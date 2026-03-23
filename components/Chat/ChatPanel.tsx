'use client';

import { useEffect } from 'react';
import { INTRO_MESSAGE } from '@/lib/chatIntro';
import { useChatStore } from '@/stores/useChatStore';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatPanel() {
  const { messages, isLoading, loadMessages, initThread } = useChatStore();

  useEffect(() => {
    loadMessages();
    initThread();
  }, [initThread, loadMessages]);

  const displayMessages = messages.length === 0 ? [INTRO_MESSAGE] : messages;

  return (
    <section className="panel-glass section-shell mx-auto flex h-full w-full max-w-4xl flex-col">
      <header className="section-head mb-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="orbital-label">对话</p>
          <h2 className="type-display text-[1.3rem] leading-[1.55] text-white/88 md:text-[1.45rem]">
            从惯性里退后半步，让真正的念头先说话。
          </h2>
        </div>

        <div className="max-w-xs text-left md:text-right">
          <p className="ui-meta text-white/34">
            先选也行，自己慢慢说也行，不用一下把整团线都理出来。
          </p>
        </div>
      </header>

      <MessageList messages={displayMessages} isLoading={isLoading} />
      <ChatInput />
    </section>
  );
}
