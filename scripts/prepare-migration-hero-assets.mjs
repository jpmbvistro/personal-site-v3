import sharp from 'sharp';
import { mkdir, copyFile, chmod, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Run explicitly against the owner's supplied directory; never part of a build.
// Recreates the "Two decisions. One safer migration." hero figures from the
// supplied Nov 3, 2026 mockup and icon pack at /mnt/e/Downloads/Migration Hero Icons.
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/prepare-migration-hero-assets.mjs <source-directory>');
const originals = 'docs/reviews/visual-refinements/sources';
const service = 'docs/reviews/visual-refinements/references';
const output = 'public/uploads/architecture';
await mkdir(originals, { recursive: true });
await mkdir(service, { recursive: true });
await mkdir(output, { recursive: true });

// Five icon elements from the pack; the sixth supplied image is the composition
// reference mockup, kept for review docs only, never page content.
const elements = ['inherited-stack', 'usage-funnel', 'necessity-branch', 'behavior-cards', 'live-comparison'];
const supplied = [
  'ChatGPT Image Nov 3, 2026, 11_07_16 AM-2.png',
  'ChatGPT Image Nov 3, 2026, 11_07_17 AM-3.png',
  'ChatGPT Image Nov 3, 2026, 11_07_20 AM-4.png',
  'ChatGPT Image Nov 3, 2026, 11_07_21 AM-5.png',
  'ChatGPT Image Nov 3, 2026, 11_07_22 AM-6.png',
];
const report = [];
for (const [i, name] of elements.entries()) {
  const file = join(source, supplied[i]);
  const original = join(originals, `${name}.png`);
  await copyFile(file, original);
  await chmod(original, 0o644);
  const metadata = await sharp(file).metadata();
  const derivatives = [];
  for (const size of [144, 288]) {
    const target = join(output, `${name}-${size}.webp`);
    await sharp(file)
      .trim({ background: '#00000000', threshold: 10 })
      .resize(size, size, { fit: 'contain', background: '#00000000' })
      .webp({ quality: 85, alphaQuality: 100 })
      .toFile(target);
    derivatives.push({ file: target, bytes: (await stat(target)).size });
  }
  report.push({ source: original, suppliedName: supplied[i], width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha, bytes: (await stat(file)).size, derivatives });
}
// The composition reference is documented for review; it is not embedded on pages.
const mockup = 'two-decisions-one-safer-migration-mockup';
await sharp(join(source, 'ChatGPT Image Nov 3, 2026, 11_07_15 AM-1.png'))
  .webp({ quality: 85 })
  .toFile(join(service, `${mockup}.webp`));
await writeFile('docs/reviews/visual-refinements/migration-hero-assets.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
