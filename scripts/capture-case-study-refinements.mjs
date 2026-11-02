// Usage: node scripts/capture-case-study-refinements.mjs <origin> <before|after> [axe.min.js]
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const [origin = 'http://localhost:4321', phase = 'after', axePath] = process.argv.slice(2);
if (!['before', 'after'].includes(phase)) throw new Error('Expected before or after.');
const directory = new URL(`../docs/reviews/visual-refinements/${phase}/`, import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const [name, route, selector] of [
    ['api', '/work/api-migration-confidence/', '.api-decision-diagram'],
    ['harness', '/work/ai-assisted-delivery/', '.harness-diagram'],
  ]) {
    for (const width of (phase === 'after' ? [1920, 1440, 1024, 768, 390, 320] : [1440, 1024, 768, 390, 320])) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(new URL(route, origin).href);
      await page.evaluate(() => document.fonts.ready);
      // Exercise lazy loading naturally before recording image health.
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
        const luminance = (rgb) => {
          const [r, g, b] = rgb.slice(0, 3).map((n) => {
            const c = n / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return r * 0.2126 + g * 0.7152 + b * 0.0722;
        };
        const textContrast = {};
        const ratio = (foreground, background) => (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
        for (const selector of ['h1', '.summary', '.story-section .eyebrow', '.question', '.superseded p', '.ticket-name', '.ticket-validation li', '.recovery-path strong', '.hero-harness > p', '.hero-harness li']) {
          const element = document.querySelector(selector);
          if (!element) continue;
          const foreground = luminance(rgba(getComputedStyle(element).color));
          let parent = element;
          while (parent && rgba(getComputedStyle(parent).backgroundColor)[3] === 0) parent = parent.parentElement;
          const background = luminance(rgba(getComputedStyle(parent || document.body).backgroundColor));
          textContrast[selector] = Number(((Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)).toFixed(2));
        }
        // Axe cannot always resolve a gradient or text near an SVG. Bound
        // contrast against both panel stops and the ribbon's maximum rendered opacity.
        let panelGradientMinimumTextContrast = null;
        const panel = document.querySelector('.investigation-panel');
        if (panel) {
          const style = getComputedStyle(panel);
          const base = style.getPropertyValue('--background').trim();
          const muted = style.getPropertyValue('--muted').trim();
          const stops = [base, `color-mix(in srgb, ${muted} 40%, ${base})`].map((color) => luminance(rgba(color)));
          panelGradientMinimumTextContrast = Number(Math.min(...[...document.querySelectorAll('.investigation-panel :is(.investigation-label, h3, .investigation-intro), .scope-retain p, .rerun, .ci-outcome :is(strong, p)')].flatMap((node) => stops.map((background) => ratio(luminance(rgba(getComputedStyle(node).color)), background)))).toFixed(2));
        }
        let heroRibbonMinimumTextContrast = null;
        const ribbon = document.querySelector('.harness-preview .ribbons');
        if (ribbon) {
          const style = getComputedStyle(ribbon);
          const alpha = Number(style.opacity);
          const base = rgba(getComputedStyle(document.body).backgroundColor);
          const stroke = rgba(style.stroke);
          const background = luminance(base.map((channel, i) => channel * (1 - alpha) + stroke[i] * alpha));
          heroRibbonMinimumTextContrast = Number(Math.min(...[...document.querySelectorAll('.hero-backlog > strong, .hero-review > strong')].map((node) => ratio(luminance(rgba(getComputedStyle(node).color)), background))).toFixed(2));
        }
        return {
          width: innerWidth,
          overflow: document.documentElement.scrollWidth > innerWidth,
          toolbar: !!document.querySelector('astro-dev-toolbar'),
          hydratedIslands: document.querySelectorAll('astro-island').length,
          images: [...document.images].map((image) => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0, bytes: performance.getEntriesByName(image.currentSrc)[0]?.transferSize })),
          clippedText: [...document.querySelectorAll('main p, main h3, main li:not(:has(*)), main figcaption')].filter((node) => node.scrollWidth > node.clientWidth + 1).map((node) => node.textContent),
          textContrast,
          panelGradientMinimumTextContrast,
          heroRibbonMinimumTextContrast,
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
      results.push({ name, ...layout, errors });
      if ([1920, 1440, 390, 320].includes(width)) await page.screenshot({ path: new URL(`${name}-${width}.png`, directory).pathname, fullPage: true });
      await page.locator(selector).screenshot({ path: new URL(`${name}-diagram-${width}.png`, directory).pathname });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile(new URL('verification.json', directory), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.overflow || result.toolbar || result.hydratedIslands || result.clippedText.length || result.errors.length || result.images.some((image) => !image.loaded) || result.accessibility?.violations.length || Object.values(result.textContrast).some((contrast) => contrast < 4.5) || (result.panelGradientMinimumTextContrast !== null && result.panelGradientMinimumTextContrast < 4.5) || (result.heroRibbonMinimumTextContrast !== null && result.heroRibbonMinimumTextContrast < 4.5))) throw new Error('Review checks failed; inspect verification.json.');
