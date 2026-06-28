import { parseCoursingResultsPage } from "../../parsers/parse-results-coursing";

/**
 * Update judges field for all coursing events
 * Generates SQL UPDATE statements for manual execution
 * 
 * Usage:
 * node scripts/update-judges.mjs
 */

async function updateJudges() {
  console.log('Starting judges update...');
  
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
  let found = 0;
  let errors = 0;
  
  for (const event of events) {
    try {
      console.log(`[${processed + 1}/${events.length}] Processing: ${event.date_start} - ${event.results_url}`);
      
      // Parse the event results directly from URL
      const parsedData = await parseCoursingResultsPage(event.results_url);
      
      // Generate SQL UPDATE statement if judges found
      if (parsedData.judges) {
        const judgesEscaped = parsedData.judges.replace(/'/g, "''");
        const sql = `UPDATE events SET judges = '${judgesEscaped}' WHERE id = ${event.id};`;
        sqlStatements.push(sql);
        console.log(`  Found judges: ${parsedData.judges}`);
        found++;
      } else {
        console.log(`  No judges found in HTML`);
      }
      
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
  fs.writeFileSync('./data/update-judges.sql', sqlStatements.join('\n'));
  
  console.log(`\n✓ Judges update completed`);
  console.log(`  Events processed: ${processed}/${events.length}`);
  console.log(`  Events with judges: ${found}`);
  console.log(`  Errors: ${errors}`);
  console.log(`\nSQL statements saved to data/update-judges.sql`);
  console.log(`Run: wrangler d1 execute pc-db --local --file=./data/update-judges.sql`);
}

updateJudges().catch(console.error);
