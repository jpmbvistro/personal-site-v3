// Tina owns URLs, but authored links must not become executable browser URLs.
export function safeHref(value?: string | null): string | undefined {
  if (!value) return undefined;
  const url = value.trim();
  if (/[\u0000-\u0020\u007f\\]/.test(url)) return undefined;
  if (/^\/(?!\/)/.test(url) || /^#[\w-]+$/.test(url)) return url;
  if (/^https?:\/\//i.test(url) || /^mailto:[^@]+@[^@]+$/i.test(url)) return url;
  return undefined;
}
