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
    <section className="fused-shell section-shell relative mx-auto flex h-full w-full max-w-5xl flex-col">
      <div className="section-head mb-4">
        <p className="ui-meta text-white/28">反复出现的词，会在这里慢慢留下位置。</p>
        <div className="inline-stat-list">
          <span className="inline-stat"><span className="ui-meta text-amber-100/44">暖光</span><strong>{stats.warm}</strong></span>
          <span className="inline-stat"><span className="ui-meta text-cyan-100/44">冷光</span><strong>{stats.cool}</strong></span>
          <span className="inline-stat"><span className="ui-meta text-violet-100/40">暗潮</span><strong>{stats.dark}</strong></span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
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
            <StarMap nodes={nodes} edges={edges} onNodeClick={selectNode} />
          </>
        )}
      </div>

      {selectedNode && <NodeDetail node={selectedNode} onClose={() => selectNode(null)} />}
    </section>
  );
}
