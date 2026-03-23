'use client';

import { ConstellNode } from '@/lib/db';
import { GlobalDialog } from '@/components/UI/GlobalDialog';

interface Props {
  node: ConstellNode;
  onClose: () => void;
}

const sentimentText: Record<ConstellNode['sentiment'], string> = {
  warm: '暖光',
  cool: '冷光',
  dark: '暗潮',
};

export function NodeDetail({ node, onClose }: Props) {
  return (
    <GlobalDialog onClose={onClose}>
      <div className="dialog-sheet text-center">
        <div className="dialog-inner">
        <p className="orbital-label justify-center">节点回声</p>
        <h3 className="type-display mt-6 text-[1.9rem] leading-[1.5] text-white/88">{node.label}</h3>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="stream-block px-2 pb-2 pt-3">
            <p className="ui-meta text-white/34">频率</p>
            <p className="mt-2 text-lg text-white/78">{node.frequency}</p>
          </div>
          <div className="stream-block px-2 pb-2 pt-3">
            <p className="ui-meta text-white/34">情绪</p>
            <p className="mt-2 text-lg text-white/78">{sentimentText[node.sentiment]}</p>
          </div>
          <div className="stream-block px-2 pb-2 pt-3">
            <p className="ui-meta text-white/34">初见</p>
            <p className="mt-2 text-sm text-white/78">
              {new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(node.firstSeen)}
            </p>
          </div>
        </div>

        {node.contextSnippets.length > 0 && (
          <div className="mt-7 space-y-3 text-left">
            <p className="ui-kicker text-white/34">最近几次出现时，它周围的话语</p>
            {node.contextSnippets.slice(-3).map((snippet, index) => (
              <p
                key={index}
                className="type-copy stream-block px-1 pb-3 pt-3 text-[0.95rem] leading-8 text-white/52"
              >
                {snippet}
              </p>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="button-secondary mt-6"
        >
          关闭
        </button>
        </div>
      </div>
    </GlobalDialog>
  );
}
