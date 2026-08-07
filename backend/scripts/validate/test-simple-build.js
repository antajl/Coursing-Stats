#!/usr/bin/env node
/**
 * Simple test to check if the schema change works
 */

const { loadLocalDataSqlite } = require('../lib/local-data/load-sqlite');

console.log('Testing modified SQL view with real data...\n');

try {
  const { db, stats } = loadLocalDataSqlite();
  
  console.log('Database stats:');
  console.log(`  Events: ${stats.events}`);
  console.log(`  Dogs: ${stats.dogs}`);
  console.log(`  Results: ${stats.results}`);
  
  // Test the modified view
  console.log('\n--- Testing v_top_by_score ---');
  const scoreView = db.prepare('SELECT * FROM v_top_by_score LIMIT 5').all();
  console.log(`Results: ${scoreView.length}`);
  
  if (scoreView.length > 0) {
    console.log('Sample result:', JSON.stringify(scoreView[0], null, 2));
    console.log('\n✅ SUCCESS: SQL view modification works!');
  } else {
    console.log('❌ FAILED: SQL view still returns 0 results');
    
    // Debug: check what data exists
    console.log('\n--- Debug: Check raw data ---');
    const finishedResults = db.prepare("SELECT COUNT(*) as c FROM results WHERE status = 'finished'").get();
    console.log(`Finished results: ${finishedResults.c}`);
    
    const withTotalScore = db.prepare("SELECT COUNT(*) as c FROM results WHERE total_score IS NOT NULL").get();
    console.log(`Results with total_score: ${withTotalScore.c}`);
    
    const withRawScores = db.prepare("SELECT COUNT(*) as c FROM results WHERE raw_scores_json IS NOT NULL").get();
    console.log(`Results with raw_scores_json: ${withRawScores.c}`);
    
    const coursingResults = db.prepare(`
      SELECT COUNT(*) as c 
      FROM results r 
      JOIN events e ON r.event_id = e.id 
      WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
    `).get();
    console.log(`Finished coursing/bzmp results: ${coursingResults.c}`);
  }
  
  db.close();
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}