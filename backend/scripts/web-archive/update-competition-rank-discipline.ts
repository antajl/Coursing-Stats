import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractRankCode, extractDisciplineCode, normalizeTitle } from '../../lib/rank-discipline-mapping';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPETITIONS_DIR = path.resolve(__dirname, '../../../data/v1/competitions');

async function main() {
  const years = ['2022', '2023', '2024'];
  
  let totalUpdated = 0;
  
  for (const year of years) {
    const yearDir = path.join(COMPETITIONS_DIR, year);
    
    if (!fs.existsSync(yearDir)) {
      continue;
    }
    
    const months = fs.readdirSync(yearDir);
    
    for (const month of months) {
      const monthDir = path.join(yearDir, month);
      
      if (!fs.statSync(monthDir).isDirectory()) {
        continue;
      }
      
      const files = fs.readdirSync(monthDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) {
          continue;
        }
        
        const filePath = path.join(monthDir, file);
        const competitionData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (!competitionData.event) {
          continue;
        }
        
        const rankLabel = competitionData.event.rank_label || competitionData.event.title || '';
        const normalizedTitle = normalizeTitle(rankLabel);
        const rankCode = extractRankCode(normalizedTitle);
        const disciplineCode = extractDisciplineCode(normalizedTitle);
        
        // Update event object
        competitionData.event.rank_code = rankCode;
        competitionData.event.discipline_code = disciplineCode;
        competitionData.event.rank_label = normalizedTitle;
        competitionData.event.title = normalizedTitle;
        
        // Write back
        fs.writeFileSync(filePath, JSON.stringify(competitionData, null, 2));
        
        totalUpdated++;
        console.log(`Updated ${year}/${month}/${file}: rank_code=${rankCode}, discipline_code=${disciplineCode}`);
      }
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total competition files updated: ${totalUpdated}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
