// Run against a loopback *built* preview, separately from Tina's editor tests.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://127.0.0.1:4324';
const directory = 'docs/reviews/homepage/screenshots';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      window.__homepageVitals = { cls: 0, lcp: 0 };
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__homepageVitals.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => { window.__homepageVitals.lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img) => img.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${directory}/page-${width}.png`, fullPage: true });
    if (width === 1440) {
      await page.locator('.hero').screenshot({ path: `${directory}/hero-1440.png` });
      await page.locator('.selected-work').screenshot({ path: `${directory}/selected-work-1440.png` });
    }
    if (width === 320) {
      await page.locator('.hero-copy').screenshot({ path: `${directory}/hero-320.png` });
      await page.locator('.leadership-diagram').screenshot({ path: `${directory}/diagram-320.png` });
    }
    const focus = [];
    await page.keyboard.press('Tab');
    for (const selector of ['.hero-actions a', '.closing .button-link']) {
      await page.locator(selector).first().focus();
      focus.push(await page.locator(selector).first().evaluate((el) => {
        const style = getComputedStyle(el);
        return { target: el.textContent.trim(), outline: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor, focused: document.activeElement === el };
      }));
    }
    let accessibility;
    if (process.env.AXE_PATH) {
      await page.addScriptTag({ path: process.env.AXE_PATH });
      accessibility = await page.evaluate(async () => {
        const audit = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
        return { version: audit.testEngine.version, violations: audit.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(({ target }) => target) })), incomplete: audit.incomplete.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) })) };
      });
      assert.equal(accessibility.violations.length, 0, `Accessibility violations at ${width}`);
    }
    const result = await page.evaluate(() => {
      // CSS color-mix may serialize as color(srgb ...), not rgb(...).
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const rgb = (value) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); };
      const luminance = (value) => rgb(value).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const background = getComputedStyle(document.body).backgroundColor;
      const contrast = Object.fromEntries(['h1', '.introduction', '.section-intro > .eyebrow', '.card-summary', '.practices', '.outcomes', '.perspective-statement', '.closing p', '.closing .button-link'].map((selector) => {
        const el = document.querySelector(selector);
        let surface = el;
        while (surface && getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)') surface = surface.parentElement;
        return [selector, ratio(getComputedStyle(el).color, surface ? getComputedStyle(surface).backgroundColor : background)];
      }));
      // Axe leaves gradient-backed domain labels unresolved. Check the darkest
      // opaque stop, conservatively, rather than claiming a complete auto audit.
      const probe = document.createElement('span');
      probe.style.color = 'color-mix(in srgb, var(--primary) 15%, var(--background))';
      document.body.append(probe);
      contrast['domain labels / darkest gradient stop'] = ratio(getComputedStyle(document.querySelector('.domain-title')).color, getComputedStyle(probe).color);
      probe.remove();
      contrast['decorative all-work arrow'] = ratio(getComputedStyle(document.querySelector('.all-work > span')).color, background);
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        contrast,
        workLinks: [...document.querySelectorAll('.work-grid h3 a')].map((a) => a.getAttribute('href')),
        images: [...document.querySelectorAll('main img')].map((img) => ({ src: img.currentSrc, loaded: img.complete && img.naturalWidth > 0, width: img.getBoundingClientRect().width })),
        ctaBottom: document.querySelector('.hero-actions').getBoundingClientRect().bottom + scrollY,
        vitals: { ...window.__homepageVitals, domContentLoadedMs: nav.domContentLoadedEventEnd, transferredBytes: performance.getEntriesByType('resource').reduce((total, entry) => total + entry.transferSize, 0) },
        scripts: [...document.scripts].filter((s) => s.src).map((s) => s.getAttribute('src')),
      };
    });
    assert.equal(result.scrollWidth, width, `Overflow at ${width}`);
    for (const [selector, contrast] of Object.entries(result.contrast)) assert.ok(contrast >= 4.5, `${selector}: ${contrast}`);
    assert.ok(result.images.every((image) => image.loaded));
    assert.ok(focus.every((item) => item.focused && item.outline === 'solid' && item.width === '3px'));
    results.push({ ...result, focus, ...(accessibility ? { accessibility } : {}) });
    await page.close();
  }
  await writeFile(`${directory}/verification.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log('Captured five widths; overflow, sampled text contrast, and image checks passed.');
} finally {
  await browser.close();
}
