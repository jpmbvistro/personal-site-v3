// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';

// Only an explicitly chosen public origin enables indexing. Do not infer the
// eventual domain (or use a per-build Vercel preview URL as a canonical origin).
const { SITE_URL } = loadEnv('production', process.cwd(), 'SITE_');

export default defineConfig({
  site: SITE_URL || undefined,
  output: 'static',
  adapter: process.env.VERCEL === '1' ? vercel() : node({ mode: 'standalone' }),
  integrations: [tina(), ...(SITE_URL ? [sitemap({
    filter: (page) => !/^\/(?:admin|preview|tina-island)(?:\/|$)/.test(new URL(page).pathname),
  })] : [])],
  vite: {
    plugins: [tailwindcss(), tinaAdminDevRedirect()],
    ssr: { noExternal: ['@tinacms/astro', '@tinacms/bridge'] },
  },
});
