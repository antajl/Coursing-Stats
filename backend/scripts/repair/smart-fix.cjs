const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const COMPETITIONS_DIR = path.join(ROOT, 'data/v1/competitions');

console.log('ROOT:', ROOT);
console.log('COMPETITIONS_DIR:', COMPETITIONS_DIR);
console.log('Directory exists:', fs.existsSync(COMPETITIONS_DIR));

function computeTotalScore(rawScoresJson) {
  try {
    const data = JSON.parse(rawScoresJson);
    const heats = data.heats || [];
    
    // Fallback 1: compute from heat totals
    if (heats.length > 0) {
      const heatTotals = heats
        .map(h => h.total)
        .filter(t => t !== null && !isNaN(t));
      if (heatTotals.length > 0) {
        return heatTotals.reduce((sum, t) => sum + t, 0);
      }
    }
    
    // Fallback 2: compute from judge sums
    if (heats.length > 0) {
      const judgeSums = heats
        .flatMap(h => h.judges || [])
        .map(j => j.sum)
        .filter(s => s !== null && !isNaN(s));
      if (judgeSums.length > 0) {
        return judgeSums.reduce((sum, s) => sum + s, 0);
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

function findFilesInDir(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findFilesInDir(fullPath));
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function fixAllFiles() {
  console.log('Starting smart fix of ALL competition files...\n');
  
  const files = findFilesInDir(COMPETITIONS_DIR);
  // Skip files that have different data format (sqlite-admin-sync source)
  const skipFiles = [
    '1456-чемпионат-ркф-cacl-по-бегам-борзых-за-механическ.json', 
    '1461-чемпионат-ркф-cacl-по-бегам-борзых.json',
    '1436-чемпионат-ркф-cacl-по-бегам-борзых.json',
    '1217-кубок-россии-cacl-по-бегам-борзых-за-механически.json',
    '1218-открытыи-чемпионат-нкп-русская-псовая-борзая-осе.json',
    '1258-чркф-бега-за-механическои-приманкои.json',
    '1265-чркф-курсинг-борзых.json',
    '1270-чркф-бега-борзых.json',
    '1272-чркф-бега-борзых.json',
    '1274-чркф-бега-за-механическои-приманкои.json',
    '1283-пчркф-уиппет-русская-псовая-борзая-родезиискии-р.json',
    '1285-чемпионат-россии-бега-борзых.json',
    '1287-пчркф-малая-итальянская-борзая-уиппет-чирнеко-де.json',
    '1298-чемпионат-россии-бега-за-механическои-приманкои.json'
  ];
  const filteredFiles = files.filter(f => !skipFiles.some(skip => f.includes(skip)));
  
  console.log(`Found ${files.length} files in competitions directory`);
  console.log(`Skipping ${files.length - filteredFiles.length} problematic files`);
  
  let totalFixed = 0;
  let filesUpdated = 0;
  let errors = 0;
  let disqualifiedSkipped = 0;
  
  for (const filePath of filteredFiles) {
    try {
      let fileContent;
      try {
        fileContent = fs.readFileSync(filePath, 'utf-8');
      } catch (readError) {
        console.log(`⚠️  Skipping ${path.basename(filePath)} - file read error: ${readError.message}`);
        continue;
      }
      
      if (typeof fileContent !== 'string') {
        console.log(`⚠️  Skipping ${path.basename(filePath)} - file content is not string (type: ${typeof fileContent})`);
        continue;
      }
      
      let data;
      try {
        data = JSON.parse(fileContent);
      } catch (parseError) {
        console.log(`⚠️  Skipping ${path.basename(filePath)} - JSON parse error: ${parseError.message}`);
        console.log(`   File content length: ${fileContent.length}`);
        console.log(`   First 100 chars: ${fileContent.substring(0, 100)}`);
        continue;
      }
      
      if (!data.results || !Array.isArray(data.results)) {
        console.log(`⚠️  Skipping ${path.basename(filePath)} - no results array`);
        continue;
      }
      
      let fileFixed = 0;
      let unknownStatusFixed = 0;
      let nullScoreFixed = 0;
      
      for (const result of data.results) {
        // Fix status if needed (first priority)
        if (result.status === 'unknown_status_check_raw_text' && result.raw_scores_json) {
          const data = JSON.parse(result.raw_scores_json);
          const heats = data.heats || [];
          const hasValidJudgeData = heats && heats.length > 0 && 
            heats.some(h => h.judges && h.judges.length > 0 && 
              h.judges.some(j => j.scores && j.scores.some(s => s !== null)));
          
          if (hasValidJudgeData) {
            result.status = 'finished';
            unknownStatusFixed++;
          }
        }
        
        // Then fix total_score for finished results
        if (result.status === 'finished' && result.total_score === null && result.raw_scores_json) {
          const computedScore = computeTotalScore(result.raw_scores_json);
          if (computedScore !== null) {
            result.total_score = computedScore;
            fileFixed++;
            nullScoreFixed++;
          }
        }
        
        // Count disqualified with null total_score
        if (result.status === 'disqualified' && result.total_score === null) {
          disqualifiedSkipped++;
        }
      }
      
      if (fileFixed > 0 || unknownStatusFixed > 0) {
        data.exported_at = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        const fixes = [];
        if (fileFixed > 0) fixes.push(`${fileFixed} total_score`);
        if (unknownStatusFixed > 0) fixes.push(`${unknownStatusFixed} status`);
        console.log(`✅ Fixed ${fixes.join(', ')} in ${path.basename(filePath)}`);
        filesUpdated++;
        totalFixed += fileFixed;
      }
      
      if (fileFixed > 0) {
        data.exported_at = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Fixed ${fileFixed} results in ${path.basename(filePath)}`);
        filesUpdated++;
        totalFixed += fileFixed;
      }
      
    } catch (error) {
      console.error(`❌ Error in ${path.basename(filePath)}:`, error.message || String(error));
      errors++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${filteredFiles.length}`);
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Results fixed: ${totalFixed}`);
  console.log(`Disqualified skipped (correct): ${disqualifiedSkipped}`);
  console.log(`Errors: ${errors}`);
  
  if (filesUpdated > 0) {
    console.log(`\n✅ Fix completed successfully!`);
  } else {
    console.log(`\nℹ️  No files needed fixing.`);
  }
}

fixAllFiles().catch(console.error);