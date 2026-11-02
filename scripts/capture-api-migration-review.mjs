// Run against a production preview, never a publicly exposed local Tina server.
// Usage: node scripts/capture-api-migration-review.mjs http://localhost:4321 [path/to/axe.min.js]
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL = process.argv[2] || 'http://localhost:4321';
const axePath = process.argv[3];
const directory = new URL('../docs/reviews/api-migration/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto(new URL('/work/api-migration-confidence/', baseURL).href);
    await page.evaluate(() => document.fonts.ready);
    const audit = await page.evaluate(() => {
      const luminance = (color) => {
        const [r, g, b] = color.match(/[\d.]+/g).slice(0, 3).map((part) => {
          const channel = Number(part) / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return r * 0.2126 + g * 0.7152 + b * 0.0722;
      };
      const canvas = luminance(getComputedStyle(document.body).backgroundColor);
      const textContrast = Object.fromEntries(['.summary', '.investigation-label', '.question', '.assumption-label', '.comparison', '.branch-finding', '.api-preview strong', '.investigation-intro', '.api-decision-diagram figcaption'].map((selector) => {
        const ink = luminance(getComputedStyle(document.querySelector(selector)).color);
        return [selector, Number(((Math.max(canvas, ink) + 0.05) / (Math.min(canvas, ink) + 0.05)).toFixed(2))];
      }));
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        toolbar: !!document.querySelector('astro-dev-toolbar'),
        investigations: [...document.querySelectorAll('.investigation-panel')].map((node) => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
        crossInvestigationConnector: !!document.querySelector('.retained-bridge'),
        textSizes: [...new Set([...document.querySelectorAll('.investigation-panel p, .investigation-panel li')].map((node) => getComputedStyle(node).fontSize))],
        textContrast,
      };
    });
    results.push(audit);
    if (axePath) {
      await page.addScriptTag({ path: axePath });
      const accessibility = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
        return {
          version: result.testEngine.version,
          violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) })),
          incomplete: result.incomplete.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })),
          passedRules: result.passes.length,
        };
      });
      audit.accessibility = accessibility;
      if (accessibility.violations.length) throw new Error(`Accessibility violations at ${width}px: ${JSON.stringify(accessibility.violations)}`);
    }
    if (audit.overflow || audit.toolbar) throw new Error(`Unexpected overflow or dev toolbar at ${width}px`);
    if ([1440, 390, 320].includes(width)) await page.screenshot({ path: new URL(`page-${width}.png`, directory).pathname, fullPage: true });
    if (width === 1440) await page.locator('.api-decision-diagram').screenshot({ path: new URL('diagram-1440.png', directory).pathname });
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(new URL('layout.json', directory), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
