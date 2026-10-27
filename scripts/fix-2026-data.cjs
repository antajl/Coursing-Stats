const fs = require('fs');
const path = require('path');

function findJson(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...findJson(p));
    else if (item.name.endsWith('.json')) files.push(p);
  }
  return files;
}

const calPath = 'data/v1/calendar/2026.json';
const cal = JSON.parse(fs.readFileSync(calPath, 'utf-8'));
let calUpdated = 0;

for (const ev of cal.events) {
  // Clear dead procoursing catalog URLs
  if (ev.catalog_url && ev.catalog_url.includes('procoursing.ru')) {
    ev.catalog_url = null;
    calUpdated++;
  }
}

if (calUpdated > 0) {
  fs.writeFileSync(calPath, JSON.stringify(cal, null, 2), 'utf-8');
  console.log(`Updated calendar/2026.json (${calUpdated} changes)`);
}

const compFiles = findJson('data/v1/competitions/2026');
let fixedBzmpHeats = 0;
let updatedComps = 0;

for (const f of compFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf-8'));
  let compModified = false;

  if (json.event && json.event.catalog_url && json.event.catalog_url.includes('procoursing.ru')) {
    json.event.catalog_url = null;
    compModified = true;
  }

  // Fix BZMP heats where heat.total == j0.sum instead of j0.sum + j1.sum
  const results = json.results || [];
  for (const r of results) {
    const rawScores = r.raw_scores_json || {};
    const heats = rawScores.heats || r.heats || [];
    for (const h of heats) {
      const judges = h.judges || [];
      if (judges.length === 2) {
        const j0 = judges[0];
        const j1 = judges[1];
        if (j0 && j1 && typeof j0.sum === 'number' && typeof j1.sum === 'number') {
          if (h.total === j0.sum && j0.sum !== (j0.sum + j1.sum) && (j0.sum + j1.sum) > 0) {
            h.total = j0.sum + j1.sum;
            fixedBzmpHeats++;
            compModified = true;
          }
        }
      }
    }
  }

  if (compModified) {
    fs.writeFileSync(f, JSON.stringify(json, null, 2), 'utf-8');
    updatedComps++;
  }
}

console.log(`Updated ${updatedComps} competition files. Fixed ${fixedBzmpHeats} BZMP heats.`);
