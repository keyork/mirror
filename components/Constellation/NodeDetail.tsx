'use client';

import { ConstellNode } from '@/lib/db';

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
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/56 p-6 backdrop-blur-md">
      <div className="panel-glass section-shell max-w-md text-center">
        <p className="orbital-label justify-center">节点回声</p>
        <h3 className="type-display mt-5 text-[1.8rem] leading-[1.55] text-white/86">{node.label}</h3>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="metric-tile">
            <p className="ui-meta text-white/34">频率</p>
            <p className="mt-2 text-lg text-white/78">{node.frequency}</p>
          </div>
          <div className="metric-tile">
            <p className="ui-meta text-white/34">情绪</p>
            <p className="mt-2 text-lg text-white/78">{sentimentText[node.sentiment]}</p>
          </div>
          <div className="metric-tile">
            <p className="ui-meta text-white/34">初见</p>
            <p className="mt-2 text-sm text-white/78">
              {new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(node.firstSeen)}
            </p>
          </div>
        </div>

        {node.contextSnippets.length > 0 && (
          <div className="mt-6 space-y-3 text-left">
            <p className="ui-kicker text-white/34">最近几次出现时，它周围的话语</p>
            {node.contextSnippets.slice(-3).map((snippet, index) => (
              <p
                key={index}
                className="type-copy rounded-2xl border border-white/8 bg-black/16 px-4 py-3 text-[0.95rem] leading-8 text-white/52"
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
  );
}
