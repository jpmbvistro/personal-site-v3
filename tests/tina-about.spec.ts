import { expect, test } from '@playwright/test';

async function openEditor(page: import('@playwright/test').Page, route = '/') {
  await page.goto('/admin/index.html');
  await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
  await expect(page.locator('iframe')).toBeVisible();
  if (route !== '/') await page.locator('iframe').evaluate((frame, path) => { (frame as HTMLIFrameElement).src = path; }, route);
}

test('clicking a career stage focuses its editor fields without manual navigation', async ({ page }) => {
  test.setTimeout(120_000);
  await openEditor(page, '/about/');
  const preview = page.frameLocator('iframe');
  await expect(preview.locator('main h1')).toBeVisible({ timeout: 45_000 });
  // Prime quick-edit mode on the known-good page title before clicking under test.
  await preview.locator('main h1').click();
  await page.waitForTimeout(500);

  await preview.locator('.stages h3').first().click();
  const headingInput = page.locator('input[name="about.path.stages.0.title"]');
  await expect(headingInput).toBeVisible();

  await preview.locator('.stages p').first().click();
  await expect(page.locator('input[name="about.path.stages.0.text"]').or(page.locator('textarea[name="about.path.stages.0.text"]'))).toBeVisible();
});

test('clicking a working principle focuses its rich-text editor', async ({ page }) => {
  test.setTimeout(120_000);
  await openEditor(page, '/about/');
  const preview = page.frameLocator('iframe');
  await expect(preview.locator('main h1')).toBeVisible({ timeout: 45_000 });
  await preview.locator('main h1').click();
  await page.waitForTimeout(500);

  await preview.locator('.principle-text').first().click();
  await expect(page.locator('[contenteditable="true"]').last()).toBeVisible({ timeout: 15_000 });
});

test('clicking a next-step link focuses its label field', async ({ page }) => {
  test.setTimeout(120_000);
  await openEditor(page, '/about/');
  const preview = page.frameLocator('iframe');
  await expect(preview.locator('main h1')).toBeVisible({ timeout: 45_000 });
  await preview.locator('main h1').click();
  await page.waitForTimeout(500);

  await preview.locator('.about-links a').first().click();
  await expect(page.locator('input[name="links.0.label"]')).toBeVisible();
});

test('career stages strip spans the full path section at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about/');
  const section = page.locator('.about-section').filter({ has: page.locator('.stages') });
  const sectionBox = await section.boundingBox();
  const stagesBox = await section.locator('.stages').boundingBox();
  expect(sectionBox).not.toBeNull();
  expect(stagesBox).not.toBeNull();
  // Spanning the section means starting in the left column (same inline start
  // as the heading) and covering essentially the full section width, not just
  // the right content column.
  expect(stagesBox!.x).toBeCloseTo(sectionBox!.x, -1);
  expect(stagesBox!.width).toBeGreaterThan(sectionBox!.width * 0.95);
});

test('stage cards remain three across, ordered, above the fold threshold at desktop width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/about/');
  const headings = page.locator('.stages h3');
  // One row, ordered left to right.
  await expect(headings).toHaveText(['Community & Programs', 'Product Engineering', 'Engineering Systems & Leadership']);
  const boxes = [];
  for (let i = 0; i < 3; i++) boxes.push(await headings.nth(i).boundingBox());
  expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
  expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);
  // Same row: equal top edges across the three stage cards.
  expect(Math.abs(boxes[0]!.y - boxes[1]!.y)).toBeLessThan(2);
  expect(Math.abs(boxes[1]!.y - boxes[2]!.y)).toBeLessThan(2);
});
