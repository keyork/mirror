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
    <section className="panel-glass section-shell mx-auto flex h-full w-full max-w-4xl flex-col pt-4 md:pt-5">
      <MessageList messages={displayMessages} isLoading={isLoading} />
      <ChatInput />
    </section>
  );
}
