// Run against a production preview, not alongside a Tina build.
// Usage: node scripts/capture-crm-strategy.mjs <origin> <output-directory> [axe.min.js]
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const [origin = 'http://localhost:4324', output = 'docs/reviews/crm-strategy/screenshots', axePath] = process.argv.slice(2);
const directory = resolve(output);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(new URL('/work/nonprofit-crm-selection/', origin).href);
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('img').all()) await image.scrollIntoViewIfNeeded();
    await page.evaluate(() => Promise.all([...document.images].map((image) => image.decode().catch(() => {}))));
    const layout = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      const context = canvas.getContext('2d');
      const rgba = (color) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data];
      };
      const mix = (foreground, background) => foreground.slice(0, 3).map((value, i) => value * foreground[3] / 255 + background[i] * (1 - foreground[3] / 255));
      const luminance = (rgb) => {
        const [r, g, b] = rgb.slice(0, 3).map((n) => { const c = n / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
        return r * 0.2126 + g * 0.7152 + b * 0.0722;
      };
      const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
      const nodes = [...document.querySelectorAll('main p, main h1, main h2, main h3, main li:not(:has(p)), main dt, main dd, main figcaption, main a')];
      const textContrasts = nodes.map((node) => {
        const ancestors = [];
        for (let parent = node; parent; parent = parent.parentElement) ancestors.unshift(parent);
        let background = [255, 255, 255];
        for (const ancestor of ancestors) background = mix(rgba(getComputedStyle(ancestor).backgroundColor), background);
        const style = getComputedStyle(node);
        return { text: node.textContent.trim().slice(0, 80), ratio: Number(contrast(rgba(style.color), background).toFixed(2)) };
      });
      // A conservative extra bound for text over the decorative copper ribbons.
      const ribbon = document.querySelector('.decision-ribbons');
      const style = getComputedStyle(ribbon);
      const stroke = rgba(style.stroke);
      stroke[3] *= Number(style.opacity);
      const ribbonBackground = mix(stroke, rgba(getComputedStyle(document.body).backgroundColor));
      const ribbonMinimum = Math.min(...[...document.querySelectorAll('.initial-options > p')].map((node) => contrast(rgba(getComputedStyle(node).color), ribbonBackground)));
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        toolbar: !!document.querySelector('astro-dev-toolbar'),
        hydratedIslands: document.querySelectorAll('astro-island').length,
        clippedText: nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent.trim()),
        minimumTextContrast: Math.min(...textContrasts.map((item) => item.ratio)),
        lowContrast: textContrasts.filter((item) => item.ratio < 4.5),
        ribbonMinimumTextContrast: Number(ribbonMinimum.toFixed(2)),
        images: [...document.images].map((image) => ({ src: image.currentSrc.replace(location.origin, ''), loaded: image.complete && image.naturalWidth > 0 })),
      };
    });
    if (axePath) {
      await page.addScriptTag({ path: axePath });
      layout.accessibility = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
        return {
          version: result.testEngine.version,
          violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) })),
          incomplete: result.incomplete.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })),
          passedRules: result.passes.length,
        };
      });
    }
    results.push({ ...layout, errors });
    await page.evaluate(() => scrollTo(0, 0));
    if ([1440, 390].includes(width)) await page.screenshot({ path: join(directory, `crm-${width}.png`), fullPage: true });
    await page.locator('.crm-transformation').screenshot({ path: join(directory, `decision-${width}.png`) });
    await page.locator('.donor-cost-model').screenshot({ path: join(directory, `model-${width}.png`) });
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(join(directory, 'verification.json'), JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.overflow || result.toolbar || result.hydratedIslands || result.clippedText.length || result.errors.length || result.images.some((image) => !image.loaded) || result.lowContrast.length || result.ribbonMinimumTextContrast < 4.5 || result.accessibility?.violations.length)) throw new Error('CRM review checks failed; inspect verification.json.');
