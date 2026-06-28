import Database from 'better-sqlite3';
import { parseCoursingResultsPage } from '../../parsers/parse-results-coursing';
import { buildDogIndex, lookupDogId } from '../../lib/dog-lookup';
import { sleep } from '../../lib/fetch-win1251';

// Connect to local D1 database (use the larger database file)
const db = new Database('../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/25a9fdfb5f2c0e75c4b581cbf0100f9e751bd9d7099c87a38bf84799002c7481.sqlite');
db.pragma('journal_mode = WAL');

console.log('Starting standalone re-parsing of coursing events...');

try {
  // Get all coursing events with results_url
  const events = db.prepare(`
    SELECT id, results_url, date_start, title 
    FROM events 
    WHERE event_type IN ('coursing', 'bzmp') 
      AND results_url IS NOT NULL
    ORDER BY date_start DESC
  `).all();
  
  console.log(`Found ${events.length} coursing/bzmp events to re-parse`);

  const dogIndex = buildDogIndex(
    db.prepare(`SELECT id, name_lat, breed FROM dogs WHERE merged_into_dog_id IS NULL`).all()
  );
  console.log(`Dog index loaded: ${dogIndex.size} unique name+breed keys`);
  
  let processed = 0;
  let updated = 0;
  let errors = 0;
  
  for (const event of events) {
    try {
      console.log(`[${processed + 1}/${events.length}] Processing: ${event.date_start} - ${event.results_url}`);
      
      await sleep(1000); // Rate limiting
      
      // Parse the event results
      const results = await parseCoursingResultsPage(event.results_url);
      console.log(`  Found ${results.length} results`);
      
      // Update each result
      for (const result of results) {
        try {
          // Find the dog
          const dogId = lookupDogId(dogIndex, result.name, result.breed);
          
          if (!dogId) {
            console.log(`    Dog not found: ${result.name} (${result.breed})`);
            continue;
          }
          
          // Update the result
          db.prepare(`
            UPDATE results 
            SET total_score = ?, 
                judge_count = ?,
                raw_scores_json = ?,
                raw_text = ?,
                status = ?
            WHERE event_id = ? AND dog_id = ?
          `).run(
            result.total_score,
            result.judge_count,
            result.raw_scores_json,
            result.raw_text,
            result.status,
            event.id,
            dogId
          );
          
          updated++;
        } catch (err) {
          console.error(`    Error updating result for ${result.name}:`, err.message);
        }
      }
      
      processed++;
      
      if (processed % 10 === 0) {
        console.log(`  Progress: ${processed}/${events.length} events processed`);
      }
      
    } catch (err) {
      console.error(`  Error processing event ${event.id}:`, err.message);
      errors++;
      processed++;
    }
  }
  
  console.log(`\n✓ Re-parsing completed`);
  console.log(`  Events processed: ${processed}/${events.length}`);
  console.log(`  Results updated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  
  db.close();
  process.exit(0);
} catch (err) {
  console.error('Re-parsing failed:', err);
  db.close();
  process.exit(1);
}
