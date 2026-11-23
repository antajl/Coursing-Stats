// Package Chrome Extension into clean zip distribution
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT_DIR = path.resolve(__dirname, '../../..');
const EXT_DIR = path.join(ROOT_DIR, 'rkf-tracker/extension');
const OUT_DIRS = [
  path.join(ROOT_DIR, 'dist'),
  path.join(ROOT_DIR, 'rkf-tracker/extension/dist')
];

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (~crc) >>> 0;
}

function createZip(files, outputPath) {
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const data = fs.readFileSync(file.src);
    const deflated = zlib.deflateRawSync(data);
    const nameBuf = Buffer.from(file.name.replace(/\\/g, '/'), 'utf8');

    // Local file header
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc32(data), 14);
    lh.writeUInt32LE(deflated.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBuf.copy(lh, 30);

    localHeaders.push(lh, deflated);

    // Central directory header
    const ch = Buffer.alloc(46 + nameBuf.length);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc32(data), 16);
    ch.writeUInt32LE(deflated.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30);
    ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34);
    ch.writeUInt16LE(0, 36);
    ch.writeUInt32LE(0, 38);
    ch.writeUInt32LE(offset, 42);
    nameBuf.copy(ch, 46);

    centralHeaders.push(ch);
    offset += lh.length + deflated.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) centralDirSize += ch.length;

  // End of central directory record
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  const fullZip = Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fullZip);
}

function collectFiles() {
  const allowedExts = new Set(['.json', '.html', '.js', '.css', '.png', '.svg']);
  const files = [];

  function scan(dir, baseDir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const fullPath = path.join(dir, ent.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (ent.isDirectory()) {
        if (ent.name !== 'dist' && ent.name !== 'node_modules') {
          scan(fullPath, baseDir);
        }
      } else {
        const ext = path.extname(ent.name).toLowerCase();
        if (allowedExts.has(ext) && !ent.name.endsWith('.zip') && !ent.name.startsWith('.')) {
          files.push({ src: fullPath, name: relPath });
        }
      }
    }
  }

  scan(EXT_DIR, EXT_DIR);
  return files;
}

function main() {
  console.log('[pack-extension] Packaging CoursingStats RKF Tracker extension...');
  const files = collectFiles();

  if (files.length === 0) {
    console.error('[pack-extension] Error: No extension files found to package.');
    process.exit(1);
  }

  let totalRawBytes = 0;
  for (const f of files) {
    const stat = fs.statSync(f.src);
    totalRawBytes += stat.size;
    console.log(`  + ${f.name} (${Math.round(stat.size / 1024 * 10) / 10} KB)`);
  }

  const archiveName = 'coursingstats-tracker.zip';
  for (const outDir of OUT_DIRS) {
    const outPath = path.join(outDir, archiveName);
    createZip(files, outPath);
    const outStat = fs.statSync(outPath);
    console.log(`[pack-extension] Saved: ${outPath} (${Math.round(outStat.size / 1024 * 10) / 10} KB)`);
  }

  console.log(`[pack-extension] Successfully packed ${files.length} files. Total uncompressed: ${Math.round(totalRawBytes / 1024 * 10) / 10} KB`);
}

main();
