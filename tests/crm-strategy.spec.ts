import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { writeContent } from './fixtures/write-content';

const route = '/work/nonprofit-crm-selection/';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`CRM strategy preserves readable decision relationships at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('body')).toHaveClass('editorial-work');
    await expect(page.locator('body > header, body > footer')).toHaveCount(2);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.story-section')).toHaveCount(4);
    await expect(page.locator('.story-decisions ol > li')).toHaveCount(3);
    const transformation = page.locator('.crm-transformation');
    const model = page.locator('.donor-cost-model');
    await expect(transformation).toHaveAccessibleName('From a constrained choice to a better option.');
    await expect(transformation).toHaveAccessibleDescription(/amended offer from Platform A, not a third CRM/);
    await expect(transformation.locator('.platform')).toHaveCount(2);
    await expect(transformation.locator('.platform-title')).toHaveText(['Platform A', 'Platform B']);
    await expect(transformation.locator('.monthly-note')).toContainText('no monthly platform fee');
    await expect(transformation.locator('.intervention')).toContainText('Juan: long-term transaction-fee modeling');
    await expect(transformation.locator('.intervention')).toContainText('Impact Innovations: vendor partnership');
    await expect(transformation.locator('.negotiated-outcome')).toContainText('Platform A — required feature enabled');
    await expect(model).toHaveAccessibleDescription(/projections, not realized savings/);
    await expect(model.locator('.tier-labels li')).toHaveText(['Major gifts', 'Recurring donors', 'General donors']);
    await expect(model.locator('.qualifier').first()).toContainText('Illustrative categories');
    await expect(model.locator('.fee-exposure .qualifier')).toContainText('Not to scale');
    await expect(model.locator('svg text')).toHaveCount(0); // No fictional axis/scenario values.
    await expect(page.locator('.story-section').last().locator('.editorial-callouts .callout-title')).toHaveText(['Full migration', 'Operational adoption', 'Verified financial savings']);
    await expect(page.locator('.story-quote blockquote, .story-quote figcaption')).toHaveCount(0);
    const hero = (await page.locator('.entry-heading').boundingBox())!;
    expect((await transformation.boundingBox())!.y).toBeGreaterThanOrEqual(hero.y + hero.height);
    const initial = (await transformation.locator('.initial-options').boundingBox())!;
    const engagement = (await transformation.locator('.intervention').boundingBox())!;
    const outcome = (await transformation.locator('.negotiated-outcome').boundingBox())!;
    if (width === 1440) {
      expect(engagement.x).toBeGreaterThan(initial.x + initial.width);
      expect(outcome.x).toBeGreaterThan(engagement.x + engagement.width);
    } else {
      expect(engagement.y).toBeGreaterThan(initial.y + initial.height);
      expect(outcome.y).toBeGreaterThan(engagement.y + engagement.height);
    }
    if (width <= 390) {
      const panels = await transformation.locator('.platform').all();
      expect((await panels[1].boundingBox())!.y).toBeGreaterThan((await panels[0].boundingBox())!.y);
      const stages = await model.locator('.donor-distribution, .growth-assumptions, .scenario-model, .fee-exposure').all();
      for (let i = 1; i < stages.length; i++) {
        const previous = (await stages[i - 1].boundingBox())!;
        expect((await stages[i].boundingBox())!.y).toBeGreaterThan(previous.y + previous.height);
      }
    }
    const decisions = await page.locator('.story-decisions ol > li').all();
    for (let i = 1; i < decisions.length; i++) {
      const previous = (await decisions[i - 1].boundingBox())!;
      const current = (await decisions[i].boundingBox())!;
      if (width > 1040) expect(current.x).toBeGreaterThanOrEqual(previous.x + previous.width);
      else expect(current.y).toBeGreaterThanOrEqual(previous.y + previous.height);
    }
    for (const figure of [transformation, model]) {
      await expect(figure.locator('svg:not([aria-hidden="true"])')).toHaveCount(0);
      for (const text of await figure.locator('p, li, dt, dd, figcaption').all()) {
        const box = (await text.boundingBox())!;
        const parent = (await figure.boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(parent.x);
        expect(box.x + box.width).toBeLessThanOrEqual(parent.x + parent.width + 1);
        expect(await text.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
        expect(parseFloat(await text.evaluate((node) => getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(13);
      }
      for (const image of await figure.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0)).toBe(true);
        await expect(image).toHaveAttribute('alt', '');
      }
    }
    const headings = await page.locator('main :is(h1,h2,h3,h4)').evaluateAll((nodes) => nodes.map((node) => Number(node.tagName.slice(1))));
    for (let i = 1; i < headings.length; i++) expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
}

test('CRM links resolve and the public story has no fabricated financial figures', async ({ page, request }) => {
  await page.goto(route);
  const links = await page.locator('body > header a[href], main a[href], body > footer a[href]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')!))]);
  for (const href of links) {
    const url = new URL(href, page.url());
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect((await request.get(url.pathname)).ok(), href).toBe(true);
  }
  await expect(page.locator('.entry-story')).not.toContainText(/\$\d|\d+%|Platform C|increased fundraising revenue/);
  await expect(page.locator('.story-section').last()).toContainText('actual first-year fundraising activity');
  await expect(page.locator('.donor-cost-model')).toContainText('not a working calculator');
});

test.describe('native CRM figures', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('strategy and outcomes remain available without JavaScript or motion', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(route);
    await expect(page.locator('.negotiated-outcome')).toBeVisible();
    await expect(page.locator('.fee-exposure')).toContainText('Lower transaction-fee structure');
    await expect(page.locator('.story-section').last()).toContainText('significant first-year savings');
    await expect(page.locator('astro-island')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test('CRM captions, negotiated-offer copy and model assumptions preview and save through Tina', async ({ page }) => {
  const path = new URL('../content/work/nonprofit-crm-selection.mdx', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await page.goto('/admin/index.html');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await expect(page.locator('iframe')).toBeVisible();
    await page.locator('iframe').evaluate((frame) => { (frame as HTMLIFrameElement).src = '/preview/work/nonprofit-crm-selection/'; });
    const preview = page.frameLocator('iframe');
    await preview.locator('main h1').click();
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await page.getByRole('button', { name: 'Open options', exact: true }).first().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('CRM decision caption trial');
    await expect(preview.locator('.crm-transformation figcaption')).toHaveText('CRM decision caption trial');
    await page.getByRole('button', { name: 'Negotiated Platform A', exact: true }).click();
    await page.locator('input[name$=".outcome.feature"]').fill('Feature accommodation editing trial');
    await expect(preview.locator('.negotiated-outcome')).toContainText('Feature accommodation editing trial');
    await page.getByRole('button', { name: 'nonprofit-crm-selection', exact: true }).click();
    await page.getByRole('button', { name: '02 / The Approach', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('CRM financial-model caption trial');
    await expect(preview.locator('.donor-cost-model figcaption')).toHaveText('CRM financial-model caption trial');
    await page.getByRole('button', { name: 'Growth assumptions', exact: true }).click();
    await page.locator('input[name$=".assumptions.volumeText"]').fill('Growth assumption editing trial');
    await expect(preview.locator('.growth-assumptions')).toContainText('Growth assumption editing trial');
    expect(await readFile(path, 'utf8')).toBe(original);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Growth assumption editing trial');
    const saved = await readFile(path, 'utf8');
    for (const text of ['CRM decision caption trial', 'Feature accommodation editing trial', 'CRM financial-model caption trial']) expect(saved).toContain(text);
    const visitor = await page.context().newPage();
    await visitor.goto(route);
    await expect(visitor.locator('.growth-assumptions')).toContainText('Growth assumption editing trial');
    await visitor.close();
  } finally {
    await page.close();
    await writeContent(path, original);
  }
});
