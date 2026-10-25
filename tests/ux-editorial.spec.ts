import { expect, test } from '@playwright/test';
import { readFile, unlink, writeFile } from 'node:fs/promises';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`editorial UX story has readable purpose-built figures at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/work/scaling-ux-capability/');
    await expect(page.locator('body')).toHaveClass('editorial-work');
    await expect(page.locator('body > header, body > footer')).toHaveCount(2);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.story-section')).toHaveCount(4);
    await expect(page.locator('.story-decisions ol > li')).toHaveCount(3);
    await expect(page.locator('.ux-figure')).toHaveCount(2);
    for (const figure of await page.locator('.ux-figure').all()) {
      await expect(figure.locator('figcaption')).toBeVisible();
      await expect(figure.locator('.diagram-summary')).toBeVisible();
      await expect(figure.locator('.diagram-mobile')).toBeVisible({ visible: width <= 768 });
      await expect(figure.locator('.diagram-desktop')).toBeVisible({ visible: width > 768 });
      await expect(figure.locator('.diagram-mobile .team-dots span')).toHaveCount(12);
      await expect(figure.locator('.metric-strip')).toHaveCount(0);
    }
    await expect(page.locator('.network-topology circle')).toHaveCount(12);
    await expect(page.locator('.metric-strip dt')).toHaveCount(4);
    await expect(page.locator('.metric-strip figcaption')).toContainText('may overlap');
    const intro = await page.locator('.entry-heading').boundingBox();
    const heroFigure = await page.locator('.ux-network').boundingBox();
    const challenge = await page.locator('.story-section').first().boundingBox();
    expect(challenge!.y).toBeGreaterThanOrEqual(intro!.y + intro!.height);
    expect(challenge!.y).toBeGreaterThanOrEqual(heroFigure!.y + heroFigure!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
}

test('editorial fonts are self-hosted and text/focus pairs have readable contrast', async ({ page }) => {
  await page.goto('/work/scaling-ux-capability/');
  const result = await page.evaluate(async () => {
    await Promise.all([document.fonts.load('400 16px Newsreader'), document.fonts.load('400 16px Inter')]);
    const luminance = (color: string) => {
      const channels = color.match(/[\d.]+/g)!.slice(0, 3).map((part) => {
        const channel = Number(part) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const body = getComputedStyle(document.body);
    const background = luminance(body.backgroundColor);
    const ratio = (color: string) => {
      const foreground = luminance(color);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    };
    return {
      fonts: [document.fonts.check('400 16px Newsreader'), document.fonts.check('400 16px Inter')],
      ratios: [ratio(body.color), ratio(getComputedStyle(document.querySelector('h1')!).color), ratio(getComputedStyle(document.querySelector('.entry-links a')!).color)],
    };
  });
  expect(result.fonts).toEqual([true, true]);
  for (const ratio of result.ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-style', 'solid');
});

test.describe('native editorial figures', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('relationships and outcomes are understandable without JavaScript or motion', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/work/scaling-ux-capability/');
    await expect(page.locator('.ux-network .diagram-mobile')).toBeVisible();
    await expect(page.locator('.ux-approach .diagram-mobile')).toBeVisible();
    await expect(page.locator('.story-decisions')).toContainText('reorganization');
    await expect(page.locator('.metric-strip')).toContainText('Teams consulted UX specialists');
    await expect(page.locator('.entry-heading')).toContainText('Global biotechnology company');
  });
});

test('the editorial format also works as a local-only draft', async ({ page, request }) => {
  const path = new URL('../content/work/editorial-preview-fixture.mdx', import.meta.url);
  const original = await readFile(new URL('../content/work/scaling-ux-capability.mdx', import.meta.url), 'utf8');
  let created = false;
  try {
    await writeFile(path, original.replace('draft: false', 'draft: true'), { flag: 'wx' });
    created = true;
    await page.setViewportSize({ width: 320, height: 900 });
    await expect(async () => {
      expect((await page.goto('/preview/work/editorial-preview-fixture/'))?.status()).toBe(200);
    }).toPass({ timeout: 10_000 });
    await expect(page.locator('.draft-note')).toBeVisible();
    await expect(page.locator('.ux-network .diagram-mobile')).toBeVisible();
    await expect(page.locator('.story-section')).toHaveCount(4);
    let note: { x: number; y: number; width: number; height: number } | null = null;
    let intro: { x: number; y: number; width: number; height: number } | null = null;
    // Font-swap/reindex timing can briefly yield no layout box.
    await expect.poll(async () => {
      note = await page.locator('.draft-note').boundingBox();
      intro = await page.locator('.entry-heading').boundingBox();
      return note !== null && intro !== null;
    }).toBe(true, { timeout: 10_000 });
    expect(intro!.y).toBeGreaterThanOrEqual(note!.y + note!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await request.get('/work/editorial-preview-fixture/')).status()).toBe(404);
  } finally {
    await page.close();
    if (created) await unlink(path);
  }
});

test('editorial prose, captions, and section order preview and save through Tina', async ({ page }) => {
  const path = new URL('../content/work/scaling-ux-capability.mdx', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await page.goto('/admin/index.html');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await expect(page.locator('iframe')).toBeVisible();
    await page.locator('iframe').evaluate((frame) => { (frame as HTMLIFrameElement).src = '/preview/work/scaling-ux-capability/'; });
    const preview = page.frameLocator('iframe');
    await preview.locator('main h1').click();
    await expect(page.locator('input[name="title"]')).toBeVisible();

    await page.getByRole('button', { name: 'Open options', exact: true }).first().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('Figure caption editing trial');
    await expect(preview.locator('.ux-network figcaption')).toHaveText('Figure caption editing trial');
    // Return from the block form to the Work document's body.
    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    await page.getByRole('button', { name: 'High ambition. Limited specialist capacity.', exact: true }).click();
    await page.locator('input[name="sections.0.title"]').fill('Section heading editing trial');
    await expect(preview.locator('.story-section h2').first()).toHaveText('Section heading editing trial');
    const prose = page.locator('[contenteditable="true"]');
    await prose.click();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('Section prose editing trial');
    await expect(preview.locator('.story-section').first()).toContainText('Section prose editing trial');
    expect(await readFile(path, 'utf8')).toBe(original);

    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    const from = await page.getByRole('button', { name: 'Specialist guidance. Local ownership.', exact: true }).locator(':scope > div').first().boundingBox();
    const to = await page.getByRole('button', { name: 'Section heading editing trial', exact: true }).locator(':scope > div').first().boundingBox();
    expect(from).not.toBeNull();
    expect(to).not.toBeNull();
    await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
    await page.mouse.down();
    // Tina's native list pointer sensor requires a stationary hold.
    await page.waitForTimeout(150);
    await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 15 });
    await page.mouse.up();
    await expect(preview.locator('.story-section h2').first()).toHaveText('Specialist guidance. Local ownership.');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Section heading editing trial');
    expect(await readFile(path, 'utf8')).toContain('Figure caption editing trial');
    expect(await readFile(path, 'utf8')).toContain('Section prose editing trial');
    const saved = await readFile(path, 'utf8');
    expect(saved.indexOf('Specialist guidance. Local ownership.')).toBeLessThan(saved.indexOf('Section heading editing trial'));
  } finally {
    await page.close();
    await writeFile(path, original);
  }
});
