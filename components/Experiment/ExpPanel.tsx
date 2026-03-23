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
      <header className="section-head mb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="orbital-label">实验</p>
          <h2 className="type-display text-[1.3rem] leading-[1.55] text-white/88 md:text-[1.45rem]">
            去做一件很小的事，看看你会不会因此更靠近自己。
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="metric-tile">
            <p className="ui-meta text-white/34">可探索</p>
            <p className="mt-1 text-2xl text-white/82">{availableExperiments.length}</p>
          </div>
          <div className="metric-tile">
            <p className="ui-meta text-white/34">已接受</p>
            <p className="mt-1 text-2xl text-white/82">{acceptedExperiments.length}</p>
          </div>
          <div className="metric-tile">
            <p className="ui-meta text-white/34">已完成</p>
            <p className="mt-1 text-2xl text-white/82">{completedExperiments.length}</p>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.95fr)]">
        <div className="flex min-h-0 flex-col justify-center">
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

        <div className="grid min-h-0 gap-4 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
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
