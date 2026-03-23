'use client';

import { Experiment } from '@/lib/db';

interface Props {
  title: string;
  emptyText: string;
  experiments: Experiment[];
  onComplete?: (experiment: Experiment) => void;
}

function formatAcceptedAt(timestamp?: number) {
  if (!timestamp) return '刚刚加入';

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp);
}

export function ExpShelf({ title, emptyText, experiments, onComplete }: Props) {
  return (
    <section className="px-3 py-3 sm:px-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="orbital-label">{title}</p>
        <span className="ui-meta">{experiments.length}</span>
      </div>

      {experiments.length === 0 ? (
        <p className="ui-copy text-[0.9rem] text-white/36">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {experiments.map((experiment) => (
            <article
              key={experiment.id}
              className="stream-list-row px-1 pb-3"
            >
              <p className="type-copy text-[0.98rem] leading-7 text-white/76">{experiment.prompt}</p>
              <p className="ui-meta mt-3 text-white/28">{formatAcceptedAt(experiment.acceptedAt)}</p>

              {experiment.reflection ? (
                <p className="ui-copy mt-3 pt-2 text-[0.92rem] text-white/48">
                  {experiment.reflection}
                </p>
              ) : null}

              {onComplete ? (
                <div className="mt-4">
                  <button
                    onClick={() => onComplete(experiment)}
                    className="button-secondary min-h-[2.45rem] px-4 text-[0.76rem]"
                  >
                    标记完成
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
