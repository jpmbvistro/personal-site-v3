import { expect, test } from '@playwright/test';

const routes = ['/', '/work/', '/projects/', '/about/', '/contact/', '/resume/'];

for (const width of [390, 1440]) {
  test(`release routes, metadata, and links work at ${width}px`, async ({ page, request }) => {
    await page.setViewportSize({ width, height: 900 });
    const checked = new Set<string>();
    for (const route of routes) {
      expect((await page.goto(route))?.status(), route).toBe(200);
      await expect(page.locator('main h1')).toBeVisible();
      // Previous specs remove temporary content; the resulting dev HMR reload
      // can replace this document between the heading check and evaluation.
      await expect(async () => {
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      }).toPass({ timeout: 10_000 });

      const title = await page.title();
      expect(title.trim()).not.toBe('');
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.trim()).toBeTruthy();
      // Social titles follow the page's H1; the HTML <title> is the separate
      // search title, so the two are intentionally allowed to differ.
      const socialTitle = (await page.locator('main h1').innerText()).trim();
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', socialTitle);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', description!);
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
      if (await page.locator('link[rel="canonical"]').count() === 0) {
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
        await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
      }

      const hrefs = await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
      for (const href of hrefs) {
        expect(href.trim(), `Empty link on ${route}`).not.toBe('');
        expect(href, `Placeholder link on ${route}`).not.toBe('#');
        const url = new URL(href, page.url());
        if (url.protocol === 'mailto:') {
          expect(url.pathname).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
          continue;
        }
        if (url.origin !== new URL(page.url()).origin) {
          expect(url.protocol, href).toBe('https:');
          continue; // External availability is not a deterministic browser test.
        }
        if (!checked.has(url.pathname)) {
          expect((await request.get(url.href)).ok(), `${route} → ${href}`).toBe(true);
          checked.add(url.pathname);
        }
        if (url.hash && url.pathname === new URL(page.url()).pathname) {
          await expect(page.locator(url.hash)).toHaveCount(1);
        }
      }
    }
  });
}

test('contact keeps the supplied external destinations and a working résumé', async ({ page }) => {
  await page.goto('/contact/');
  await expect(page.getByRole('link', { name: 'Email Juan', exact: true })).toHaveAttribute('href', 'mailto:jpmbvistro@gmail.com');
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/juan-justin-vistro/');
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/jpmbvistro');
  await page.getByRole('link', { name: 'View résumé' }).click();
  await expect(page).toHaveURL(/\/resume\/$/);
  await expect(page.locator('main h1')).toBeVisible();
});
