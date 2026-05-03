# Mirror

Mirror 是一个 AI 驱动的主体性唤醒工具，面向那些有些卡住、被惯性裹着走、又一时说不清自己到底想靠近什么的人。

它不是效率工具，也不是打卡系统；不是教练，也不是治疗师。Mirror 更像一面会成长的镜子：你可以和它说话，让零散的念头慢慢有形；也可以看语言长成星图，或接住一张很轻的小实验卡，试着从“活在惯性里”走向“活在选择里”。

## 功能概览

- 更自然、低压的人机对话体验
- 对话记录、本地记忆、实验状态保存在浏览器本地
- 长对话会自动压缩摘要，减少上下文失真
- 根据对话内容生成个人星图，逐步显影高频词与关联
- 提供轻量实验，并区分 `可探索 / 已接受 / 已完成`
- 支持在页面里手动填写 LLM URL、Model 和 API Key
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

3. 配置 LLM

推荐在页面底部「设置」里填写：

- `URL`：OpenAI 或兼容服务的 base URL，例如 `https://api.openai.com/v1`
- `Model`：对话模型名称
- `API Key`：对应服务的密钥

从页面发起对话前，以上三项都需要填写完整。配置会保存在当前浏览器本地。

也可以在服务端准备环境变量，作为 `/api/chat` 的兜底配置：

- `OPENAI_API_KEY`
- `OPENAI_MODEL`：可选，默认 `gpt-4o`
- `OPENAI_SUMMARY_MODEL`：可选，默认优先跟随 `OPENAI_MODEL`，否则使用 `gpt-4o-mini`
- `OPENAI_BASE_URL`：可选，仅在使用兼容服务或代理时需要

如果页面设置和环境变量都存在，新的对话请求会优先使用页面设置里的 `URL / Model / API Key`。

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
- 页面「设置」里的 LLM 配置也保存在当前浏览器本地。API Key 不会写入仓库或 `.env`，但发起对话时会随请求发送到本项目的 `/api/chat` 服务端路由。
- 如果没有填写完整的 `URL / Model / API Key`，首页会提示先去设置页填写，并暂时禁用输入框。
- 上下文管理机制记录在 [`docs/context-management.md`](./docs/context-management.md)。
- 当前通过 [`app/api/chat/route.ts`](./app/api/chat/route.ts) 调用 OpenAI。
- 产品构想和设计方向记录在 [`AGENT.md`](./AGENT.md)。

## 仓库注意事项

- 不要提交 `.env.local`
- 不要提交 `.next/` 和 `node_modules/`
- 如果改了对话人格或 prompt，建议同时检查 [`lib/prompts.ts`](./lib/prompts.ts) 和 [`app/api/chat/route.ts`](./app/api/chat/route.ts)

## License

Apache-2.0，详见 [`LICENSE`](./LICENSE)。
