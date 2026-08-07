#!/usr/bin/env node
/**
 * Test SQL views to see if they return data
 */

const Database = require('better-sqlite3');
const { loadLocalDataSqlite } = require('../lib/local-data/load-sqlite');

console.log('Testing SQL views...\n');

try {
  const { db, stats } = loadLocalDataSqlite();
  
  console.log('Database stats:');
  console.log(`  Events: ${stats.events}`);
  console.log(`  Dogs: ${stats.dogs}`);
  console.log(`  Results: ${stats.results}`);
  
  // Test v_top_by_placement
  console.log('\n--- Testing v_top_by_placement ---');
  const placementView = db.prepare('SELECT * FROM v_top_by_placement LIMIT 5').all();
  console.log(`Results: ${placementView.length}`);
  if (placementView.length > 0) {
    console.log('Sample:', JSON.stringify(placementView[0], null, 2));
  }
  
  // Test v_top_by_score
  console.log('\n--- Testing v_top_by_score ---');
  const scoreView = db.prepare('SELECT * FROM v_top_by_score LIMIT 5').all();
  console.log(`Results: ${scoreView.length}`);
  if (scoreView.length > 0) {
    console.log('Sample:', JSON.stringify(scoreView[0], null, 2));
  }
  
  // Test direct query on results
  console.log('\n--- Testing direct results query ---');
  const finishedResults = db.prepare('SELECT COUNT(*) as c FROM results WHERE status = "finished"').get();
  console.log(`Finished results: ${finishedResults.c}`);
  
  const withTotalScore = db.prepare('SELECT COUNT(*) as c FROM results WHERE total_score IS NOT NULL').get();
  console.log(`Results with total_score: ${withTotalScore.c}`);
  
  const coursingResults = db.prepare(`
    SELECT COUNT(*) as c 
    FROM results r 
    JOIN events e ON r.event_id = e.id 
    WHERE r.status = 'finished' AND e.event_type IN ('coursing', 'bzmp')
  `).get();
  console.log(`Finished coursing/bzmp results: ${coursingResults.c}`);
  
  db.close();
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}