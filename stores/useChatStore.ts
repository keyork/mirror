import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { db, MemoryItem, Message } from '@/lib/db';
import { useLlmSettingsStore } from '@/stores/useLlmSettingsStore';

interface ChatStore {
  messages: Message[];
  threadId: string | null;
  isLoading: boolean;
  conversationSummary: string;
  compressedMessageCount: number;
  replyOptions: string[];
  loadMessages: () => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  initThread: () => Promise<void>;
}

function getErrorReply(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return '刚刚断了一下。\n\n你把那句话再发我一次，好吗？';
}

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, ' ').slice(0, 24);
}

function getContentTerms(content: string) {
  const normalized = content.toLowerCase();
  const latinTerms = normalized.match(/[a-z0-9_]{2,}/g) || [];
  const cjkTerms = Array.from(new Set((content.match(/[\u4e00-\u9fff]{2,}/g) || [])
    .flatMap((segment) => {
      const terms: string[] = [];
      for (let index = 0; index < segment.length - 1; index += 1) {
        terms.push(segment.slice(index, index + 2));
      }
      return terms;
    })));

  return Array.from(new Set([...latinTerms, ...cjkTerms])).slice(0, 80);
}

function scoreMemory(memory: MemoryItem, content: string, terms: string[], now: number) {
  const lowerContent = content.toLowerCase();
  const lowerMemoryText = memory.text.toLowerCase();
  const tagScore = memory.tags.reduce((score, tag) => {
    const lowerTag = tag.toLowerCase();
    return lowerContent.includes(lowerTag) ? score + 3 : score;
  }, 0);
  const termScore = terms.reduce((score, term) => (
    lowerMemoryText.includes(term.toLowerCase()) ? score + 1 : score
  ), 0);
  const ageDays = Math.max(0, (now - memory.createdAt) / 86_400_000);
  const recencyScore = Math.max(0, 2 - ageDays / 14);

  return tagScore + Math.min(termScore, 5) + memory.importance * 2 + recencyScore;
}

async function retrieveRelevantMemories(content: string) {
  const now = Date.now();
  const terms = getContentTerms(content);
  const memories = await db.memories.orderBy('createdAt').reverse().limit(120).toArray();
  const ranked = memories
    .map((memory) => ({ memory, score: scoreMemory(memory, content, terms, now) }))
    .filter((item) => item.score >= 2.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.memory);

  if (ranked.length > 0) {
    await Promise.all(ranked.map((memory) => db.memories.update(memory.id, { lastUsedAt: now })));
  }

  return ranked.map((memory) => ({
    id: memory.id,
    text: memory.text,
    tags: memory.tags,
    importance: memory.importance,
  }));
}

async function saveMemoryItem(params: {
  userMessage: Message;
  aiMessage: Message;
  keywords?: string[];
  sentiment?: string;
}) {
  const tags = Array.from(new Set((params.keywords || [])
    .map(normalizeTag)
    .filter((tag) => tag.length >= 2)))
    .slice(0, 6);

  if (tags.length === 0) return;

  const now = Date.now();
  const importance = Math.min(
    1,
    0.45 + tags.length * 0.08 + (params.sentiment === 'heavy' ? 0.18 : 0)
  );

  await db.memories.put({
    id: nanoid(),
    text: [
      `用户提到：${params.userMessage.content.slice(0, 180)}`,
      `镜当时回应：${params.aiMessage.content.slice(0, 160)}`,
    ].join('\n'),
    sourceMessageIds: [params.userMessage.id, params.aiMessage.id],
    tags,
    importance,
    createdAt: now,
  });
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  threadId: null,
  isLoading: false,
  conversationSummary: '',
  compressedMessageCount: 0,
  replyOptions: [],

  loadMessages: async () => {
    const meta = await db.meta.get('singleton');
    if (!meta) return;

    const messages = await db.messages.where('threadId').equals(meta.threadId).sortBy('timestamp');
    set({
      threadId: meta.threadId,
      messages,
      conversationSummary: meta.conversationSummary || '',
      compressedMessageCount: meta.compressedMessageCount || 0,
      replyOptions: meta.replyOptions || [],
    });
  },

  initThread: async () => {
    const meta = await db.meta.get('singleton');
    if (meta) {
      set({
        threadId: meta.threadId,
        conversationSummary: meta.conversationSummary || '',
        compressedMessageCount: meta.compressedMessageCount || 0,
        replyOptions: meta.replyOptions || [],
      });
    }
  },

  sendMessage: async (content: string) => {
    const { threadId, messages, conversationSummary, compressedMessageCount } = get();
    const llmSettings = useLlmSettingsStore.getState();
    set({ isLoading: true, replyOptions: [] });

    const history = messages
      .slice(compressedMessageCount)
      .map((item) => ({ role: item.role, content: item.content }));

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: Date.now(),
      threadId: threadId || '',
    };

    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const relevantMemories = await retrieveRelevantMemories(content);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          message: content,
          history,
          summary: conversationSummary,
          compressedMessageCount,
          llmSettings: {
            url: llmSettings.url,
            model: llmSettings.model,
            apiKey: llmSettings.apiKey,
          },
          relevantMemories,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to process request');
      }

      const nextThreadId = data.threadId;
      const nextSummary = data.contextSummary || '';
      const nextCompressedMessageCount = data.compressedMessageCount || 0;
      const nextReplyOptions = Array.isArray(data.metadata?.suggestions)
        ? data.metadata.suggestions
        : [];

      if (!threadId) {
        const existingMeta = await db.meta.get('singleton');
        if (!existingMeta) {
          await db.meta.put({
            id: 'singleton',
            threadId: nextThreadId,
            firstVisit: Date.now(),
            totalSessions: 1,
            lastActive: Date.now(),
            conversationSummary: nextSummary,
            compressedMessageCount: nextCompressedMessageCount,
            summaryUpdatedAt: nextSummary ? Date.now() : undefined,
            replyOptions: nextReplyOptions,
          });
        } else {
          await db.meta.update('singleton', {
            threadId: nextThreadId,
            lastActive: Date.now(),
            conversationSummary: nextSummary,
            compressedMessageCount: nextCompressedMessageCount,
            summaryUpdatedAt: nextSummary ? Date.now() : existingMeta.summaryUpdatedAt,
            replyOptions: nextReplyOptions,
          });
        }

        set({
          threadId: nextThreadId,
          conversationSummary: nextSummary,
          compressedMessageCount: nextCompressedMessageCount,
          replyOptions: nextReplyOptions,
        });
        userMessage.threadId = nextThreadId;
      } else {
        await db.meta.update('singleton', {
          lastActive: Date.now(),
          conversationSummary: nextSummary,
          compressedMessageCount: nextCompressedMessageCount,
          summaryUpdatedAt: nextSummary ? Date.now() : undefined,
          replyOptions: nextReplyOptions,
        });
        set({
          conversationSummary: nextSummary,
          compressedMessageCount: nextCompressedMessageCount,
          replyOptions: nextReplyOptions,
        });
      }

      await db.messages.put({ ...userMessage, threadId: nextThreadId });

      const aiMessage: Message = {
        id: nanoid(),
        role: 'ai',
        content: data.reply,
        timestamp: Date.now(),
        threadId: nextThreadId,
        extractedKeywords: data.metadata?.keywords,
        sentiment: data.metadata?.sentiment,
      };

      await db.messages.put(aiMessage);
      set((state) => ({ messages: [...state.messages, aiMessage] }));

      if (data.metadata?.keywords?.length) {
        await updateConstellation(data.metadata.keywords, data.metadata.sentiment, data.reply);
      }

      await saveMemoryItem({
        userMessage: { ...userMessage, threadId: nextThreadId },
        aiMessage,
        keywords: data.metadata?.keywords,
        sentiment: data.metadata?.sentiment,
      });
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMessage: Message = {
        id: nanoid(),
        role: 'ai',
        content: getErrorReply(error),
        timestamp: Date.now(),
        threadId: threadId || '',
      };

      set((state) => ({
        messages: [...state.messages, fallbackMessage],
        replyOptions: [],
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));

async function updateConstellation(keywords: string[], sentiment: string, context: string) {
  const { db: database } = await import('@/lib/db');
  const { nanoid: createId } = await import('nanoid');
  const nodeIds: string[] = [];

  for (const keyword of keywords) {
    const existing = await database.nodes.where('label').equals(keyword).first();

    if (existing) {
      await database.nodes.update(existing.id, {
        frequency: existing.frequency + 1,
        contextSnippets: [...existing.contextSnippets.slice(-4), context.slice(0, 100)],
      });
      nodeIds.push(existing.id);
      continue;
    }

    const nodeId = createId();
    await database.nodes.put({
      id: nodeId,
      label: keyword,
      category: 'interest',
      firstSeen: Date.now(),
      frequency: 1,
      sentiment: sentiment === 'warm' ? 'warm' : sentiment === 'heavy' ? 'dark' : 'cool',
      contextSnippets: [context.slice(0, 100)],
      position: { x: Math.random(), y: Math.random() },
    });
    nodeIds.push(nodeId);
  }

  for (let i = 0; i < nodeIds.length; i += 1) {
    for (let j = i + 1; j < nodeIds.length; j += 1) {
      const source = nodeIds[i];
      const target = nodeIds[j];

      const existingEdge = await database.edges
        .filter(
          (edge) =>
            (edge.source === source && edge.target === target) ||
            (edge.source === target && edge.target === source)
        )
        .first();

      if (existingEdge) {
        await database.edges.update(existingEdge.id, {
          strength: Math.min(existingEdge.strength + 0.14, 1),
        });
      } else {
        await database.edges.put({
          id: createId(),
          source,
          target,
          strength: 0.32,
        });
      }
    }
  }
}
