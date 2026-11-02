import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { writeContent } from './fixtures/write-content';

const route = '/work/api-migration-confidence/';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`API story separates the scope filter and behavioral investigation at ${width}px`, async ({ page }) => {
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
    await expect(diagram).toHaveAccessibleName('Different investigations. A shared standard for evidence.');
    await expect(diagram).toHaveAccessibleDescription(/complementary, not a sequential pipeline/);
    await expect(page.locator('.api-preview .motif-labels li')).toHaveText(['Inherited work', 'Usage evidence', 'Necessity decision', 'Actual behavior', 'Live comparison', 'Investigate · revalidate']);
    await expect(diagram.locator('.investigation-panel')).toHaveCount(2);
    await expect(diagram.locator('.scope-exit')).toContainText('37+');
    await expect(diagram.locator('.scope-exit')).toContainText('No — remove');
    await expect(diagram.locator('.scope-retain')).toContainText('Yes — retain');
    await expect(diagram.locator('.scope-retain')).toContainText('Endpoints still requiring migration');
    await expect(diagram.locator('.scope-retain')).not.toContainText(/Gate 2|Continue|200\+|75/);
    await expect(diagram.locator('.superseded')).toContainText('Unreliable abstraction · deprioritized');
    await expect(diagram.locator('.superseded')).toContainText('insufficient as a reliable representation of actual behavior');
    await expect(diagram.locator('.trusted-inputs')).not.toContainText('Typed');
    await expect(diagram.locator('.behavior-investigation .investigation-intro')).toContainText('200+ endpoints');
    await expect(diagram.locator('.comparison')).not.toContainText('200+');
    await expect(diagram.locator('.source-investigation')).toContainText('75 missed behavioral branches');
    await expect(diagram.locator('.source-investigation')).toContainText('legacy JavaScript');
    await expect(diagram.locator('.rerun')).toContainText('Revalidate after correction');
    await expect(diagram.locator('.correction')).toContainText('Prioritize corrective work');
    await expect(diagram.locator('.ci-outcome')).toContainText('integrated into CI');
    await expect(diagram.locator('.ci-outcome')).toContainText('not evidence that every finding was corrected');
    await expect(diagram.locator('.diagram-summary')).toContainText('not a sequential pipeline');
    await expect(diagram.locator('.diagram-summary')).toContainText('endpoint populations are not established as identical');
    await expect(diagram.locator('.retained-bridge, .match-path, .gate')).toHaveCount(0);
    // Every functional connector stays inside its own investigation. No A → B arrow.
    await expect(diagram.locator('.scope-filter .scope-fork')).toHaveCount(1);
    await expect(diagram.locator('.behavior-cycle .feedback-loop')).toHaveCount(2);
    await expect(page.locator('.entry-body .metric-strip')).toHaveCount(0);
    await expect(page.locator('.metric-strip')).toHaveCount(1);
    await expect(page.locator('.metric-strip dt')).toHaveCount(3);
    await expect(diagram.locator('figcaption, .diagram-summary')).toHaveCount(2);
    await expect(diagram.locator('svg:not([aria-hidden="true"])')).toHaveCount(0);

    const scope = await diagram.locator('.scope-investigation').boundingBox();
    const behavior = await diagram.locator('.behavior-investigation').boundingBox();
    const hero = await page.locator('.entry-heading').boundingBox();
    const preview = await page.locator('.api-preview').boundingBox();
    const previewLabels = await page.locator('.preview-question').all();
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
    if (width > 1280) {
      expect(behavior!.x).toBeGreaterThan(scope!.x + scope!.width);
      expect(Math.abs(behavior!.width - scope!.width)).toBeLessThan(1);
    } else {
      expect(behavior!.y).toBeGreaterThan(scope!.y + scope!.height);
    }
    if (width > 960) {
      expect(preview!.x).toBeGreaterThan(hero!.x + hero!.width);
      expect(hero!.width / preview!.width).toBeCloseTo(1.5, 1);
    } else {
      expect(preview!.y).toBeGreaterThanOrEqual(hero!.y + hero!.height);
    }
    const loop = await diagram.locator('.feedback-loop:visible').boundingBox();
    const comparison = await diagram.locator('.comparison').boundingBox();
    const correction = await diagram.locator('.correction').boundingBox();
    // The SVG return path's upper/lower ends align with live comparison and
    // prioritization respectively; neither points at CI or the scope filter.
    if (width <= 640) {
      const returnY = loop!.y + loop!.height * 25 / 300;
      const fromY = loop!.y + loop!.height * 275 / 300;
      expect(returnY).toBeGreaterThanOrEqual(comparison!.y);
      expect(returnY).toBeLessThanOrEqual(comparison!.y + comparison!.height);
      expect(fromY).toBeGreaterThanOrEqual(correction!.y);
      expect(fromY).toBeLessThanOrEqual(correction!.y + correction!.height);
    } else {
      const work = (await diagram.locator('.corrective-work').boundingBox())!;
      expect(loop!.y).toBeCloseTo(work.y + work.height, 0);
      const returnX = loop!.x;
      const fromX = loop!.x + loop!.width;
      expect(returnX).toBeGreaterThanOrEqual(comparison!.x);
      expect(returnX).toBeLessThanOrEqual(comparison!.x + comparison!.width);
      expect(fromX).toBeGreaterThanOrEqual(correction!.x);
      expect(fromX).toBeLessThanOrEqual(correction!.x + correction!.width);
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

test('architectural case studies have a wider canvas without widening the UX reference', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  for (const slug of ['api-migration-confidence', 'ai-assisted-delivery']) {
    await page.goto(`/work/${slug}/`);
    const width = (await page.locator('.detail-page').boundingBox())!.width;
    expect(width).toBe(1440);
    await expect(page.locator('body > header .container')).toHaveCSS('width', '1440px');
  }
  await page.goto('/work/scaling-ux-capability/');
  expect((await page.locator('.detail-page').boundingBox())!.width).toBe(1152);
});

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
  test('independent inquiries, the scope exit and local loop work without JavaScript or motion', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(route);
    await expect(page.locator('.scope-exit')).toContainText('37+');
    await expect(page.locator('.scope-retain')).toContainText('Endpoints still requiring migration');
    await expect(page.locator('.superseded')).toBeVisible();
    await expect(page.locator('.rerun')).toBeVisible();
    await expect(page.locator('.ci-outcome')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test('API questions, investigation narratives and labels preview and save through Tina', async ({ page }) => {
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
    await page.getByRole('button', { name: '02 / The Investigations', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('API full diagram caption trial');
    await page.getByRole('button', { name: 'A — scope reduction', exact: true }).click();
    await page.locator('input[name$=".scope.question"]').fill('Scope question editing trial');
    await expect(preview.locator('.scope-investigation .question')).toHaveText('Scope question editing trial');
    await page.getByRole('button', { name: 'API migration — complementary investigations', exact: true }).click();
    await page.getByRole('button', { name: 'B — behavioral correctness', exact: true }).click();
    await page.locator('textarea[name$=".behavior.summary"]').fill('Behavior narrative editing trial');
    await expect(preview.locator('.behavior-investigation .investigation-intro')).toHaveText('Behavior narrative editing trial');
    await page.locator('input[name$=".behavior.branches"]').fill('Behavior finding editing trial');
    await expect(preview.locator('.branch-finding')).toHaveText('Behavior finding editing trial');
    expect(await readFile(path, 'utf8')).toBe(original);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Behavior finding editing trial');
    const saved = await readFile(path, 'utf8');
    expect(saved).toContain('API hero caption trial');
    expect(saved).toContain('API full diagram caption trial');
    expect(saved).toContain('Scope question editing trial');
    expect(saved).toContain('Behavior narrative editing trial');
    const visitor = await page.context().newPage();
    await visitor.goto(route);
    await expect(visitor.locator('.branch-finding')).toHaveText('Behavior finding editing trial');
    await visitor.close();
  } finally {
    await page.close();
    await writeContent(path, original);
  }
});
