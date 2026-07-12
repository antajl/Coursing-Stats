import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.resolve(ROOT, '../data/v1');
const TARGET_DIR = path.resolve(ROOT, 'public/data/v1');

// Files/directories to exclude from public deployment (too large or admin-only)
const EXCLUDE_PATTERNS = [
  'shows/indexes/dog-ranking.json', // 73.7 MiB - exceeds Cloudflare Pages 25 MiB limit
];

function shouldExclude(relativePath) {
  const normalizedPath = relativePath.replace(/\\/g, '/');
  const shouldExclude = EXCLUDE_PATTERNS.some(pattern => normalizedPath.includes(pattern));
  if (shouldExclude) {
    console.log(`  Excluding: ${normalizedPath}`);
  }
  return shouldExclude;
}

function copyDirectory(src, dest, relativePath = '') {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (shouldExclude(entryRelativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, entryRelativePath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying data/v1 to public/data...');
copyDirectory(SOURCE_DIR, TARGET_DIR);
console.log('Data copied successfully!');
