import { requestWithMetadata } from '@tinacms/astro';
import client from '../../../tina/__generated__/client';

export const getHome = () =>
  requestWithMetadata(client.queries.page({ relativePath: 'home.md' }), {
    priority: 'primary',
  });
