import { create } from 'zustand';

export type EntityState = 'idle' | 'listening' | 'responding' | 'deep' | 'constellation' | 'experiment';
export type AppMode = 'chat' | 'constellation' | 'experiment';

interface AppStore {
  mode: AppMode;
  entityState: EntityState;
  isIntroComplete: boolean;
  setMode: (mode: AppMode) => void;
  setEntityState: (state: EntityState) => void;
  setIntroComplete: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  mode: 'chat',
  entityState: 'idle',
  isIntroComplete: false,
  setMode: (mode) => {
    set({ mode });
    if (mode === 'constellation') set({ entityState: 'constellation' });
    else if (mode === 'experiment') set({ entityState: 'experiment' });
    else set({ entityState: 'idle' });
  },
  setEntityState: (entityState) => set({ entityState }),
  setIntroComplete: () => set({ isIntroComplete: true }),
}));
