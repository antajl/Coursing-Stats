import fs from 'fs';
const html = fs.readFileSync('results_sample.html', 'utf8');

// Ищем все статусы
const patterns = [
  /Неявка/gi,
  /снят/gi,
  /дискв/gi,
  /н\/ф/gi,
  /не финишировал/gi,
  /Отозван/gi
];

console.log('=== Searching for statuses ===');
for (const pattern of patterns) {
  const matches = html.match(pattern);
  if (matches) {
    console.log(`${pattern.flags}: Found ${matches.length} matches`);
  }
}

// Ищем "Неприбывшие участники"
const dnsSection = html.match(/Неприбывшие участники[\s\S]*?<\/table>/i);
if (dnsSection) {
  console.log('\n=== DNS/DNF Section ===');
  console.log(dnsSection[0].substring(0, 500));
}