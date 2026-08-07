/**
 * Генерация favicon PNG файлов из frontend/public/favicon.svg (16/32/48 px).
 * Usage: npx tsx backend/scripts/generate-favicon.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(ROOT, 'frontend/public');
const SVG = path.join(PUBLIC, 'favicon.svg');

async function main() {
  const svg = fs.readFileSync(SVG);
  const sizes = [16, 32, 48] as const;
  
  // Generate PNG files for each size
  for (const size of sizes) {
    const png = await sharp(svg).resize(size, size).png().toBuffer();
    fs.writeFileSync(path.join(PUBLIC, `favicon-${size}.png`), png);
  }

  console.log('Wrote frontend/public/favicon-{16,32,48}.png');
  console.log('Note: Modern browsers support PNG favicons directly');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
