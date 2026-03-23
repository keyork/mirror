'use client';

import { Experiment } from '@/lib/db';

interface Props {
  experiment: Experiment;
  onAccept: () => void;
  onSkip: () => void;
}

export function ExpCard({ experiment, onAccept, onSkip }: Props) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-6 text-center sm:px-5 sm:py-8 md:px-7 md:py-12">
      <div className="mx-auto max-w-[31rem] space-y-6 sm:space-y-7">
        <p className="orbital-label justify-center">
          {experiment.source === 'preset' ? '预设邀请' : '生成邀请'}
        </p>
        <p className="ui-title mx-auto max-w-[28rem] text-white/84">
          {experiment.prompt}
        </p>

        <div className="fused-note px-3 py-4 text-left sm:px-4">
          <p className="ui-kicker text-white/34">做的时候，可以留意</p>
          <p className="ui-copy mt-3 text-white/56">
            {experiment.observation}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 text-left">
          <span className="exp-note-chip">
            <span className="exp-note-dot bg-violet-200/55" />
            完成时，期待你的反馈
          </span>
        </div>
      </div>

      <div className="mt-7 flex flex-col justify-center gap-3 md:mt-10 md:flex-row">
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
