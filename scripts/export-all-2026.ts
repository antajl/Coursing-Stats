import fs from 'node:fs';
import path from 'node:path';
import { buildProtocolHtml, compilePdfWithEdge, CompetitionData } from '../backend/scripts/export/export-protocol-vector.js';

const gDrive2026 = 'C:\\Users\\Antal\\Documents\\Google.Disk\\Competitions\\2026';
const cal = JSON.parse(fs.readFileSync('data/v1/calendar/2026.json', 'utf-8'));
const gdFolders = fs.readdirSync(gDrive2026);

function findCompFile(id: number | string): string | null {
  const dir = 'data/v1/competitions/2026';
  for (const item of fs.readdirSync(dir, { recursive: true })) {
    const s = String(item);
    if (s.endsWith('.json') && s.includes(String(id))) {
      return path.join(dir, s);
    }
  }
  return null;
}

let successCount = 0;
let errors: string[] = [];

for (let i = 0; i < cal.events.length; i++) {
  const ev = cal.events[i];
  const folder = gdFolders.find(f => f.includes(`[${ev.id}-`) || f.includes(`[${ev.id}]`));
  if (!folder) {
    errors.push(`Folder not found for ${ev.id}`);
    continue;
  }

  const compPath = findCompFile(ev.id);
  if (!compPath) {
    errors.push(`Comp JSON not found for ${ev.id}`);
    continue;
  }

  const targetDir = path.join(gDrive2026, folder);
  const compData: CompetitionData = JSON.parse(fs.readFileSync(compPath, 'utf8'));

  const outHtml = path.join(targetDir, 'protocol_cs.html');
  const outPdf = path.join(targetDir, 'protocol_cs.pdf');

  try {
    const html = buildProtocolHtml(compData);
    
    if (html.includes('undefined.undefined') || html.includes('NaN')) {
      console.warn(`WARNING: Anomaly detected in HTML for event ${ev.id}`);
    }

    fs.writeFileSync(outHtml, html, 'utf8');

    const ok = compilePdfWithEdge(outHtml, outPdf);
    if (ok && fs.existsSync(outPdf)) {
      const pdfSize = fs.statSync(outPdf).size;
      console.log(`[${i + 1}/${cal.events.length}] Exported event ${ev.id} (${compData.event.date_start} - ${compData.event.competition_kind || ''}): HTML ${html.length}b, PDF ${pdfSize}b`);
      successCount++;
    } else {
      errors.push(`Failed to compile PDF for ${ev.id}`);
    }
  } catch (err: any) {
    console.error(`Error processing event ${ev.id}:`, err.message);
    errors.push(`Error on ${ev.id}: ${err.message}`);
  }
}

console.log(`\n=== Export finished: ${successCount} / ${cal.events.length} successful. ===`);
if (errors.length > 0) {
  console.error('Errors:', errors);
}
