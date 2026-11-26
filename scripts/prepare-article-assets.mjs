import sharp from 'sharp';
import { mkdir, copyFile, chmod, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Run explicitly against the owner's supplied directory; never part of a build.
const source = process.argv[2];
if (!source) {
  throw new Error('Usage: node scripts/prepare-article-assets.mjs <source-directory>');
}

const originals = 'docs/reviews/faster-code-tougher-tradeoffs/sources';
const output = 'public/uploads/articles';
const social = 'public/uploads/faster-code-tougher-tradeoffs-og-1200x630.png';
await mkdir(originals, { recursive: true });
await mkdir(output, { recursive: true });

const illustrations = [
  ['The_Three_Bears__Cozy_Automation_Workshop.png', 'the-three-bears-cozy-automation-workshop.webp'],
  ['Breadth_vs._Depth__Porridge_Automation_Lab.png', 'breadth-vs-depth-porridge-automation-lab.webp'],
  ['Goldilocks_and_the_Code_Review_Crunch.png', 'goldilocks-and-the-code-review-crunch.webp'],
  ['Code_Porridge_Bottleneck.png', 'code-porridge-bottleneck.webp'],
  ['Goldilocks_and_the_Automation_Porridge.png', 'goldilocks-and-the-automation-porridge.webp'],
];

const report = [];

// The approved social card is already composed at ~1.9:1; resize without
// cropping so its title, author line and artwork all survive at 1200 × 630.
const ogSource = join(source, 'Faster_Code__Tougher_Tradeoffs.png');
const ogOriginal = join(originals, 'Faster_Code__Tougher_Tradeoffs.png');
await copyFile(ogSource, ogOriginal);
await chmod(ogOriginal, 0o644);
const ogMetadata = await sharp(ogSource).metadata();
await sharp(ogSource).resize(1200, 630, { fit: 'fill' }).png({ compressionLevel: 9 }).toFile(social);
report.push({
  source: ogOriginal,
  dimensions: { width: ogMetadata.width, height: ogMetadata.height },
  derivative: social,
  derivativeDimensions: { width: 1200, height: 630 },
  bytes: (await stat(social)).size,
});

for (const [supplied, derivativeName] of illustrations) {
  const file = join(source, supplied);
  const original = join(originals, supplied);
  await copyFile(file, original);
  await chmod(original, 0o644);
  const metadata = await sharp(file).metadata();
  const derivatives = [];
  for (const width of [1280, 640]) {
    const name = width === 1280 ? derivativeName : derivativeName.replace(/\.webp$/, '-640.webp');
    const target = join(output, name);
    await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toFile(target);
    derivatives.push({
      derivative: target,
      derivativeDimensions: { width, height: Math.round((metadata.height / metadata.width) * width) },
      bytes: (await stat(target)).size,
    });
  }
  report.push({
    source: original,
    dimensions: { width: metadata.width, height: metadata.height },
    derivatives,
  });
}

await writeFile('docs/reviews/faster-code-tougher-tradeoffs/assets.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
