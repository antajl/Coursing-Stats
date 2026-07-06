/**
 * Генерация favicon.ico из frontend/public/favicon.svg (16/32/48 px).
 * Usage: npx tsx backend/scripts/generate-favicon.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(ROOT, 'frontend/public');
const SVG = path.join(PUBLIC, 'favicon.svg');

async function main() {
  const svg = fs.readFileSync(SVG);
  const sizes = [16, 32, 48] as const;
  const pngBuffers = await Promise.all(
    sizes.map((size) => sharp(svg).resize(size, size).png().toBuffer()),
  );

  const ico = await toIco(pngBuffers);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), ico);
  fs.writeFileSync(path.join(PUBLIC, 'favicon-48.png'), pngBuffers[2]);

  console.log('Wrote frontend/public/favicon.ico and favicon-48.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
