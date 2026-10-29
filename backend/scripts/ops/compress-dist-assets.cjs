const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const assetsDir = path.resolve(__dirname, '../../../frontend/dist/assets');

if (!fs.existsSync(assetsDir)) {
  console.log('[compress-dist-assets] No dist/assets directory found. Skipping compression.');
  process.exit(0);
}

const files = fs.readdirSync(assetsDir);
let totalOriginal = 0;
let totalCompressed = 0;
let count = 0;

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (ext !== '.js' && ext !== '.css') continue;

  const fullPath = path.join(assetsDir, file);
  const content = fs.readFileSync(fullPath);
  totalOriginal += content.length;

  const compressed = zlib.gzipSync(content, { level: 9 });
  totalCompressed += compressed.length;
  fs.writeFileSync(fullPath, compressed);
  count++;
}

if (count > 0) {
  const savedPercent = Math.round((1 - totalCompressed / totalOriginal) * 100);
  console.log(
    `[compress-dist-assets] Compressed ${count} assets with gzip (level 9): ` +
    `${Math.round(totalOriginal / 1024)} KB -> ${Math.round(totalCompressed / 1024)} KB ` +
    `(-${savedPercent}%)`
  );
} else {
  console.log('[compress-dist-assets] No JS or CSS assets found to compress.');
}
