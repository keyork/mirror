# Mirror

Mirror 是一个 AI 驱动的主体性唤醒工具，面向那些有些卡住、被惯性裹着走、又一时说不清自己到底想靠近什么的人。

它不是效率工具，也不是打卡系统；不是教练，也不是治疗师。Mirror 更像一面会成长的镜子：你可以和它说话，让零散的念头慢慢有形；也可以看语言长成星图，或接住一张很轻的小实验卡，试着从“活在惯性里”走向“活在选择里”。

## 功能概览

- 更自然、低压的人机对话体验
- 对话记录、本地记忆、实验状态保存在浏览器本地
- 长对话会自动压缩摘要，减少上下文失真
- 根据对话内容生成个人星图，逐步显影高频词与关联
- 提供轻量实验，并区分 `可探索 / 已接受 / 已完成`
- 支持一键清空本地记忆

## 技术栈

- Next.js 16 App Router
- React 19
- TypeScript
- Zustand
- Dexie / IndexedDB
- React Three Fiber / Three.js
- OpenAI API
- Tailwind CSS 4

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 创建本地环境变量文件

```bash
cp .env.example .env.local
```

3. 填写需要的环境变量

- `OPENAI_API_KEY`
- `OPENAI_MODEL`：可选，默认 `gpt-4o`
- `OPENAI_SUMMARY_MODEL`：可选，默认优先跟随 `OPENAI_MODEL`，否则使用 `gpt-4o-mini`
- `OPENAI_BASE_URL`：可选，仅在使用兼容服务或代理时需要

4. 启动开发环境

```bash
npm run dev
```

5. 构建与生产启动

```bash
npm run build
npm run start
```

## 项目说明

- 对话历史、星图数据、实验状态、上下文摘要都保存在浏览器本地。
- 当前通过 [`app/api/chat/route.ts`](./app/api/chat/route.ts) 调用 OpenAI。
- 产品构想和设计方向记录在 [`AGENT.md`](./AGENT.md)。

## 仓库注意事项

- 不要提交 `.env.local`
- 不要提交 `.next/` 和 `node_modules/`
- 如果改了对话人格或 prompt，建议同时检查 [`lib/prompts.ts`](./lib/prompts.ts) 和 [`app/api/chat/route.ts`](./app/api/chat/route.ts)

## License

Apache-2.0，详见 [`LICENSE`](./LICENSE)。
