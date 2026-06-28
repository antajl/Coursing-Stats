import { parseCoursingResultsPage } from "../../parsers/parse-results-coursing";

/**
 * Simple approach: match results by order in the database
 * This assumes the results are stored in the same order as they appear in HTML
 */

async function updateRawScores() {
  console.log('Starting raw scores update (simple approach)...');
  
  const events = [
    { id: 641, results_url: 'http://procoursing.ru/2026/2026-05-23_Complete_Results_Coursing.html', date_start: '2026-05-23' },
    { id: 639, results_url: 'http://procoursing.ru/2026/2026-05-10_Complete_Results_Coursing.html', date_start: '2026-05-10' },
    { id: 638, results_url: 'http://procoursing.ru/2026/2026-05-03_Complete_Results_Coursing.html', date_start: '2026-05-03' },
    { id: 636, results_url: 'http://procoursing.ru/2026/2026-05-02_Complete_Results_Coursing.html', date_start: '2026-05-02' },
    { id: 637, results_url: 'http://procoursing.ru/2026/2026-05-02_Complete_Results_BZMP.html', date_start: '2026-05-02' },
    { id: 634, results_url: 'http://procoursing.ru/2026/2026-04-25_Complete_Results_Coursing.html', date_start: '2026-04-25' },
    { id: 635, results_url: 'http://procoursing.ru/2026/2026-04-25_Complete_Results_BZMP.html', date_start: '2026-04-25' },
    { id: 631, results_url: 'http://procoursing.ru/2026/2026-04-19_Complete_Results_Coursing.html', date_start: '2026-04-19' },
    { id: 632, results_url: 'http://procoursing.ru/2026/2026-04-19_Complete_Results_BZMP.html', date_start: '2026-04-19' },
    { id: 628, results_url: 'http://procoursing.ru/2026/2026-04-18_Complete_Results_Coursing.html', date_start: '2026-04-18' },
    { id: 629, results_url: 'http://procoursing.ru/2026/2026-04-18_Complete_Results_BZMP.html', date_start: '2026-04-18' },
    { id: 626, results_url: 'http://procoursing.ru/2026/2026-04-12_Complete_Results_Coursing.html', date_start: '2026-04-12' },
    { id: 627, results_url: 'http://procoursing.ru/2026/2026-04-12_Complete_Results_BZMP.html', date_start: '2026-04-12' },
    { id: 624, results_url: 'http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html', date_start: '2026-04-04' },
    { id: 625, results_url: 'http://procoursing.ru/2026/2026-04-04_Complete_Results_BZMP.html', date_start: '2026-04-04' },
  ];
  
  console.log(`Found ${events.length} coursing/bzmp events to update`);
  
  const sqlStatements = [];
  let processed = 0;
  let updated = 0;
  let errors = 0;
  
  for (const event of events) {
    try {
      console.log(`[${processed + 1}/${events.length}] Processing: ${event.date_start} - ${event.results_url}`);
      
      // Parse the event results directly from URL
      const parsedData = await parseCoursingResultsPage(event.results_url);
      
      // Get existing result IDs for this event (all results, including those without placement)
      const { exec } = await import('child_process');
      const existingResults = await new Promise((resolve, reject) => {
        exec(`wrangler d1 execute pc-db --local --command="SELECT id FROM results WHERE event_id = ${event.id} ORDER BY id"`, (error, stdout, stderr) => {
          if (error) {
            reject(error);
            return;
          }
          // Parse the output to extract IDs - simpler approach
          const lines = stdout.split('\n');
          const ids = [];
          for (const line of lines) {
            // Look for numbers that could be IDs (typically 5+ digits)
            const matches = line.match(/\b(\d{5,})\b/g);
            if (matches) {
              matches.forEach(m => {
                const num = parseInt(m);
                if (!ids.includes(num)) {
                  ids.push(num);
                }
              });
            }
          }
          resolve(ids);
        });
      });
      
      console.log(`  Found ${existingResults.length} existing results`);
      console.log(`  Parser found ${parsedData.results.length} results`);
      
      // Match parsed results with existing results by order (simple index-based matching)
      let matchCount = 0;
      for (let i = 0; i < parsedData.results.length; i++) {
        const result = parsedData.results[i];
        if (result.raw_scores_json && i < existingResults.length) {
          const existingId = existingResults[i];
          const sql = `UPDATE results SET raw_scores_json = '${result.raw_scores_json.replace(/'/g, "''")}' WHERE id = ${existingId};`;
          sqlStatements.push(sql);
          updated++;
          matchCount++;
        }
      }
      console.log(`  Generated ${matchCount} SQL statements`);
      
      processed++;
      
      if (processed % 5 === 0) {
        console.log(`  Progress: ${processed}/${events.length} events processed`);
      }
      
    } catch (err) {
      console.error(`  Error processing event ${event.id}:`, err.message);
      errors++;
      processed++;
    }
  }
  
  // Save SQL statements to file
  const fs = await import('fs');
  fs.writeFileSync('./data/update-raw-scores.sql', sqlStatements.join('\n'));
  
  console.log(`\n✓ Raw scores update completed`);
  console.log(`  Events processed: ${processed}/${events.length}`);
  console.log(`  SQL statements generated: ${updated}`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nSQL statements saved to data/update-raw-scores.sql`);
  console.log(`Run: wrangler d1 execute pc-db --local --file=./data/update-raw-scores.sql`);
}

updateRawScores().catch(console.error);
