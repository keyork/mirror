'use client';

import { useState } from 'react';
import { clearMirrorMemory } from '@/lib/memory';
import { ResetMemoryDialog } from './ResetMemoryDialog';

export function ResetMemoryButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = async () => {
    if (isClearing) return;

    setIsClearing(true);
    setIsDone(false);

    try {
      await clearMirrorMemory();
      setIsOpen(false);
      setIsDone(true);
      window.setTimeout(() => setIsDone(false), 2000);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isClearing}
        className="button-secondary min-w-[7.5rem] whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40"
        title="清空本地记忆"
      >
        {isClearing ? '正在清空' : isDone ? '已清空' : '清空记忆'}
      </button>

      {isOpen && (
        <ResetMemoryDialog
          isClearing={isClearing}
          onClose={() => setIsOpen(false)}
          onConfirm={handleReset}
        />
      )}
    </>
  );
}
