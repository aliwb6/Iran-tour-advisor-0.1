import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = path.resolve('public/images');
const outputDir = path.join(sourceDir, 'optimized');
const widths = [640, 1600];

await mkdir(outputDir, { recursive: true });

const files = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(jpe?g|png)$/i.test(entry.name));

for (const file of files) {
  const source = path.join(sourceDir, file.name);
  const slug = path.parse(file.name).name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  for (const width of widths) {
    await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: width === 640 ? 72 : 76, effort: 5 })
      .toFile(path.join(outputDir, `${slug}-${width}.webp`));
  }
}

console.log(`Created ${files.length * widths.length} responsive WebP images in ${outputDir}`);
