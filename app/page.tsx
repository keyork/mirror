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
  const { mode, entityState, isIntroComplete } = useAppStore();
  const modeCopy = MODE_COPY[mode];
  const status = ENTITY_STATUS[entityState];

  return (
    <main className="scene-shell fixed inset-0 overflow-hidden">
      <IntroScreen />
      <div
        className={`transition-opacity duration-[1400ms] ${
          isIntroComplete ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Entity />

        <div className="pointer-events-none fixed inset-0 z-[1]">
          <div className="mirror-axis" />
          <div className="absolute left-[7%] top-[12%] h-52 w-52 bg-[radial-gradient(circle,_rgba(118,146,228,0.14),_rgba(118,146,228,0))] blur-3xl" />
          <div className="absolute right-[8%] top-[18%] h-40 w-40 bg-[radial-gradient(circle,_rgba(178,106,255,0.11),_rgba(178,106,255,0))] blur-3xl" />
          <div className="absolute left-[18%] bottom-[18%] h-44 w-44 bg-[radial-gradient(circle,_rgba(78,208,170,0.09),_rgba(78,208,170,0))] blur-3xl" />
          <div className="absolute bottom-[12%] right-[14%] h-56 w-56 bg-[radial-gradient(circle,_rgba(255,180,92,0.1),_rgba(255,180,92,0))] blur-3xl" />
          <div className="absolute right-[26%] bottom-[24%] h-40 w-40 bg-[radial-gradient(circle,_rgba(255,107,124,0.08),_rgba(255,107,124,0))] blur-3xl" />
          <div className="absolute inset-x-[18%] top-[8%] h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        </div>

        <div className="app-shell">
          <div className="shell-max">
            <section className="fused-rail section-shell top-rail pointer-events-auto">
              <div className="top-rail-copy">
                <p className="orbital-label">镜 · {modeCopy.index} · {modeCopy.eyebrow}</p>
                <div className="top-rail-title-mark mt-2">
                  <span className="twin-sigil" aria-hidden="true" />
                  <p
                    className="type-copy top-rail-title echo-text echo-text-soft text-[0.97rem] leading-[1.78] text-white/74"
                    data-echo={modeCopy.title}
                  >
                    {modeCopy.title}
                  </p>
                </div>
              </div>

              <div className="top-rail-status min-w-0">
                <p className="ui-meta flex items-center gap-2 text-cyan-100/44">
                  <span className="twin-sigil scale-[0.8]" aria-hidden="true" />
                  {status.label}
                </p>
                <p className="ui-meta mt-1.5 text-white/28">
                  {status.description}
                </p>
              </div>

              <div className="top-rail-action justify-self-end">
                <ResetMemoryButton />
              </div>
            </section>
          </div>

          <div className="stage-stack">
            <div className="panel-stage">
              {mode === 'chat' && <ChatPanel />}
              {mode === 'constellation' && <ConstellPanel />}
              {mode === 'experiment' && <ExpPanel />}
            </div>
          </div>

          <div className="nav-stage">
            <ModeNav />
          </div>
        </div>
      </div>
    </main>
  );
}
