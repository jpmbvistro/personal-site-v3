import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { writeContent } from './fixtures/write-content';

async function openEditor(page: import('@playwright/test').Page, route = '/') {
  await page.goto('/admin/index.html');
  await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
  await expect(page.locator('iframe')).toBeVisible();
  if (route !== '/') await page.locator('iframe').evaluate((frame, path) => { (frame as HTMLIFrameElement).src = path; }, route);
}

for (const [index, expectedTitle] of [
  ['0', 'Technical judgment'],
  ['1', 'Cross-functional leadership'],
  ['2', 'Engineering delivery'],
] as const) {
  test(`clicking homepage capability ${index} focuses its fields in the editor without manual navigation`, async ({ page }) => {
    const path = new URL('../content/pages/home.md', import.meta.url);
    const original = await readFile(path, 'utf8');
    try {
      await openEditor(page);
      const preview = page.frameLocator('iframe');
      // Prime quick-edit mode with a no-op click on the known-good title anchor
      // before clicking under test, so the first handshake doesn't swallow it.
      const title = page.locator('input[name="title"]');
      await expect(title).toBeVisible();
      const originalTitle = await title.inputValue();
      await title.fill(originalTitle);
      await preview.locator('main h1').click();

      const headingInput = page.locator(`input[name="homepage.capabilities.${index}.title"]`);
      // Tina's quick-edit handshake can swallow a click while local content
      // reloads; retry the click until the matching field is shown.
      await expect(async () => {
        await preview.locator('.capabilities h2').nth(Number(index)).click();
        await expect(headingInput).toBeVisible({ timeout: 2_000 });
      }).toPass({ timeout: 20_000 });
      await expect(headingInput).toHaveValue(expectedTitle);
      await expect(preview.locator('.capabilities h2').nth(Number(index))).toHaveText(expectedTitle);
      expect(await readFile(path, 'utf8')).toBe(original);
    } finally {
      await page.close();
      await writeContent(path, original);
    }
  });
}
