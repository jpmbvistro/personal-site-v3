import { readFileSync } from 'node:fs';

// Test navigation/publication behavior without freezing the author's titles or
// publication choices. These records use single-line YAML title scalars.
export const workStories = ['scaling-ux-capability', 'api-migration-confidence', 'ai-assisted-delivery', 'nonprofit-crm-selection'].map((slug) => {
  const source = readFileSync(new URL(`../../content/work/${slug}.mdx`, import.meta.url), 'utf8');
  const raw = source.match(/^title: (.+)$/m)![1];
  const title = raw.startsWith("'") ? raw.slice(1, -1).replaceAll("''", "'") : raw.startsWith('"') ? JSON.parse(raw) as string : raw;
  return { slug, title, published: /^draft: false$/m.test(source) };
});

export const workDrafts = workStories.filter(({ published }) => !published);
