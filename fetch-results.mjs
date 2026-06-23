import iconvLite from 'iconv-lite';
import https from 'https';
import http from 'http';
import fs from 'fs';

async function fetchRaw(url) {
  const protocol = url.startsWith('https') ? https : http;
  
  return new Promise((resolve, reject) => {
    protocol.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  // First fetch the calendar to get a results link
  const calendarUrl = 'http://procoursing.ru/s_2026.html';
  console.log('Fetching calendar:', calendarUrl);
  
  const calendarRaw = await fetchRaw(calendarUrl);
  const calendarHtml = iconvLite.decode(calendarRaw, 'windows-1251').toString();
  
  // Extract first results link
  const resultsLinkMatch = calendarHtml.match(/href="(2026\/[^"]+_Complete_Results_Coursing\.html)"/);
  if (!resultsLinkMatch) {
    console.log('No results link found');
    return;
  }
  
  const resultsPath = resultsLinkMatch[1];
  const resultsUrl = 'http://procoursing.ru/' + resultsPath;
  console.log('Fetching results:', resultsUrl);
  
  const resultsRaw = await fetchRaw(resultsUrl);
  const resultsHtml = iconvLite.decode(resultsRaw, 'windows-1251').toString();
  
  fs.writeFileSync('results_sample.html', resultsHtml, 'utf8');
  console.log('Saved to results_sample.html');
  console.log('\n=== FIRST 4000 CHARS ===\n');
  console.log(resultsHtml.substring(0, 4000));
}

main().catch(console.error);