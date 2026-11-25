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

    await expect(page.getByRole('link', { name: /Explore working together/i })).toHaveCount(1);
    await expect(page.getByRole('link', { name: /Start a conversation/i })).toHaveCount(1);
    await expect(page.getByRole('link', { name: /Send an inquiry instead/i })).toHaveCount(1);

    await expect(page.getByRole('link', { name: /Explore working together/i })).toHaveAttribute('href', 'https://app.reclaim.ai/m/juanvistro/intro-conversation');
    await expect(page.getByRole('link', { name: /Start a conversation/i })).toHaveAttribute('href', 'https://app.reclaim.ai/m/juanvistro/intro-conversation');
    await expect(page.getByRole('link', { name: /Send an inquiry instead/i })).toHaveAttribute('href', 'https://forms.clickup.com/9014549590/f/8cmy72p-11434/0J4GZPYUQK3WOMCACO');

    for (const name of [/Explore working together/i, /Start a conversation/i, /Send an inquiry instead/i]) {
      const link = page.getByRole('link', { name });
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    if (width < 768) {
      await page.locator('[data-mobile-nav] summary').click();
      await expect(page.locator('[data-mobile-nav] a[aria-current="page"]')).toHaveAttribute('href', '/work-with-me/');
    } else {
      await expect(page.locator('.desktop-nav a[aria-current="page"]')).toHaveAttribute('href', '/work-with-me/');
    }
    await page.keyboard.press('Tab');
    await page.locator('.hero-actions .button-link').focus();
    await expect(page.locator('.hero-actions .button-link')).toHaveCSS('outline-style', 'solid');
    await expect(page.locator('.hero-actions .button-link')).toHaveCSS('outline-color', 'rgb(243, 237, 227)');
    await expect(page.locator('.hero-media video')).toHaveCount(1);
    await expect(page.locator('body > header')).toHaveCount(1);
    await expect(page.locator('body > footer')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
