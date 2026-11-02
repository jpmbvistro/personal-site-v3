import { expect, test } from '@playwright/test';
import { unlink, writeFile } from 'node:fs/promises';

const fixture = new URL('../content/work/list-rendering-fixture.mdx', import.meta.url);
let created = false;

test.beforeAll(async () => {
  await writeFile(fixture, `---
title: List rendering fixture
draft: true
tags:
  - Rendering fixture
---

- First bullet with enough text to wrap on a small screen and check its indentation.
- Second bullet
  - Nested bullet
  - Another nested bullet

1. First numbered step
2. Second numbered step
   1. Nested numbered step
   2. Another nested numbered step
`, { flag: 'wx' });
  created = true;
});

test.afterAll(async () => {
  if (created) await unlink(fixture);
});

test.use({ javaScriptEnabled: false });

for (const width of [320, 1440]) {
  test(`rich-text lists retain native markers and indentation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await expect(async () => {
      expect((await page.goto('/preview/work/list-rendering-fixture/'))?.status()).toBe(200);
    }).toPass({ timeout: 10_000 });

    const body = page.locator('.entry-body');
    await expect(body.locator('ul')).toHaveCount(2);
    await expect(body.locator('ol')).toHaveCount(2);
    for (const [tag, marker] of [['ul', 'disc'], ['ol', 'decimal']]) {
      for (const list of await body.locator(tag).all()) {
        await expect(list).toHaveCSS('list-style-type', marker);
        await expect(list).toHaveCSS('list-style-position', 'outside');
        expect(await list.evaluate((element) => parseFloat(getComputedStyle(element).paddingInlineStart))).toBeGreaterThan(0);
      }
    }
    for (const item of await body.locator('li').all()) {
      await expect(item).toHaveCSS('display', 'list-item');
    }
    await expect(page.locator('.tags')).toHaveCSS('list-style-type', 'none');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
