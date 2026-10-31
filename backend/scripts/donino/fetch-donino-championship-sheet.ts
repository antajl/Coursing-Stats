import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

const SPREADSHEET_ID = '1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ';
const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=xlsx`;

function fetchBuffer(url: string, redirects = 0): Promise<Buffer> {
  if (redirects > 5) throw new Error('Too many redirects');
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location, redirects + 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch spreadsheet: status ${res.statusCode}`));
      }
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function parseStageSheet(rows: any[][]) {
  const result: any[] = [];
  rows.slice(1).forEach((r) => {
    if (!r || !r[0]) return;
    result.push({
      dog_name: String(r[0]).trim(),
      breed: String(r[1] || '').trim(),
      sex: String(r[2] || '').trim(),
      breed_class: String(r[3] || '').trim(),
      placement: r[4] != null ? Number(r[4]) : null,
      place_points: r[5] != null ? Number(r[5]) : 0,
      best_final_points: r[6] != null ? Number(r[6]) : 0,
      best_class_points: r[7] != null ? Number(r[7]) : 0,
      best_breed_points: r[8] != null ? Number(r[8]) : 0,
      track_record_points: r[9] != null ? Number(r[9]) : 0,
      total_points: r[10] != null ? Number(r[10]) : 0,
    });
  });
  return result;
}

function parseRatingSheet(rows: any[][]) {
  const result: any[] = [];
  rows.slice(1).forEach((r) => {
    if (!r || !r[0]) return;
    result.push({
      dog_name: String(r[0]).trim(),
      breed: String(r[1] || '').trim(),
      sex: String(r[2] || '').trim(),
      breed_class: String(r[3] || '').trim(),
      stage_1_points: r[4] != null ? Number(r[4]) : 0,
      stage_2_points: r[5] != null ? Number(r[5]) : 0,
      total_points: r[6] != null ? Number(r[6]) : 0,
    });
  });
  return result;
}

export async function fetchDoninoChampionshipPoints() {
  console.log(`Fetching championship spreadsheet ${SPREADSHEET_ID}...`);
  const buf = await fetchBuffer(EXPORT_URL);
  const wb = xlsx.read(buf, { type: 'buffer' });

  const stage1Rows = xlsx.utils.sheet_to_json(wb.Sheets['09.08.2026'], { header: 1 }) as any[][];
  const stage2Rows = xlsx.utils.sheet_to_json(wb.Sheets['20.09.2026'], { header: 1 }) as any[][];
  const ratingRows = xlsx.utils.sheet_to_json(wb.Sheets['Рейтинг'], { header: 1 }) as any[][];

  const payload = {
    source: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`,
    synced_at: new Date().toISOString(),
    stage_1: parseStageSheet(stage1Rows),
    stage_2: parseStageSheet(stage2Rows),
    overall: parseRatingSheet(ratingRows),
  };

  const outFile = path.join(ROOT, 'data/v1/donino/championship-points.json');
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Saved championship points to ${outFile} (${payload.overall.length} dogs)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  fetchDoninoChampionshipPoints().catch((err) => {
    console.error('Failed to sync championship points:', err);
    process.exit(1);
  });
}
