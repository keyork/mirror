import { db } from '@/lib/db';
import { useAppStore } from '@/stores/useAppStore';
import { useChatStore } from '@/stores/useChatStore';
import { useConstellStore } from '@/stores/useConstellStore';
import { useExpStore } from '@/stores/useExpStore';

export async function clearMirrorMemory() {
  await db.transaction('rw', [db.messages, db.nodes, db.edges, db.experiments, db.meta], async () => {
    await db.messages.clear();
    await db.nodes.clear();
    await db.edges.clear();
    await db.experiments.clear();
    await db.meta.clear();
  });

  useChatStore.setState({
    messages: [],
    threadId: null,
    isLoading: false,
    conversationSummary: '',
    compressedMessageCount: 0,
    replyOptions: [],
  });

  useConstellStore.setState({
    nodes: [],
    edges: [],
    selectedNode: null,
  });

  useExpStore.setState({
    availableExperiments: [],
    acceptedExperiments: [],
    completedExperiments: [],
  });

  const appState = useAppStore.getState();
  appState.setMode('chat');
  appState.setEntityState('idle');

  await useExpStore.getState().loadExperiments();
}
