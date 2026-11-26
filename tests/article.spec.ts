import { expect, test } from '@playwright/test';

const route = '/articles/faster-code-tougher-tradeoffs/';
const description = 'A framework for thinking about automation, risk, bottlenecks, and engineering leadership in the age of AI-driven software development.';

test('article renders the approved headline, subtitle and share metadata', async ({ page }) => {
  expect((await page.goto(route))?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveText('Faster Code, Tougher Tradeoffs');
  await expect(page.locator('main .subtitle')).toHaveText('Balancing Speed, Risk, and Opportunity in AI-Driven Software Engineering');
  await expect(page).toHaveTitle('Faster Code, Tougher Tradeoffs | Juan Vistro');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Faster Code, Tougher Tradeoffs');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /faster-code-tougher-tradeoffs-og-1200x630\.png$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

  const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(structured['@type']).toBe('BlogPosting');
  expect(structured.headline).toBe('Faster Code, Tougher Tradeoffs');
  expect(structured.description).toBe(description);
  expect(structured.author).toEqual({ '@type': 'Person', name: 'Juan Vistro' });
  const canonicalLink = page.locator('link[rel="canonical"]');
  const canonical = (await canonicalLink.count()) ? await canonicalLink.getAttribute('href') : null;
  if (canonical) {
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    expect(structured.url).toBe(canonical);
    expect(structured.mainEntityOfPage).toBe(canonical);
  }
});

test('five captioned illustrations load with descriptive alt text', async ({ page }) => {
  await page.goto(route);
  const figures = page.locator('.article-figure');
  await expect(figures).toHaveCount(5);
  for (const figure of await figures.all()) {
    await expect(figure.locator('figcaption')).not.toBeEmpty();
    const image = figure.locator('img');
    await expect(image).toHaveAttribute('alt', /[^\s]/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});

test('article and Work With Me link to each other', async ({ page, request }) => {
  await page.goto(route);
  await expect(page.locator('.article-body a[href="/work-with-me/"]')).toBeVisible();
  await page.goto('/work-with-me/');
  await expect(page.locator('.hero-body a[href="/articles/faster-code-tougher-tradeoffs/"]')).toBeVisible();
  expect((await request.get(route)).ok()).toBe(true);
});

for (const width of [320, 390, 768, 1440]) {
  test(`article figures reflow without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const image of await page.locator('.article-figure img').all()) {
      await image.scrollIntoViewIfNeeded();
      const box = (await image.boundingBox())!;
      expect(box.width, 'figure width').toBeLessThanOrEqual(width);
    }
  });
}
