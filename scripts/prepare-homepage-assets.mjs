// Optional, offline asset preparation. No generated imagery or product UI.
// Usage: node scripts/prepare-homepage-assets.mjs /path/to/supplied/asset-pack
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

if (!process.argv[2]) throw new Error('Supply the homepage asset-pack directory');
const source = resolve(process.argv[2]);
await mkdir('public/uploads/homepage', { recursive: true });
await mkdir('docs/reviews/homepage', { recursive: true });
const assets = [];
for (const key of ['ux-scaling', 'agentic-delivery', 'api-migration', 'crm-strategy']) {
  const file = `work-thumbnails/${key}-thumbnail-1600x900.png`;
  const original = await readFile(resolve(source, file));
  const outputs = [];
  for (const width of [400, 800]) {
    const path = `public/uploads/homepage/${key}${width === 400 ? '-400' : ''}.webp`;
    // Preserve the complete composition, including its frame; never crop labels.
    const info = await sharp(original).resize({ width }).webp({ quality: 85 }).toFile(path);
    outputs.push({ path, width: info.width, height: info.height, bytes: info.size });
  }
  assets.push({ source: file, sha256: createHash('sha256').update(original).digest('hex'), outputs });
}
await writeFile('docs/reviews/homepage/assets.json', `${JSON.stringify(assets, null, 2)}\n`);
