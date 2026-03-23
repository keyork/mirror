'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/useAppStore';

export function IntroScreen() {
  const [phase, setPhase] = useState<'idle' | 'flipping'>('idle');
  const [show, setShow] = useState(true);
  const { setIntroComplete } = useAppStore();

  const handleEnter = () => {
    if (phase !== 'idle') return;
    setIntroComplete();
    setPhase('flipping');
  };

  useEffect(() => {
    if (!show || phase !== 'idle') return;

    const handleKeyDown = () => {
      handleEnter();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase, setIntroComplete, show]);

  useEffect(() => {
    if (phase !== 'flipping') return;

    const t1 = window.setTimeout(() => {
      setShow(false);
    }, 1180);

    return () => {
      window.clearTimeout(t1);
    };
  }, [phase]);

  if (!show) return null;

  return (
    <div className="intro-portal fixed inset-0 z-50" onClick={handleEnter}>
      <div className={`intro-plane ${phase === 'flipping' ? 'is-flipping' : ''}`}>
        <div className="intro-stage space-y-7 text-center">
          <div className="intro-mark space-y-6 text-center">
            <p className="text-[0.64rem] uppercase tracking-[0.56em] text-white/28">Mirror</p>
            <p className="type-display text-4xl tracking-[0.36em] text-white/82 md:text-5xl">镜</p>
            <p className="type-copy text-sm tracking-[0.18em] text-white/30">
              在失重的静默里，靠近自己
            </p>
          </div>

          <div className={`transition-all duration-700 ${phase === 'idle' ? 'opacity-100' : 'translate-y-3 opacity-0'}`}>
            <p className="ui-meta text-white/28">点击或按任意键进入</p>
          </div>
        </div>
      </div>
    </div>
  );
}
