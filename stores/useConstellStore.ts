import { create } from 'zustand';
import { db, ConstellNode, ConstellEdge } from '@/lib/db';

interface ConstellStore {
  nodes: ConstellNode[];
  edges: ConstellEdge[];
  selectedNode: ConstellNode | null;
  loadData: () => Promise<void>;
  selectNode: (node: ConstellNode | null) => void;
}

export const useConstellStore = create<ConstellStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,

  loadData: async () => {
    const nodes = await db.nodes.toArray();
    const edges = await db.edges.toArray();
    set({ nodes, edges });
  },

  selectNode: (node) => set({ selectedNode: node }),
}));
