import { NextResponse } from 'next/server';
import OpenAI from 'openai';

interface LlmSettings {
  url?: string;
  model?: string;
  apiKey?: string;
}

function cleanSetting(value?: string) {
  return typeof value === 'string' ? value.trim() : '';
}

function getValidTemperature(model: string, desiredTemperature: number): number {
  const modelName = model.toLowerCase();
  return ['o1', 'o3', 'kimi'].some((name) => modelName.includes(name))
    ? 1
    : desiredTemperature;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return '连接测试失败。';
}

export async function POST(req: Request) {
  try {
    const settings: LlmSettings = await req.json();
    const apiKey = cleanSetting(settings.apiKey);
    const baseURL = cleanSetting(settings.url);
    const model = cleanSetting(settings.model);

    if (!baseURL || !model || !apiKey) {
      return NextResponse.json(
        { error: '请先填写 URL、Model 和 API Key。' },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey, baseURL });
    const response = await client.chat.completions.create({
      model,
      temperature: getValidTemperature(model, 0),
      messages: [
        {
          role: 'user',
          content: '请只回复 OK，用于连接测试。',
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      message: response.choices[0]?.message?.content?.trim() || 'OK',
    });
  } catch (error) {
    console.error('LLM test error:', error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
