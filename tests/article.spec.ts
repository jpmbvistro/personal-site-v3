import { expect, test } from '@playwright/test';

const route = '/articles/faster-code-tougher-tradeoffs/';
const description = 'A framework for thinking about automation, risk, bottlenecks, and engineering leadership in the age of AI-driven software development.';
const socialAlt = 'Faster Code, Tougher Tradeoffs by Juan Vistro, illustrated with Goldilocks overseeing a software factory where robots produce porridge faster than three bears can review and package it.';
const heroAlt = 'Goldilocks oversees a software factory from a control room while robots produce porridge and three overwhelmed bears review and package it for deployment.';

test('article renders the approved headline, subtitle and share metadata', async ({ page }) => {
  expect((await page.goto(route))?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveText('Faster Code, Tougher Tradeoffs');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main .subtitle')).toHaveText('Balancing Speed, Risk, and Opportunity in AI-Driven Software Engineering');
  await expect(page.locator('main .byline')).toHaveText('By Juan Vistro');
  await expect(page.locator('main header time')).toHaveCount(0);
  await expect(page).toHaveTitle('Faster Code, Tougher Tradeoffs | Juan Vistro');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Faster Code, Tougher Tradeoffs');
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /faster-code-tougher-tradeoffs-og-1200x630\.png$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', socialAlt);
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', socialAlt);
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

test('header order places the control-room hero after the byline and before the prose', async ({ page }) => {
  await page.goto(route);
  const order = await page.locator('#main').evaluate((main) =>
    [...main.querySelectorAll('.back-link, h1, .subtitle, .byline, .article-hero, .article-body')]
      .map((node) => node.className || node.tagName.toLowerCase()),
  );
  const indexOf = (name: string) => order.findIndex((entry) => entry.includes(name));
  const heroIndex = indexOf('article-hero');
  expect(heroIndex).toBeGreaterThan(indexOf('byline'));
  expect(heroIndex).toBeLessThan(indexOf('article-body'));

  const hero = page.locator('.article-hero img');
  await expect(hero).toHaveAttribute('src', /goldilocks-and-the-code-review-crunch\.webp$/);
  await expect(hero).toHaveAttribute('alt', heroAlt);
  await expect(hero).toHaveAttribute('width', '1280');
  await expect(hero).toHaveAttribute('height', '720');
  await expect(hero).toHaveAttribute('loading', 'eager');
  await expect(hero).toHaveAttribute('srcset', /640w.*1280w/);
  await expect(hero).toBeVisible();
  await expect(page.locator('main .article-body').first()).toContainText('Goldilocks found three bowls of porridge.');
  await expect(page.locator('main img[src*="og-1200x630"]')).toHaveCount(0);
});

test('four captioned body figures appear at their exact paragraph anchors', async ({ page }) => {
  await page.goto(route);
  const figures = page.locator('.article-figure');
  await expect(figures).toHaveCount(4);
  await expect(figures.nth(0).locator('img')).toHaveAttribute('src', /breadth-vs-depth-porridge-automation-lab\.webp$/);
  await expect(figures.nth(1).locator('img')).toHaveAttribute('src', /code-porridge-bottleneck\.webp$/);
  await expect(figures.nth(2).locator('img')).toHaveAttribute('src', /goldilocks-and-the-automation-porridge\.webp$/);
  await expect(figures.nth(3).locator('img')).toHaveAttribute('src', /the-three-bears-cozy-automation-workshop\.webp$/);

  const anchors = await page.locator('.article-body').evaluate((body) => {
    const nodes = [...body.children];
    return nodes.filter((node) => node.tagName === 'FIGURE').map((figure) => {
      const index = nodes.indexOf(figure);
      return {
        src: figure.querySelector('img')?.getAttribute('src') ?? '',
        before: nodes[index - 1]?.textContent?.trim() ?? '',
        after: nodes[index + 1]?.textContent?.trim() ?? '',
      };
    });
  });
  expect(anchors[0].before).toContain('That investment might benefit dozens of workflows without making any of them fully autonomous.');
  expect(anchors[0].after).toContain("I don't think there's an inherent order to these approaches.");
  expect(anchors[1].before).toContain('A team that previously had enough review capacity may suddenly struggle to keep up.');
  expect(anchors[1].after).toContain("It's also possible that the organization already has enough downstream capacity.");
  expect(anchors[2].before).toContain('These are all deliberate choices. They have different costs, and different consequences.');
  expect(anchors[2].after).toContain("The question isn't simply how much automation we can achieve.");
  expect(anchors[3].before).toContain('Measure and reassess.');
  expect(anchors[3].after).toContain('Within that process, I keep returning to three capabilities');

  for (const figure of await figures.all()) {
    await expect(figure.locator('figcaption')).not.toBeEmpty();
    const image = figure.locator('img');
    await expect(image).toHaveAttribute('alt', /[^\s]/);
    await expect(image).toHaveAttribute('srcset', /640w.*1280w/);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
});

test('article typography follows the editorial scale at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(route);
  const px = async (selector: string, property = 'fontSize') =>
    Number((await page.locator(selector).first().evaluate((el, prop) => getComputedStyle(el)[prop as any], property)).replace('px', ''));
  expect(await px('main h1')).toBeGreaterThanOrEqual(64);
  expect(await px('main h1')).toBeLessThanOrEqual(80);
  expect(await px('main .subtitle')).toBeGreaterThanOrEqual(24);
  expect(await px('main .subtitle')).toBeLessThanOrEqual(28);
  expect(await px('main .article-body h2')).toBeGreaterThanOrEqual(32);
  expect(await px('main .article-body h2')).toBeLessThanOrEqual(40);
  expect(await px('main .article-body p')).toBeGreaterThanOrEqual(18);
  expect(await px('main .article-body p')).toBeLessThanOrEqual(20);
  expect(await px('main .article-figure figcaption')).toBeGreaterThanOrEqual(14);
});

test('article and Work With Me link to each other', async ({ page, request }) => {
  await page.goto(route);
  await expect(page.locator('.article-body a[href="/work-with-me/"]')).toBeVisible();
  await page.goto('/work-with-me/');
  await expect(page.locator('.hero-body a[href="/articles/faster-code-tougher-tradeoffs/"]')).toBeVisible();
  expect((await request.get(route)).ok()).toBe(true);
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`article images reflow without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const image of await page.locator('.article-hero img, .article-figure img').all()) {
      await image.scrollIntoViewIfNeeded();
      const box = (await image.boundingBox())!;
      expect(box.width, 'image width').toBeLessThanOrEqual(width);
    }
  });
}
