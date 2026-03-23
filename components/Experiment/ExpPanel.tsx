'use client';

import { useEffect, useState } from 'react';
import { Experiment } from '@/lib/db';
import { useExpStore } from '@/stores/useExpStore';
import { ExpCard } from './ExpCard';
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
    const reflection = window.prompt('如果你愿意，可以留一句感受。也可以直接留空。', '');
    await completeExperiment(experiment.id, reflection?.trim() || '');
  };

  return (
    <section className="panel-glass section-shell mx-auto flex h-full w-full max-w-6xl flex-col">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
        <p className="ui-meta text-white/32">不是任务清单，只是一张你现在可以接住的小邀请。</p>
        <div className="flex flex-wrap justify-end gap-2">
          <div className="metric-tile min-w-[4.7rem] px-3 py-2 text-center">
            <p className="ui-meta text-white/34">可探索</p>
            <p className="mt-1 text-base text-white/82">{availableExperiments.length}</p>
          </div>
          <div className="metric-tile min-w-[4.7rem] px-3 py-2 text-center">
            <p className="ui-meta text-white/34">已接受</p>
            <p className="mt-1 text-base text-white/82">{acceptedExperiments.length}</p>
          </div>
          <div className="metric-tile min-w-[4.7rem] px-3 py-2 text-center">
            <p className="ui-meta text-white/34">已完成</p>
            <p className="mt-1 text-base text-white/82">{completedExperiments.length}</p>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.95fr)]">
        <div className="flex min-h-0 flex-col justify-center rounded-[1.7rem] border border-white/7 bg-black/10 px-2 py-2 sm:px-3 sm:py-3">
          {current ? (
            <ExpCard experiment={current} onAccept={handleAccept} onSkip={handleSkip} />
          ) : (
            <section className="flex h-full min-h-[22rem] items-center justify-center rounded-[1.8rem] border border-white/8 bg-black/16 px-6">
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

        <div className="grid min-h-0 gap-4 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-h-0 overflow-y-auto scrollbar-none">
            <ExpShelf
              title="已接受"
              emptyText="你接住的邀请，会先停在这里。"
              experiments={acceptedExperiments}
              onComplete={handleComplete}
            />
          </div>
          <div className="min-h-0 overflow-y-auto scrollbar-none">
            <ExpShelf
              title="已完成"
              emptyText="做完的实验，会在这里留下痕迹。"
              experiments={completedExperiments}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
