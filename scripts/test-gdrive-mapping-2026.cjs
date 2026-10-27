const fs = require('fs');
const path = require('path');

const gDrive2026 = 'C:\\Users\\Antal\\Documents\\Google.Disk\\Competitions\\2026';
const cal = JSON.parse(fs.readFileSync('data/v1/calendar/2026.json', 'utf-8'));
const gdFolders = fs.readdirSync(gDrive2026);

const matched = [];
const unmatched = [];

for (const ev of cal.events) {
  // Find folder matching [${ev.id}- or [${ev.id}]
  const folder = gdFolders.find(f => f.includes(`[${ev.id}-`) || f.includes(`[${ev.id}]`));
  if (folder) {
    matched.push({ id: ev.id, folder });
  } else {
    unmatched.push(ev.id);
  }
}

console.log(`Matched: ${matched.length} / ${cal.events.length}`);
if (unmatched.length > 0) {
  console.log('Unmatched IDs:', unmatched);
} else {
  console.log('All 26 events perfectly matched to Google Drive folders!');
}
