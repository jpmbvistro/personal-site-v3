import { requestWithMetadata } from '@tinacms/astro';
import client from '../../../tina/__generated__/client';

export const getPage = (relativePath: string) =>
  requestWithMetadata(client.queries.page({ relativePath }), {
    priority: 'primary',
  });

export const getHome = () => getPage('home.md');

export async function getHomepage() {
  const [home, work, projects, articles, contact] = await Promise.all([
    // Contact supplies configuration, not a second editable primary document.
    getHome(), getPublishedWork(), getPublishedProjects(), getPublishedArticles(), client.queries.page({ relativePath: 'contact.md' }),
  ]);
  return { ...home, work, projects, articles, resume: contact.data.page.resume };
}

// Only an explicit false is published. Missing draft flags fail closed.
export const isPublished = (entry: { draft?: boolean | null }) => entry.draft === false;

// MODE is explicit: Tina's local build server can leave NODE_ENV=development
// in its child process, making DEV alone unsafe for a publication boundary.
export const localDraftPreview = import.meta.env.DEV && import.meta.env.MODE === 'development';

export async function getWork(relativePath: string, localPreview = false) {
  const result = await client.queries.work({ relativePath });
  if (!isPublished(result.data.work) && !(localDraftPreview && localPreview)) {
    throw new Error('Unpublished work');
  }
  return requestWithMetadata(result, { priority: 'primary' });
}

export async function getProject(relativePath: string, localPreview = false) {
  const result = await client.queries.project({ relativePath });
  if (!isPublished(result.data.project) && !(localDraftPreview && localPreview)) {
    throw new Error('Unpublished project');
  }
  return requestWithMetadata(result, { priority: 'primary' });
}

export async function getArticle(relativePath: string, localPreview = false) {
  const result = await client.queries.article({ relativePath });
  if (!isPublished(result.data.article) && !(localDraftPreview && localPreview)) {
    throw new Error('Unpublished article');
  }
  return requestWithMetadata(result, { priority: 'primary' });
}

export async function getPublishedWork() {
  const entries = [];
  let after: string | undefined;
  do {
    const { data } = await client.queries.workConnection({ first: 100, after, filter: { draft: { eq: false } } });
    for (const edge of data.workConnection.edges ?? []) {
      if (edge?.node && isPublished(edge.node)) entries.push(edge.node);
    }
    after = data.workConnection.pageInfo.hasNextPage ? data.workConnection.pageInfo.endCursor ?? undefined : undefined;
  } while (after);
  return entries;
}

export async function getPublishedProjects() {
  const entries = [];
  let after: string | undefined;
  do {
    const { data } = await client.queries.projectConnection({ first: 100, after, filter: { draft: { eq: false } } });
    for (const edge of data.projectConnection.edges ?? []) {
      if (edge?.node && isPublished(edge.node)) entries.push(edge.node);
    }
    after = data.projectConnection.pageInfo.hasNextPage ? data.projectConnection.pageInfo.endCursor ?? undefined : undefined;
  } while (after);
  return entries;
}

export async function getPublishedArticles() {
  const entries = [];
  let after: string | undefined;
  do {
    const { data } = await client.queries.articleConnection({ first: 100, after, filter: { draft: { eq: false } } });
    for (const edge of data.articleConnection.edges ?? []) {
      if (edge?.node && isPublished(edge.node)) entries.push(edge.node);
    }
    after = data.articleConnection.pageInfo.hasNextPage ? data.articleConnection.pageInfo.endCursor ?? undefined : undefined;
  } while (after);
  return entries;
}
