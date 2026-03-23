'use client';

import { useEffect, useMemo } from 'react';
import { useConstellStore } from '@/stores/useConstellStore';
import { NodeDetail } from './NodeDetail';
import { StarMap } from './StarMap';

export function ConstellPanel() {
  const { nodes, edges, selectedNode, loadData, selectNode } = useConstellStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(
    () => ({
      warm: nodes.filter((node) => node.sentiment === 'warm').length,
      cool: nodes.filter((node) => node.sentiment === 'cool').length,
      dark: nodes.filter((node) => node.sentiment === 'dark').length,
    }),
    [nodes]
  );

  return (
    <section className="panel-glass section-shell relative mx-auto flex h-full w-full max-w-5xl flex-col">
      <header className="section-head mb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="orbital-label">星图</p>
          <h2 className="type-display text-[1.3rem] leading-[1.55] text-white/88 md:text-[1.45rem]">
            你反复说起的东西，正在这里慢慢聚成星群。
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-white/42">
          <div className="metric-tile">
            <p className="ui-meta text-amber-100/50">暖光</p>
            <p className="mt-1 text-lg text-white/82">{stats.warm}</p>
          </div>
          <div className="metric-tile">
            <p className="ui-meta text-cyan-100/50">冷光</p>
            <p className="mt-1 text-lg text-white/82">{stats.cool}</p>
          </div>
          <div className="metric-tile">
            <p className="ui-meta text-violet-100/45">暗潮</p>
            <p className="mt-1 text-lg text-white/82">{stats.dark}</p>
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-md space-y-4 text-center">
              <p className="orbital-label justify-center">尚未显影</p>
              <p className="ui-title text-white/72">
                与镜说上几轮，
                <br />
                星图才会从黑暗里慢慢显影。
              </p>
              <p className="ui-copy text-white/42">
                当某些词一再出现，它们会在这里留下位置、温度和彼此的牵引。
              </p>
            </div>
          </div>
        ) : (
          <StarMap nodes={nodes} edges={edges} onNodeClick={selectNode} />
        )}
      </div>

      {selectedNode && <NodeDetail node={selectedNode} onClose={() => selectNode(null)} />}
    </section>
  );
}
