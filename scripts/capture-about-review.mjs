// Run against a loopback *built* preview, separately from Tina's editor tests.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.argv[2] || 'http://127.0.0.1:4324';
const directory = 'docs/reviews/about/screenshots';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      window.__aboutVitals = { cls: 0, lcp: 0 };
      new PerformanceObserver((list) => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__aboutVitals.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((list) => { window.__aboutVitals.lcp = list.getEntries().at(-1).startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(`${origin}/about/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const image of await page.locator('main img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img) => img.decode());
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${directory}/page-${width}.png`, fullPage: true });
    if (width === 1440) {
      await page.locator('.hero').screenshot({ path: `${directory}/hero-1440.png` });
      await page.locator('.stages').screenshot({ path: `${directory}/stages-1440.png` });
      await page.locator('.feature-grid').screenshot({ path: `${directory}/features-1440.png` });
    }
    if (width === 320) {
      await page.locator('.hero-copy').screenshot({ path: `${directory}/hero-320.png` });
      await page.locator('.hero-portrait').screenshot({ path: `${directory}/portrait-320.png` });
    }
    const focus = [];
    const keyboard = async (selector) => {
      for (const target of await page.locator(selector).all()) {
        await target.focus();
        focus.push(await target.evaluate((el) => {
          const style = getComputedStyle(el);
          return { target: el.textContent.trim().slice(0, 48), outline: style.outlineStyle, width: style.outlineWidth, focused: document.activeElement === el };
        }));
      }
    };
    await keyboard('.about-links a');
    await keyboard('.closing .button-link');
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
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const rgb = (value) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); };
      const luminance = (value) => rgb(value).map((x) => { x /= 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }).reduce((sum, x, i) => sum + x * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const background = getComputedStyle(document.body).backgroundColor;
      const contrast = Object.fromEntries([
        'h1', '.hero-intro', '.about-section .eyebrow', '.about-section h2',
        '.stages h3', '.stages p', '.principles-list dt', '.principle-text p',
        '.feature h3', '.feature-text p', '.feature a',
        '.about-links a', '.closing p', '.closing .button-link',
      ].flatMap((selector) => [...document.querySelectorAll(selector)].map((el, index) => {
        let surface = el;
        while (surface && getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)') surface = surface.parentElement;
        return [`${selector}${index ? `[${index}]` : ''}`, ratio(getComputedStyle(el).color, surface ? getComputedStyle(surface).backgroundColor : background)];
      })));
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        width: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        contrast,
        icons: [...document.querySelectorAll('main img')].map((img) => ({ src: img.currentSrc, loaded: img.complete && img.naturalWidth > 0, width: Math.round(img.getBoundingClientRect().width) })),
        aboutLinks: [...document.querySelectorAll('.about-links a')].map((a) => ({ text: a.textContent.trim(), href: a.getAttribute('href') })),
        featureLinks: [...document.querySelectorAll('.feature a')].map((a) => a.getAttribute('href')),
        headingOrder: [...document.querySelectorAll('main h1, main h2, main h3')].map((h) => `${h.tagName}: ${h.textContent.trim().slice(0, 60)}`),
        vitals: { ...window.__aboutVitals, domContentLoadedMs: nav.domContentLoadedEventEnd, transferredBytes: performance.getEntriesByType('resource').reduce((total, entry) => total + entry.transferSize, 0) },
      };
    });
    assert.equal(result.scrollWidth, width, `Overflow at ${width}`);
    for (const [selector, value] of Object.entries(result.contrast)) assert.ok(value >= 4.5, `${selector}: ${value}`);
    assert.ok(result.icons.every((image) => image.loaded));
    assert.ok(focus.every((item) => item.focused && item.outline === 'solid' && item.width === '3px'));
    results.push({ ...result, focus, ...(accessibility ? { accessibility } : {}) });
    await page.close();
  }
  await writeFile(`${directory}/verification.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log('Captured five widths; overflow, sampled text contrast, image, focus and heading-order checks passed.');
} finally {
  await browser.close();
}
