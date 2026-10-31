import fs from 'node:fs';
import path from 'node:path';
import { DATA_V1_ROOT } from '../../lib/local-data/paths.ts';

const DOGS_DIR = path.join(DATA_V1_ROOT, 'dogs/by-id');
const DOGS_KEY_DIR = path.join(DATA_V1_ROOT, 'dogs/by-key');
const REPORT_FILE = 'backend/scripts/breedarchive-scan-results.json';

interface ScanResult {
  dogId: number;
  dogKey?: string;
  breed: string;
  name_lat: string | null;
  name_ru: string | null;
  matchedName: string;
  matchType: string;
  url: string;
}

interface ScanReport {
  totalChecked: number;
  totalQueue: number;
  matchedCount: number;
  results: ScanResult[];
}

function main() {
  if (!fs.existsSync(REPORT_FILE)) {
    console.error(`Report file not found: ${REPORT_FILE}`);
    process.exit(1);
  }

  const report: ScanReport = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf8'));
  console.log(`Loaded ${report.results.length} scan results.`);

  let updatedById = 0;
  let updatedByKey = 0;

  for (const item of report.results) {
    const idPath = path.join(DOGS_DIR, `${item.dogId}.json`);
    if (!fs.existsSync(idPath)) {
      console.warn(`File not found: ${idPath}`);
      continue;
    }

    const dog = JSON.parse(fs.readFileSync(idPath, 'utf8'));
    dog.pedigree_url = item.url;
    fs.writeFileSync(idPath, `${JSON.stringify(dog, null, 2)}\n`, 'utf8');
    updatedById++;

    const key = dog.dog_key || item.dogKey;
    if (key) {
      const keyPath = path.join(DOGS_KEY_DIR, `${key}.json`);
      if (fs.existsSync(keyPath)) {
        const keyDog = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        keyDog.pedigree_url = item.url;
        fs.writeFileSync(keyPath, `${JSON.stringify(keyDog, null, 2)}\n`, 'utf8');
        updatedByKey++;
      }
    }
  }

  console.log(`\nSuccessfully applied Breed Archive URLs:`);
  console.log(`- Updated in dogs/by-id: ${updatedById} files`);
  console.log(`- Updated in dogs/by-key: ${updatedByKey} files`);
}

main();
