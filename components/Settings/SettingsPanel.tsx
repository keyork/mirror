'use client';

import { useEffect, useState } from 'react';
import { EMPTY_LLM_SETTINGS, LlmSettings, useLlmSettingsStore } from '@/stores/useLlmSettingsStore';

export function SettingsPanel() {
  const { url, model, apiKey, updateSettings, clearSettings } = useLlmSettingsStore();
  const [form, setForm] = useState<LlmSettings>(EMPTY_LLM_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({ url, model, apiKey });
  }, [url, model, apiKey]);

  const updateField = (field: keyof LlmSettings, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    updateSettings({
      url: form.url.trim(),
      model: form.model.trim(),
      apiKey: form.apiKey.trim(),
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleClear = () => {
    clearSettings();
    setForm(EMPTY_LLM_SETTINGS);
    setSaved(false);
  };

  return (
    <section className="fused-shell section-shell mx-auto h-full min-h-0 w-full max-w-4xl overflow-y-auto pt-5 md:pt-7">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <p className="orbital-label">LLM 设置</p>
          <h2 className="ui-title mt-3 text-white/86">手动填写模型连接信息</h2>
          <p className="ui-copy mt-3 text-white/48">
            从页面发起对话前，需要把 URL、Model 和 API Key 填完整。保存后，新的对话请求会使用这里的配置。
          </p>
        </div>

        <div className="settings-form">
          <label className="settings-field">
            <span className="ui-meta text-white/34">URL</span>
            <input
              value={form.url}
              onChange={(event) => updateField('url', event.target.value)}
              placeholder="https://api.openai.com/v1"
              className="settings-input"
              spellCheck={false}
            />
          </label>

          <label className="settings-field">
            <span className="ui-meta text-white/34">Model</span>
            <input
              value={form.model}
              onChange={(event) => updateField('model', event.target.value)}
              placeholder="gpt-4o"
              className="settings-input"
              spellCheck={false}
            />
          </label>

          <label className="settings-field">
            <span className="ui-meta text-white/34">API Key</span>
            <input
              value={form.apiKey}
              onChange={(event) => updateField('apiKey', event.target.value)}
              placeholder="sk-..."
              type="password"
              className="settings-input"
              spellCheck={false}
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="ui-meta min-h-5 text-white/30">
            {saved ? '已保存。下一次发送消息时生效。' : '配置保存在当前浏览器本地。'}
          </p>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={handleClear} className="button-secondary">
              清除设置
            </button>
            <button type="button" onClick={handleSave} className="button-primary">
              保存设置
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
