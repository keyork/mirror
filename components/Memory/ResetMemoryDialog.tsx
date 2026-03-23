'use client';

import { GlobalDialog } from '@/components/UI/GlobalDialog';

interface Props {
  isClearing: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ResetMemoryDialog({ isClearing, onClose, onConfirm }: Props) {
  return (
    <GlobalDialog onClose={() => {
      if (!isClearing) onClose();
    }}>
      <div className="dialog-sheet">
        <div className="dialog-inner">
        <div className="space-y-3 pb-2">
          <p className="orbital-label">清空记忆</p>
          <p className="ui-title text-[clamp(1.08rem,0.98rem+0.55vw,1.34rem)] text-white/84">
            这会把镜现在记得的东西都放开。
          </p>
          <p className="ui-copy text-white/46">
            本地保存的对话、星图、实验记录和摘要都会一起清掉。这个动作做完后，没法撤回。
          </p>
        </div>

        <div className="dialog-block mt-4">
          <p className="ui-meta text-white/30">会被清空的内容</p>
          <p className="ui-copy mt-3 text-white/58">
            对话记录、上下文摘要、星图节点与连线、实验状态，以及当前会话的本地记忆。
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="button-secondary"
          >
            先不清空
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isClearing}
            className="button-primary"
          >
            {isClearing ? '正在清空' : '确认清空'}
          </button>
        </div>
        </div>
      </div>
    </GlobalDialog>
  );
}
