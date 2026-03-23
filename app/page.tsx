'use client';

import { ChatPanel } from '@/components/Chat/ChatPanel';
import { ConstellPanel } from '@/components/Constellation/ConstellPanel';
import { Entity } from '@/components/Entity/Entity';
import { ExpPanel } from '@/components/Experiment/ExpPanel';
import { IntroScreen } from '@/components/Intro/IntroScreen';
import { ResetMemoryButton } from '@/components/Memory/ResetMemoryButton';
import { ModeNav } from '@/components/Navigation/ModeNav';
import { ENTITY_STATUS, MODE_COPY } from '@/lib/modeContent';
import { useAppStore } from '@/stores/useAppStore';

export default function Home() {
  const { mode, entityState } = useAppStore();
  const modeCopy = MODE_COPY[mode];
  const status = ENTITY_STATUS[entityState];

  return (
    <main className="scene-shell fixed inset-0 overflow-hidden">
      <IntroScreen />
      <Entity />

      <div className="pointer-events-none fixed inset-0 z-[1]">
        <div className="absolute left-[10%] top-[16%] h-40 w-40 rounded-full bg-[radial-gradient(circle,_rgba(137,166,255,0.14),_rgba(137,166,255,0))] blur-3xl" />
        <div className="absolute bottom-[16%] right-[12%] h-48 w-48 rounded-full bg-[radial-gradient(circle,_rgba(236,191,121,0.1),_rgba(236,191,121,0))] blur-3xl" />
        <div className="absolute inset-x-[14%] top-[8%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col px-4 pb-6 pt-6 md:px-8 md:pb-8 md:pt-6">
        <div className="mx-auto w-full max-w-6xl">
          <section className="panel-glass section-shell top-rail pointer-events-auto">
            <div className="top-rail-copy">
              <p className="orbital-label">镜 · {modeCopy.index} · {modeCopy.eyebrow}</p>
              <p className="ui-copy mt-2 truncate text-white/72 md:whitespace-normal">
                {modeCopy.title}
              </p>
            </div>

            <div className="hidden min-w-0 md:block">
              <p className="ui-meta text-cyan-100/48">{status.label}</p>
              <p className="ui-meta mt-2 truncate text-white/34 lg:whitespace-normal">
                {status.description}
              </p>
            </div>

            <div className="justify-self-end">
              <ResetMemoryButton />
            </div>
          </section>
        </div>

        <div className="flex min-h-0 flex-1 items-stretch justify-center pt-4 md:pt-6">
          <div className="pointer-events-auto flex h-full min-h-0 w-full max-w-[62rem] overflow-hidden">
            {mode === 'chat' && <ChatPanel />}
            {mode === 'constellation' && <ConstellPanel />}
            {mode === 'experiment' && <ExpPanel />}
          </div>
        </div>

        <div className="pointer-events-auto pt-4 md:pt-5">
          <ModeNav />
        </div>
      </div>
    </main>
  );
}
