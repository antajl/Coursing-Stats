#!/usr/bin/env node
/**
 * Simple test to check if competition data has proper fields for SQL views
 */

const fs = require('fs');
const path = require('path');

const compDir = path.join(__dirname, '../../../../data/v1/competitions');

function checkRandomCompetition() {
  const files = [];
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(compDir);
  
  console.log(`Found ${files.length} competition files`);
  
  // Check random sample
  const sampleSize = Math.min(10, files.length);
  const sample = [];
  for (let i = 0; i < sampleSize; i++) {
    const randomIndex = Math.floor(Math.random() * files.length);
    sample.push(files[randomIndex]);
  }
  
  let finishedCount = 0;
  let totalScoreCount = 0;
  let nullStatusCount = 0;
  
  for (const file of sample) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
          if (result.status === 'finished') finishedCount++;
          if (result.total_score !== null && result.total_score !== undefined) totalScoreCount++;
          if (result.status === 'unknown_status_check_raw_text') nullStatusCount++;
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  console.log(`\nSample analysis (${sample.length} files):`);
  console.log(`  Finished results: ${finishedCount}`);
  console.log(`  Results with total_score: ${totalScoreCount}`);
  console.log(`  Results with unknown_status: ${nullStatusCount}`);
  
  // Check one specific file in detail
  console.log('\n--- Detailed check of 20240407 file ---');
  const testFile = path.join(compDir, '2024/04-апрель/20240407--cacl-07042024-.json');
  if (fs.existsSync(testFile)) {
    const data = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
    console.log(`Results count: ${data.results.length}`);
    const firstResult = data.results[0];
    console.log('First result:');
    console.log(`  status: ${firstResult.status}`);
    console.log(`  total_score: ${firstResult.total_score}`);
    console.log(`  placement: ${firstResult.placement}`);
    console.log(`  Has raw_scores_json: ${!!firstResult.raw_scores_json}`);
  }
}

checkRandomCompetition();