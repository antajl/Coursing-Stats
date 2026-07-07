/**
 * Package data/v1/pc-db.sqlite for Cloudflare Pages static hosting.
 * CI: deploy-frontend.yml (replaces fragile bash heredoc + gzip CLI).
 *
 * Usage: npx tsx backend/scripts/ci/package-pages-snapshot.ts
 */
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SNAPSHOT = path.join(ROOT, 'data/v1/pc-db.sqlite');
const OUT_DIR = path.join(ROOT, 'frontend/public/data/v1');

function sha256Short(filePath: string): string {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
  return hash.slice(0, 16);
}

function gzipFile(src: string, dest: string): void {
  const input = fs.readFileSync(src);
  fs.writeFileSync(dest, zlib.gzipSync(input));
}

function copyIfExists(src: string, dest: string): void {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing required file: ${src}`);
  }
  fs.copyFileSync(src, dest);
}

function copyJsonTree(srcDir: string, destDir: string, skipNames = new Set(['pc-db.sqlite', 'pc-db.sqlite.gz'])) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (skipNames.has(entry.name)) continue;
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyJsonTree(src, dest, skipNames);
    } else if (entry.name.endsWith('.json')) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }
}

function main(): void {
  if (!fs.existsSync(SNAPSHOT)) {
    console.error('Snapshot not found. Run: npm run build-data-snapshot');
    process.exit(1);
  }

  // Синхронизировать indexes/calendar из data/v1 (после dedupe-calendar)
  execSync('npx tsx backend/scripts/rebuild-calendar-index.ts', { cwd: ROOT, stdio: 'inherit' });

  fs.mkdirSync(path.join(OUT_DIR, 'donino'), { recursive: true });

  const hash = sha256Short(SNAPSHOT);
  const gzPath = path.join(OUT_DIR, 'pc-db.sqlite.gz');
  const versionedGz = path.join(OUT_DIR, `pc-db-${hash}.sqlite.gz`);

  gzipFile(SNAPSHOT, gzPath);
  gzipFile(SNAPSHOT, versionedGz);

  copyIfExists(path.join(ROOT, 'data/v1/manifest.json'), path.join(OUT_DIR, 'manifest.json'));
  const speedSrc = path.join(ROOT, 'data/v1/donino/speed_records.json');
  if (!fs.existsSync(speedSrc)) {
    throw new Error(
      'Missing data/v1/donino/speed_records.json — run export-local-data or check .gitignore',
    );
  }
  copyIfExists(speedSrc, path.join(OUT_DIR, 'donino/speed_records.json'));
  const coursingSrc = path.join(ROOT, 'data/v1/donino/coursing_records.json');
  if (fs.existsSync(coursingSrc)) {
    copyIfExists(coursingSrc, path.join(OUT_DIR, 'donino/coursing_records.json'));
  }

  const indexesSrc = path.join(ROOT, 'data/v1/indexes');
  if (fs.existsSync(indexesSrc)) {
    const indexesOut = path.join(OUT_DIR, 'indexes');
    fs.mkdirSync(indexesOut, { recursive: true });
    for (const name of fs.readdirSync(indexesSrc)) {
      if (name.endsWith('.json')) {
        copyIfExists(path.join(indexesSrc, name), path.join(indexesOut, name));
      }
    }
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/v1/manifest.json'), 'utf-8')) as {
    exported_at?: string;
    counts?: Record<string, number>;
  };

  const snapshotLatest = {
    hash,
    exported_at: manifest.exported_at,
    counts: manifest.counts,
    gzip_bytes: fs.statSync(gzPath).size,
  };

  fs.writeFileSync(path.join(OUT_DIR, 'snapshot-latest.json'), JSON.stringify(snapshotLatest));

  console.log('Copying data/v1 JSON tree to Pages...');
  copyJsonTree(path.join(ROOT, 'data/v1'), OUT_DIR);

  console.log('Packaged Pages snapshot:', {
    hash,
    gzip_bytes: snapshotLatest.gzip_bytes,
    versioned: path.basename(versionedGz),
  });

  const githubOutput = process.env.GITHUB_OUTPUT;
  if (githubOutput) {
    fs.appendFileSync(githubOutput, `hash=${hash}\n`);
  }
}

main();
