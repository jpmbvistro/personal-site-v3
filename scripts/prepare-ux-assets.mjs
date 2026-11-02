import sharp from 'sharp';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// Offline only: node scripts/prepare-ux-assets.mjs <owner-supplied ux diagram directory>
const source = process.argv[2];
if (!source) throw new Error('Supply the UX artwork directory');
const files = (await readdir(source)).filter((file) => file.endsWith('.png')).sort();
const output = 'public/uploads/ux';
const review = 'docs/reviews/ux-icons';
await mkdir(output, { recursive: true });
await mkdir(review, { recursive: true });

const artwork = [
  // Extract symbols only, never baked-in diagram copy or relationship counts.
  { name: 'specialists', index: 1, crop: { left: 174, top: 470, width: 196, height: 148 } },
  { name: 'embedded', index: 1, crop: { left: 634, top: 470, width: 164, height: 172 } },
  { name: 'distributed', index: 2 },
  { name: 'capacity', index: 3 },
  { name: 'skepticism', index: 4 },
  { name: 'research', index: 5 },
  { name: 'integration', index: 6 },
  { name: 'partnership', index: 7 },
];
const report = [];
for (const item of artwork) {
  const original = await readFile(join(source, files[item.index]));
  let image = sharp(original);
  if (item.crop) image = image.extract(item.crop);
  if (item.name === 'embedded') {
    // Exclude fragments of the reference diagram's surrounding copper ring.
    image = image.composite([{ input: Buffer.from('<svg width="164" height="172"><polygon points="80,0 160,36 160,136 87,172 2,137 2,42" fill="white" /></svg>'), blend: 'dest-in' }]);
  }
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // The PNGs have opaque pale paper backgrounds. Normalize that paper and
  // unmatte the light pixels so ivory, not a peach/white rectangle, is the canvas.
  const paper = [255, 244, 232];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const rgb = paper.map((value, c) => Math.min(255, data[i + c] * 255 / value));
      const unmattedAlpha = 1 - Math.min(...rgb) / 255;
      // Discard the near-paper haze rather than retain a faint square backdrop.
      const alpha = Math.max(0, (unmattedAlpha - 0.035) / 0.965);
      const edge = Math.min(x, y, info.width - x - 1, info.height - y - 1);
      const feather = Math.min(1, edge / (Math.min(info.width, info.height) * 0.06));
      const radius = Math.hypot((x / info.width - 0.5) * 2, (y / info.height - 0.5) * 2);
      const cornerFade = Math.max(0, Math.min(1, (1.15 - radius) / 0.25));
      for (let c = 0; c < 3; c++) data[i + c] = unmattedAlpha > 0 ? 255 - (255 - rgb[c]) / unmattedAlpha : 0;
      data[i + 3] = Math.round(data[i + 3] * alpha * feather * cornerFade);
    }
  }
  const derivatives = [];
  for (const size of [128, 256]) {
    const target = join(output, `${item.name}-${size}.webp`);
    const result = await sharp(data, { raw: info }).resize(size, size, { fit: 'contain', background: '#00000000' })
      .webp({ quality: 85, alphaQuality: 100 }).toFile(target);
    derivatives.push({ file: target, bytes: result.size });
  }
  report.push({ name: item.name, suppliedFile: files[item.index], sha256: createHash('sha256').update(original).digest('hex'), crop: item.crop, derivatives });
}
await writeFile(join(review, 'assets.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Prepared ${artwork.length} UX symbols in two sizes.`);
