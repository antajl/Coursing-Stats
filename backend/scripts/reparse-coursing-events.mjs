import { parseCoursingResultsPage } from "../parsers/parse-results-coursing.mjs";
import { loadDogIndexFromD1, lookupDogIdFromIndex } from "../lib/dog-lookup.mjs";
import { sleep } from "../lib/fetch-win1251.mjs";

/**
 * Re-parse all coursing events to get accurate judge counts and normalized scores
 * 
 * This script:
 * 1. Gets all coursing events from the database
 * 2. Re-parses their HTML with the updated parser
 * 3. Updates records with correct judge_count and normalized total_score
 * 
 * Usage:
 * node scripts/reparse-coursing-events.mjs
 */

export async function reparseCoursingEvents(db) {
  console.log('Starting re-parsing of coursing events...');
  
  try {
    // Get all coursing events with results_url
    const { results: events } = await db.prepare(`
      SELECT id, results_url, date_start, title 
      FROM events 
      WHERE event_type IN ('coursing', 'bzmp') 
        AND results_url IS NOT NULL
      ORDER BY date_start DESC
    `).all();
    
    console.log(`Found ${events.length} coursing/bzmp events to re-parse`);

    const dogIndex = await loadDogIndexFromD1(db);
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
            const dogId = lookupDogIdFromIndex(dogIndex, result.name, result.breed);
            
            if (!dogId) {
              console.log(`    Dog not found: ${result.name} (${result.breed})`);
              continue;
            }
            
            // Update the result
            await db.prepare(`
              UPDATE results 
              SET total_score = ?, 
                  judge_count = ?,
                  raw_scores_json = ?,
                  raw_text = ?
              WHERE event_id = ? AND dog_id = ?
            `).bind(
              result.total_score,
              result.judge_count,
              result.raw_scores_json,
              result.raw_text,
              event.id,
              dogId
            ).run();
            
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
    
    return { processed, updated, errors };
  } catch (err) {
    console.error('Re-parsing failed:', err);
    throw err;
  }
}

// CLI mode
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('This script requires a database connection');
  console.log('It should be called from within a context that provides a db connection');
  console.log('Use the API endpoint: POST /api/admin/reparse-coursing');
}
