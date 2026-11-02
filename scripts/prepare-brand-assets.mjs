import sharp from 'sharp';

// Keep the supplied SVG exports unchanged. They contain large embedded rasters
// on square white canvases; crop only empty margins and produce smaller lockups.
// CSS multiply blends their white canvas into the site's warm-ivory surface.
for (const name of ['horizontal', 'stacked']) {
  const source = `public/brand/juan-vistro-${name}.svg`;
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = 0, bottom = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] > 0 && Math.min(data[i], data[i + 1], data[i + 2]) < 245) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }
  // Retain a small safety margin for antialiasing and the translucent backlayer.
  const padding = 12;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(info.width - 1, right + padding);
  bottom = Math.min(info.height - 1, bottom + padding);
  const output = `public/brand/juan-vistro-${name}.webp`;
  const result = await sharp(source)
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .webp({ quality: 90 })
    .toFile(output);
  console.log(`${output}: ${result.width}×${result.height}, ${result.size} bytes`);
}
