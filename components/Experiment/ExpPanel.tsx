'use client';

import { useEffect, useState } from 'react';
import { Experiment } from '@/lib/db';
import { useExpStore } from '@/stores/useExpStore';
import { ExpCard } from './ExpCard';
import { CompleteExperimentDialog } from './CompleteExperimentDialog';
import { ExpShelf } from './ExpShelf';

export function ExpPanel() {
  const {
    availableExperiments,
    acceptedExperiments,
    completedExperiments,
    loadExperiments,
    acceptExperiment,
    completeExperiment,
    skipExperiment,
  } = useExpStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completingExperiment, setCompletingExperiment] = useState<Experiment | null>(null);

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  useEffect(() => {
    if (currentIdx >= availableExperiments.length) {
      setCurrentIdx(0);
    }
  }, [availableExperiments.length, currentIdx]);

  const current = availableExperiments[currentIdx];

  const handleAccept = async () => {
    if (!current) return;
    await acceptExperiment(current.id);
    setCurrentIdx(0);
  };

  const handleSkip = async () => {
    if (!current) return;
    await skipExperiment(current.id);
    setCurrentIdx((index) => {
      if (availableExperiments.length <= 1) return 0;
      return index % Math.max(1, availableExperiments.length - 1);
    });
  };

  const handleComplete = async (experiment: Experiment) => {
    setCompletingExperiment(experiment);
  };

  return (
    <section className="fused-shell section-shell mx-auto flex h-full w-full max-w-6xl flex-col">
      <div className="section-head mb-4">
        <p className="ui-meta text-white/32">不是任务清单，只是一张你现在可以接住的小邀请。</p>
        <div className="inline-stat-list">
          <span className="inline-stat"><span className="ui-meta text-white/34">可探索</span><strong>{availableExperiments.length}</strong></span>
          <span className="inline-stat"><span className="ui-meta text-white/34">已接受</span><strong>{acceptedExperiments.length}</strong></span>
          <span className="inline-stat"><span className="ui-meta text-white/34">已完成</span><strong>{completedExperiments.length}</strong></span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.95fr)]">
        <div className="flex min-h-0 flex-col justify-center px-2 py-3 sm:px-3 sm:py-4">
          {current ? (
            <ExpCard experiment={current} onAccept={handleAccept} onSkip={handleSkip} />
          ) : (
            <section className="flex h-full min-h-[22rem] items-center justify-center px-6">
              <div className="max-w-md space-y-4 text-center">
                <p className="orbital-label justify-center">邀请暂歇</p>
                <p className="ui-title text-white/76">
                  眼下没有新的实验卡了。
                  <br />
                  你可以先去做已接受的那一张。
                </p>
                <p className="ui-copy text-white/44">
                  镜不会催你交作业。等你回来，它会继续记得你走到了哪里。
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="grid min-h-0 gap-4 md:grid-cols-2 2xl:grid-cols-1 2xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="stream-block min-h-0 overflow-y-auto scrollbar-none">
            <ExpShelf
              title="已接受"
              emptyText="你接住的邀请，会先停在这里。"
              experiments={acceptedExperiments}
              onComplete={handleComplete}
            />
          </div>
          <div className="stream-block min-h-0 overflow-y-auto scrollbar-none">
            <ExpShelf
              title="已完成"
              emptyText="做完的实验，会在这里留下痕迹。"
              experiments={completedExperiments}
            />
          </div>
        </div>
      </div>

      {completingExperiment && (
        <CompleteExperimentDialog
          experiment={completingExperiment}
          onClose={() => setCompletingExperiment(null)}
          onConfirm={async (reflection) => {
            await completeExperiment(completingExperiment.id, reflection);
            setCompletingExperiment(null);
          }}
        />
      )}
    </section>
  );
}
