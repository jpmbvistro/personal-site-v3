import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1440]) {
  test(`Work With Me is complete, editable, and fits at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto('/work-with-me/');
    expect(response?.status()).toBe(200);

    await expect(page.locator('main h1')).toHaveText('See the whole system. Lead the change.');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('main h2')).toHaveCount(5);
    await expect(page.locator('.approach-rows > li')).toHaveCount(3);
    await expect(page.locator('.engagement-rows > li')).toHaveCount(3);
    await expect(page.locator('.evidence-card')).toHaveCount(3);
    expect(await page.locator('[data-tina-field]').count()).toBeGreaterThan(20);
    await expect(page.locator('.hero-media')).toHaveCSS('aspect-ratio', '16 / 9');

    const contactActions = page.getByRole('link', { name: 'Discuss an initiative' });
    await expect(contactActions).toHaveCount(2);
    for (let i = 0; i < await contactActions.count(); i += 1) {
      await expect(contactActions.nth(i)).toHaveAttribute('href', '/contact/');
    }
    if (width < 768) {
      await page.locator('[data-mobile-nav] summary').click();
      await expect(page.locator('[data-mobile-nav] a[aria-current="page"]')).toHaveAttribute('href', '/work-with-me/');
    } else {
      await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveAttribute('href', '/work-with-me/');
    }
    await page.keyboard.press('Tab');
    await page.locator('.hero-actions a').focus();
    await expect(page.locator('.hero-actions a')).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('.hero-actions a')).toHaveCSS('outline-color', 'rgb(243, 237, 227)');
    await expect(page.getByRole('link', { name: /Reclaim|ClickUp|article/i })).toHaveCount(0);
    await expect(page.locator('body > header')).toHaveCount(1);
    await expect(page.locator('body > footer')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
