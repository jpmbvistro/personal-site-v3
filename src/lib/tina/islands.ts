import type { IslandRegistry } from '@tinacms/astro/experimental';
import HomeIntro from '../../components/HomeIntro.astro';
import { getHome } from './data';

export const islands: IslandRegistry = {
  home: {
    fetch: () => getHome(),
    component: HomeIntro,
    wrapper: { tag: 'section', className: 'home-intro' },
    propsFromData: (result) => ({ data: (result as Awaited<ReturnType<typeof getHome>>).data.page }),
  },
};
