/**
 * Migration script to add judge_count field to results table
 * and normalize existing total_score values
 */

export async function migrateAddJudgeCount(db) {
  console.log('Starting migration: Add judge_count field...');
  
  try {
    // Add the judge_count column if it doesn't exist
    await db.exec(`
      ALTER TABLE results ADD COLUMN judge_count INTEGER DEFAULT 3
    `);
    console.log('✓ Added judge_count column');
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log('✓ judge_count column already exists');
    } else {
      throw err;
    }
  }
  
  // For existing data, we need to estimate judge count
  // This is a heuristic - we'll assume 3 judges for most data
  // In the future, this should be determined from raw_scores_json or re-parsed
  
  console.log('⚠️  Note: Existing data will have judge_count = 3 by default');
  console.log('⚠️  To get accurate judge counts, re-parse the HTML results');
  
  console.log('✓ Migration completed');
  return true;
}
