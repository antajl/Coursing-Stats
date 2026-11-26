const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const CANONICAL = path.join(ROOT, 'rkf-tracker/shared/rkf-competitions-2026.json');

const TARGETS = [
  'frontend/src/pages/Tracker/rkf-competitions-2026.json',
  'rkf-tracker/web/rkf-competitions-2026.json',
  'rkf-tracker/desktop/web/rkf-competitions-2026.json',
  'rkf-tracker/extension/rkf-competitions-2026.json',
  'rkf-tracker/bot/src/data/competitions-2026.json',
  'bot/src/tracker/competitions-2026.json',
];

const content = fs.readFileSync(CANONICAL, 'utf8').replace(/\r\n/g, '\n');
let synced = 0;
for (const rel of TARGETS) {
  const dest = path.join(ROOT, rel);
  if (fs.existsSync(path.dirname(dest))) {
    const prev = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
    if (prev !== content) {
      fs.writeFileSync(dest, content, 'utf8');
      synced++;
    }
  }
}
console.log(`[sync-tracker-calendar] canonical=rkf-tracker/shared/rkf-competitions-2026.json updated=${synced}/${TARGETS.length}`);
