import { expect, test } from '@playwright/test';

const brandRoutes = [
  '/', '/work/', '/projects/', '/about/', '/contact/', '/resume/',
  '/work/scaling-ux-capability/', '/work/api-migration-confidence/',
  '/work/ai-assisted-delivery/', '/work/nonprofit-crm-selection/',
  '/preview/projects/keel/',
];

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`one brand palette, typography, canvas and logo pair across routes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of brandRoutes) {
      expect((await page.goto(route))?.status(), route).toBe(200);
      await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(243, 237, 227)');
      await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(243, 237, 227)');
      await expect(page.locator('body')).toHaveCSS('color', 'rgb(52, 52, 50)');
      await expect(page.locator('body')).toHaveCSS('font-family', /Inter/);
      await expect(page.locator('main h1')).toHaveCSS('color', 'rgb(40, 51, 43)');
      await expect(page.locator('main h1')).toHaveCSS('font-family', /Newsreader/);
      await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#F3EDE3');
      const tokens = await page.evaluate(() => {
        const style = getComputedStyle(document.body);
        return ['--accent', '--secondary', '--text-body'].map((token) => style.getPropertyValue(token).trim());
      });
      expect(tokens, route).toEqual(['#b17750', '#d2c6b8', '1rem']);

      const header = (await page.locator('body > header .container').boundingBox())!;
      const gutter = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('body > header .container')!).marginLeft));
      expect(header.width, route).toBeCloseTo(Math.min(1440, width - 2 * gutter), 1);
      for (const container of await page.locator('main .container, body > footer .container').all()) {
        const box = (await container.boundingBox())!;
        expect(box.x, route).toBeCloseTo(header.x, 1);
        expect(box.width, route).toBeCloseTo(header.width, 1);
      }
      for (const [region, variant] of [['header', 'horizontal'], ['footer', 'stacked']] as const) {
        const logo = page.locator(`body > ${region} .wordmark img`);
        await expect(logo).toHaveAttribute('src', `/brand/juan-vistro-${variant}.webp`);
        await expect(logo).toHaveAttribute('alt', 'Juan Vistro');
        await logo.scrollIntoViewIfNeeded();
        await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
        await expect(logo).toHaveCSS('mix-blend-mode', 'multiply');
        await expect(logo.locator('..')).toHaveAccessibleName('Juan Vistro — home');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    }
  });
}

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
