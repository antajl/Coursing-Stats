const fs = require('fs');
const iconv = require('iconv-lite');

const buf = fs.readFileSync('data/tmp/procoursing_2021/s_2021.html');
const html = iconv.decode(buf, 'win1251');

// Match table rows: each competition is typically in a table row with date, title, location, and links
const rowRegex = /<tr[\s\S]*?<\/tr>/gi;
let match;
let count = 0;
while ((match = rowRegex.exec(html)) !== null) {
  const rowHtml = match[0];
  if (!rowHtml.includes('results/')) continue;
  count++;
  // Clean tags to see text
  const cleanText = rowHtml
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, ' [LINK: $1 | TEXT: $2] ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  console.log(`\n--- Event #${count} ---`);
  console.log(cleanText);
}

