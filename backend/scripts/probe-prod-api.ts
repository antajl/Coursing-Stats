const urls = [
  'https://api.coursing-stats.ru/api/stats',
  'https://api.coursing-stats.ru/api/speed-records?limit=3',
  'https://api.coursing-stats.ru/api/coursing-records?limit=3',
  'https://api.coursing-stats.ru/api/speed-records/top-by-breed?limit=3',
  'https://api.coursing-stats.ru/api/coursing-records/top-by-breed?limit=3',
  'https://api.coursing-stats.ru/api/breeds',
  'https://api.coursing-stats.ru/api/competitions?year=2026',
  'https://coursing-stats.ru/data/v1/pc-db.sqlite',
];

for (const url of urls) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const ct = res.headers.get('content-type') ?? '';
    if (ct.includes('json') || url.includes('/api/')) {
      const text = await res.text();
      console.log(url, res.status, text.slice(0, 300));
    } else {
      const buf = await res.arrayBuffer();
      console.log(url, res.status, 'bytes', buf.byteLength, ct);
    }
  } catch (e) {
    console.log(url, 'ERR', (e as Error).message);
  }
}
