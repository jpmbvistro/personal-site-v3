import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { writeContent } from './fixtures/write-content';
import { workStories } from './fixtures/work-drafts';

async function openEditor(page: import('@playwright/test').Page, route = '/') {
  await page.goto('/admin/index.html');
  await page.getByRole('button', { name: 'Enter Edit Mode' }).click();
  await expect(page.locator('iframe')).toBeVisible();
  if (route !== '/') await page.locator('iframe').evaluate((frame, path) => { (frame as HTMLIFrameElement).src = path; }, route);
}

for (const { slug, title, published } of workStories) {
  test(`selecting ${slug} from the collection opens its local visual preview`, async ({ page }) => {
    await openEditor(page);
    await page.goto('/admin/index.html#/collections/work');
    await page.getByText(title, { exact: true }).click();
    await expect(page.locator('iframe')).toHaveAttribute('src', new RegExp(`/preview/work/${slug}/$`));
    await expect(page.frameLocator('iframe').locator('.draft-note')).toHaveCount(published ? 0 : 1);
    await expect(page.locator('input[name="title"]')).toHaveValue(title);
  });
}

test('in-context edit previews before saving to the Git-backed Markdown file', async ({ page }) => {
  const path = new URL('../content/pages/home.md', import.meta.url);
  const originalFile = await readFile(path, 'utf8');

  try {
    await openEditor(page);

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
    await writeContent(path, originalFile);
  }
});

test('homepage leadership narrative previews and saves through the fixed Tina content group', async ({ page }) => {
  const path = new URL('../content/pages/home.md', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await openEditor(page);
    const statement = page.frameLocator('iframe').locator('.perspective-statement');
    await statement.click();
    await page.getByRole('button', { name: 'Homepage content (Home only)', exact: true }).click();
    await page.getByRole('button', { name: 'Leadership perspective', exact: true }).click();
    const field = page.locator('textarea[name="homepage.perspective.text"]');
    await expect(field).toBeVisible();
    const edited = `${await field.inputValue()} Preview test.`;
    await field.fill(edited);
    await expect(statement).toHaveText(edited);
    expect(await readFile(path, 'utf8')).toBe(original);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Preview test.');
  } finally {
    await page.close();
    await writeContent(path, original);
  }
});

for (const { route, file } of [
  ...workStories.map(({ slug }) => ({ route: `/preview/work/${slug}/`, file: `../content/work/${slug}.mdx` })),
  { route: '/preview/projects/keel/', file: '../content/projects/keel.mdx' },
  { route: '/about/', file: '../content/pages/about.md' },
  { route: '/resume/', file: '../content/pages/resume.md' },
]) {
  test(`visual edit and save ${route} without changing template code`, async ({ page }) => {
    const path = new URL(file, import.meta.url);
    const original = await readFile(path, 'utf8');
    try {
      await openEditor(page, route);
      const heading = page.frameLocator('iframe').locator('main h1');
      await expect(heading).toBeVisible();
      await heading.click();
      const title = page.locator('input[name="title"]');
      await expect(title).toBeVisible();
      const edited = `${await title.inputValue()} — editing test`;
      await title.fill(edited);
      await expect(heading).toHaveText(edited);
      expect(await readFile(path, 'utf8')).toBe(original);
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await expect.poll(() => readFile(path, 'utf8')).toContain(edited);
    } finally {
      await page.close();
      await writeContent(path, original);
    }
  });
}

test('insert, edit, reorder, and save a typed metric strip through the real rich-text editor', async ({ page }) => {
  const path = new URL('../content/work/ai-assisted-delivery.mdx', import.meta.url);
  const original = await readFile(path, 'utf8');
  try {
    await openEditor(page, '/preview/work/ai-assisted-delivery/');
    await page.frameLocator('iframe').locator('main h1').click();
    await expect(page.locator('input[name="title"]')).toBeVisible();
    // Replace only the body's metric strip, retaining the story's lead figure.
    await page.getByRole('button', { name: 'Open options', exact: true }).last().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Remove', exact: true }).click();
    // Clicking the editor's center can open the remaining hero embed's form.
    // Focus the actual rich-text surface, then create the trailing paragraph
    // with the keyboard so insertion stays in the document editor.
    const editor = page.locator('[contenteditable="true"]');
    await editor.focus();
    await editor.press('ControlOrMeta+End');
    await editor.press('Enter');
    await page.getByTestId('rich-text-editor-overflow-menu-button').click();
    await page.getByRole('radio', { name: 'Embed', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Metric strip', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Open options', exact: true }).last().click();
    await page.getByRole('dialog').getByText('Edit', { exact: true }).click();
    await page.locator('input[name$=".props.caption"]').fill('Authoring trial (test only)');

    for (const [value, label] of [['A', 'First trial'], ['B', 'Second trial']]) {
      await page.locator('button[data-test^="add-item-"]').click();
      await page.getByRole('button', { name: 'Metric', exact: true }).click();
      await page.locator('input[name$=".value"]').fill(value);
      await page.locator('input[name$=".label"]').fill(label);
      await page.locator('input[name$=".qualifier"]').fill('Illustrative test data');
      await page.getByRole('button', { name: 'Metric strip', exact: true }).click();
    }

    const second = page.getByRole('button', { name: 'Second trial', exact: true });
    const first = page.getByRole('button', { name: 'First trial', exact: true });
    const from = await second.locator(':scope > div').first().boundingBox();
    const to = await first.locator(':scope > div').first().boundingBox();
    expect(from).not.toBeNull();
    expect(to).not.toBeNull();
    await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
    await page.mouse.down();
    // Tina's pointer sensor deliberately requires a 100ms stationary hold.
    await page.waitForTimeout(150);
    await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 15 });
    await page.mouse.up();
    const figure = page.frameLocator('iframe').locator('figure').filter({ hasText: 'Authoring trial (test only)' });
    await expect(figure.locator('dt')).toHaveText(['Second trial', 'First trial']);
    expect(await readFile(path, 'utf8')).toBe(original);

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect.poll(() => readFile(path, 'utf8')).toContain('Authoring trial (test only)');
    const saved = await readFile(path, 'utf8');
    expect(saved.indexOf('Second trial')).toBeLessThan(saved.indexOf('First trial'));
    const publicPreview = await page.context().newPage();
    await publicPreview.goto('/preview/work/ai-assisted-delivery/');
    await expect(publicPreview.locator('figure').filter({ hasText: 'Authoring trial (test only)' }).locator('dt')).toHaveText(['Second trial', 'First trial']);
    await publicPreview.close();
  } finally {
    await page.close();
    await writeContent(path, original);
  }
});
