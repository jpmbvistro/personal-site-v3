// Run against loopback dev (before) or the production preview (after).
// Usage: node scripts/capture-ux-review.mjs before http://localhost:4321
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const [phase, baseURL = 'http://localhost:4321'] = process.argv.slice(2);
if (!['before', 'after'].includes(phase)) throw new Error('Choose before or after.');
const directory = new URL('../docs/reviews/ux-scaling/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    await page.goto(new URL('/work/scaling-ux-capability/', baseURL).href);
    await page.evaluate(() => document.fonts.ready);
    const audit = await page.evaluate(() => ({
      width: innerWidth,
      viewportScale: visualViewport?.scale,
      rootSize: getComputedStyle(document.documentElement).fontSize,
      bodyZoom: getComputedStyle(document.body).zoom,
      overflow: document.documentElement.scrollWidth > innerWidth,
      toolbar: !!document.querySelector('astro-dev-toolbar'),
      typography: Object.fromEntries(['.summary', '.intro-copy p', '.story-decisions li', '.approach-stages p', '.diagram-summary', '.metric-strip dd > span:not(.metric-icon)'].map((selector) => {
        const style = getComputedStyle(document.querySelector(selector));
        return [selector, { size: style.fontSize, weight: style.fontWeight, lineHeight: style.lineHeight }];
      })),
    }));
    console.log(JSON.stringify(audit));
    // A dev toolbar is not part of the design comparison. Never conceal one in
    // the production capture: that would hide a publication defect.
    if (phase === 'before') await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
    else if (audit.toolbar) throw new Error('Unexpected toolbar in the production preview.');
    await page.screenshot({ path: new URL(`${phase}-${width}.png`, directory).pathname, fullPage: true });
    await page.close();
  }
} finally {
  await browser.close();
}
