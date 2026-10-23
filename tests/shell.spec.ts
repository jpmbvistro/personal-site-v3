import { expect, test } from '@playwright/test';

for (const width of [320, 390, 768, 1440]) {
  test(`shared shell fits at ${width}px with working destinations`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('body > header')).toHaveCount(1);
    await expect(page.locator('body > footer')).toHaveCount(1);
    await expect(page.locator('main h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    const mainNavigation = page.getByRole('navigation', { name: 'Main navigation', exact: true });
    const menu = page.locator('summary');
    if (width < 768) {
      await expect(mainNavigation).toBeHidden();
      await expect(menu).toBeVisible();
    } else {
      await expect(mainNavigation).toBeVisible();
      await expect(menu).toBeHidden();
    }

    // Verify destinations, not editorial wording or a pixel-perfect mockup.
    const hrefs = await page.locator('body > :is(header, main, footer) a[href], body > a[href]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute('href')!))],
    );
    for (const href of hrefs) {
      const url = new URL(href, page.url());
      if (url.origin !== new URL(page.url()).origin) continue;
      const response = await page.request.get(`${url.origin}${url.pathname}`);
      expect(response.ok(), href).toBe(true);
      if (url.hash) await expect(page.locator(url.hash)).toHaveCount(1);
    }
  });
}

test('keyboard skip link and mobile disclosure navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  const menu = page.locator('summary');
  await menu.focus();
  await page.keyboard.press('Enter');
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(navigation.getByRole('link').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect(menu).toBeFocused();

  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work\/$/);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeHidden();
  await expect(page.locator('main h1')).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('content and native mobile navigation remain usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('main h1')).toBeVisible();
    await page.locator('summary').click();
    const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(navigation).toBeVisible();
    await navigation.getByRole('link', { name: 'Work', exact: true }).click();
    await expect(page).toHaveURL(/\/work\/$/);
  });
});
