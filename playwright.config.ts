import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: 'http://localhost:4322', trace: 'retain-on-failure' },
  webServer: {
    command: 'TINA_PUBLIC_IS_LOCAL=true npx tinacms dev -c "astro dev --ignore-lock --port 4322"',
    url: 'http://localhost:4322/admin/index.html',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
