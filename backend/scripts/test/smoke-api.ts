/**
 * Smoke-тест API (требует запущенный Worker: npm run dev или wrangler dev).
 * Запуск: npx tsx backend/scripts/test/smoke-api.ts [baseUrl]
 */
const BASE = process.argv[2] ?? 'http://127.0.0.1:8787';

async function check(path: string, assert: (data: unknown, status: number) => void) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  assert(data, res.status);
  console.log(`✓ ${path}`);
}

async function main() {
  console.log(`Smoke API @ ${BASE}\n`);

  await check('/api/breeds', (data, status) => {
    if (status !== 200) throw new Error(`status ${status}`);
    if (!(data as { success?: boolean }).success) throw new Error('success false');
  });

  await check('/api/years', (data, status) => {
    if (status !== 200) throw new Error(`status ${status}`);
  });

  await check('/api/competitions', (data, status) => {
    if (status !== 200) throw new Error(`status ${status}`);
  });

  const adminRes = await fetch(`${BASE}/api/recreate-views`, { method: 'POST' });
  const adminData = await adminRes.json();
  if (adminRes.status !== 401) {
    throw new Error(`expected 401 for admin without token, got ${adminRes.status}`);
  }
  console.log('✓ POST /api/recreate-views → 401 без токена');

  console.log('\nOK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
