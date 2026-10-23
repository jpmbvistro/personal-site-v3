import { expect, test } from '@playwright/test';
import { readFile, writeFile, unlink } from 'node:fs/promises';

const workPath = new URL('../content/work/browser-fixture.mdx', import.meta.url);
const projectPath = new URL('../content/projects/browser-fixture.mdx', import.meta.url);
const created: URL[] = [];

test.describe('collection rendering and publication', () => {
  test.beforeAll(async () => {
    await writeFile(workPath, '---\ntitle: Work rendering fixture\ndraft: false\n---\n\nA minimal published work entry.\n', { flag: 'wx' });
    created.push(workPath);
    await writeFile(projectPath, '---\ntitle: Project rendering fixture\ndraft: false\n---\n\nA minimal published project entry.\n', { flag: 'wx' });
    created.push(projectPath);
  });

  test.afterAll(async () => {
    await Promise.all(created.splice(0).map((file) => unlink(file)));
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`all routes and optional metadata fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/work/', '/projects/', '/about/', '/contact/', '/resume/', '/work/browser-fixture/', '/projects/browser-fixture/']) {
        await expect(async () => {
          const response = await page.goto(route);
          expect(response?.status()).toBe(200);
        }).toPass();
        await expect(page.locator('main h1')).toHaveCount(1);
        await expect(page.locator('body > header')).toHaveCount(1);
        await expect(page.locator('body > footer')).toHaveCount(1);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
        await expect(page.locator('.entry-meta, .tags, .entry-links')).toHaveCount(0);
      }
    });
  }

  test('published entries feed home and indexes, while draft routes do not exist', async ({ page, request }) => {
    for (const route of ['/', '/work/']) {
      await page.goto(route);
      await expect(page.getByRole('link', { name: 'Work rendering fixture' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Building an AI-assisted delivery workflow' })).toHaveCount(0);
    }
    for (const route of ['/', '/projects/']) {
      await page.goto(route);
      await expect(page.getByRole('link', { name: 'Project rendering fixture' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Keel', exact: true })).toHaveCount(0);
    }
    expect((await request.get('/work/ai-assisted-delivery/')).status()).toBe(404);
    expect((await request.get('/projects/keel/')).status()).toBe(404);
  });

  test('draft block preview is readable at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/preview/work/ai-assisted-delivery/');
    await expect(page.locator('.draft-note')).toBeVisible();
    await expect(page.locator('.metric-strip dt')).toHaveCount(2);
    await expect(page.locator('.metric-strip')).toContainText('35/40');
    await expect(page.locator('.metric-strip')).toContainText('Not zero human intervention');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test('publishing and unpublishing refreshes local routes and listings without a restart', async ({ page, request }) => {
    for (const [file, section] of [[workPath, 'work'], [projectPath, 'projects']] as const) {
      const original = await readFile(file, 'utf8');
      try {
        await writeFile(file, original.replace('draft: false', 'draft: true'));
        await expect.poll(async () => (await request.get(`/${section}/browser-fixture/`)).status()).toBe(404);
        await page.goto(`/${section}/`);
        await expect(page.locator('a[href$="/browser-fixture/"]')).toHaveCount(0);
      } finally {
        await writeFile(file, original);
      }
      await expect.poll(async () => (await request.get(`/${section}/browser-fixture/`)).status()).toBe(200);
      await page.goto(`/${section}/`);
      await expect(page.locator('a[href$="/browser-fixture/"]')).toHaveCount(1);
    }
  });
});

test('homepage leads to the supplied résumé through Contact', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Contact & résumé', exact: true }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
  await page.getByRole('link', { name: 'View résumé' }).click();
  await expect(page).toHaveURL(/\/resume\/$/);
  await expect(page.locator('main h1')).toHaveText('Résumé');
  await expect(page.getByRole('heading', { name: 'Professional summary', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email Juan' })).toHaveAttribute('href', 'mailto:jpmbvistro@gmail.com');
});

test.describe('rich text without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('metric labels, values, and qualifiers are native HTML', async ({ page }) => {
    await page.goto('/preview/work/ai-assisted-delivery/');
    await expect(page.locator('.metric-strip dt')).toHaveCount(2);
    await expect(page.locator('.metric-strip')).toContainText('35/40');
    await expect(page.locator('.metric-strip')).toContainText('Not zero human intervention');
  });
});
