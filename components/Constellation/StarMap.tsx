'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConstellEdge, ConstellNode } from '@/lib/db';

interface Props {
  nodes: ConstellNode[];
  edges: ConstellEdge[];
  onNodeClick: (node: ConstellNode) => void;
}

function getSentimentStyle(sentiment: string) {
  if (sentiment === 'warm') {
    return { core: '#efc48e', glow: 'rgba(244, 201, 141, 0.32)' };
  }

  if (sentiment === 'cool') {
    return { core: '#9bb9ff', glow: 'rgba(153, 185, 255, 0.32)' };
  }

  return { core: '#978dcb', glow: 'rgba(151, 141, 203, 0.28)' };
}

export function StarMap({ nodes, edges, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const derivedEdges = useMemo(() => {
    if (edges.length > 0 || nodes.length < 2) return edges;

    return nodes.slice(1).map((node, index) => ({
      id: `derived-${node.id}`,
      source: nodes[index].id,
      target: node.id,
      strength: 0.24 + Math.min((nodes[index].frequency + node.frequency) / 10, 0.34),
    }));
  }, [edges, nodes]);

  const orbitNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        position: {
          x: Math.min(0.9, Math.max(0.1, node.position.x)),
          y: Math.min(0.88, Math.max(0.12, node.position.y)),
        },
      })),
    [nodes]
  );

  const ambientStars = useMemo(
    () =>
      Array.from({ length: 28 }, () => ({
        x: Math.random(),
        y: Math.random(),
        radius: 0.8 + Math.random() * 1.4,
        alpha: 0.06 + Math.random() * 0.12,
      })),
    []
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = container.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const orbitRadius = Math.min(width, height) * 0.3;

    for (let index = 0; index < 3; index += 1) {
      context.beginPath();
      context.arc(centerX, centerY, orbitRadius + index * 42, 0, Math.PI * 2);
      context.strokeStyle = `rgba(255,255,255,${0.035 - index * 0.008})`;
      context.lineWidth = 1;
      context.stroke();
    }

    ambientStars.forEach((star) => {
      context.beginPath();
      context.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255,255,255,${star.alpha})`;
      context.fill();
    });

    derivedEdges.forEach((edge) => {
      const source = orbitNodes.find((node) => node.id === edge.source);
      const target = orbitNodes.find((node) => node.id === edge.target);
      if (!source || !target) return;

      const x1 = source.position.x * width;
      const y1 = source.position.y * height;
      const x2 = target.position.x * width;
      const y2 = target.position.y * height;
      const gradient = context.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(143,176,255,0.05)');
      gradient.addColorStop(0.5, 'rgba(255,222,168,0.18)');
      gradient.addColorStop(1, 'rgba(143,176,255,0.05)');

      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = gradient;
      context.lineWidth = 0.8 + edge.strength * 1.2;
      context.stroke();
    });

    orbitNodes.forEach((node) => {
      const x = node.position.x * width;
      const y = node.position.y * height;
      const hovered = node.id === hoveredNodeId;
      const radius = 4 + Math.min(node.frequency * 1.2, 10) + (hovered ? 1.5 : 0);
      const style = getSentimentStyle(node.sentiment);

      const glow = context.createRadialGradient(x, y, 0, x, y, radius * 4);
      glow.addColorStop(0, style.glow);
      glow.addColorStop(1, 'transparent');
      context.beginPath();
      context.arc(x, y, radius * 4, 0, Math.PI * 2);
      context.fillStyle = glow;
      context.fill();

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = style.core;
      context.fill();

      context.beginPath();
      context.arc(x, y, radius * 0.45, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255,255,255,0.92)';
      context.fill();

      context.fillStyle = hovered ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.56)';
      context.font = hovered ? '600 12px "Noto Serif SC", serif' : '12px "Noto Serif SC", serif';
      context.textAlign = 'center';
      context.fillText(node.label, x, y + radius + 18);
    });
  }, [ambientStars, derivedEdges, hoveredNodeId, orbitNodes]);

  useEffect(() => {
    draw();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(draw);
    observer.observe(container);

    return () => observer.disconnect();
  }, [draw]);

  const getNodeAtPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return (
      orbitNodes.find((node) => {
        const dx = node.position.x - x;
        const dy = node.position.y - y;
        return Math.sqrt(dx * dx + dy * dy) < 0.05;
      }) || null
    );
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-[28px] border border-white/8 bg-black/18"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(112,145,255,0.06),_rgba(0,0,0,0)_38%),linear-gradient(180deg,_rgba(255,255,255,0.03),_transparent_24%,_transparent_78%,_rgba(255,255,255,0.02))]" />
      <canvas
        ref={canvasRef}
        onClick={(event) => {
          const clicked = getNodeAtPoint(event.clientX, event.clientY);
          if (clicked) onNodeClick(clicked);
        }}
        onMouseMove={(event) => {
          const hovered = getNodeAtPoint(event.clientX, event.clientY);
          setHoveredNodeId(hovered?.id ?? null);
        }}
        onMouseLeave={() => setHoveredNodeId(null)}
        className="h-full w-full cursor-pointer"
      />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/8 bg-black/18 px-3 py-2 text-[0.7rem] text-white/36">
        点击节点，查看它出现过的回声
      </div>
    </div>
  );
}
