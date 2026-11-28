import type { APIRoute } from 'astro';
import { experimental_createIslandRoute } from '@tinacms/astro/experimental';
import { islands } from '../../lib/tina/islands';
import { getArticle } from '../../lib/tina/data';

export const prerender = false;

const renderIsland = experimental_createIslandRoute(islands);

export const ALL: APIRoute = async (context) => {
  // An unpublished article must not leak through the refresh endpoint. The
  // generic island handler reports a fetch failure as 500, so reject drafts
  // explicitly with the same 404 the public route uses.
  if (context.params.name === 'article') {
    const path = context.url.searchParams.get('path') ?? '';
    if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.mdx$/.test(path)) {
      return new Response('Not Found', { status: 404 });
    }
    try {
      await getArticle(path, context.url.searchParams.get('preview') === '1');
    } catch {
      return new Response('Not Found', { status: 404 });
    }
  }
  return renderIsland(context);
};
