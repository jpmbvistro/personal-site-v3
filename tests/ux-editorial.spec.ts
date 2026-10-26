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
    await expect(page.locator('.network-topology .team-node')).toHaveCount(12);
    await expect(page.locator('.metric-strip dt')).toHaveCount(4);
    await expect(page.locator('.entry-story')).toContainText('groups may overlap');
    await expect(page.locator('.story-quote blockquote')).toContainText('Lower the cost of participation');
    await expect(page.locator('.story-quote figcaption')).toHaveCount(0);
    await expect(page.locator('.story-section').first().locator('.editorial-callouts > li')).toHaveCount(3);
    await expect(page.locator('.hero-outcomes .editorial-callouts > li')).toHaveCount(3);
    await expect(page.locator('.network-topology .editorial-callouts')).toHaveCount(0);
    await expect(page.locator('.approach-stages > li')).toHaveCount(4);
    await expect(page.locator('.metric-strip .metric-icon')).toHaveCount(4);
    for (const row of await page.locator('.story-section').all()) {
      await expect(row).toHaveCSS('border-top-width', '1px');
      await expect(row.locator('.intro-copy')).toBeVisible();
      const heading = await row.locator('h2').boundingBox();
      const prose = await row.locator('.intro-copy').boundingBox();
      const left = await row.locator('.section-intro').boundingBox();
      const right = await row.locator('.section-copy').boundingBox();
      expect(prose!.y).toBeGreaterThanOrEqual(heading!.y + heading!.height);
      if (width > 960) {
        expect(right!.x).toBeGreaterThanOrEqual(left!.x + left!.width);
        expect(right!.y).toBeLessThan(left!.y + left!.height);
      } else {
        expect(right!.y).toBeGreaterThanOrEqual(left!.y + left!.height);
      }
    }
    const intro = await page.locator('.entry-heading').boundingBox();
    const heroFigure = await page.locator('.ux-network').boundingBox();
    const challenge = await page.locator('.story-section').first().boundingBox();
    expect(challenge!.y).toBeGreaterThanOrEqual(intro!.y + intro!.height);
    expect(challenge!.y).toBeGreaterThanOrEqual(heroFigure!.y + heroFigure!.height);
    const metrics = await page.locator('.metric-strip').boundingBox();
    const quote = await page.locator('.story-quote').boundingBox();
    if (width > 1280) expect(quote!.x).toBeGreaterThanOrEqual(metrics!.x + metrics!.width);
    else expect(quote!.y).toBeGreaterThanOrEqual(metrics!.y + metrics!.height);
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
      ratios: [ratio(body.color), ratio(getComputedStyle(document.querySelector('h1')!).color), ratio(getComputedStyle(document.querySelector('.entry-links a')!).color), ratio(getComputedStyle(document.querySelector('.story-section .eyebrow')!).color)],
      subheadingFont: getComputedStyle(document.querySelector('.intro-copy h3')!).fontFamily,
      paragraphFont: getComputedStyle(document.querySelector('.section-main > p')!).fontFamily,
      bodyWeight: Number(body.getPropertyValue('--font-weight-body')),
      matchingWeights: [...document.querySelectorAll('.intro-copy > p, .section-main > p, .editorial-callouts p, .diagram-summary, .resources-label, .metric-strip dd > span:not(.metric-icon), .story-decisions li, .entry-heading .summary')].map((element) => getComputedStyle(element).fontWeight),
      matchingSizes: [...document.querySelectorAll('.intro-copy > p, .section-main > p, .editorial-callouts p, .diagram-summary, .resources-label, .metric-strip dd > span:not(.metric-icon), .story-decisions li, .entry-heading .summary')].map((element) => getComputedStyle(element).fontSize),
      copyContrasts: [...document.querySelectorAll('.intro-copy > p, .section-main > p, .editorial-callouts p, .diagram-summary, .resources-label, .metric-strip dd > span:not(.metric-icon), .story-decisions li, .entry-heading .summary')].map((element) => ratio(getComputedStyle(element).color)),
      headingWeight: getComputedStyle(document.querySelector('h1')!).fontWeight,
      emphasisWeight: getComputedStyle(document.querySelector('.intro-copy strong')!).fontWeight,
      bodyTypography: ['.intro-copy > p', '.section-main > p'].map((selector) => {
        const style = getComputedStyle(document.querySelector(selector)!);
        return { family: style.fontFamily, size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight };
      }),
      dividerColor: getComputedStyle(document.querySelector('.story-section')!).borderTopColor,
      copperColor: getComputedStyle(document.querySelector('.story-quote')!).borderLeftColor,
      badge: (() => {
        const badge = getComputedStyle(document.querySelector('.story-decisions li')!, '::before');
        return { background: badge.backgroundColor, color: badge.color, contrast: ratio(badge.backgroundColor) };
      })(),
    };
  });
  expect(result.fonts).toEqual([true, true]);
  for (const ratio of result.ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
  expect(result.subheadingFont).toContain('Newsreader');
  expect(result.paragraphFont).toContain('Inter');
  expect(result.bodyWeight).toBeLessThan(400);
  for (const weight of result.matchingWeights) expect(Number(weight)).toBe(result.bodyWeight);
  for (const size of result.matchingSizes) expect(size).toBe('12px');
  for (const contrast of result.copyContrasts) expect(contrast).toBeGreaterThanOrEqual(4.5);
  expect(Number(result.headingWeight)).toBeGreaterThan(result.bodyWeight);
  expect(Number(result.emphasisWeight)).toBeGreaterThan(result.bodyWeight);
  expect(result.bodyTypography[1]).toEqual(result.bodyTypography[0]);
  expect(result.dividerColor).toBe(result.copperColor);
  expect(result.badge.contrast).toBeGreaterThanOrEqual(4.5);
  await expect(page.locator('.story-decisions li').first()).toHaveCSS('font-family', /Inter/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toHaveCSS('outline-style', 'solid');
});

for (const width of [1024, 1440]) {
  test(`ownership diagram connectors stay in the symbol lane at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/work/scaling-ux-capability/');
    await page.evaluate(() => document.fonts.ready);
    const flow = page.locator('.ownership-flow');
    await expect(flow.locator('.resources-label')).toBeVisible();
    await expect(flow.locator('.resources-label')).toContainText('JTBD');
    await expect(flow.locator('.flow-arrow')).toHaveCount(0);
    const symbols = await flow.locator('.node-symbol').all();
    const specialist = await symbols[0].boundingBox();
    const participant = await symbols[1].boundingBox();
    expect(Math.abs(specialist!.y - participant!.y)).toBeLessThan(1);
    for (const node of await flow.locator('.flow-node').all()) {
      const symbol = await node.locator('.node-symbol').boundingBox();
      const label = await node.locator('strong').boundingBox();
      expect(label!.y).toBeGreaterThanOrEqual(symbol!.y + symbol!.height);
    }
    const connector = await flow.locator('.team-connections').boundingBox();
    const dots = await flow.locator('.team-dots').boundingBox();
    expect(Math.abs(connector!.x + connector!.width - dots!.x)).toBeLessThan(2);
    const stages = await page.locator('.approach-stages li').evaluateAll((items) => items.map((item, index) => {
      if (!index) return null;
      const box = item.getBoundingClientRect();
      const previous = items[index - 1].getBoundingClientRect();
      const arrow = getComputedStyle(item, '::before');
      const arrowLeft = box.x + parseFloat(arrow.left);
      return { before: arrowLeft - previous.right, after: box.left - arrowLeft - parseFloat(arrow.width), y: parseFloat(arrow.top), center: box.height / 2 };
    }));
    for (const stage of stages) if (stage) {
      expect(stage.before).toBeGreaterThan(0);
      expect(stage.after / stage.before).toBeCloseTo(2, 1);
      expect(Math.abs(stage.y - stage.center)).toBeLessThan(1);
    }
    const calloutGap = await page.locator('.story-section .callout-icon').first().evaluate((icon) => {
      return icon.nextElementSibling!.querySelector('h3')!.getBoundingClientRect().top - icon.getBoundingClientRect().bottom;
    });
    expect(Math.abs(calloutGap - 16)).toBeLessThan(1); // Previous combined gap was 48px.
  });
}

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
    await expect(page.locator('.hero-outcomes')).toContainText('groups may overlap');
    await expect(page.locator('.story-section').first().locator('.intro-copy')).toContainText('fragmented interfaces');
    await expect(page.locator('.story-section').first().locator('.editorial-callouts')).toContainText('Initial skepticism');
    await expect(page.locator('.approach-stages')).toContainText('Support');
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
    // Read both boxes in one browser turn so a dev reload cannot separate them.
    await expect.poll(async () => {
      return page.evaluate(() => {
        const note = document.querySelector('.draft-note')?.getBoundingClientRect();
        const intro = document.querySelector('.entry-heading')?.getBoundingClientRect();
        return !!note && !!intro && intro.y >= note.bottom;
      });
    }, { timeout: 10_000 }).toBe(true);
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
    await page.getByRole('button', { name: 'Research artifacts', exact: true }).click();
    await page.locator('input[name$=".title"]').fill('Hero callout editing trial');
    await expect(preview.locator('.hero-outcomes')).toContainText('Hero callout editing trial');
    // Return from the block form to the Work document's body.
    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    await page.getByRole('button', { name: '01 / The challenge', exact: true }).click();
    await page.locator('input[name="sections.0.title"]').fill('Section heading editing trial');
    await expect(preview.locator('.story-section h2').first()).toHaveText('Section heading editing trial');
    const prose = page.locator('[contenteditable="true"]').first();
    await prose.click();
    await page.keyboard.press('ControlOrMeta+End');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('Section prose editing trial');
    await expect(preview.locator('.story-section .intro-copy').first()).toContainText('Section prose editing trial');

    // The right-hand callouts remain editable independently of the introduction.
    await page.getByRole('button', { name: 'Open options', exact: true }).click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.getByRole('button', { name: 'Distributed ownership', exact: true }).click();
    await page.locator('input[name$=".title"]').fill('Callout heading editing trial');
    await expect(preview.locator('.story-section .section-copy').first()).toContainText('Callout heading editing trial');
    expect(await readFile(path, 'utf8')).toBe(original);

    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    await page.getByRole('button', { name: '02 / The approach', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.getByRole('button', { name: 'Support', exact: true }).click();
    await page.locator('input[name$=".title"]').fill('Stage heading editing trial');
    await expect(preview.locator('.approach-stages')).toContainText('Stage heading editing trial');

    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    await page.getByRole('button', { name: '04 / Results and reflection', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).first().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    const topRule = page.locator('input[name$=".props.topRule"]');
    const bottomRule = page.locator('input[name$=".props.bottomRule"]');
    for (const [top, bottom] of [[true, false], [false, true], [true, true], [false, false], [true, false]]) {
      await topRule.setChecked(top);
      await bottomRule.setChecked(bottom);
      await expect(preview.locator('.metric-strip')).toHaveCSS('border-top-width', top ? '1px' : '0px');
      await expect(preview.locator('.metric-strip')).toHaveCSS('border-bottom-width', bottom ? '1px' : '0px');
    }
    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    await page.getByRole('button', { name: '04 / Results and reflection', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).last().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.label"]').fill('Quote label editing trial');
    await page.locator('textarea[name$=".props.quote"]').fill('Quote text editing trial');
    await page.locator('input[name$=".props.attribution"]').fill('Attribution editing trial');
    await expect(preview.locator('.story-quote blockquote')).toHaveText('Quote text editing trial');
    await expect(preview.locator('.story-quote figcaption')).toHaveText('Attribution editing trial');

    await page.getByRole('button', { name: 'scaling-ux-capability', exact: true }).click();
    await page.getByRole('button', { name: '02 / The approach', exact: true }).scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: '01 / The challenge', exact: true }).scrollIntoViewIfNeeded();
    const from = await page.getByRole('button', { name: '02 / The approach', exact: true }).locator(':scope > div').first().boundingBox();
    const to = await page.getByRole('button', { name: '01 / The challenge', exact: true }).locator(':scope > div').first().boundingBox();
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
    expect(saved).toContain('Callout heading editing trial');
    expect(saved).toContain('Hero callout editing trial');
    expect(saved).toContain('Stage heading editing trial');
    expect(saved).toContain('Quote text editing trial');
    expect(saved).toContain('Attribution editing trial');
    expect(saved).toContain('topRule={true}');
    expect(saved).toContain('bottomRule={false}');
  } finally {
    await page.close();
    await writeFile(path, original);
  }
});
