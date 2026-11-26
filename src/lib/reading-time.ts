// Reading time is derived from the article's authored prose only. Tina
// component props (image alt text, captions, labels) and page metadata are not
// prose; the text of an original-text thesis callout is. Rate: 200 words per
// minute, rounded up, with a one-minute floor. The same helper feeds the
// visible byline on every render, so the number cannot drift on rebuild.
export const WORDS_PER_MINUTE = 200;

type RichTextNode = {
  type?: string;
  text?: string;
  children?: RichTextNode[];
  props?: Record<string, unknown>;
};

const proseProps = ['text', 'quote'];

function collectText(node: unknown, words: string[]): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, words);
    return;
  }
  const value = node as RichTextNode;
  if (typeof value.text === 'string' && value.text.trim()) words.push(value.text.trim());
  if (value.props) {
    for (const key of proseProps) {
      const prop = value.props[key];
      if (typeof prop === 'string' && prop.trim()) words.push(prop.trim());
    }
  }
  if (Array.isArray(value.children)) {
    for (const child of value.children) collectText(child, words);
  }
}

export function readingTimeMinutes(content: unknown): number {
  const chunks: string[] = [];
  collectText(content, chunks);
  // Count per authored chunk. Joining first would turn punctuation split out
  // by inline markup (e.g. "Contour" + ":") into phantom words.
  let count = 0;
  for (const chunk of chunks) {
    for (const token of chunk.split(/\s+/)) {
      if (/\p{L}|\p{N}/u.test(token)) count += 1;
    }
  }
  return Math.max(1, Math.ceil(count / WORDS_PER_MINUTE));
}
