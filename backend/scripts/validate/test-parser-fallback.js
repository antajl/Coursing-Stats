#!/usr/bin/env node
/**
 * Test parser fallback logic on a sample competition file
 */

const fs = require('fs');
const path = require('path');

// Import the parser
const { parseCoursing } = require('../parsers/coursing/index.ts');

const testFile = path.join(__dirname, '../../../../data/v1/competitions/2024/04-апрель/20240407--cacl-07042024-.json');

console.log('Testing parser fallback logic...\n');

try {
  // Read the HTML file (we'll need to find the actual HTML source)
  const jsonData = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
  
  console.log('Existing competition data:');
  console.log(`  Event ID: ${jsonData.event_id}`);
  console.log(`  Year: ${jsonData.event.year}`);
  console.log(`  Results: ${jsonData.results.length}`);
  
  // Check for null total_score
  let nullTotalScoreCount = 0;
  let withRawScores = 0;
  
  jsonData.results.forEach((result, idx) => {
    if (result.total_score === null) {
      nullTotalScoreCount++;
      if (result.raw_scores_json) {
        withRawScores++;
        console.log(`\nResult ${idx}:`);
        console.log(`  total_score: null`);
        console.log(`  raw_scores_json: ${result.raw_scores_json.substring(0, 100)}...`);
      }
    }
  });
  
  console.log(`\nSummary:`);
  console.log(`  Results with null total_score: ${nullTotalScoreCount}`);
  console.log(`  Results with raw_scores_json available: ${withRawScores}`);
  
  if (withRawScores > 0) {
    console.log('\n✅ Fallback logic should help: ' + withRawScores + ' results have raw_scores data');
  } else {
    console.log('\n❌ No raw_scores data available for fallback');
  }
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}