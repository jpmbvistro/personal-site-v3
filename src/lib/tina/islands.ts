import type { IslandRegistry } from '@tinacms/astro/experimental';
import HomePageContent from '../../components/HomePageContent.astro';
import AboutPageContent from '../../components/AboutPageContent.astro';
import PageContent from '../../components/PageContent.astro';
import EntryContent from '../../components/EntryContent.astro';
import { getHomepage, getPage, getWork, getProject } from './data';

const pathFromParams = (params: URLSearchParams) => {
  const path = params.get('path') ?? '';
  if (!/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\.mdx$/.test(path)) throw new Error('Invalid entry path');
  return path;
};

export const islands: IslandRegistry = {
  home: {
    fetch: () => getHomepage(),
    component: HomePageContent,
    wrapper: { tag: 'div', className: 'homepage' },
    propsFromData: (result) => {
      const { data, work, projects, resume } = result as Awaited<ReturnType<typeof getHomepage>>;
      return { data: data.page, work, projects, resume };
    },
  },
  about: {
    fetch: () => getPage('about.md'),
    component: AboutPageContent,
    wrapper: { tag: 'div', className: 'about-page' },
    propsFromData: (result) => ({ data: (result as Awaited<ReturnType<typeof getPage>>).data.page }),
  },
  page: {
    fetch: (_request, params) => {
      const name = params.get('page');
      // About has a dedicated route and island (src/pages/about.astro).
      if (!['contact', 'work', 'projects', 'resume'].includes(name ?? '')) throw new Error('Unknown page');
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
