import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const route = '/work/api-migration-confidence/';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`API story preserves its two decisions and reflows at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    // A preceding real-editor save/restore may finish its full-page HMR reload
    // just after navigation. Retry setup only, never the layout assertions.
    await expect(async () => {
      expect((await page.goto(route))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
    }).toPass({ timeout: 10_000 });
    await expect(page.locator('body')).toHaveClass('editorial-work');
    await expect(page.locator('body > header, body > footer')).toHaveCount(2);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.story-section')).toHaveCount(4);
    await expect(page.locator('.story-decisions ol > li')).toHaveCount(3);
    const diagram = page.locator('.api-decision-diagram');
    await expect(diagram).toHaveAccessibleName('Two gates, connected by the work that still matters.');
    await expect(diagram.locator('.gate')).toHaveCount(2);
    await expect(diagram.locator('.scope-exit')).toContainText('37+');
    await expect(diagram.locator('.scope-retain')).toContainText('Gate 2');
    await expect(diagram.locator('.superseded')).toContainText('not a trusted input');
    await expect(diagram.locator('.trusted-inputs')).not.toContainText('Typed');
    await expect(diagram.locator('.comparison')).toContainText('200+');
    await expect(diagram.locator('.investigation')).toContainText('75 missed behavioral branches');
    await expect(diagram.locator('.investigation')).toContainText('legacy implementation analysis');
    await expect(diagram.locator('.rerun')).toContainText('Rerun shadow-diff comparison');
    await expect(diagram.locator('.match-path')).toContainText('not a claim of full parity');
    await expect(diagram.locator('.ci-outcome')).toContainText('integrated into CI');
    await expect(diagram.locator('figcaption, .diagram-summary')).toHaveCount(2);
    await expect(diagram.locator('svg:not([aria-hidden="true"])')).toHaveCount(0);

    const scope = await diagram.locator('.scope-gate').boundingBox();
    const behavior = await diagram.locator('.behavior-gate').boundingBox();
    const hero = await page.locator('.entry-heading').boundingBox();
    const preview = await page.locator('.api-preview').boundingBox();
    const previewLabels = await page.locator('.preview-gate, .preview-flow > p').all();
    for (let i = 0; i < previewLabels.length; i++) {
      const box = await previewLabels[i].boundingBox();
      expect(await previewLabels[i].evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
      for (let j = i + 1; j < previewLabels.length; j++) {
        const other = await previewLabels[j].boundingBox();
        const overlapX = Math.min(box!.x + box!.width, other!.x + other!.width) - Math.max(box!.x, other!.x);
        const overlapY = Math.min(box!.y + box!.height, other!.y + other!.height) - Math.max(box!.y, other!.y);
        expect(overlapX > 0 && overlapY > 0, 'Hero labels must not obscure one another').toBe(false);
      }
    }
    if (width > 960) {
      expect(behavior!.x).toBeGreaterThan(scope!.x + scope!.width);
      expect(Math.abs(behavior!.width - scope!.width)).toBeLessThan(1);
      expect(Math.abs(behavior!.height - scope!.height)).toBeLessThan(1);
      const continuation = await diagram.locator('.retained-bridge').boundingBox();
      const retained = await diagram.locator('.scope-retain').boundingBox();
      const nextGateHeading = await diagram.locator('.behavior-gate header').boundingBox();
      // The fixed curve connects the Yes lane to Gate 2's heading, not to CI
      // or the superseded client. It stays entirely outside the text panels.
      const startY = continuation!.y + continuation!.height * 0.9;
      const endY = continuation!.y + continuation!.height * 0.05;
      expect(startY).toBeGreaterThanOrEqual(retained!.y);
      expect(startY).toBeLessThanOrEqual(retained!.y + retained!.height);
      expect(endY).toBeGreaterThanOrEqual(nextGateHeading!.y);
      expect(endY).toBeLessThanOrEqual(nextGateHeading!.y + nextGateHeading!.height);
      expect(preview!.x).toBeGreaterThan(hero!.x + hero!.width);
      expect(hero!.width / preview!.width).toBeCloseTo(1.5, 1);
    } else {
      expect(behavior!.y).toBeGreaterThan(scope!.y + scope!.height);
      expect(preview!.y).toBeGreaterThanOrEqual(hero!.y + hero!.height);
    }
    expect((await diagram.boundingBox())!.y).toBeGreaterThan(preview!.y + preview!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    // Check text boxes, not just document overflow (hidden/clipped labels also fail).
    for (const text of await diagram.locator('p, h3, li, figcaption').all()) {
      const box = await text.boundingBox();
      const figure = await diagram.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(figure!.x);
      expect(box!.x + box!.width).toBeLessThanOrEqual(figure!.x + figure!.width + 1);
      expect(await text.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    }
    const headings = await page.locator('main :is(h1, h2, h3, h4)').evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));
    for (let i = 1; i < headings.length; i++) expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
}

test('API story links resolve without exposing implementation details', async ({ page, request }) => {
  await page.goto(route);
  const links = await page.locator('body > header a[href], main a[href], body > footer a[href]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')!))]);
  for (const href of links) {
    const url = new URL(href, page.url());
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect((await request.get(url.pathname)).ok(), href).toBe(true);
  }
  await expect(page.locator('.entry-story')).not.toContainText(/Moderna|engineer.months|zero customer incidents|95%/i);
  await expect(page.locator('.entry-links a[href="/work/ai-assisted-delivery/"]')).toBeVisible();
});

test.describe('native API diagrams', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('both gates, exits and loop remain understandable without JavaScript or motion', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(route);
    await expect(page.locator('.scope-exit')).toContainText('37+');
    await expect(page.locator('.scope-retain')).toContainText('Continue to Gate 2');
    await expect(page.locator('.superseded')).toBeVisible();
    await expect(page.locator('.rerun')).toBeVisible();
    await expect(page.locator('.ci-outcome')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test('API preview and nested gate labels preview and save through Tina', async ({ page }) => {
  const path = new URL('../content/work/api-migration-confidence.mdx', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await page.goto('/admin/index.html');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await expect(page.locator('iframe')).toBeVisible();
    await page.locator('iframe').evaluate((frame) => { (frame as HTMLIFrameElement).src = '/preview/work/api-migration-confidence/'; });
    const preview = page.frameLocator('iframe');
    await preview.locator('main h1').click();
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await page.getByRole('button', { name: 'Open options', exact: true }).first().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('API hero caption trial');
    await expect(preview.locator('.api-preview figcaption')).toHaveText('API hero caption trial');
    await page.getByRole('button', { name: 'api-migration-confidence', exact: true }).click();
    await page.getByRole('button', { name: '02 / Approach', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('API full diagram caption trial');
    await page.getByRole('button', { name: 'Gate 1 — migration necessity', exact: true }).click();
    await page.locator('input[name$=".scope.question"]').fill('Scope question editing trial');
    await expect(preview.locator('.scope-gate .question')).toHaveText('Scope question editing trial');
    await page.getByRole('button', { name: 'API migration — two decision gates', exact: true }).click();
    await page.getByRole('button', { name: 'Gate 2 — behavioral correctness', exact: true }).click();
    await page.locator('input[name$=".behavior.branches"]').fill('Behavior finding editing trial');
    await expect(preview.locator('.branch-finding')).toHaveText('Behavior finding editing trial');
    expect(await readFile(path, 'utf8')).toBe(original);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Behavior finding editing trial');
    const saved = await readFile(path, 'utf8');
    expect(saved).toContain('API hero caption trial');
    expect(saved).toContain('API full diagram caption trial');
    expect(saved).toContain('Scope question editing trial');
    const visitor = await page.context().newPage();
    await visitor.goto(route);
    await expect(visitor.locator('.branch-finding')).toHaveText('Behavior finding editing trial');
    await visitor.close();
  } finally {
    await page.close();
    await writeFile(path, original);
  }
});
