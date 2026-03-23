'use client';

import { useState } from 'react';
import { clearMirrorMemory } from '@/lib/memory';

export function ResetMemoryButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleReset = async () => {
    const confirmed = window.confirm('这会清空本地保存的对话、星图与实验状态。确定继续吗？');
    if (!confirmed || isClearing) return;

    setIsClearing(true);
    setIsDone(false);

    try {
      await clearMirrorMemory();
      setIsDone(true);
      window.setTimeout(() => setIsDone(false), 2000);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isClearing}
      className="button-secondary min-w-[7.5rem] disabled:cursor-not-allowed disabled:opacity-40"
      title="清空本地记忆"
    >
      {isClearing ? '正在清空' : isDone ? '已清空' : '清空记忆'}
    </button>
  );
}
