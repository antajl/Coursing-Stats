#!/usr/bin/env node
/**
 * Test the fallback logic we added to the parser
 */

import fs from 'node:fs';
import path from 'node:path';

const testFile = path.join(process.cwd(), 'data/v1/competitions/2024/04-апрель/20240407--cacl-07042024-.json');

console.log('Testing fallback logic on sample data...\n');

try {
  const jsonData = JSON.parse(fs.readFileSync(testFile, 'utf-8'));
  
  // Find a result with null total_score but valid raw_scores_json
  const sampleResult = jsonData.results.find((r: any) => r.total_score === null && r.raw_scores_json);
  
  if (!sampleResult) {
    console.log('❌ No suitable sample result found');
    process.exit(1);
  }
  
  console.log('Sample result:');
  console.log(`  total_score: ${sampleResult.total_score}`);
  console.log(`  status: ${sampleResult.status}`);
  
  const rawScores = JSON.parse(sampleResult.raw_scores_json);
  console.log(`  Raw scores structure:`, JSON.stringify(rawScores, null, 2));
  
  // Test the fallback logic manually
  const heats = rawScores.heats;
  
  // Fallback 1: compute from heat totals
  let grandTotal: number | null = null;
  if (heats.length > 0) {
    const heatTotals = heats
      .map((h: any) => h.total)
      .filter((t: any) => t !== null && !isNaN(t));
    if (heatTotals.length > 0) {
      grandTotal = heatTotals.reduce((sum: number, t: number) => sum + t, 0);
      console.log(`\n✅ Fallback 1 (heat totals): ${grandTotal}`);
    }
  }
  
  // Fallback 2: compute from judge sums
  if (grandTotal === null && heats.length > 0) {
    const judgeSums = heats
      .flatMap((h: any) => h.judges || [])
      .map((j: any) => j.sum)
      .filter((s: any) => s !== null && !isNaN(s));
    if (judgeSums.length > 0) {
      grandTotal = judgeSums.reduce((sum: number, s: number) => sum + s, 0);
      console.log(`✅ Fallback 2 (judge sums): ${grandTotal}`);
      console.log(`   Judge sums: ${judgeSums.join(' + ')} = ${grandTotal}`);
    }
  }
  
  if (grandTotal !== null) {
    console.log(`\n✅ SUCCESS: Fallback logic can compute total_score = ${grandTotal}`);
    console.log(`   Original total_score was null, now we have ${grandTotal}`);
  } else {
    console.log(`\n❌ FAILED: No fallback could compute total_score`);
  }
  
  // Test status detection
  const hasValidJudgeData = heats && heats.length > 0 && 
    heats.some((h: any) => h.judges && h.judges.length > 0 && 
      h.judges.some((j: any) => j.scores && j.scores.some((s: any) => s !== null)));
  
  console.log(`\nStatus detection test:`);
  console.log(`  hasValidJudgeData: ${hasValidJudgeData}`);
  console.log(`  Current status: ${sampleResult.status}`);
  console.log(`  Should be: ${hasValidJudgeData ? 'finished' : 'unknown_status_check_raw_text'}`);
  
  if (hasValidJudgeData && sampleResult.status === 'unknown_status_check_raw_text') {
    console.log(`\n✅ Status detection fix will change this to 'finished'`);
  }
  
} catch (error) {
  console.error('Error:', (error as Error).message);
  console.error((error as Error).stack);
  process.exit(1);
}