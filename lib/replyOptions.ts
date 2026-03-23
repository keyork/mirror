export function normalizeReplyOptions(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === 'string' ? item : ''))
    .map((item) => item.replace(/^[\d\s\-.*、，,]+/, '').trim())
    .filter((item) => item.length >= 2 && item.length <= 24)
    .slice(0, 3);
}

export function dedupeReplyOptions(items: string[]) {
  return Array.from(new Set(items)).slice(0, 3);
}

export function extractReplyOptions(reply: string) {
  const bulletMatches = Array.from(
    reply.matchAll(/(?:^|\n)\s*(?:[-*]|\d+[.、])\s*([^\n？！!]+)/g)
  )
    .map((match) => match[1]?.trim() || '')
    .filter((item) => item.length >= 2 && item.length <= 24);

  if (bulletMatches.length >= 2) {
    return dedupeReplyOptions(bulletMatches);
  }

  const questionLine = reply
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /[:：].+(?:、|还是).+[？?]/.test(line));

  if (!questionLine) return [];

  const inlineOptions = questionLine
    .replace(/^.*?[:：]/, '')
    .replace(/[？?].*$/, '')
    .replace(/，还是/g, '、')
    .replace(/还是/g, '、')
    .split('、')
    .map((item) => item.replace(/^(是|像是|更像是|比较像)/, '').trim())
    .filter((item) => item.length >= 2 && item.length <= 24);

  return inlineOptions.length >= 2 ? dedupeReplyOptions(inlineOptions) : [];
}
