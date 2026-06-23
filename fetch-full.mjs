import iconvLite from 'iconv-lite';
import https from 'https';
import http from 'http';

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
  const url = 'http://procoursing.ru/s_2026.html';
  console.log('Fetching:', url);
  
  const rawBuffer = await fetchRaw(url);
  console.log('Raw bytes length:', rawBuffer.length);
  
  // Decode as windows-1251
  const html = iconvLite.decode(rawBuffer, 'windows-1251').toString();
  console.log('Decoded length:', html.length);
  
  // Save to file for analysis
  import('fs').then(fs => {
    fs.default.writeFileSync('calendar_2026.html', html, 'utf8');
    console.log('Saved to calendar_2026.html');
  });
  
  // Print first 3000 chars
  console.log('\n=== FIRST 3000 CHARS ===\n');
  console.log(html.substring(0, 3000));
}

main().catch(console.error);