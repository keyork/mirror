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
    <nav className="shell-max flex justify-center">
      <div className="fused-rail flex w-full items-center justify-between px-2 py-0.5 sm:px-4 sm:py-1">
        {modes.map((entry) => (
          <button
            key={entry.key}
            onClick={() => setMode(entry.key)}
            className={`mode-tab flex min-w-0 flex-1 flex-col items-center px-3 py-2.5 text-center transition-all duration-400 sm:px-6 sm:py-3 ${
              mode === entry.key
                ? 'is-active translate-y-[-1px] text-white/84'
                : 'text-white/24 hover:text-white/52'
            }`}
          >
            <span className="ui-meta text-cyan-100/35">
              {MODE_COPY[entry.key].index}
            </span>
            <span className="mt-1.5 type-copy text-[clamp(0.82rem,0.76rem+0.2vw,0.93rem)] tracking-[0.05em]">
              {entry.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
