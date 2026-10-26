const http = require('http');
const fs = require('fs');
const path = require('path');

const files = [
  { url: 'http://procoursing.ru/results/2021-04-17_C/2021-04-17_C.webp', name: '2021-04-17_C.webp' },
  { url: 'http://procoursing.ru/results/2021-04-18_B/2021-04-18_B.webp', name: '2021-04-18_B.webp' },
  { url: 'http://procoursing.ru/results/2021-04-24/2021-04-24.webp', name: '2021-04-24.webp' },
  { url: 'http://procoursing.ru/results/2021-05-02/2021-05-02.webp', name: '2021-05-02.webp' },
  { url: 'http://procoursing.ru/results/2021-05-22/2021-05-22.webp', name: '2021-05-22.webp' },
  { url: 'http://procoursing.ru/results/2021-06-13/2021-06-13.webp', name: '2021-06-13.webp' },
  { url: 'http://procoursing.ru/results/2021-06-13/Catalog_2021-06-13.pdf', name: 'Catalog_2021-06-13.pdf' },
  { url: 'http://procoursing.ru/results/2021-06-19/2021-06-19.webp', name: '2021-06-19.webp' },
  { url: 'http://procoursing.ru/results/2021-08-07/2021-08-07.webp', name: '2021-08-07.webp' },
  { url: 'http://procoursing.ru/results/2021-08-21/2021-08-21.webp', name: '2021-08-21.webp' },
  { url: 'http://procoursing.ru/results/2021-09-04_C/2021-09-04_C.webp', name: '2021-09-04_C.webp' },
  { url: 'http://procoursing.ru/results/2021-09-04_B/2021-09-04_B.webp', name: '2021-09-04_B.webp' },
  { url: 'http://procoursing.ru/results/2021-09-18/2021-09-18.webp', name: '2021-09-18.webp' },
  { url: 'http://procoursing.ru/results/2021-09-18/Catalog_2021-09-18_Coursing_Cup_Russia.pdf', name: 'Catalog_2021-09-18_Coursing_Cup_Russia.pdf' },
  { url: 'http://procoursing.ru/results/2021-09-19_R/2021-09-19_R.webp', name: '2021-09-19_R.webp' },
  { url: 'http://procoursing.ru/results/2021-09-19_C/2021-09-19_C.webp', name: '2021-09-19_C.webp' },
  { url: 'http://procoursing.ru/results/2021-10-02/2021-10-02.webp', name: '2021-10-02.webp' },
  { url: 'http://procoursing.ru/results/2021-10-10/2021-10-10.webp', name: '2021-10-10.webp' },
  { url: 'http://procoursing.ru/results/2021-10-24/2021-10-24.webp', name: '2021-10-24.webp' },
];

function downloadFile(item) {
  return new Promise((resolve) => {
    const dest = path.join('data/tmp/procoursing_2021', item.name);
    http.get(item.url, (res) => {
      if (res.statusCode !== 200) {
        console.error(`[HTTP ${res.statusCode}] Failed to download ${item.url}`);
        return resolve();
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        const stat = fs.statSync(dest);
        console.log(`[OK] Downloaded ${item.name} (${stat.size} bytes)`);
        resolve();
      });
    }).on('error', (err) => {
      console.error(`[ERROR] ${item.name}:`, err.message);
      resolve();
    });
  });
}

async function run() {
  for (const item of files) {
    await downloadFile(item);
  }
}

run();
