import sharp from 'sharp';
import { mkdir, copyFile, chmod, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Run explicitly against the owner's supplied directory; never part of a build.
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/optimize-crm-assets.mjs <source-directory>');
const originals = 'docs/reviews/crm-strategy/sources';
const output = 'public/uploads/crm-strategy';
await mkdir(originals, { recursive: true });
await mkdir(output, { recursive: true });
const names = ['layered_sage_platform_stack', 'copper_handshake_emblem', 'warm_ivory_calculator_badge', 'isometric_green_growth_chart_icon', 'isometric_green_slider_settings_icon', 'stacked_green_coin_transaction_icon', 'three_tiered_green_and_copper_pyramid'];
const report = [];
for (const [i, name] of names.entries()) {
  const file = join(source, `ChatGPT Image Nov 1, 2026, 04_14_${['03', '04', '06', '10', '11', '12', '14'][i]} PM-${i + 1}.png`);
  const original = join(originals, `${name}.png`);
  await copyFile(file, original);
  await chmod(original, 0o644);
  const metadata = await sharp(file).metadata();
  const derivatives = [];
  for (const size of (i === 6 ? [320, 640] : [128, 256])) {
    const target = join(output, `${name}-${size}.webp`);
    await sharp(file).trim({ background: '#00000000', threshold: 10 }).resize(size, size, { fit: 'contain', background: '#00000000' }).webp({ quality: 85, alphaQuality: 100 }).toFile(target);
    derivatives.push({ file: target, bytes: (await stat(target)).size });
  }
  report.push({ source: original, suppliedName: file.split('/').at(-1), width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha, bytes: (await stat(file)).size, derivatives });
}
await writeFile('docs/reviews/crm-strategy/assets.json', JSON.stringify(report, null, 2) + '\n');
const references = 'docs/reviews/crm-strategy/references';
await mkdir(references, { recursive: true });
for (const name of ['crm_decision_transformation_mockup', 'donor_cost_model_mockup']) {
  await sharp(join(source, `${name}.png`)).webp({ quality: 85 }).toFile(join(references, `${name}.webp`));
}
console.log(JSON.stringify(report, null, 2));
