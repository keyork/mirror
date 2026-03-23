import { create } from 'zustand';
import { db, Experiment } from '@/lib/db';
import { PRESET_EXPERIMENTS } from '@/lib/experiments';

interface ExpStore {
  availableExperiments: Experiment[];
  acceptedExperiments: Experiment[];
  completedExperiments: Experiment[];
  loadExperiments: () => Promise<void>;
  acceptExperiment: (id: string) => Promise<void>;
  completeExperiment: (id: string, reflection: string) => Promise<void>;
  skipExperiment: (id: string) => Promise<void>;
}

async function refreshExperiments() {
  const [availableExperiments, acceptedExperiments, completedExperiments] = await Promise.all([
    db.experiments.where('status').equals('available').toArray(),
    db.experiments.where('status').equals('accepted').toArray(),
    db.experiments.where('status').equals('completed').toArray(),
  ]);

  acceptedExperiments.sort((a, b) => (b.acceptedAt || 0) - (a.acceptedAt || 0));
  completedExperiments.sort((a, b) => (b.acceptedAt || 0) - (a.acceptedAt || 0));

  return {
    availableExperiments,
    acceptedExperiments,
    completedExperiments,
  };
}

export const useExpStore = create<ExpStore>((set, get) => ({
  availableExperiments: [],
  acceptedExperiments: [],
  completedExperiments: [],

  loadExperiments: async () => {
    const count = await db.experiments.count();
    if (count === 0) {
      await db.experiments.bulkPut(
        PRESET_EXPERIMENTS.map((experiment) => ({
          ...experiment,
          source: 'preset' as const,
          status: 'available' as const,
        }))
      );
    }

    set(await refreshExperiments());
  },

  acceptExperiment: async (id) => {
    await db.experiments.update(id, { status: 'accepted', acceptedAt: Date.now() });
    set(await refreshExperiments());
  },

  completeExperiment: async (id, reflection) => {
    await db.experiments.update(id, { status: 'completed', reflection });
    set(await refreshExperiments());
  },

  skipExperiment: async (id) => {
    const experiments = get().availableExperiments;
    const skipped = experiments.find((experiment) => experiment.id === id);
    if (!skipped) return;

    set({
      availableExperiments: [
        ...experiments.filter((experiment) => experiment.id !== id),
        skipped,
      ],
    });
  },
}));
