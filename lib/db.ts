import Dexie, { Table } from 'dexie';

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  threadId: string;
  extractedKeywords?: string[];
  sentiment?: 'warm' | 'neutral' | 'heavy';
}

export interface ConstellNode {
  id: string;
  label: string;
  category: 'interest' | 'memory' | 'person' | 'emotion' | 'pattern';
  firstSeen: number;
  frequency: number;
  sentiment: 'warm' | 'cool' | 'dark';
  contextSnippets: string[];
  position: { x: number; y: number };
}

export interface ConstellEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
}

export interface Experiment {
  id: string;
  prompt: string;
  observation: string;
  source: 'preset' | 'generated';
  relatedNodeIds?: string[];
  status: 'available' | 'accepted' | 'completed';
  acceptedAt?: number;
  reflection?: string;
}

export interface UserMeta {
  id: 'singleton';
  threadId: string;
  firstVisit: number;
  totalSessions: number;
  lastActive: number;
  conversationSummary?: string;
  compressedMessageCount?: number;
  summaryUpdatedAt?: number;
  replyOptions?: string[];
}

export class MirrorDB extends Dexie {
  messages!: Table<Message>;
  nodes!: Table<ConstellNode>;
  edges!: Table<ConstellEdge>;
  experiments!: Table<Experiment>;
  meta!: Table<UserMeta>;

  constructor() {
    super('MirrorDB');
    this.version(1).stores({
      messages: 'id, threadId, timestamp',
      nodes: 'id, label, category, firstSeen',
      edges: 'id, source, target',
      experiments: 'id, status',
      meta: 'id',
    });
    this.version(2)
      .stores({
        messages: 'id, threadId, timestamp',
        nodes: 'id, label, category, firstSeen',
        edges: 'id, source, target',
        experiments: 'id, status',
        meta: 'id',
      })
      .upgrade(async (tx) => {
        const meta = await tx.table('meta').get('singleton');
        if (meta) {
          await tx.table('meta').put({
            ...meta,
            conversationSummary: meta.conversationSummary || '',
            compressedMessageCount: meta.compressedMessageCount || 0,
            summaryUpdatedAt: meta.summaryUpdatedAt || undefined,
          });
        }
      });
    this.version(3)
      .stores({
        messages: 'id, threadId, timestamp',
        nodes: 'id, label, category, firstSeen',
        edges: 'id, source, target',
        experiments: 'id, status',
        meta: 'id',
      })
      .upgrade(async (tx) => {
        const meta = await tx.table('meta').get('singleton');
        if (meta) {
          await tx.table('meta').put({
            ...meta,
            conversationSummary: meta.conversationSummary || '',
            compressedMessageCount: meta.compressedMessageCount || 0,
            summaryUpdatedAt: meta.summaryUpdatedAt || undefined,
            replyOptions: Array.isArray(meta.replyOptions) ? meta.replyOptions : [],
          });
        }
      });
  }
}

export const db = new MirrorDB();
