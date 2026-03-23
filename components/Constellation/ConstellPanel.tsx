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
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
        <p className="ui-meta text-white/32">反复出现的词，会在这里慢慢留下位置。</p>
        <div className="flex flex-wrap justify-end gap-2">
          <div className="metric-tile min-w-[4.3rem] px-3 py-2 text-center">
            <p className="ui-meta text-amber-100/50">暖光</p>
            <p className="mt-1 text-base text-white/82">{stats.warm}</p>
          </div>
          <div className="metric-tile min-w-[4.3rem] px-3 py-2 text-center">
            <p className="ui-meta text-cyan-100/50">冷光</p>
            <p className="mt-1 text-base text-white/82">{stats.cool}</p>
          </div>
          <div className="metric-tile min-w-[4.3rem] px-3 py-2 text-center">
            <p className="ui-meta text-violet-100/45">暗潮</p>
            <p className="mt-1 text-base text-white/82">{stats.dark}</p>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.7rem] border border-white/7 bg-black/10">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-md space-y-4 text-center">
              <p className="ui-meta text-white/28">尚未显影</p>
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
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/14 to-transparent" />
            <div className="pointer-events-none absolute left-5 top-5 z-10">
              <p className="ui-meta text-white/26">拖一会儿视线，看看什么总在靠近彼此。</p>
            </div>
            <StarMap nodes={nodes} edges={edges} onNodeClick={selectNode} />
          </>
        )}
      </div>

      {selectedNode && <NodeDetail node={selectedNode} onClose={() => selectNode(null)} />}
    </section>
  );
}
