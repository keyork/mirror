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
    <section className="fused-shell section-shell mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pt-3 md:pt-4">
      <MessageList messages={displayMessages} isLoading={isLoading} />
      <ChatInput />
    </section>
  );
}
