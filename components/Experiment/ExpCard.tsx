'use client';

import { Experiment } from '@/lib/db';

interface Props {
  experiment: Experiment;
  onAccept: () => void;
  onSkip: () => void;
}

export function ExpCard({ experiment, onAccept, onSkip }: Props) {
  return (
    <div className="panel-glass relative z-10 mx-auto w-full max-w-2xl rounded-[2rem] px-6 py-8 text-center md:px-10 md:py-10">
      <div className="mx-auto max-w-[31rem] space-y-6">
        <p className="orbital-label justify-center">
          {experiment.source === 'preset' ? '预设邀请' : '生成邀请'}
        </p>
        <p className="ui-title mx-auto max-w-[28rem] text-white/84">
          {experiment.prompt}
        </p>

        <div className="rounded-[1.5rem] border border-white/8 bg-black/16 px-5 py-5 text-left">
          <p className="ui-kicker text-white/34">做的时候，可以留意</p>
          <p className="ui-copy mt-3 text-white/56">
            {experiment.observation}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-[0.78rem] text-white/32">
          <span className="rounded-full border border-white/8 px-3 py-2">15 分钟以内</span>
          <span className="rounded-full border border-white/8 px-3 py-2">允许拒绝</span>
          <span className="rounded-full border border-white/8 px-3 py-2">不做打卡</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 md:flex-row">
        <button
          onClick={onAccept}
          className="button-primary"
        >
          接住这张卡
        </button>
        <button
          onClick={onSkip}
          className="button-secondary"
        >
          换一张看看
        </button>
      </div>
    </div>
  );
}
