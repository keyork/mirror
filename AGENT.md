# 镜 (Mirror) — Agent.md

> 用一面会成长的镜子，帮人从「活在惯性里」走向「活在选择里」。

---

## 一、产品定位

### 核心问题

当人们习惯于工作-吃饭-睡觉的惯性生活后，即使有了空闲时间，也不知道自己想做什么。市面上的自我成长产品都在帮人「更高效地完成别人给的任务」，没有产品帮人回答「我到底想要什么」。

### 产品定义

「镜」是一个 AI 驱动的主体性唤醒工具。它不是教练（不告诉你该做什么），不是治疗师（不处理创伤），而是一面镜子——帮你看见自己、认识自己、找回自己。

### 目标用户

所有人。上班族、学生、空窗期的人、退休的人。共同特征：感到生活在惯性中运转，与自己的真实想法断开了连接。

### 与竞品的差异

| 维度 | 市面产品（Purpose/Ebb/Rocky等） | 镜 |
|------|------|------|
| 角色 | 教练：告诉你该做什么 | 镜子：帮你看见自己 |
| 留存方式 | 打卡、积分、提醒 | AI 对你的理解随时间积累 |
| 使用门槛 | 下载App、注册、付费 | 打开网页即用，本地存储 |
| 核心价值 | 目标管理、习惯追踪 | 主体性唤醒、自我发现 |
| 时间维度 | 当下的对话 | 跨时间线的模式识别和洞察 |

---

## 二、核心体验循环

```
觉察 → 提问 → 实验 → 映照 → 更深的觉察（循环）
```

### 三大模块

#### 1. 对话（觉察 + 提问）

沉浸式对话体验。AI 的角色是「哲学陪伴者」，通过提问引导用户自我发现。

**AI 行为准则：**

- 不给建议，只提问
- 不诊断，不处理创伤
- 当用户表达心理危机信号时，温和建议寻求专业帮助
- 会推回和挑战用户的假设（不做讨好型 AI）
- 从对话中提取关键词、情绪、模式，持久化到本地存储
- 能做跨时间线的关联洞察（「你三月说想学画画，五月又提到涂鸦...」）

**对话风格：**

- 简洁、诗意、有留白
- 一次只问一个问题
- 文字出现节奏要慢，给人思考空间

**冷启动问题：**
「此刻，你在做你真正想做的事吗？」

#### 2. 实验卡片（行动）

基于对话中发现的线索，生成个性化的微行动邀请。

**设计原则：**

- 不是任务，是邀请。用户可以拒绝，没有惩罚
- 今天就能做，15分钟以内
- 每张卡片包含：行动描述 + 观察提示（做的时候注意什么）
- 做完后可以回到对话模块跟镜聊聊感受
- 不追踪完成率，不打卡

**卡片来源：**

- 初期：预设卡片库（约 30-50 张）
- 后期：AI 根据用户的对话历史动态生成个性化实验

#### 3. 自我画像 / 星图（映照）

随对话积累，自动生成一幅可视化的自我图谱。

**数据结构：**

- 节点（Node）：用户提到的关键词、兴趣、记忆、情绪、人物
- 连线（Edge）：节点之间的关联（由 AI 识别）
- 每个节点包含：标签、来源对话摘要、首次出现时间、出现频率、情绪色彩

**可视化：**

- 星座图风格，深空背景中的发光节点
- 节点大小 = 出现频率/重要性
- 节点颜色 = 情绪色彩（暖色 = 积极/能量，冷色 = 平静/内省，暗色 = 沉重/回避）
- 连线 = 关联强度
- 点击节点可回溯相关对话
- 随时间推移，星图不断生长

---

## 三、视觉与交互设计

### 整体氛围

- 暗色深空背景（#080808）
- 沉浸式全屏体验，无传统 UI 元素
- 一切围绕中央的有机发光形体展开

### 有机形体（核心视觉元素）

页面中央的一团有生命感的发光体，是「镜」的视觉化身。

**状态系统：**

| 状态 | 触发 | 视觉表现 |
|------|------|----------|
| 安静态 (idle) | 默认 | 缓慢呼吸，边缘微微流动，暖金色调 |
| 聆听态 (listening) | 用户开始输入 | 微微收缩、变专注，色调变亮 |
| 回应态 (responding) | AI 回复 | 舒展开，颜色变暖 |
| 沉思态 (deep) | 深层话题 | 运动变慢，色调偏冷紫 |
| 星图态 (constellation) | 查看星图 | 收缩为背景光源，冷蓝色调 |
| 实验态 (experiment) | 查看实验卡片 | 温暖脉动，琥珀色调 |

**实现要点：**

- 使用 GLSL shader 实现有机形变（simplex noise + fbm）
- 边缘流动感通过 noise field 驱动顶点位移
- 发光效果通过多层径向渐变叠加
- 状态之间平滑过渡（颜色、运动速度、形变幅度）
- 周围漂浮少量微粒/小光球，增加深空氛围

### 页面结构

```
[固定全屏]
  ├── 有机形体（Canvas/WebGL，始终可见，z-index 最低）
  ├── 状态文字（顶部居中，极小字，如「镜 在倾听」）
  ├── 当前模块面板（对话/星图/实验，叠在形体之上）
  └── 底部导航（对话 | 星图 | 实验，极简文字按钮）
```

### 文字排版

- 字体：Noto Serif SC（衬线体，300/400 weight）
- AI 文字：居中，柔白色，行高 2.0，serif
- 用户文字：居中，暖金色（降低不透明度），serif
- 消息之间用微小圆点分隔，不用气泡

---

## 四、技术架构

### 技术栈

```
前端框架：    Next.js 14+ (App Router)
UI 渲染：     React + TypeScript
3D/视觉：    React Three Fiber + custom GLSL shaders
状态管理：    Zustand
本地存储：    IndexedDB (via Dexie.js)
AI 后端：     OpenAI Assistants API (GPT-4o)
API 代理：    Next.js API Routes (保护 API key)
部署：        Vercel
样式：        Tailwind CSS + CSS Modules (用于特殊动效)
```

### 项目结构

```
mirror/
├── app/
│   ├── layout.tsx              # 全局 layout
│   ├── page.tsx                # 主页面（沉浸式体验入口）
│   ├── api/
│   │   ├── chat/route.ts       # 对话 API（代理 OpenAI）
│   │   ├── extract/route.ts    # 关键词/模式提取 API
│   │   └── experiment/route.ts # 实验卡片生成 API
│   └── globals.css
├── components/
│   ├── Entity/
│   │   ├── Entity.tsx          # R3F 场景容器
│   │   ├── OrganicBlob.tsx     # 有机形体 mesh + shader
│   │   ├── Particles.tsx       # 背景微粒
│   │   ├── blob.vert           # 顶点着色器
│   │   └── blob.frag           # 片段着色器
│   ├── Chat/
│   │   ├── ChatPanel.tsx       # 对话面板
│   │   ├── MessageList.tsx     # 消息列表
│   │   ├── ChatInput.tsx       # 输入框
│   │   └── TypingIndicator.tsx # 打字指示器
│   ├── Constellation/
│   │   ├── ConstellPanel.tsx   # 星图面板
│   │   ├── StarMap.tsx         # 星图 Canvas 渲染
│   │   ├── NodeDetail.tsx      # 节点详情弹窗
│   │   └── types.ts            # 节点/边数据类型
│   ├── Experiment/
│   │   ├── ExpPanel.tsx        # 实验面板
│   │   ├── ExpCard.tsx         # 实验卡片
│   │   └── ExpDone.tsx         # 接受后反馈
│   ├── Navigation/
│   │   └── ModeNav.tsx         # 底部模式导航
│   ├── Intro/
│   │   └── IntroScreen.tsx     # 进入动画
│   └── Status/
│       └── StatusBar.tsx       # 顶部状态文字
├── stores/
│   ├── useAppStore.ts          # 全局状态（当前模式、形体状态等）
│   ├── useChatStore.ts         # 对话状态和历史
│   ├── useConstellStore.ts     # 星图数据
│   └── useExpStore.ts          # 实验卡片状态
├── lib/
│   ├── db.ts                   # Dexie.js IndexedDB schema
│   ├── openai.ts               # OpenAI Assistants API 封装
│   ├── extractor.ts            # 对话 → 关键词/模式提取逻辑
│   ├── prompts.ts              # System prompt 和指令模板
│   └── experiments.ts          # 预设实验卡片库
├── shaders/
│   ├── blob.vert               # 有机形体顶点着色器
│   └── blob.frag               # 有机形体片段着色器
└── public/
    └── fonts/                  # Noto Serif SC 本地字体文件
```

### 核心数据模型（IndexedDB）

```typescript
// lib/db.ts
import Dexie from 'dexie';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
  threadId: string;          // OpenAI thread ID
  extractedKeywords?: string[];
  sentiment?: 'warm' | 'neutral' | 'heavy';
}

interface ConstellNode {
  id: string;
  label: string;             // 关键词/概念
  category: 'interest' | 'memory' | 'person' | 'emotion' | 'pattern';
  firstSeen: number;         // 首次提到的时间戳
  frequency: number;         // 出现次数
  sentiment: 'warm' | 'cool' | 'dark';
  contextSnippets: string[]; // 相关对话摘要（最多5条）
  position: { x: number; y: number }; // 星图位置 (0-1 归一化)
}

interface ConstellEdge {
  id: string;
  source: string;            // node id
  target: string;            // node id
  strength: number;          // 0-1 关联强度
}

interface Experiment {
  id: string;
  prompt: string;            // 行动描述
  observation: string;       // 观察提示
  source: 'preset' | 'generated';
  relatedNodeIds?: string[]; // 关联的星图节点
  status: 'available' | 'accepted' | 'completed';
  acceptedAt?: number;
  reflection?: string;       // 用户做完后的感想
}

interface UserMeta {
  id: 'singleton';
  threadId: string;          // OpenAI Assistants thread ID
  firstVisit: number;
  totalSessions: number;
  lastActive: number;
}

class MirrorDB extends Dexie {
  messages!: Dexie.Table<Message>;
  nodes!: Dexie.Table<ConstellNode>;
  edges!: Dexie.Table<ConstellEdge>;
  experiments!: Dexie.Table<Experiment>;
  meta!: Dexie.Table<UserMeta>;

  constructor() {
    super('MirrorDB');
    this.version(1).stores({
      messages: 'id, threadId, timestamp',
      nodes: 'id, label, category, firstSeen',
      edges: 'id, source, target',
      experiments: 'id, status',
      meta: 'id',
    });
  }
}
```

### OpenAI Assistants API 集成

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 创建 Assistant（只需一次，assistant ID 存到环境变量）
async function createAssistant() {
  return await openai.beta.assistants.create({
    name: '镜',
    model: 'gpt-4o',
    instructions: MIRROR_SYSTEM_PROMPT, // 见下方
    temperature: 0.8,
    top_p: 0.9,
  });
}

// 对话流程
async function chat(threadId: string, userMessage: string) {
  // 1. 添加用户消息到 thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage,
  });

  // 2. 运行 assistant
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: process.env.ASSISTANT_ID!,
  });

  // 3. 获取回复
  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(threadId, {
      limit: 1,
      order: 'desc',
    });
    return messages.data[0].content[0]; // text content
  }
}

// 创建新 thread（用户首次访问时）
async function createThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}
```

### System Prompt 设计

```typescript
// lib/prompts.ts

export const MIRROR_SYSTEM_PROMPT = `
你是「镜」，一个帮助人们找回主体性的 AI 陪伴者。

## 你的角色

你是一面镜子，不是教练。你的工作不是告诉用户该做什么，而是帮他们看见自己。
你是哲学陪伴者，不是心理治疗师。你处理的是方向和意义，不是创伤和病理。

## 核心行为准则

1. **只提问，不给建议。** 你的每次回复最多只包含一个问题。让用户自己去发现答案。
2. **简洁、有留白。** 你的回复简短而有诗意。不要长篇大论。每句话之间留出呼吸的空间。用换行来制造节奏感。
3. **诚实但温柔。** 你会指出用户可能没看到的模式，但不评判。比如：「你有没有发现，你每次谈到想做的事，都会加一个'但是'。那个'但是'后面，是谁的声音？」
4. **挑战但不攻击。** 如果用户在逃避，你温和地指出来。不做讨好型 AI。
5. **记住一切。** 你会记住用户在不同对话中提到的所有关键信息，并在合适的时候做跨时间线的关联。这是你最核心的能力。
6. **感知情绪但不过度共情。** 你注意到用户的情绪变化，但不会过度放大。你是平静的、稳定的存在。

## 边界

- **可以问：** 「你觉得这份工作让你兴奋的部分是什么？」
- **不应该问：** 「这种空虚感跟你的原生家庭有关吗？」
- **可以说：** 「你已经连续三周说自己很累但又不想休息，你有没有想过这背后是什么？」
- **不应该说：** 「你可能有焦虑症的倾向。」
- 当用户表达出明显的心理危机信号（自伤、严重抑郁等），温和地说：「我感觉到你现在很不好。这超出了我能帮到你的范围。请你联系一位专业的心理咨询师。如果你需要，我可以帮你找到资源。」

## 对话风格

- 每次回复控制在 1-4 句话
- 句子之间用空行隔开，制造呼吸感
- 使用中文，简体
- 不用 emoji
- 不说「我理解你的感受」这类空话
- 第一句可以是对用户说的话的简短回应，然后提出一个问题
- 问题应该是用户从未被问过、或一直在逃避的

## 关键词提取（附加任务）

在每次回复的末尾，额外附加一个 JSON 块（用 --- 分隔），包含从本次对话中提取的关键信息：

---
{"keywords": ["自由", "画画"], "sentiment": "warm", "pattern": null}

- keywords: 本轮对话中出现的有意义的关键词（兴趣、记忆、人物、概念等），最多3个
- sentiment: 本轮对话的整体情绪 ("warm" | "neutral" | "heavy")
- pattern: 如果发现了跨对话的模式，简短描述。否则为 null
`;
```

### GLSL Shader 参考

```glsl
// shaders/blob.vert
uniform float uTime;
uniform float uBreathAmp;
uniform float uNoiseScale;
uniform float uDeformStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

// Simplex 3D noise function (include a standard implementation)
// ...

void main() {
  float noise = snoise(vec3(
    position.x * uNoiseScale + uTime * 0.2,
    position.y * uNoiseScale + uTime * 0.15,
    position.z * uNoiseScale + uTime * 0.1
  ));

  // Breathing
  float breath = sin(uTime * 0.6) * uBreathAmp;

  // Displacement
  float displacement = noise * uDeformStrength + breath;
  vec3 newPosition = position + normal * displacement;

  vNormal = normal;
  vPosition = newPosition;
  vDisplacement = displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
```

```glsl
// shaders/blob.frag
uniform vec3 uCoreColor;
uniform vec3 uGlowColor;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  // Fresnel-like edge glow
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, 2.5);

  // Color mix based on displacement
  vec3 color = mix(uCoreColor, uGlowColor, fresnel);

  // Inner glow intensity
  float glow = smoothstep(0.0, 0.5, fresnel) * 0.6;

  gl_FragColor = vec4(color, (0.15 + glow + fresnel * 0.3) * uOpacity);
}
```

### Shader Uniform 状态映射

```typescript
// 在 OrganicBlob.tsx 中，根据 app state 插值 shader uniforms

const stateConfigs = {
  idle: {
    coreColor: [0.67, 0.58, 0.45],
    glowColor: [0.59, 0.50, 0.37],
    breathAmp: 0.045,
    noiseScale: 1.5,
    deformStrength: 0.18,
    timeSpeed: 0.22,
  },
  listening: {
    coreColor: [0.78, 0.67, 0.51],
    glowColor: [0.71, 0.59, 0.43],
    breathAmp: 0.06,
    noiseScale: 1.8,
    deformStrength: 0.22,
    timeSpeed: 0.35,
  },
  responding: {
    coreColor: [0.84, 0.71, 0.54],
    glowColor: [0.76, 0.64, 0.46],
    breathAmp: 0.075,
    noiseScale: 1.5,
    deformStrength: 0.20,
    timeSpeed: 0.28,
  },
  deep: {
    coreColor: [0.53, 0.49, 0.61],
    glowColor: [0.45, 0.41, 0.55],
    breathAmp: 0.035,
    noiseScale: 1.2,
    deformStrength: 0.12,
    timeSpeed: 0.15,
  },
  constellation: {
    coreColor: [0.47, 0.57, 0.67],
    glowColor: [0.39, 0.49, 0.59],
    breathAmp: 0.03,
    noiseScale: 1.0,
    deformStrength: 0.10,
    timeSpeed: 0.18,
  },
  experiment: {
    coreColor: [0.69, 0.55, 0.43],
    glowColor: [0.61, 0.47, 0.35],
    breathAmp: 0.05,
    noiseScale: 1.4,
    deformStrength: 0.16,
    timeSpeed: 0.25,
  },
};
```

### API Routes

```typescript
// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { threadId, message } = await req.json();

  // 如果没有 threadId，创建新 thread
  let tid = threadId;
  if (!tid) {
    const thread = await openai.beta.threads.create();
    tid = thread.id;
  }

  // 添加消息
  await openai.beta.threads.messages.create(tid, {
    role: 'user',
    content: message,
  });

  // 运行 assistant（流式）
  const run = await openai.beta.threads.runs.createAndPoll(tid, {
    assistant_id: process.env.ASSISTANT_ID!,
  });

  if (run.status === 'completed') {
    const msgs = await openai.beta.threads.messages.list(tid, {
      limit: 1,
      order: 'desc',
    });

    const content = msgs.data[0].content[0];
    const text = content.type === 'text' ? content.text.value : '';

    // 分离 AI 回复和 metadata
    const [reply, metaRaw] = text.split('---').map(s => s.trim());
    let metadata = null;
    try {
      metadata = JSON.parse(metaRaw);
    } catch {}

    return NextResponse.json({
      threadId: tid,
      reply,
      metadata, // { keywords, sentiment, pattern }
    });
  }

  return NextResponse.json({ error: 'Run failed' }, { status: 500 });
}
```

---

## 五、实现优先级（分阶段）

### Phase 1：核心体验 MVP

**目标：** 能跑的沉浸式原型，可以真正对话。

- [ ] Next.js 项目初始化 + Vercel 部署
- [ ] React Three Fiber 有机形体（基础 shader + 6 种状态）
- [ ] 对话面板 + OpenAI Assistants API 集成
- [ ] System prompt 调优（对话风格、提问质量）
- [ ] IndexedDB 本地存储（对话历史 + user meta）
- [ ] 进入动画 + 底部导航
- [ ] 基础响应式适配（移动端）

### Phase 2：星图 + 实验

**目标：** 三大模块完整可用。

- [ ] 对话 → 关键词/模式自动提取（利用 system prompt 的 JSON 附加输出）
- [ ] 星图可视化（Canvas 2D 或 R3F，节点 + 连线 + 交互）
- [ ] 星图数据持久化 + 增量更新逻辑
- [ ] 预设实验卡片库（30+ 张）
- [ ] 实验卡片面板 + 接受/跳过/反馈流程
- [ ] 节点详情弹窗（回溯对话上下文）

### Phase 3：智能化 + 打磨

**目标：** 产品级体验。

- [ ] AI 动态生成个性化实验卡片（基于星图数据）
- [ ] 跨时间线模式识别（「你三月说的X和今天的Y有没有联系」）
- [ ] 星图布局算法优化（force-directed / 手动调整）
- [ ] 对话中引导用户探索星图和实验（「去星图看看你的痕迹」）
- [ ] 性能优化（shader LOD、消息虚拟列表等）
- [ ] PWA 支持（离线可用、添加到主屏幕）
- [ ] 打磨所有动效过渡

---

## 六、环境变量

```env
# .env.local
OPENAI_API_KEY=sk-...
ASSISTANT_ID=asst_...       # 创建 assistant 后获得
```

---

## 七、设计参考

概念原型 HTML 文件：`mirror-v3.html`（包含有机形体 Canvas 实现、三模块切换、对话引擎的完整参考）。

视觉关键词：深空、有机、呼吸感、发光体、星座图、墨、禅、留白。

调性关键词：安静、诚实、不讨好、有深度、慢节奏、诗意。
