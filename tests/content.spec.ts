import { expect, test } from '@playwright/test';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { workDrafts, workStories } from './fixtures/work-drafts';
import { writeContent } from './fixtures/write-content';

const workPath = new URL('../content/work/browser-fixture.mdx', import.meta.url);
const projectPath = new URL('../content/projects/browser-fixture.mdx', import.meta.url);
const draftPath = new URL('../content/work/browser-unpublished.mdx', import.meta.url);
const created: URL[] = [];

test.describe('collection rendering and publication', () => {
  test.beforeAll(async () => {
    await writeFile(workPath, '---\ntitle: Work rendering fixture\ndraft: false\n---\n\nA minimal published work entry.\n', { flag: 'wx' });
    created.push(workPath);
    await writeFile(projectPath, '---\ntitle: Project rendering fixture\ndraft: false\n---\n\nA minimal published project entry.\n', { flag: 'wx' });
    created.push(projectPath);
    await writeFile(draftPath, '---\ntitle: Unpublished work fixture\ndraft: true\n---\n\nA draft must not appear publicly.\n', { flag: 'wx' });
    created.push(draftPath);
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

  test('published entries feed indexes, while the homepage remains curated and draft routes do not exist', async ({ page, request }) => {
    for (const route of ['/work/']) {
      await page.goto(route);
      await expect(page.getByRole('link', { name: 'Work rendering fixture' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Unpublished work fixture' })).toHaveCount(0);
      for (const { title } of workDrafts) {
        await expect(page.getByRole('link', { name: title, exact: true })).toHaveCount(0);
      }
    }
    for (const route of ['/projects/']) {
      await page.goto(route);
      await expect(page.getByRole('link', { name: 'Project rendering fixture' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Keel', exact: true })).toHaveCount(0);
    }
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Work rendering fixture' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Project rendering fixture' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Unpublished work fixture' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Keel', exact: true })).toHaveCount(0);
    for (const { slug } of workDrafts) {
      expect((await request.get(`/work/${slug}/`)).status()).toBe(404);
    }
    expect((await request.get('/projects/keel/')).status()).toBe(404);
    expect((await request.get('/work/browser-unpublished/')).status()).toBe(404);
  });

  test('draft block preview is readable at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/preview/work/ai-assisted-delivery/');
    await expect(page.locator('.metric-strip dt')).toHaveCount(8);
    await expect(page.locator('.metric-strip').first()).toContainText('35/40');
    await expect(page.locator('.metric-strip').first()).toContainText('Human oversight');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`case study drafts use the shared layout and fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const { slug, title, published } of workStories) {
        expect((await page.goto(`/preview/work/${slug}/`))?.status()).toBe(200);
        await expect(page.locator('main h1')).toHaveText(title);
        await expect(page.locator('body > header')).toHaveCount(1);
        await expect(page.locator('body > footer')).toHaveCount(1);
        await expect(page.locator('.draft-note')).toHaveCount(published ? 0 : 1);
        expect(await page.locator('.entry-story h2').count()).toBeGreaterThan(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), slug).toBe(true);
      }
      await page.goto('/preview/work/scaling-ux-capability/');
      await expect(page.locator('.metric-strip dt')).toHaveCount(4);
      await expect(page.locator('.entry-story')).toContainText('groups may overlap');
    });
  }

  test('editorial story links to related public work', async ({ page }) => {
    await page.goto('/work/scaling-ux-capability/');
    await page.locator('.entry-links a[href="/work/api-migration-confidence/"]').click();
    await expect(page).toHaveURL(/\/work\/api-migration-confidence\/$/);
    await expect(page.locator('main h1')).toHaveText(workStories.find(({ slug }) => slug === 'api-migration-confidence')!.title);
  });

  test('publishing and unpublishing refreshes local routes and listings without a restart', async ({ page, request }) => {
    for (const [file, section] of [[workPath, 'work'], [projectPath, 'projects']] as const) {
      const original = await readFile(file, 'utf8');
      try {
        await writeContent(file, original.replace('draft: false', 'draft: true'));
        await expect.poll(async () => (await request.get(`/${section}/browser-fixture/`)).status()).toBe(404);
        // Tina indexing and Vite's full-page HMR can finish at different times.
        // Retry the observed navigation/listing, not just the route status.
        // Bound each navigation so an interrupted HMR load can actually retry;
        // the listing only needs the DOM, not every dev-server asset loaded.
        await expect(async () => {
          await page.goto(`/${section}/`, { waitUntil: 'domcontentloaded', timeout: 3_000 });
          await expect(page.locator('a[href$="/browser-fixture/"]')).toHaveCount(0);
        }).toPass({ timeout: 10_000 });
      } finally {
        await writeContent(file, original);
      }
      await expect.poll(async () => (await request.get(`/${section}/browser-fixture/`)).status()).toBe(200);
      await expect(async () => {
        await page.goto(`/${section}/`, { waitUntil: 'domcontentloaded', timeout: 3_000 });
        await expect(page.locator('a[href$="/browser-fixture/"]')).toHaveCount(1);
      }).toPass({ timeout: 10_000 });
    }
  });
});

test('homepage leads directly to the configured résumé', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View résumé' }).click();
  await expect(page).toHaveURL(/\/resume\/$/);
  await expect(page.locator('main h1')).toHaveText('Résumé');
  await expect(page.getByRole('heading', { name: 'Professional summary', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email Juan' })).toHaveAttribute('href', 'mailto:jpmbvistro@gmail.com');
});

test.describe('rich text without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  for (const { slug, title, published } of workStories) {
    test(`case study ${slug} is readable without JavaScript`, async ({ page }) => {
      await page.goto(`/preview/work/${slug}/`);
      await expect(page.locator('main h1')).toHaveText(title);
      await expect(page.locator('.draft-note')).toHaveCount(published ? 0 : 1);
      expect(await page.locator('.entry-body p').count()).toBeGreaterThan(0);
    });
  }
  test('metric labels, values, and qualifiers are native HTML', async ({ page }) => {
    await page.goto('/preview/work/ai-assisted-delivery/');
    await expect(page.locator('.metric-strip dt')).toHaveCount(8);
    await expect(page.locator('.metric-strip').first()).toContainText('35/40');
    await expect(page.locator('.metric-strip').first()).toContainText('Human oversight');
  });
});
