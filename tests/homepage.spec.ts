import { expect, test } from '@playwright/test';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { writeContent } from './fixtures/write-content';

const slugs = ['scaling-ux-capability', 'ai-assisted-delivery', 'api-migration-confidence', 'nonprofit-crm-selection'];
const headline = 'Designing the systems behind better product and engineering outcomes.';
const description = "I'm Juan Vistro, a technical leader focused on improving how teams decide, deliver, and evolve—through stronger systems, clearer product thinking, and practical enablement.";

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`editorial homepage is readable, ordered, and linked at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('main h1')).toHaveText(headline);
    await expect(page.locator('.introduction')).toHaveText(description);
    expect(await page.locator('.work-grid h3 a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(slugs.map((slug) => `/work/${slug}/`));
    // No mock project UI or private/draft detail links.
    await expect(page.locator('.project-grid')).toHaveCount(0);
    await expect(page.locator('main a[href*="/preview/"]')).toHaveCount(0);
    await expect(page.locator('main a[href="/projects/keel/"]')).toHaveCount(0);
    const diagram = page.getByRole('figure', { name: 'Engineering leadership philosophy' });
    await expect(diagram).toHaveAccessibleDescription(/leadership philosophy, not an organizational chart/);
    await expect(diagram.locator('.domain-title')).toHaveText(['People', 'Product', 'Systems']);
    await expect(diagram.locator('.outcomes li')).toHaveText(['Better decisions', 'More capable teams', 'Stronger delivery']);
    await expect(diagram.locator('.practices li')).toHaveText(['Coaching', 'Enablement', 'User understanding', 'Prioritization', 'Architecture', 'Delivery improvement']);
    const actions = page.locator('.hero-actions');
    if (width < 960) expect((await actions.boundingBox())!.y + (await actions.boundingBox())!.height).toBeLessThan((await diagram.boundingBox())!.y);
    if (width < 768) expect((await actions.boundingBox())!.y).toBeLessThan(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    await page.getByRole('link', { name: 'Explore selected work', exact: true }).click();
    await expect(page).toHaveURL(/#selected-work$/);
    await expect(page.locator('#selected-work')).toBeInViewport();
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute('loading', 'lazy');
      await expect(image).toHaveAttribute('width');
      await expect(image).toHaveAttribute('height');
    }
    for (const slug of slugs) expect((await request.get(`/work/${slug}/`)).ok()).toBe(true);
    await expect(page.getByRole('link', { name: 'Get in touch', exact: true })).toHaveAttribute('href', '/contact/');
    await expect(page.getByRole('link', { name: 'View résumé', exact: true })).toHaveAttribute('href', '/resume/');
    await expect(page.locator('.perspective blockquote')).toHaveCount(0);
    await expect(page.locator('body > header')).toHaveCount(1);
    await expect(page.locator('body > footer')).toHaveCount(1);
  });
}

test('curation follows edited order, rejects duplicates, missing and draft records, and supports genuine project artifacts', async ({ page, request }) => {
  const homePath = new URL('../content/pages/home.md', import.meta.url);
  const home = await readFile(homePath, 'utf8');
  const files: URL[] = [];
  try {
    for (const [slug, draft] of [['homepage-public-fixture', false], ['homepage-draft-fixture', true]] as const) {
      const file = new URL(`../content/projects/${slug}.mdx`, import.meta.url);
      await writeFile(file, `---\ntitle: ${slug}\ndraft: ${draft}\nsummary: A public-safe engineering artifact fixture.\nstatus: In development\ncardImage: /favicon.svg\ncardImageAlt: Test artifact, not a product screenshot\n---\n\nFixture.\n`, { flag: 'wx' });
      files.push(file);
    }
    const edited = home.replace('    - contour\n    - keel', '    - homepage-public-fixture\n    - homepage-draft-fixture\n    - homepage-public-fixture\n    - absent-project')
      .replace('    - scaling-ux-capability\n    - ai-assisted-delivery', '    - ai-assisted-delivery\n    - scaling-ux-capability\n    - ai-assisted-delivery\n    - absent-work');
    await writeContent(homePath, edited);
    await expect.poll(async () => (await request.get('/projects/homepage-public-fixture/')).status()).toBe(200);
    await expect(async () => {
      await page.goto('/');
      expect(await page.locator('.work-grid h3 a').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(['ai-assisted-delivery', 'scaling-ux-capability', 'api-migration-confidence', 'nonprofit-crm-selection'].map((slug) => `/work/${slug}/`));
      await expect(page.locator('.project-grid h3 a')).toHaveCount(1);
      await expect(page.locator('.project-grid h3 a')).toHaveAttribute('href', '/projects/homepage-public-fixture/');
    }).toPass();
    await expect(page.locator('.project-grid img')).toHaveAttribute('alt', 'Test artifact, not a product screenshot');
    await expect(page.locator('.project-grid')).toContainText('In development');
    expect((await request.get('/projects/homepage-draft-fixture/')).status()).toBe(404);
  } finally {
    await page.close();
    await writeContent(homePath, home);
    await Promise.all(files.map((file) => unlink(file)));
  }
});

test('missing or unsafe résumé configuration uses the available contact route', async ({ page }) => {
  const file = new URL('../content/pages/contact.md', import.meta.url);
  const original = await readFile(file, 'utf8');
  try {
    for (const value of ['', 'javascript:alert(1)']) {
      await writeContent(file, original.replace('resume: /resume/', value ? `resume: ${value}` : ''));
      await expect(async () => {
        await page.goto('/');
        await expect(page.locator('.hero-actions a').last()).toHaveText(/Get in touch/);
        await expect(page.locator('.hero-actions a').last()).toHaveAttribute('href', '/contact/');
      }).toPass();
    }
  } finally {
    await page.close();
    await writeContent(file, original);
  }
});

test.describe('native homepage', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('copy, visualization, anchor and contact work without client scripts', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/');
    await expect(page.locator('main h1')).toHaveText(headline);
    await expect(page.locator('.leadership-diagram .outcomes li')).toHaveCount(3);
    await page.getByRole('link', { name: 'Explore selected work', exact: true }).click();
    await expect(page).toHaveURL(/#selected-work$/);
    await page.getByRole('link', { name: 'Get in touch', exact: true }).click();
    await expect(page).toHaveURL(/\/contact\/$/);
  });
});
