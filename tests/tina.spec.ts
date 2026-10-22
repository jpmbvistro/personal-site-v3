import { expect, test } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

test('in-context edit previews before saving to the Git-backed Markdown file', async ({ page }) => {
  const path = new URL('../content/pages/home.md', import.meta.url);
  const originalFile = await readFile(path, 'utf8');

  try {
    await page.goto('/admin/index.html');
    await page.getByRole('button', { name: 'Enter Edit Mode' }).click();

    const title = page.locator('input[name="title"]');
    await expect(title).toBeVisible();
    const originalTitle = await title.inputValue();
    const editedTitle = `${originalTitle} — preview test`;
    const preview = page.frameLocator('iframe');
    const heading = preview.locator('main h1');

    // Use the real admin/iframe bridge, not a mocked GraphQL mutation.
    await heading.click();
    await title.fill(editedTitle);
    await expect(heading).toHaveText(editedTitle);
    expect(await readFile(path, 'utf8')).toBe(originalFile);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain(editedTitle);

    const publicPage = await page.context().newPage();
    await publicPage.goto('/');
    await expect(publicPage.locator('main h1')).toHaveText(editedTitle);
    await publicPage.close();
  } finally {
    await page.close();
    await writeFile(path, originalFile);
  }
});
