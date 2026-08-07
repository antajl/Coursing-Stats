const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

// Sample files from our investigation - files with null total_score issues
const FILES_TO_FIX = [
  "data/v1/competitions/2024/04-апрель/20240407--cacl-07042024-.json",
  "data/v1/competitions/2023/04-апрель/1202-чемпионат-ркф-по-бегам-за-механическои-приманкои.json",
  "data/v1/competitions/2024/04-апрель/20240429--cacl-29-30042024-.json",
  "data/v1/competitions/2023/09-сентябрь/1218-открытыи-чемпионат-нкп-русская-псовая-борзая-осе.json",
  "data/v1/competitions/2024/10-октябрь/20241027--cacl-27102024-.json"
];

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
    
    // If we have valid judge data but status is unknown, fix it
    if (hasValidJudgeData && currentStatus === 'unknown_status_check_raw_text') {
      return 'finished';
    }
    
    return currentStatus;
  } catch (e) {
    return currentStatus;
  }
}

async function fixTotalScores() {
  console.log('Fixing total_score in ' + FILES_TO_FIX.length + ' local competition files...\n');
  
  let fixedCount = 0;
  let errorCount = 0;
  let totalFixed = 0;
  
  for (const filePath of FILES_TO_FIX) {
    const fullPath = path.join(ROOT, filePath);
    console.log('Processing: ' + filePath);
    
    try {
      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      let fileFixed = 0;
      
      for (const result of data.results) {
        if (result.total_score === null && result.raw_scores_json) {
          const computedScore = computeTotalScore(result.raw_scores_json);
          if (computedScore !== null) {
            result.total_score = computedScore;
            fileFixed++;
          }
        }
        
        // Fix status if needed
        if (result.status === 'unknown_status_check_raw_text' && result.raw_scores_json) {
          const fixedStatus = fixStatus(result.raw_scores_json, result.status);
          if (fixedStatus !== result.status) {
            result.status = fixedStatus;
          }
        }
      }
      
      if (fileFixed > 0) {
        data.exported_at = new Date().toISOString();
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('  ✅ Fixed ' + fileFixed + ' results');
        fixedCount++;
        totalFixed += fileFixed;
      } else {
        console.log('  ℹ️  No fixes needed');
      }
      
    } catch (error) {
      console.error('  ❌ Error: ' + error.message);
      errorCount++;
    }
    
    console.log();
  }
  
  console.log('\nSummary:');
  console.log('  Files updated: ' + fixedCount);
  console.log('  Results fixed: ' + totalFixed);
  console.log('  Errors: ' + errorCount);
  console.log('  Total files: ' + FILES_TO_FIX.length);
  
  if (fixedCount > 0) {
    console.log('\nNext steps:');
    console.log('  1. Run: npm run build-all-data');
    console.log('  2. Verify index files are populated');
  }
}

fixTotalScores().catch(console.error);