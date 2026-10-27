const fs = require('fs');
const path = require('path');

const calPath = 'data/v1/calendar/2026.json';
const cal = JSON.parse(fs.readFileSync(calPath, 'utf-8'));
const gDrive2026 = 'C:\\Users\\Antal\\Documents\\Google.Disk\\Competitions\\2026';

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
console.log(`Found ${cal.events.length} calendar events, ${compFiles.length} competition JSON files.`);

const compMap = new Map();
for (const f of compFiles) {
  const json = JSON.parse(fs.readFileSync(f, 'utf-8'));
  const id = json.event ? json.event.id : null;
  if (id) compMap.set(String(id), { file: f, json });
}

let missingPdfUrlInCal = 0;
let missingPdfUrlInComp = 0;
let totalDogs = 0;
let footnoteArtifacts = [];
let judgeSumMismatches = [];
let bzmpSingleJudgeTotals = [];
let nullSecondJudgeSums = [];
let noisyJudges = [];
let deadCatalogUrls = [];

for (const ev of cal.events) {
  const cData = compMap.get(String(ev.id));
  if (!cData) {
    console.error(`ERROR: Competition file for calendar event ${ev.id} not found!`);
    continue;
  }
  if (!ev.results_pdf_url) missingPdfUrlInCal++;
  if (!cData.json.event.results_pdf_url) missingPdfUrlInComp++;

  const results = cData.json.results || [];
  totalDogs += results.length;

  const eventJudges = cData.json.event.judges || '';
  if (/главный судья|судья\s*-|руководитель/i.test(eventJudges)) {
    noisyJudges.push({ id: ev.id, judges: eventJudges });
  }

  if (ev.catalog_url && ev.catalog_url.includes('procoursing.ru')) {
    deadCatalogUrls.push({ id: ev.id, url: ev.catalog_url });
  }

  for (const r of results) {
    const rawScores = r.raw_scores_json || {};
    const heats = rawScores.heats || r.heats || [];
    const isRacing = (cData.json.event.event_type === 'racing' || rawScores.format === 'racing');

    let heatsSum = 0;
    for (const h of heats) {
      if (typeof h.total === 'number') {
        if (h.total > 400) {
          footnoteArtifacts.push({ id: ev.id, dog: r.dog?.name_ru || r.dog_name, heatTotal: h.total });
        }
        heatsSum += h.total;
      }
      const judges = h.judges || [];
      if (judges.length === 2 && !isRacing) {
        const j0 = judges[0];
        const j1 = judges[1];
        if (j0 && typeof j0.sum === 'number' && j1 && j1.sum === null) {
          nullSecondJudgeSums.push({ id: ev.id, dog: r.dog?.name_ru || r.dog_name, j0: j0.sum, j1: j1.sum, heatTotal: h.total });
        }
        if (j0 && j1 && typeof j0.sum === 'number' && typeof j1.sum === 'number') {
          if (h.total === j0.sum && j0.sum !== (j0.sum + j1.sum) && (j0.sum + j1.sum) > 0) {
            bzmpSingleJudgeTotals.push({ id: ev.id, dog: r.dog?.name_ru || r.dog_name, j0: j0.sum, j1: j1.sum, heatTotal: h.total });
          }
        }
      }
      for (let ji = 0; ji < judges.length; ji++) {
        const j = judges[ji];
        if (j && Array.isArray(j.scores) && j.scores.length > 0) {
          const calcSum = j.scores.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
          if (typeof j.sum === 'number' && j.sum !== calcSum && !calcSum.toString().includes('NaN')) {
            judgeSumMismatches.push({ id: ev.id, dog: r.dog?.name_ru || r.dog_name, judgeIdx: ji, jSum: j.sum, calcSum });
          }
        }
      }
    }
  }
}

console.log('--- 2026 Audit Summary ---');
console.log(`Total competitions: ${cal.events.length}`);
console.log(`Total dogs in results: ${totalDogs}`);
console.log(`Missing results_pdf_url in calendar: ${missingPdfUrlInCal}`);
console.log(`Missing results_pdf_url in competition JSON: ${missingPdfUrlInComp}`);
console.log(`Noisy judge strings: ${noisyJudges.length}`, noisyJudges);
console.log(`Procoursing catalog URLs: ${deadCatalogUrls.length}`, deadCatalogUrls);
console.log(`Footnote artifacts (>400): ${footnoteArtifacts.length}`, footnoteArtifacts);
console.log(`Null second judge sums: ${nullSecondJudgeSums.length}`, nullSecondJudgeSums.slice(0, 5));
console.log(`BZMP single judge heat totals (heat.total == j0.sum): ${bzmpSingleJudgeTotals.length}`, bzmpSingleJudgeTotals.slice(0, 5));
console.log(`Judge sum mismatches: ${judgeSumMismatches.length}`, judgeSumMismatches);

// Check Google Drive 2026 folders
const gdFolders = fs.readdirSync(gDrive2026);
let existingHtml = 0;
let existingPdf = 0;
for (const sub of gdFolders) {
  const p = path.join(gDrive2026, sub);
  if (fs.statSync(p).isDirectory()) {
    if (fs.existsSync(path.join(p, 'protocol_cs.html'))) existingHtml++;
    if (fs.existsSync(path.join(p, 'protocol_cs.pdf'))) existingPdf++;
  }
}
console.log(`Google Drive 2026: ${existingHtml}/${gdFolders.length} have protocol_cs.html, ${existingPdf}/${gdFolders.length} have protocol_cs.pdf`);
