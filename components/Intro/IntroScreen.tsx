'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function IntroScreen() {
  const [opacity, setOpacity] = useState(0);
  const [show, setShow] = useState(true);
  const { setIntroComplete } = useAppStore();

  useEffect(() => {
    const t1 = setTimeout(() => setOpacity(1), 100);
    const t2 = setTimeout(() => setOpacity(0), 3000);
    const t3 = setTimeout(() => {
      setShow(false);
      setIntroComplete();
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [setIntroComplete]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_center,_rgba(14,20,38,0.95),_rgba(4,5,11,1)_58%)] transition-opacity duration-1000"
      style={{ opacity }}
    >
      <div className="space-y-5 text-center">
        <p className="text-[0.68rem] uppercase tracking-[0.5em] text-white/34">Mirror</p>
        <p className="type-display text-4xl tracking-[0.34em] text-white/76 md:text-5xl">镜</p>
        <p className="type-copy text-sm tracking-[0.16em] text-white/34">
          在失重的静默里，靠近自己
        </p>
      </div>
    </div>
  );
}
