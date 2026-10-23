import type { IslandRegistry } from '@tinacms/astro/experimental';
import HomeIntro from '../../components/HomeIntro.astro';
import PageContent from '../../components/PageContent.astro';
import EntryContent from '../../components/EntryContent.astro';
import { getHome, getPage, getWork, getProject } from './data';

const pathFromParams = (params: URLSearchParams) => {
  const path = params.get('path') ?? '';
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.mdx$/.test(path)) throw new Error('Invalid entry path');
  return path;
};

export const islands: IslandRegistry = {
  home: {
    fetch: () => getHome(),
    component: HomeIntro,
    wrapper: { tag: 'section', className: 'home-intro' },
    propsFromData: (result) => ({ data: (result as Awaited<ReturnType<typeof getHome>>).data.page }),
  },
  page: {
    fetch: (_request, params) => {
      const name = params.get('page');
      if (!['about', 'contact', 'work', 'projects', 'resume'].includes(name ?? '')) throw new Error('Unknown page');
      return getPage(`${name}.md`);
    },
    component: PageContent,
    wrapper: { tag: 'section', className: 'page-intro' },
    propsFromData: (result) => ({ data: (result as Awaited<ReturnType<typeof getPage>>).data.page }),
  },
  work: {
    fetch: (_request, params) => getWork(pathFromParams(params), params.get('preview') === '1'),
    component: EntryContent,
    wrapper: { tag: 'article', className: 'entry-content' },
    propsFromData: (result) => ({ data: (result as Awaited<ReturnType<typeof getWork>>).data.work }),
  },
  project: {
    fetch: (_request, params) => getProject(pathFromParams(params), params.get('preview') === '1'),
    component: EntryContent,
    wrapper: { tag: 'article', className: 'entry-content' },
    propsFromData: (result) => ({ data: (result as Awaited<ReturnType<typeof getProject>>).data.project }),
  },
};
