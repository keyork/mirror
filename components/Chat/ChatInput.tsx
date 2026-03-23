'use client';

import { useEffect, useRef, useState } from 'react';
import { INTRO_MESSAGE } from '@/lib/chatIntro';
import { extractReplyOptions } from '@/lib/replyOptions';
import { useAppStore } from '@/stores/useAppStore';
import { useChatStore } from '@/stores/useChatStore';
import { QuickChoices } from './QuickChoices';

const DEEP_TONE_REGEX = /意义|为什么|空虚|迷茫|害怕|疲惫|不想|不知道|选择/;

export function ChatInput() {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blurTimerRef = useRef<number | null>(null);
  const { mode, setEntityState } = useAppStore();
  const { messages, replyOptions, sendMessage, isLoading } = useChatStore();

  const getTone = (input: string) =>
    input.length > 40 || DEEP_TONE_REGEX.test(input) ? 'deep' : 'listening';

  const submitMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    setValue('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setEntityState(getTone(trimmed) === 'deep' ? 'deep' : 'responding');
    await sendMessage(trimmed);
    setEntityState('listening');
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (mode !== 'chat' || isLoading) return;

    const focusTextarea = () => {
      textareaRef.current?.focus();
      setEntityState(value.trim() ? getTone(value) : 'listening');
    };

    const frame = window.requestAnimationFrame(focusTextarea);
    return () => window.cancelAnimationFrame(frame);
  }, [mode, isLoading, setEntityState, value]);

  useEffect(() => {
    return () => {
      if (blurTimerRef.current) {
        window.clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    setEntityState(nextValue.trim().length === 0 ? 'listening' : getTone(nextValue));

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleBlur = () => {
    if (mode !== 'chat' || isLoading) return;

    blurTimerRef.current = window.setTimeout(() => {
      textareaRef.current?.focus();
      setEntityState(value.trim() ? getTone(value) : 'listening');
    }, 0);
  };

  const handleSubmit = async () => {
    await submitMessage(value);
  };

  const handleKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const lastAiMessage = [...messages].reverse().find((message) => message.role === 'ai');
  const autoReplyOptions =
    replyOptions.length > 0
      ? replyOptions
      : extractReplyOptions(lastAiMessage?.content || INTRO_MESSAGE.content);
  const choiceOptions = autoReplyOptions.map((option) => ({ label: option, value: option }));
  const showChoices = !value.trim() && !isLoading;

  return (
    <div className="mt-5 border-t border-white/8 pt-5">
      <div className="mx-auto max-w-[36rem] rounded-[1.45rem] border border-white/10 bg-black/16 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        {showChoices && choiceOptions.length > 0 && (
          <div className="mb-4">
            <p className="ui-meta text-white/30">
              先选一个也行。如果都不贴，你就按自己的说法来。
            </p>
            <QuickChoices
              options={choiceOptions}
              disabled={isLoading}
              onSelect={(nextValue) => {
                void submitMessage(nextValue);
              }}
            />
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onFocus={() => setEntityState(value.trim() ? getTone(value) : 'listening')}
          onBlur={handleBlur}
          onKeyDown={handleKey}
          placeholder="都不贴的话，就按你自己的说法来。"
          rows={1}
          disabled={isLoading}
          className="type-copy min-h-[3rem] w-full resize-none bg-transparent text-[1rem] leading-8 text-amber-50/78 outline-none placeholder:text-white/22"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="ui-meta text-white/26">
            Enter 发送，Shift + Enter 换行
          </p>
          <button
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="button-secondary disabled:cursor-not-allowed disabled:opacity-25"
          >
            把它交给镜
          </button>
        </div>
      </div>
    </div>
  );
}
