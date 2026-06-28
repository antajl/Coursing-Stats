import { parseCoursingResultsPage } from "../../parsers/parse-results-coursing";

/**
 * Execute a wrangler d1 query and return results
 */
async function wranglerD1Query(query) {
  const { exec } = await import('child_process');
  return new Promise((resolve, reject) => {
    exec(`wrangler d1 execute pc-db --local --command="${query}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      // Parse the output to extract the table data
      const lines = stdout.split('\n');
      const data = [];
      let inTable = false;
      
      for (const line of lines) {
        if (line.includes('├') || line.includes('│')) {
          inTable = true;
          if (line.includes('│') && !line.includes('├') && !line.includes('┬') && !line.includes('┴')) {
            const parts = line.split('│').map(p => p.trim()).filter(p => p);
            if (parts.length > 1) {
              data.push(parts);
            }
          }
        }
      }
      
      // Convert array of arrays to array of objects
      if (data.length > 0) {
        const headers = data[0];
        const objects = data.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = row[i] || null;
          });
          return obj;
        });
        resolve(objects);
      } else {
        resolve([]);
      }
    });
  });
}

/**
 * Update raw_scores_json field for all coursing/bzmp events
 * Generates SQL UPDATE statements for manual execution via wrangler
 * 
 * Usage:
 * node scripts/update-raw-scores.mjs
 * wrangler d1 execute pc-db --local --file=./data/update-raw-scores.sql
 */

async function updateRawScores() {
  console.log('Starting raw scores update...');
  
  // Hardcoded events list from the database with correct IDs
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
      
      // Get existing results for this event to match by position within breed_class
      const existingResults = await wranglerD1Query(`SELECT id, breed_class, placement FROM results WHERE event_id = ${event.id} ORDER BY id`);
      
      // Group existing results by breed_class
      const groupedExisting = {};
      existingResults.forEach(r => {
        if (!groupedExisting[r.breed_class]) {
          groupedExisting[r.breed_class] = [];
        }
        groupedExisting[r.breed_class].push(r);
      });
      
      // Match parsed results with existing results by breed_class and position
      let groupIndex = 0;
      let currentBreedClass = null;
      
      for (let i = 0; i < parsedData.results.length; i++) {
        const result = parsedData.results[i];
        if (result.raw_scores_json) {
          // Track breed_class changes
          if (result.breed_class && result.breed_class !== currentBreedClass) {
            currentBreedClass = result.breed_class;
            groupIndex = 0;
          }
          
          // Find corresponding existing result
          const group = groupedExisting[currentBreed_class] || [];
          const existing = group[groupIndex];
          
          if (existing) {
            const sql = `UPDATE results SET raw_scores_json = '${result.raw_scores_json.replace(/'/g, "''")}' WHERE id = ${existing.id};`;
            sqlStatements.push(sql);
            updated++;
          }
          
          groupIndex++;
        }
      }
      console.log(`  Generated ${parsedData.results.length} SQL statements`);
      
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
