const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const YEAR_2024_DIR = path.join(ROOT, 'data/v1/competitions/2024');

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

function fixStatus(rawScoresJson, currentStatus) {
  try {
    const data = JSON.parse(rawScoresJson);
    const heats = data.heats || [];
    
    const hasValidJudgeData = heats && heats.length > 0 && 
      heats.some(h => h.judges && h.judges.length > 0 && 
        h.judges.some(j => j.scores && j.scores.some(s => s !== null)));
    
    if (hasValidJudgeData && currentStatus === 'unknown_status_check_raw_text') {
      return 'finished';
    }
    
    return currentStatus;
  } catch (e) {
    return currentStatus;
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

async function fix2024Files() {
  console.log('Starting fix of 2024 competition files...\n');
  
  const files = findFilesInDir(YEAR_2024_DIR);
  console.log(`Found ${files.length} files in 2024 directory`);
  
  let totalFixed = 0;
  let filesUpdated = 0;
  let errors = 0;
  
  for (const filePath of files) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      if (!data.results || !Array.isArray(data.results)) {
        continue;
      }
      
      let fileFixed = 0;
      
      for (const result of data.results) {
        if (result.total_score === null && result.raw_scores_json) {
          const computedScore = computeTotalScore(result.raw_scores_json);
          if (computedScore !== null) {
            result.total_score = computedScore;
            fileFixed++;
          }
        }
        
        if (result.status === 'unknown_status_check_raw_text' && result.raw_scores_json) {
          const fixedStatus = fixStatus(result.raw_scores_json, result.status);
          if (fixedStatus !== result.status) {
            result.status = fixedStatus;
          }
        }
      }
      
      if (fileFixed > 0) {
        data.exported_at = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ Fixed ${fileFixed} results in ${path.basename(filePath)}`);
        filesUpdated++;
        totalFixed += fileFixed;
      }
      
    } catch (error) {
      console.error(`❌ Error in ${path.basename(filePath)}: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Files processed: ${files.length}`);
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Results fixed: ${totalFixed}`);
  console.log(`Errors: ${errors}`);
  
  if (filesUpdated > 0) {
    console.log(`\nNext: Run npm run build-all-data`);
  }
}

fix2024Files().catch(console.error);