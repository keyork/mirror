'use client';

import { useEffect } from 'react';
import { INTRO_MESSAGE } from '@/lib/chatIntro';
import { useAppStore } from '@/stores/useAppStore';
import { useChatStore } from '@/stores/useChatStore';
import { isLlmSettingsComplete, useLlmSettingsStore } from '@/stores/useLlmSettingsStore';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

export function ChatPanel() {
  const { messages, isLoading, loadMessages, initThread } = useChatStore();
  const { setMode } = useAppStore();
  const llmSettings = useLlmSettingsStore();
  const shouldShowLlmNotice = llmSettings.hasHydrated && !isLlmSettingsComplete(llmSettings);

  useEffect(() => {
    loadMessages();
    initThread();
  }, [initThread, loadMessages]);

  const displayMessages = messages.length === 0 ? [INTRO_MESSAGE] : messages;

  return (
    <section className="fused-shell section-shell mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pt-3 md:pt-4">
      {shouldShowLlmNotice && (
        <div className="llm-missing-notice mb-4">
          <div className="min-w-0">
            <p className="orbital-label">LLM 未填写</p>
            <p className="ui-copy mt-2 text-white/58">
              需要先填写 URL、Model 和 API Key，镜才能开始回应。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMode('settings')}
            className="button-primary shrink-0"
          >
            去填写设置
          </button>
        </div>
      )}
      <MessageList messages={displayMessages} isLoading={isLoading} />
      <ChatInput />
    </section>
  );
}
