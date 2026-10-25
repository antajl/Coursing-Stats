const http = require('http');
const fs = require('fs');
const iconv = require('iconv-lite');
const path = require('path');

const events = [
  { slug: '2021-04-17_C', url: 'http://procoursing.ru/results/2021-04-17_C/' },
  { slug: '2021-04-18_B', url: 'http://procoursing.ru/results/2021-04-18_B/' },
  { slug: '2021-04-24',   url: 'http://procoursing.ru/results/2021-04-24/' },
  { slug: '2021-05-02',   url: 'http://procoursing.ru/results/2021-05-02/' },
  { slug: '2021-05-22',   url: 'http://procoursing.ru/results/2021-05-22/' },
  { slug: '2021-06-13',   url: 'http://procoursing.ru/results/2021-06-13/' },
  { slug: '2021-06-19',   url: 'http://procoursing.ru/results/2021-06-19/' },
  { slug: '2021-08-07',   url: 'http://procoursing.ru/results/2021-08-07/' },
  { slug: '2021-08-21',   url: 'http://procoursing.ru/results/2021-08-21/' },
  { slug: '2021-09-04_C', url: 'http://procoursing.ru/results/2021-09-04_C/' },
  { slug: '2021-09-04_B', url: 'http://procoursing.ru/results/2021-09-04_B/' },
  { slug: '2021-09-18',   url: 'http://procoursing.ru/results/2021-09-18/' },
  { slug: '2021-09-19_R', url: 'http://procoursing.ru/results/2021-09-19_R/' },
  { slug: '2021-09-19_C', url: 'http://procoursing.ru/results/2021-09-19_C/' },
  { slug: '2021-10-02',   url: 'http://procoursing.ru/results/2021-10-02/' },
  { slug: '2021-10-10',   url: 'http://procoursing.ru/results/2021-10-10/' },
  { slug: '2021-10-24',   url: 'http://procoursing.ru/results/2021-10-24/' },
];

function fetchUrl(item) {
  return new Promise((resolve) => {
    http.get(item.url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const html = iconv.decode(buf, 'win1251');
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : 'No title';
        const hasImg = /<img[^>]+src=["']([^"']+\.(?:jpg|png|webp))["']/i.exec(html);
        const hasTable = html.includes('<table');
        const tableRows = (html.match(/<tr/gi) || []).length;
        console.log(`[HTTP ${res.statusCode}] ${item.slug}: size=${buf.length}, title="${title}", hasTable=${hasTable} (${tableRows} tr), img=${hasImg ? hasImg[1] : 'none'}`);
        // Save to disk
        fs.writeFileSync(path.join('data/tmp/procoursing_2021', `${item.slug}.html`), buf);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`[ERROR] ${item.slug}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  for (const item of events) {
    await fetchUrl(item);
  }
}

run();
