'use client';

import { MODE_COPY } from '@/lib/modeContent';
import { AppMode, useAppStore } from '@/stores/useAppStore';

const modes: { key: AppMode; label: string }[] = [
  { key: 'chat', label: '对话' },
  { key: 'constellation', label: '星图' },
  { key: 'experiment', label: '实验' },
];

export function ModeNav() {
  const { mode, setMode } = useAppStore();

  return (
    <nav className="flex justify-center">
      <div className="panel-glass flex w-full max-w-xl items-center justify-between rounded-full px-2 py-2">
        {modes.map((entry) => (
          <button
            key={entry.key}
            onClick={() => setMode(entry.key)}
            className={`flex min-w-[96px] flex-1 flex-col items-center rounded-full px-3 py-3 text-center transition-all duration-300 ${
              mode === entry.key
                ? 'bg-white/8 text-white/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                : 'text-white/28 hover:text-white/58'
            }`}
          >
            <span className="ui-meta text-cyan-100/45">
              {MODE_COPY[entry.key].index}
            </span>
            <span className="mt-1 type-copy text-[0.95rem] tracking-[0.04em]">{entry.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
