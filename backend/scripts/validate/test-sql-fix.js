#!/usr/bin/env node
/**
 * Quick test to see if the SQL view modification works
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../../../schema.sql');
const testDataPath = path.join(__dirname, '../../../../data/v1/competitions/2024/04-апрель/20240407--cacl-07042024-.json');

console.log('Testing SQL view modification...\n');

try {
  // Create in-memory database with modified schema
  const db = new Database(':memory:');
  
  // Load modified schema
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  
  // Load some test data
  const compData = JSON.parse(fs.readFileSync(testDataPath, 'utf-8'));
  
  console.log('Sample competition data:');
  console.log(`  Event ID: ${compData.event_id}`);
  console.log(`  Year: ${compData.event.year}`);
  console.log(`  Results: ${compData.results.length}`);
  
  // Insert event
  const eventStmt = db.prepare(`
    INSERT INTO events (id, year, date_start, title, event_type, competition_kind, competition_type, location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  eventStmt.run(compData.event_id, compData.event.year, compData.event.date_start, compData.event.title, compData.event.event_type, compData.event.competition_kind, compData.event.competition_type, compData.event.location);
  
  // Insert dogs and results
  const dogStmt = db.prepare(`INSERT INTO dogs (id, name_lat, name_ru, breed) VALUES (?, ?, ?, ?)`);
  const resultStmt = db.prepare(`
    INSERT INTO results (event_id, dog_id, placement, total_score, judge_count, status, raw_scores_json, qualification, vc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  let insertedCount = 0;
  let withNullTotalScore = 0;
  
  for (const result of compData.results) {
    // Insert dog if not exists
    try {
      dogStmt.run(insertedCount + 1, result.name_lat || result.name, result.name_ru, result.breed);
    } catch (e) {
      // Dog might exist, ignore
    }
    
    // Insert result
    const dogId = insertedCount + 1;
    resultStmt.run(
      compData.event_id,
      dogId,
      result.placement,
      result.total_score,
      result.judge_count,
      result.status,
      result.raw_scores_json,
      result.qualification,
      result.vc
    );
    
    if (result.total_score === null) {
      withNullTotalScore++;
    }
    insertedCount++;
  }
  
  console.log(`\nInserted ${insertedCount} results`);
  console.log(`Results with null total_score: ${withNullTotalScore}`);
  
  // Test the modified view
  console.log('\n--- Testing v_top_by_score ---');
  const scoreView = db.prepare('SELECT * FROM v_top_by_score').all();
  console.log(`Results: ${scoreView.length}`);
  
  if (scoreView.length > 0) {
    console.log('Sample result:', JSON.stringify(scoreView[0], null, 2));
    console.log('\n✅ SUCCESS: SQL view modification works!');
  } else {
    console.log('❌ FAILED: SQL view still returns 0 results');
  }
  
  db.close();
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}