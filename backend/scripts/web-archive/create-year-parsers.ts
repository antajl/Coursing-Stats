import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEBARCHIVE_SCRIPTS = path.resolve(__dirname);

const baseFile = path.join(WEBARCHIVE_SCRIPTS, 'parse-calendar-base.ts');
const baseContent = fs.readFileSync(baseFile, 'utf-8');

const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'];

for (const year of years) {
  const content = baseContent.replace(/YEAR/g, year);
  const filePath = path.join(WEBARCHIVE_SCRIPTS, `parse-calendar-${year}.ts`);
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
}

console.log('\nAll year-specific parsers created successfully!');
