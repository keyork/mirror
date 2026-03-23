import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { db, Message } from '@/lib/db';

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          message: content,
          history,
          summary: conversationSummary,
          compressedMessageCount,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
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
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMessage: Message = {
        id: nanoid(),
        role: 'ai',
        content: '刚刚断了一下。\n\n你把那句话再发我一次，好吗？',
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
