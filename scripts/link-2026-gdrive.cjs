const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = 'C:\\Users\\Antal\\AppData\\Local\\Google\\DriveFS\\112594307878006789686\\mirror_metadata_sqlite.db';
const db = new Database(dbPath, { readonly: true });

const query = `
SELECT child.id as cloud_id, child.local_title as file_name, parent.local_title as parent_folder
FROM items child
JOIN stable_parents sp ON child.stable_id = sp.item_stable_id
JOIN items parent ON sp.parent_stable_id = parent.stable_id
WHERE parent.local_title LIKE '2026%'
`;

const rows = db.prepare(query).all();
console.log(`Found ${rows.length} total files under 2026 in DriveFS mirror db.`);

const pdfMap = new Map();
const catalogMap = new Map();
const rulesMap = new Map();

for (const r of rows) {
  // Extract event id from parent_folder: e.g. [1301-чркф-бзмп] or [2022000]
  const m = r.parent_folder.match(/\[([a-zA-Z0-9]+)(?:-.*)?\]/);
  if (!m) continue;
  const eventId = isNaN(Number(m[1])) ? m[1] : Number(m[1]);
  const fname = r.file_name.toLowerCase();

  if (fname === 'protocol_cs.pdf') {
    pdfMap.set(String(eventId), `https://drive.google.com/file/d/${r.cloud_id}/view`);
  } else if (fname.includes('catalog') || fname.includes('каталог')) {
    catalogMap.set(String(eventId), `https://drive.google.com/file/d/${r.cloud_id}/view`);
  } else if (fname.includes('reglament') || fname.includes('регламент')) {
    rulesMap.set(String(eventId), `https://drive.google.com/file/d/${r.cloud_id}/view`);
  }
}

console.log(`Matched ${pdfMap.size} protocol_cs.pdf files.`);
console.log(`Matched ${catalogMap.size} catalog files.`);
console.log(`Matched ${rulesMap.size} regulation/rules files.`);

// Update calendar/2026.json
const calPath = 'data/v1/calendar/2026.json';
const cal = JSON.parse(fs.readFileSync(calPath, 'utf-8'));
let calUpdated = 0;

for (const ev of cal.events) {
  const pdfUrl = pdfMap.get(String(ev.id));
  if (pdfUrl && ev.results_pdf_url !== pdfUrl) {
    ev.results_pdf_url = pdfUrl;
    calUpdated++;
  }
  const catUrl = catalogMap.get(String(ev.id));
  if (catUrl && (!ev.catalog_url || ev.catalog_url.includes('procoursing.ru'))) {
    ev.catalog_url = catUrl;
    calUpdated++;
  }
  const rulesUrl = rulesMap.get(String(ev.id));
  if (rulesUrl && (!ev.rules_url || ev.rules_url.includes('procoursing.ru'))) {
    ev.rules_url = rulesUrl;
    calUpdated++;
  }
}

fs.writeFileSync(calPath, JSON.stringify(cal, null, 2), 'utf-8');
console.log(`Updated calendar/2026.json (${calUpdated} changes).`);

function findJson(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...findJson(p));
    else if (item.name.endsWith('.json')) files.push(p);
  }
  return files;
}

const compFiles = findJson('data/v1/competitions/2026');
let compsUpdated = 0;

for (const f of compFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf-8'));
  const eventId = json.event ? json.event.id : null;
  if (!eventId) continue;

  let modified = false;
  const pdfUrl = pdfMap.get(String(eventId));
  if (pdfUrl && json.event.results_pdf_url !== pdfUrl) {
    json.event.results_pdf_url = pdfUrl;
    modified = true;
  }
  const catUrl = catalogMap.get(String(eventId));
  if (catUrl && (!json.event.catalog_url || json.event.catalog_url.includes('procoursing.ru'))) {
    json.event.catalog_url = catUrl;
    modified = true;
  }
  const rulesUrl = rulesMap.get(String(eventId));
  if (rulesUrl && (!json.event.rules_url || json.event.rules_url.includes('procoursing.ru'))) {
    json.event.rules_url = rulesUrl;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(f, JSON.stringify(json, null, 2), 'utf-8');
    compsUpdated++;
  }
}

console.log(`Updated ${compsUpdated} competition files.`);
