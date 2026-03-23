'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/db';

interface Props {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatTime = (timestamp: number) => {
    if (!timestamp) return '初见';

    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className="mask-edge scrollbar-none flex-1 overflow-y-auto py-2">
      {messages.map((message, index) => (
        <article key={message.id} className="mx-auto flex max-w-[33rem] flex-col items-center px-3 py-7 text-center">
          {index > 0 && (
            <div className="mb-8 flex items-center gap-3">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/10" />
              <div className="star-divider" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          )}

          <p className="ui-meta mb-4 text-white/28">
            {message.role === 'ai' ? '镜' : '你'} · {formatTime(message.timestamp)}
          </p>
          <p
            className={`type-copy max-w-[30rem] whitespace-pre-line text-center text-[1.02rem] leading-[2.22] md:text-[1.08rem] ${
              message.role === 'ai' ? 'text-white/82' : 'text-amber-100/62'
            }`}
          >
            {message.content}
          </p>
        </article>
      ))}

      {isLoading && (
        <div className="mx-auto flex max-w-xl flex-col items-center py-6 text-center">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white/10" />
            <div className="star-divider" />
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white/10" />
          </div>
          <p className="ui-meta mb-4 text-white/28">
            镜 正在组织一个问题
          </p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((value) => (
              <span
                key={value}
                className="h-1.5 w-1.5 rounded-full bg-cyan-100/45 animate-pulse"
                style={{ animationDelay: `${value * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
