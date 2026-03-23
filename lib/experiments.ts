export interface PresetExperiment {
  id: string;
  prompt: string;
  observation: string;
}

export const PRESET_EXPERIMENTS: PresetExperiment[] = [
  {
    id: 'exp-001',
    prompt: '找一个你很久没去过的地方，独自待上15分钟。',
    observation: '注意当你独处时，脑海中第一个浮现的念头是什么。',
  },
  {
    id: 'exp-002',
    prompt: '写下三件你曾经想做但从未开始的事。',
    observation: '对于每一件，问自己：是什么让我止步？',
  },
  {
    id: 'exp-003',
    prompt: '今天，拒绝一件你通常会答应但其实不想做的事。',
    observation: '注意说「不」之后你的感受——是轻松还是愧疚？',
  },
  {
    id: 'exp-004',
    prompt: '用手机拍10张你觉得美的东西。',
    observation: '这些照片里有什么共同点？',
  },
  {
    id: 'exp-005',
    prompt: '今天花15分钟做一件纯粹为了享受、没有任何产出的事。',
    observation: '你选择了什么？在做的过程中，你有没有觉得「这样不对」？',
  },
  {
    id: 'exp-006',
    prompt: '给一个你很久没联系的人发一条消息，就说「在想你」。',
    observation: '是什么让你一直没有联系他/她？',
  },
  {
    id: 'exp-007',
    prompt: '关掉所有通知，安静坐15分钟，不做任何事。',
    observation: '什么念头最先浮现？什么让你感到不安？',
  },
  {
    id: 'exp-008',
    prompt: '去一家你从未去过的餐厅，点一道你完全不认识的菜。',
    observation: '在陌生中，你感受到的是好奇还是抗拒？',
  },
  {
    id: 'exp-009',
    prompt: '写一封信给10年前的自己。',
    observation: '你最想告诉那个人什么？',
  },
  {
    id: 'exp-010',
    prompt: '今天，主动做一件对陌生人善意的小事。',
    observation: '这件事让你感觉如何？',
  },
  {
    id: 'exp-011',
    prompt: '找一首你年轻时喜欢的歌，完整地听一遍。',
    observation: '这首歌带你回到了哪里？你对那个时候的自己有什么感觉？',
  },
  {
    id: 'exp-012',
    prompt: '今天早起15分钟，在日出时做任何你想做的事。',
    observation: '你选择用这15分钟做什么？',
  },
  {
    id: 'exp-013',
    prompt: '画一幅你理想中的一天——不需要画得好，只需要画出来。',
    observation: '这幅画里，你在哪里？你在做什么？',
  },
  {
    id: 'exp-014',
    prompt: '今天走一条不一样的路回家。',
    observation: '当熟悉的路消失，你注意到了什么？',
  },
  {
    id: 'exp-015',
    prompt: '写下你生命中5个最重要的时刻。',
    observation: '这些时刻里，你做了什么选择？',
  },
];
