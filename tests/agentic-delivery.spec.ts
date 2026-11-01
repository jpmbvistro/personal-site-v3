import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { writeContent } from './fixtures/write-content';

const route = '/work/ai-assisted-delivery/';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`delivery architecture preserves isolation, validation and recovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await expect(async () => {
      expect((await page.goto(route))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
    }).toPass({ timeout: 10_000 });
    await expect(page.locator('body')).toHaveClass('editorial-work');
    await expect(page.locator('body > header, body > footer')).toHaveCount(2);
    await expect(page.locator('main h1')).toHaveText('Building a delivery system while delivering the work.');
    await expect(page.locator('.entry-heading')).toContainText('Global biotechnology company · Agentic engineering');
    await expect(page.locator('.story-section')).toHaveCount(4);
    await expect(page.locator('.story-decisions .section-main > ol > li')).toHaveCount(4);
    await expect(page.locator('.editorial-callouts > li')).toHaveCount(3);
    const diagram = page.locator('.harness-diagram');
    await expect(diagram).toHaveAccessibleName('From sequential proof to parallel delivery.');
    await expect(diagram).toHaveAccessibleDescription(/Tickets execute independently.*Failed checks lead to bounded retry.*Separately/);
    await expect(diagram.locator('.delivery-phases strong')).toHaveText(['1 / Prove sequential execution', '2 / Introduce parallel delivery']);
    await expect(diagram.locator('.delivery-phases')).toContainText('within the same 30 days');
    await expect(diagram.locator('.ticket-lane')).toHaveCount(3);
    await expect(diagram.locator('.lane-note')).toContainText('not a maximum concurrency claim');
    for (const lane of await diagram.locator('.ticket-lane').all()) {
      await expect(lane.locator('.lane-steps > li')).toHaveCount(3);
      await expect(lane).toContainText('Independent Git worktree');
      await expect(lane).toContainText('Coding-agent implementation');
      await expect(lane).toContainText('Isolated test context');
      await expect(lane).toContainText('Required checks per ticket');
      await expect(lane.locator('.ticket-validation')).toContainText('Required validation commands');
      await expect(lane.locator('.ticket-validation')).toContainText('Shadow-diff integration tests where applicable');
      const steps = await lane.locator('.lane-steps > li').all();
      for (let i = 1; i < steps.length; i++) {
        const previous = (await steps[i - 1].boundingBox())!;
        const current = (await steps[i].boundingBox())!;
        if (width > 640) expect(current.x).toBeGreaterThanOrEqual(previous.x + previous.width);
        else expect(current.y).toBeGreaterThanOrEqual(previous.y + previous.height);
      }
    }
    await expect(diagram.locator('.validation-stage')).toHaveCount(0);
    await expect(diagram.locator('.failure-rule')).toContainText('Failure blocks successful completion');
    await expect(diagram.locator('.review-stage')).toContainText('not mean merged or deployed');
    await expect(diagram.locator('.recovery-path strong')).toHaveText(['Failure', 'Bounded retry', 'Persistent failure', 'Human handoff']);
    await expect(diagram.locator('.recovery-note')).toContainText('Retries do not guarantee success');
    await expect(diagram.locator('.observability-stage')).toContainText('Langfuse traces, spans, artifacts and transcripts');
    await expect(diagram.locator('.observability-stage')).toContainText('Debugging-agent investigation');
    await expect(diagram.locator('.observability-stage')).toContainText('Not every failure could be corrected automatically');
    await expect(diagram.locator('.observability-stage')).toContainText('subsequent executions');
    await expect(diagram.locator('.recovery-note')).toContainText('one ticket');
    await expect(diagram.locator('.operational-paths > section')).toHaveCount(2);
    await expect(diagram.locator('svg:not([aria-hidden="true"])')).toHaveCount(0);
    await expect(page.locator('.harness-preview ul > li')).toHaveCount(3);
    await expect(page.locator('.harness-preview .diagram-summary')).toContainText('not that every ticket passed on its first attempt');
    for (const image of await page.locator('.harness-preview img').all()) expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator('.entry-body > .metric-strip dt')).toHaveCount(4);
    await expect(page.locator('.metric-strip').last().locator('dt')).toHaveCount(4);
    await expect(page.locator('.metric-strip').last()).toContainText('~1–1.5 days');
    await expect(page.locator('.entry-story')).toContainText('My subsequent harness designs became thinner');
    await expect(page.locator('.story-quote .quote-text')).toHaveText('Build systems that can demonstrate correctness, expose uncertainty, and recover when automation reaches its limits.');
    await expect(page.locator('.story-quote blockquote')).toHaveCount(0);
    await expect(page.locator('.entry-story')).not.toContainText(/Moderna|37\+|95%|zero customer incidents|engineer.months/i);

    const stages = await diagram.locator('.harness-pipeline > li').all();
    expect(stages).toHaveLength(3);
    for (let i = 1; i < stages.length; i++) {
      const previous = await stages[i - 1].boundingBox();
      const current = await stages[i].boundingBox();
      if (width > 1120) expect(current!.x).toBeGreaterThanOrEqual(previous!.x + previous!.width);
      else if (width <= 1120) expect(current!.y).toBeGreaterThanOrEqual(previous!.y + previous!.height);
    }
    const decisions = await page.locator('.story-decisions .section-main > ol > li').all();
    const boxes = await Promise.all(decisions.map(async (decision) => (await decision.boundingBox())!));
    if (width > 640) {
      expect(boxes[1].x).toBeGreaterThanOrEqual(boxes[0].x + boxes[0].width);
      expect(boxes[2].x).toBe(boxes[0].x);
      expect(boxes[3].x).toBe(boxes[1].x);
      expect(boxes[2].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
      expect(boxes[3].y).toBe(boxes[2].y);
    } else {
      for (let i = 1; i < boxes.length; i++) expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i - 1].y + boxes[i - 1].height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const node of await page.locator('.harness-diagram p, .harness-diagram h3, .lane-steps > li, .hero-harness li, .metric-strip strong').all()) {
      expect(await node.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
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

test('delivery story links resolve to public-safe work and native images', async ({ page, request }) => {
  await page.goto(route);
  const hrefs = await page.locator('body > header a[href], main a[href], body > footer a[href]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.getAttribute('href')!))]);
  for (const href of hrefs) {
    const url = new URL(href, page.url());
    expect(url.origin).toBe(new URL(page.url()).origin);
    expect((await request.get(url.pathname)).ok(), href).toBe(true);
  }
  await expect(page.locator('.entry-links a[href="/work/api-migration-confidence/"]')).toBeVisible();
});

test.describe('delivery without client execution', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  test('parallel lanes and human recovery remain meaningful without JavaScript or motion', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1000 });
    await page.goto(route);
    await expect(page.locator('.ticket-lane')).toHaveCount(3);
    await expect(page.locator('.recovery-path')).toContainText('Human handoff');
    await expect(page.locator('.failure-rule')).toContainText('Failure blocks successful completion');
    await expect(page.locator('.ticket-validation')).toHaveCount(3);
    await expect(page.locator('.metric-strip').first()).toContainText('Human oversight still required');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
});

test('delivery captions, per-ticket labels and recovery edit and save through Tina', async ({ page }) => {
  const path = new URL('../content/work/ai-assisted-delivery.mdx', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await page.goto('/admin/index.html');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
    await expect(page.locator('iframe')).toBeVisible();
    await page.locator('iframe').evaluate((frame) => { (frame as HTMLIFrameElement).src = '/preview/work/ai-assisted-delivery/'; });
    const preview = page.frameLocator('iframe');
    await preview.locator('main h1').click();
    await expect(page.locator('input[name="title"]')).toBeVisible();
    await page.getByRole('button', { name: 'Open options', exact: true }).first().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('Delivery preview editing trial');
    await expect(preview.locator('.harness-preview figcaption')).toHaveText('Delivery preview editing trial');
    await page.getByRole('button', { name: 'ai-assisted-delivery', exact: true }).click();
    await page.getByRole('button', { name: '02 / The Approach', exact: true }).click();
    await page.getByRole('button', { name: 'Open options', exact: true }).click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('Delivery architecture editing trial');
    await page.getByRole('button', { name: 'Per-ticket isolation', exact: true }).click();
    await page.locator('input[name$=".execution.worktree"]').fill('Worktree label editing trial');
    for (const lane of await preview.locator('.ticket-lane').all()) await expect(lane).toContainText('Worktree label editing trial');
    await page.getByRole('button', { name: 'Agentic delivery — isolation, validation and recovery', exact: true }).click();
    await page.getByRole('button', { name: 'Failure and recovery', exact: true }).click();
    await page.locator('input[name$=".recovery.retry"]').fill('Retry label editing trial');
    await expect(preview.locator('.recovery-path')).toContainText('Retry label editing trial');
    expect(await readFile(path, 'utf8')).toBe(original);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Retry label editing trial');
    const saved = await readFile(path, 'utf8');
    expect(saved).toContain('Delivery preview editing trial');
    expect(saved).toContain('Delivery architecture editing trial');
    expect(saved).toContain('Worktree label editing trial');
    const visitor = await page.context().newPage();
    await visitor.goto(route);
    await expect(visitor.locator('.recovery-path')).toContainText('Retry label editing trial');
    await visitor.close();
  } finally {
    await page.close();
    await writeContent(path, original);
  }
});
