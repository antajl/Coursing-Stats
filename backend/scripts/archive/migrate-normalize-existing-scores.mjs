/**
 * Migration script to normalize existing total_score values
 * 
 * This script attempts to determine judge_count from raw_scores_json
 * and recalculates total_score as normalized value.
 * 
 * For data where judge_count cannot be determined, it defaults to 3.
 */

export async function migrateNormalizeExistingScores(db) {
  console.log('Starting migration: Normalize existing scores...');
  
  try {
    // Get all coursing/bzmp results with total_score
    const { results: coursingResults } = await db.prepare(`
      SELECT id, total_score, raw_scores_json 
      FROM results r
      JOIN events e ON r.event_id = e.id
      WHERE e.event_type IN ('coursing', 'bzmp') 
        AND r.total_score IS NOT NULL 
        AND r.status = 'finished'
    `).all();
    
    console.log(`Found ${coursingResults.length} coursing/bzmp results to process`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const result of coursingResults) {
      try {
        let judgeCount = 3; // Default to 3 judges
        let rawTotal = result.total_score;
        
        // Try to extract judge_count from raw_scores_json
        if (result.raw_scores_json) {
          const scoresData = JSON.parse(result.raw_scores_json);
          if (scoresData.judge_count) {
            judgeCount = scoresData.judge_count;
          } else if (scoresData.raw_total) {
            // If we have raw_total, use that for normalization
            rawTotal = scoresData.raw_total;
          }
        }
        
        // Recalculate normalized total_score
        const normalizedScore = Math.round((rawTotal / judgeCount) * 100) / 100;
        
        // Update the record
        await db.prepare(`
          UPDATE results 
          SET total_score = ?, judge_count = ?
          WHERE id = ?
        `).bind(normalizedScore, judgeCount, result.id).run();
        
        updated++;
        
        if (updated % 100 === 0) {
          console.log(`  Processed ${updated}/${coursingResults.length} records...`);
        }
      } catch (err) {
        console.error(`  Error processing result ${result.id}:`, err.message);
        skipped++;
      }
    }
    
    console.log(`✓ Migration completed`);
    console.log(`  Updated: ${updated} records`);
    console.log(`  Skipped: ${skipped} records`);
    console.log(`\n⚠️  Note: For accurate judge counts, re-parse HTML results`);
    
    return true;
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  }
}
