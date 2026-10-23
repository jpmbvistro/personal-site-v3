import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';

const clientId = process.env.TINA_PUBLIC_CLIENT_ID || process.env.TINA_CLIENT_ID;
assert(clientId, 'Set TINA_PUBLIC_CLIENT_ID (or legacy TINA_CLIENT_ID) first.');
const token = process.env.TINA_TOKEN;
assert(token, 'Set TINA_TOKEN to check that it is absent from public assets.');

async function checkPublicFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkPublicFiles(path);
    else if (entry.isFile()) {
      assert(!(await readFile(path)).includes(Buffer.from(token)), `Token found in ${path}`);
    }
  }
}
await checkPublicFiles('dist/client');

// Use a free loopback port without interrupting any existing dev/preview server.
const reservation = createServer();
await new Promise((resolve) => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['dist/server/entry.mjs'], {
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let browser;
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Preview server did not start.')), 15_000);
    server.once('error', reject);
    server.once('exit', () => reject(new Error('Preview server exited before startup.')));
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Server listening')) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });

  for (const route of ['/', '/work/', '/projects/', '/about/', '/contact/', '/resume/']) {
    const response = await fetch(`${origin}${route}`);
    assert.equal(response.status, 200, `Built public route: ${route}`);
    const html = await response.text();
    assert.match(html, /<title>[^<]+<\/title>/, `Page title: ${route}`);
    assert.match(html, /property="og:description" content="[^"]+"/, `Social description: ${route}`);
  }
  for (const route of ['/preview/work/ai-assisted-delivery/', '/preview/projects/keel/', '/work/ai-assisted-delivery/', '/projects/keel/']) {
    const response = await fetch(`${origin}${route}?tina-edit=1`, { headers: { Cookie: '__tina_edit=1' } });
    assert.equal(response.status, 404, `Built draft boundary: ${route}`);
  }

  browser = await chromium.launch();
  const context = await browser.newContext();
  let loginUrl;
  // Inspect the real login navigation, but do not sign in or mutate cloud content.
  await context.route('https://app.tina.io/signin**', async (route) => {
    loginUrl = new URL(route.request().url());
    await route.fulfill({ contentType: 'text/html', body: 'Login URL captured for validation.' });
  });
  const page = await context.newPage();
  await page.goto(`${origin}/admin/index.html`);
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  assert(loginUrl, 'Tina login navigation was not captured.');
  assert(loginUrl.searchParams.get('clientId') === clientId, 'Login client ID is missing or incorrect.');
  assert(loginUrl.searchParams.get('origin') === origin, 'Login origin is incorrect.');
  console.log('Cloud artifact smoke test passed: public routes, draft exclusion, correct login client ID/origin; token absent from public assets.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
