'use client';

import { useEffect, useRef, useState } from 'react';
import { Experiment } from '@/lib/db';
import { GlobalDialog } from '@/components/UI/GlobalDialog';

interface Props {
  experiment: Experiment;
  onClose: () => void;
  onConfirm: (reflection: string) => Promise<void> | void;
}

export function CompleteExperimentDialog({ experiment, onClose, onConfirm }: Props) {
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onConfirm(value.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlobalDialog onClose={() => {
      if (!isSaving) onClose();
    }}>
      <div className="dialog-sheet">
        <div className="dialog-inner">
        <div className="space-y-3 pb-2">
          <p className="orbital-label">完成实验</p>
          <p className="ui-title text-[clamp(1.08rem,0.98rem+0.55vw,1.34rem)] text-white/84">
            这一张你已经走完了。
          </p>
          <p className="ui-copy text-white/46">
            如果你愿意，我会期待你的反馈。不写也没关系。
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="dialog-block">
            <p className="type-copy text-[0.98rem] leading-7 text-white/74">{experiment.prompt}</p>
          </div>

          <label className="block space-y-2">
            <span className="ui-meta text-white/30">留一句感受</span>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={4}
              disabled={isSaving}
              placeholder="比如：做的时候，我比想象中更轻一点。"
              className="type-copy w-full resize-none bg-[linear-gradient(180deg,rgba(255,255,255,0.012),transparent_64%)] px-0 py-4 text-[0.98rem] leading-7 text-amber-50/76 outline-none placeholder:text-white/22"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="button-secondary"
          >
            先放着
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving}
            className="button-primary"
          >
            {isSaving ? '正在收好' : '标记完成'}
          </button>
        </div>
        </div>
      </div>
    </GlobalDialog>
  );
}
