import { AppMode, EntityState } from '@/stores/useAppStore';

export const MODE_COPY: Record<
  AppMode,
  {
    index: string;
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  chat: {
    index: '01',
    eyebrow: '觉察与提问',
    title: '让语言慢一点，让自己浮现出来。',
    description: '这里不追求结论。镜只把你的注意力，轻轻带回你自己。',
  },
  constellation: {
    index: '02',
    eyebrow: '星图与映照',
    title: '你说过的话，正在这里慢慢重新连线。',
    description: '每一个节点，都是你反复提到的东西。靠近它，看看它为什么总在出现。',
  },
  experiment: {
    index: '03',
    eyebrow: '行动与试探',
    title: '不是任务，是一张轻轻递来的邀请。',
    description: '这些实验不要求证明什么，只邀请你离惯性远一点，看看身体会不会先知道答案。',
  },
};

export const ENTITY_STATUS: Record<
  EntityState,
  {
    label: string;
    description: string;
  }
> = {
  idle: {
    label: '镜 在等待',
    description: '让注意力像失重一样，慢慢落回内心表面。',
  },
  listening: {
    label: '镜 在倾听',
    description: '当你开始输入，镜会把呼吸收紧一些。',
  },
  responding: {
    label: '镜 在回应',
    description: '它不急着给答案，只尝试把问题擦得更清楚。',
  },
  deep: {
    label: '镜 在沉思',
    description: '当话题更深，运动会放慢，像在更冷的轨道里漂浮。',
  },
  constellation: {
    label: '镜 在映照',
    description: '此刻的光不是为了照亮前路，而是照见你留下的痕迹。',
  },
  experiment: {
    label: '镜 在邀请',
    description: '答案还没出现，但身体已经可以先迈出一小步。',
  },
};
