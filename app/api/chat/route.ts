import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MIRROR_CONTEXT_SUMMARY_PROMPT, MIRROR_SYSTEM_PROMPT } from '@/lib/prompts';
import { extractReplyOptions, normalizeReplyOptions } from '@/lib/replyOptions';

const RECENT_MESSAGE_WINDOW = 8;

const MODELS_REQUIRING_TEMPERATURE_ONE = ['o1', 'o3', 'kimi'];

function getValidTemperature(model: string, desiredTemperature: number): number {
  const modelName = model.toLowerCase();
  return MODELS_REQUIRING_TEMPERATURE_ONE.some(m => modelName.includes(m))
    ? 1
    : desiredTemperature;
}
const SUMMARY_TRIGGER_COUNT = 14;

type ChatRole = 'user' | 'ai';

interface HistoryMessage {
  role: ChatRole;
  content: string;
}

interface MirrorMetadata {
  keywords?: string[];
  sentiment?: 'warm' | 'neutral' | 'heavy';
  pattern?: string | null;
  suggestions?: string[];
}

interface LlmSettings {
  url?: string;
  model?: string;
  apiKey?: string;
}

interface ResolvedLlmConfig {
  client: OpenAI;
  model: string;
  summaryModel: string;
}

function cleanSetting(value?: string) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveLlmConfig(settings?: LlmSettings): ResolvedLlmConfig {
  const apiKey = cleanSetting(settings?.apiKey) || process.env.OPENAI_API_KEY || '';
  const baseURL = cleanSetting(settings?.url) || process.env.OPENAI_BASE_URL || undefined;
  const model = cleanSetting(settings?.model) || process.env.OPENAI_MODEL || 'gpt-4o';
  const summaryModel = cleanSetting(settings?.model) || process.env.OPENAI_SUMMARY_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error('Missing LLM API key');
  }

  return {
    // The client is built per request because browser-local settings may override env defaults.
    client: new OpenAI({ apiKey, baseURL }),
    model,
    summaryModel,
  };
}

function postProcessMirrorReply(reply: string) {
  return reply
    .replace(/你应该/g, '也许可以')
    .replace(/你需要/g, '可以先')
    .replace(/不妨/g, '可以')
    .replace(/难道不是吗\??/g, '你会这么觉得吗？')
    .replace(/这说明你/g, '这像是在说')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatHistory(history: HistoryMessage[]) {
  return history
    .map((item) => `${item.role === 'user' ? '用户' : '镜'}：${item.content}`)
    .join('\n\n');
}

async function summarizeHistory(existingSummary: string, messages: HistoryMessage[], llm: ResolvedLlmConfig) {
  const formattedHistory = formatHistory(messages);
  const model = llm.summaryModel;

  const response = await llm.client.chat.completions.create({
    model,
    temperature: getValidTemperature(model, 0.3),
    messages: [
      { role: 'system', content: MIRROR_CONTEXT_SUMMARY_PROMPT },
      {
        role: 'user',
        content: [
          existingSummary ? `已有摘要：\n${existingSummary}` : '已有摘要：\n（暂无）',
          `请把下面这些较早的对话整合进摘要：\n${formattedHistory}`,
        ].join('\n\n'),
      },
    ],
  });

  return (response.choices[0].message.content || '').trim();
}

export async function POST(req: Request) {
  try {
    const {
      threadId,
      message,
      history = [],
      summary = '',
      compressedMessageCount = 0,
      llmSettings,
    }: {
      threadId?: string | null;
      message: string;
      history?: HistoryMessage[];
      summary?: string;
      compressedMessageCount?: number;
      llmSettings?: LlmSettings;
    } = await req.json();

    const llm = resolveLlmConfig(llmSettings);

    let nextSummary = summary.trim();
    let nextCompressedMessageCount = compressedMessageCount;
    let recentHistory = history;

    if (history.length >= SUMMARY_TRIGGER_COUNT) {
      const messagesToCompress = history.slice(0, Math.max(0, history.length - RECENT_MESSAGE_WINDOW));

      if (messagesToCompress.length > 0) {
        nextSummary = await summarizeHistory(nextSummary, messagesToCompress, llm);
        nextCompressedMessageCount += messagesToCompress.length;
        recentHistory = history.slice(messagesToCompress.length);
      }
    }

    const contextMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: MIRROR_SYSTEM_PROMPT },
    ];

    if (nextSummary) {
      contextMessages.push({
        role: 'system',
        content: `以下是截至目前的长期对话摘要，仅供你延续上下文时参考：\n${nextSummary}`,
      });
    }

    contextMessages.push(
      ...recentHistory.map((item) => ({
        role: item.role === 'user' ? 'user' as const : 'assistant' as const,
        content: item.content,
      }))
    );

    contextMessages.push({ role: 'user', content: message });

    const model = llm.model;
    const response = await llm.client.chat.completions.create({
      model,
      messages: contextMessages,
      temperature: getValidTemperature(model, 0.8),
    });

    const text = response.choices[0].message.content || '';
    const [rawReply, metaRaw] = text.split('---').map((segment) => segment.trim());
    const reply = postProcessMirrorReply(rawReply);

    const replySuggestions = extractReplyOptions(reply);
    let metadata: MirrorMetadata | null = null;
    try {
      const parsed = JSON.parse(metaRaw);
      const modelSuggestions = normalizeReplyOptions(parsed?.suggestions);

      metadata = {
        keywords: Array.isArray(parsed?.keywords) ? parsed.keywords.slice(0, 3) : [],
        sentiment:
          parsed?.sentiment === 'warm' || parsed?.sentiment === 'neutral' || parsed?.sentiment === 'heavy'
            ? parsed.sentiment
            : 'neutral',
        pattern: typeof parsed?.pattern === 'string' ? parsed.pattern : null,
        suggestions: replySuggestions.length > 0 ? replySuggestions : modelSuggestions,
      };
    } catch {
      metadata = replySuggestions.length > 0 ? {
        keywords: [],
        sentiment: 'neutral',
        pattern: null,
        suggestions: replySuggestions,
      } : null;
    }

    const tid = threadId || `local-${Date.now()}`;
    return NextResponse.json({
      threadId: tid,
      reply,
      metadata,
      contextSummary: nextSummary,
      compressedMessageCount: nextCompressedMessageCount,
    });
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error && err.message === 'Missing LLM API key'
      ? '请先在设置里填写 LLM API Key，或配置服务端 OPENAI_API_KEY。'
      : 'Failed to process request';
    const status = err instanceof Error && err.message === 'Missing LLM API key' ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
