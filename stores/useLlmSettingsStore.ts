'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LlmSettings {
  url: string;
  model: string;
  apiKey: string;
}

interface LlmSettingsStore extends LlmSettings {
  hasHydrated: boolean;
  updateSettings: (settings: LlmSettings) => void;
  clearSettings: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const EMPTY_LLM_SETTINGS: LlmSettings = {
  url: '',
  model: '',
  apiKey: '',
};

export function isLlmSettingsComplete(settings: LlmSettings) {
  return Boolean(settings.url.trim() && settings.model.trim() && settings.apiKey.trim());
}

export const useLlmSettingsStore = create<LlmSettingsStore>()(
  persist(
    (set) => ({
      ...EMPTY_LLM_SETTINGS,
      hasHydrated: false,
      updateSettings: (settings) => set(settings),
      clearSettings: () => set(EMPTY_LLM_SETTINGS),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'mirror-llm-settings',
      partialize: ({ url, model, apiKey }) => ({ url, model, apiKey }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
