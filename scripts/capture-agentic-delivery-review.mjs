// Usage: node scripts/capture-agentic-delivery-review.mjs http://localhost:4321 [path/to/axe.min.js]
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const baseURL = process.argv[2] || 'http://localhost:4321';
const axePath = process.argv[3];
const directory = new URL('../docs/reviews/agentic-delivery/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto(new URL('/work/ai-assisted-delivery/', baseURL).href);
    await page.evaluate(() => document.fonts.ready);
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
      const luminance = (rgb) => {
        const [r, g, b] = rgb.slice(0, 3).map((n) => {
          const c = n / 255;
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
        });
        return r * 0.2126 + g * 0.7152 + b * 0.0722;
      };
      const contrast = (selector) => {
        const element = document.querySelector(selector);
        const foreground = luminance(rgba(getComputedStyle(element).color));
        let parent = element;
        while (parent && rgba(getComputedStyle(parent).backgroundColor)[3] === 0) parent = parent.parentElement;
        const background = luminance(rgba(getComputedStyle(parent || document.body).backgroundColor));
        return Number(((Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)).toFixed(2));
      };
      // Axe cannot always resolve text near the decorative SVG. Bound the
      // worst case at the ribbon's full measured opacity over the ivory canvas.
      const ribbon = getComputedStyle(document.querySelector('.harness-preview .ribbons'));
      const alpha = Number(ribbon.opacity);
      const base = rgba(getComputedStyle(document.body).backgroundColor);
      const stroke = rgba(ribbon.stroke);
      const ribbonBackground = luminance(base.map((channel, index) => channel * (1 - alpha) + stroke[index] * alpha));
      const ribbonMinimum = Math.min(...['.hero-backlog > strong', '.hero-review > strong'].map((selector) => {
        const foreground = luminance(rgba(getComputedStyle(document.querySelector(selector)).color));
        return (Math.max(foreground, ribbonBackground) + 0.05) / (Math.min(foreground, ribbonBackground) + 0.05);
      }));
      return {
        width: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        toolbar: !!document.querySelector('astro-dev-toolbar'),
        representativeLanes: document.querySelectorAll('.ticket-lane').length,
        decisions: document.querySelectorAll('.story-decisions .section-main > ol > li').length,
        textContrast: Object.fromEntries(['h1', '.summary', '.story-section .eyebrow', '.ticket-name', '.lane-steps > li', '.hero-harness > p', '.hero-harness li', '.hero-backlog > strong', '.hero-review > strong', '.recovery-note', '.story-quote .quote-text p'].map((selector) => [selector, contrast(selector)])),
        ribbonWorstCaseTextContrast: Number(ribbonMinimum.toFixed(2)),
        stages: [...document.querySelectorAll('.harness-pipeline > li')].map((node) => ({ heading: node.querySelector('h3').textContent, x: node.getBoundingClientRect().x, y: node.getBoundingClientRect().y, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height })),
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
    results.push(layout);
    if ([1440, 390, 320].includes(width)) await page.screenshot({ path: new URL(`page-${width}.png`, directory).pathname, fullPage: true });
    if (width === 1440) await page.locator('.harness-diagram').screenshot({ path: new URL('diagram-1440.png', directory).pathname });
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(new URL('accessibility.json', directory), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.overflow || result.toolbar || result.accessibility?.violations.length || result.ribbonWorstCaseTextContrast < 4.5 || Object.values(result.textContrast).some((ratio) => ratio < 4.5))) throw new Error('Review checks failed; inspect accessibility.json.');
