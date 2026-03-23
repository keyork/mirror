'use client';

import { ENTITY_STATUS } from '@/lib/modeContent';
import { useAppStore } from '@/stores/useAppStore';

export function StatusBar() {
  const entityState = useAppStore((state) => state.entityState);
  const status = ENTITY_STATUS[entityState];

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-6 z-10 flex justify-center">
      <div className="flex items-center gap-3 rounded-full border border-white/8 bg-black/16 px-4 py-2 backdrop-blur-xl">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-100/70 shadow-[0_0_12px_rgba(153,182,255,0.8)]" />
        <span className="ui-meta text-white/42">
          {status.label}
        </span>
      </div>
    </div>
  );
}
