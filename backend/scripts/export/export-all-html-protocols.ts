/**
 * Export all competition vector HTML protocols to frontend/public/protocols/{eventId}.html
 * Fast in-memory generator (generates 187+ HTML files in <1s).
 *
 * Usage: npx tsx backend/scripts/export/export-all-html-protocols.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildProtocolHtml, CompetitionData } from './export-protocol-vector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

const COMPS_DIR = path.join(ROOT, 'data/v1/competitions');
const OUT_DIR = path.join(ROOT, 'frontend/public/protocols');

function findJsonFiles(dir: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (item.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

export function exportAllHtmlProtocols(outDir = OUT_DIR): { total: number; durationMs: number } {
  const t0 = Date.now();
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const compFiles = findJsonFiles(COMPS_DIR);
  let count = 0;

  for (const filePath of compFiles) {
    try {
      const comp = JSON.parse(fs.readFileSync(filePath, 'utf8')) as CompetitionData;
      const eventId = comp.event_id || comp.event?.id;
      if (!eventId) continue;

      const html = buildProtocolHtml(comp);
      const outPath = path.join(outDir, `${eventId}.html`);
      fs.writeFileSync(outPath, html, 'utf8');
      count++;
    } catch (err) {
      console.error(`Error exporting protocol for ${filePath}:`, err instanceof Error ? err.message : String(err));
    }
  }

  const durationMs = Date.now() - t0;
  console.log(`✓ Exported ${count} HTML protocols to ${path.relative(ROOT, outDir)} in ${(durationMs / 1000).toFixed(2)}s`);
  return { total: count, durationMs };
}

const isMain = process.argv[1] && (
  process.argv[1] === __filename ||
  process.argv[1].endsWith('export-all-html-protocols.ts')
);

if (isMain) {
  exportAllHtmlProtocols();
}
