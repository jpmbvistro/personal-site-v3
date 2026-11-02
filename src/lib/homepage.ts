import { isPublished } from './tina/data';

/** Explicit curation, with the same fail-closed publication rule as public routes. */
export function selectFeatured<T extends { draft?: boolean | null; _sys: { breadcrumbs: string[] } }>(
  entries: T[], slugs?: (string | null)[] | null,
): T[] {
  const bySlug = new Map(entries.filter(isPublished).map((entry) => [entry._sys.breadcrumbs.join('/'), entry]));
  return [...new Set(slugs ?? [])].flatMap((slug) => {
    const entry = slug ? bySlug.get(slug) : undefined;
    return entry ? [entry] : [];
  });
}
