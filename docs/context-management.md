# 上下文管理

这份文档说明 Mirror 现在如何管理对话上下文、这个方案的优缺点，以及后续更可靠的改进方向。

## 当前模型

Mirror 现在采用的是“客户端本地记忆 + 服务端按次组装上下文”的模式：

- IndexedDB 在浏览器本地保存完整对话。
- 每次请求只把“未压缩的最近消息 + 滚动摘要”发给 `/api/chat`。
- 服务端在每次请求里组装 prompt，并返回新的摘要游标。
- 模型回复里的 metadata 会派生出快捷回复选项和星图节点。

相关文件：

- `stores/useChatStore.ts`：读取本地消息、发送请求、保存回复和 metadata。
- `app/api/chat/route.ts`：压缩旧上下文、组装模型消息、解析 metadata。
- `lib/db.ts`：定义 IndexedDB 表和 `UserMeta`。
- `lib/prompts.ts`：定义主对话 prompt 和摘要 prompt。

## 本地存储内容

`messages`

- 保存当前 thread 的所有用户消息和 AI 消息。
- 通过 `threadId` 和 `timestamp` 查询。
- AI 消息可附带关键词和情绪。

`meta`

- 只有一个 `singleton` 记录。
- 保存 `threadId`、`conversationSummary`、`compressedMessageCount`、`summaryUpdatedAt`、`replyOptions`。
- `compressedMessageCount` 是当前摘要游标：它前面的消息默认已经被压进 `conversationSummary`。

`memories`

- 保存从对话中沉淀出来的长期记忆片段。
- 每条 memory item 包含 `text`、`sourceMessageIds`、`tags`、`importance`、`createdAt`、`lastUsedAt`。
- 发送新消息前，客户端会从本地检索 3-5 条相关 memory item，并随请求传给 `/api/chat`。

`nodes` 和 `edges`

- 保存由模型 metadata 派生出的星图节点和连线。
- 当前只写入星图；聊天反向检索先由 `memories` 表承担。

`experiments`

- 保存实验卡状态。
- 当前不会稳定注入聊天上下文，除非相关内容刚好被摘要捕捉到。

## 请求流程

1. `ChatInput` 调用 `useChatStore.sendMessage(content)`。
2. `sendMessage` 从本地状态读取：
   - `messages`
   - `threadId`
   - `conversationSummary`
   - `compressedMessageCount`
   - 本地 LLM 设置
3. 通过下面的方式计算这次要发送的历史：

```ts
messages.slice(compressedMessageCount)
```

4. 用户消息先乐观追加到前端 UI。
5. 浏览器 POST 到 `/api/chat`，请求体包括：
   - 当前用户消息
   - 未压缩历史
   - 已有摘要
   - 压缩游标
   - 本地 LLM 设置
   - 相关长期记忆
6. API route 判断是否需要先压缩旧消息。
7. API route 调用主对话模型，消息顺序是：
   - `MIRROR_SYSTEM_PROMPT`
   - 可选的长期摘要 system message
   - 可选的相关长期记忆 system message
   - 最近未压缩历史
   - 当前用户消息
8. API 返回：
   - AI 回复
   - metadata
   - 更新后的摘要
   - 更新后的压缩游标
9. 客户端持久化：
   - 用户消息
   - AI 回复
   - 新摘要和游标
   - 快捷回复选项
   - 由关键词生成的星图更新

## 摘要压缩策略

服务端目前在 `app/api/chat/route.ts` 里使用两个常量：

```ts
const RECENT_MESSAGE_WINDOW = 8;
const SUMMARY_TRIGGER_COUNT = 14;
```

当请求里的未压缩历史达到 14 条消息时，服务端会压缩除最近 8 条以外的旧消息。

例子：

- 客户端发来 18 条未压缩消息。
- 服务端压缩最旧的 10 条。
- 最近 8 条保留原文。
- `compressedMessageCount` 增加 10。
- 下一次请求只发送这个游标之后的消息。

摘要 prompt 要求保留：

- 反复出现的主题
- 用户在意的人或事
- 稳定冲突
- 已表达过的愿望
- 正在进行的实验
- 还没解开的线头

## Metadata 流程

主模型被要求在正常回复后用 `---` 附加 JSON：

```json
{
  "keywords": ["自由", "画画"],
  "sentiment": "warm",
  "pattern": null,
  "suggestions": ["更像是累一点", "先给我一点具体建议", "我现在还说不太清"]
}
```

API 会解析这段 metadata，并把它单独返回给前端。

前端使用 metadata 做两件事：

- `replyOptions`：生成 AI 回复后的快捷选项。
- `keywords` 和 `sentiment`：更新星图节点与连线。

如果 JSON 解析失败，系统会尝试从可见回复文本里提取快捷选项。

## Memory Item 流程

每次成功回复后，如果 metadata 里包含关键词，客户端会创建一条 memory item：

```ts
interface MemoryItem {
  id: string;
  text: string;
  sourceMessageIds: string[];
  tags: string[];
  importance: number;
  createdAt: number;
  lastUsedAt?: number;
}
```

当前 `text` 会保存用户原话片段和当时的 AI 回复片段；`tags` 来自 metadata keywords；`importance` 会根据关键词数量和情绪粗略估算。

下一次发送消息前，客户端会读取最近的 memory item，并按下面因素打分：

- 当前输入是否直接包含 memory tag
- 当前输入和 memory 文本的词面重合
- memory 的重要性
- memory 的最近性

分数靠前的最多 5 条会被注入服务端 prompt，作为“可轻轻参考”的相关记忆。

## 当前优点

- 完整对话仍保存在本地，展示层不会丢历史。
- 模型调用不会无限发送全量历史，请求规模可控。
- 滚动摘要能在长对话里提供基本连续性。
- 兼容 OpenAI 以及 OpenAI-compatible endpoint。
- 不需要用户账户或服务端长期记忆库，产品形态比较轻。

## 当前问题

1. **摘要有损。**
   旧消息一旦被压缩，原话、语气和细节就不再进入模型上下文。

2. **游标基于数量，不够稳。**
   `compressedMessageCount` 依赖本地 `messages` 数组顺序和数量不变。如果以后支持删除、过滤、迁移消息，这个游标容易失准。

3. **检索仍然偏简单。**
   当前 memory 检索基于关键词、词面重合、重要性和最近性，还没有 embedding，也没有真正理解语义相似度。

4. **实验状态没有稳定进入聊天上下文。**
   已接受或已完成的实验不会自动注入 prompt，除非它们刚好被摘要写进去。

5. **摘要质量依赖用户配置的模型。**
   如果用户设置了能力较弱的本地模型，长期记忆摘要可能很快劣化。

6. **回复和 metadata 耦合在同一次模型调用里。**
   模型既要自然聊天，又要输出干净 JSON。这样更容易出现 JSON 解析失败，或者把格式泄露到回复里。

7. **没有 token 预算。**
   当前按消息条数触发压缩，不按真实 token 数。少数超长消息仍可能让请求变重。

## 更好的方式

更稳的设计是把记忆拆成三层。

### 1. 最近原文窗口

继续保留最近 N 轮原话。这样能保存对话节奏、措辞和情绪细节。

建议改法：

- 保留现在的最近窗口。
- 从“按条数”改成“按 token 预算”。
- 给 system prompt、摘要、检索记忆、当前消息分别预留预算。

### 2. 结构化长期画像

在自由文本摘要之外，维护一份结构化长期画像：

```ts
interface LongTermProfile {
  stableThemes: string[];
  importantPeople: string[];
  recurringConflicts: string[];
  userPreferences: string[];
  boundaries: string[];
  openThreads: string[];
}
```

这份画像应该保守更新，只记录重复出现或明显重要的信息。

它比单段摘要更好维护，也更容易选择性注入 prompt。

### 3. 可检索记忆

当前已经有第一版 memory item。下一步可以把它从“关键词片段”升级成更稳定的结构化记忆：

```ts
interface MemoryItem {
  id: string;
  text: string;
  sourceMessageIds: string[];
  tags: string[];
  importance: number;
  createdAt: number;
  lastUsedAt?: number;
}
```

每次请求时，仍然只取和当前消息相关的少量记忆。

检索一开始不一定要上 embedding，可以先用：

- 关键词重合
- 最近性
- 重要性分数
- 星图节点匹配

后续如果需要更强召回，再加 embedding。

## 建议的下一步

1. 把 `compressedMessageCount` 换成 message ID 游标。

当前：

```ts
compressedMessageCount: number;
```

更稳：

```ts
lastCompressedMessageId?: string;
```

这样以后消息删除、迁移或过滤时不容易错位。

2. 加 token budget helper。

发送前估算上下文大小，根据 token 预算决定压缩多少，而不是只看消息条数。

3. 把 metadata 抽取从主回复里拆出去。

可以使用第二个轻量模型调用，或者使用严格 JSON response mode。这样主回复会更自然，metadata 也更稳定。

4. 把相关星图记忆反向注入聊天。

当用户当前消息命中已知节点时，注入一个短 memory block：

```text
Relevant memory:
- 用户已经提到过“自由”4 次，通常和 warm 情绪相关。
- 相关主题：画画、工作、选择。
```

5. 把实验状态作为显式上下文。

已接受、最近完成、正在观察的实验应该作为小块状态注入 prompt，方便 AI 自然跟进。

6. 保存摘要修订记录。

可以增加：

```ts
interface SummaryRevision {
  id: string;
  summary: string;
  sourceMessageIds: string[];
  createdAt: number;
}
```

这样更容易排查摘要漂移。

## 推荐实施路线

最稳的路线是渐进式：

1. 继续保留当前滚动摘要。
2. 新增 `lastCompressedMessageId`，迁移期仍兼容 `compressedMessageCount`。
3. 把当前 `memories` 表里的片段型 memory 升级为更结构化的 memory item。
4. 为 memory 检索增加 token 预算和去重策略。
5. 把已接受和最近完成的实验状态注入 prompt。
6. 如果 metadata JSON 失败频繁，再把 metadata 抽取拆成独立步骤。

这样不用推翻现有实现，也能明显改善长期记忆、上下文稳定性和可调试性。
