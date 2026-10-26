import { expect, test } from '@playwright/test';
import { unlink, writeFile } from 'node:fs/promises';

const path = new URL('../content/work/editorial-blocks-fixture.mdx', import.meta.url);
let created = false;

test.beforeAll(async () => {
  await writeFile(path, `---
title: Editorial block rendering fixture
draft: false
presentation: editorial
---

<BlockQuote quote="Quote text only" />
<BlockQuote label="Optional label" quote="Quote with label" />
<BlockQuote quote="Quote with attribution" attribution="Test attribution" />
<BlockQuote label="Full quote" quote="Quote with both optional fields" attribution="Another test attribution" />

<MetricStrip caption="Original defaults" metrics={[{ value: "A", label: "Test value" }]} />
${[[true, false], [false, true], [true, true], [false, false]].map(([top, bottom]) => `<MetricStrip caption="Rules ${top}/${bottom}" topRule={${top}} bottomRule={${bottom}} metrics={[{ value: "A", label: "Test value" }]} />`).join('\n')}
`, { flag: 'wx' });
  created = true;
});

test.afterAll(async () => {
  if (created) await unlink(path);
});

test.use({ javaScriptEnabled: false });

for (const width of [320, 1440]) {
  test(`quote optional fields and independent metric rules render natively at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await expect(async () => {
      expect((await page.goto('/work/editorial-blocks-fixture/'))?.status()).toBe(200);
    }).toPass({ timeout: 10_000 });
    const quotes = page.locator('.story-quote');
    await expect(quotes).toHaveCount(4);
    await expect(quotes.nth(0).locator('blockquote')).toHaveText('Quote text only');
    await expect(quotes.nth(0).locator('.quote-label, figcaption')).toHaveCount(0);
    await expect(quotes.nth(1).locator('.quote-label')).toHaveText('Optional label');
    await expect(quotes.nth(1).locator('figcaption')).toHaveCount(0);
    await expect(quotes.nth(2).locator('.quote-label')).toHaveCount(0);
    await expect(quotes.nth(2).locator('figcaption')).toHaveText('Test attribution');
    await expect(quotes.nth(3).locator('.quote-label')).toHaveText('Full quote');
    await expect(quotes.nth(3).locator('figcaption')).toHaveText('Another test attribution');

    const defaults = page.locator('.metric-strip').filter({ hasText: 'Original defaults' });
    await expect(defaults).toHaveCSS('border-top-width', '1px');
    await expect(defaults).toHaveCSS('border-bottom-width', '1px');
    for (const [top, bottom] of [[true, false], [false, true], [true, true], [false, false]]) {
      const strip = page.locator('.metric-strip').filter({ hasText: `Rules ${top}/${bottom}` });
      await expect(strip).toHaveCSS('border-top-width', top ? '1px' : '0px');
      await expect(strip).toHaveCSS('border-bottom-width', bottom ? '1px' : '0px');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
