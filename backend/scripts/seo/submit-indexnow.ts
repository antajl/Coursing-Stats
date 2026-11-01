/**
 * IndexNow submission script for instant indexing in Yandex and Bing.
 * Specification: https://www.indexnow.org/documentation
 *
 * Usage:
 *   npx tsx backend/scripts/seo/submit-indexnow.ts            # submit core hubs & recent protocols
 *   npx tsx backend/scripts/seo/submit-indexnow.ts --all      # submit all protocols and hubs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');

const HOST = 'coursing-stats.ru';
const KEY = 'c03759a2f3e843e99fa68cf38c4125b0';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

// IndexNow endpoints for Yandex and generic IndexNow API
const ENDPOINTS = [
  'https://yandex.com/indexnow',
  'https://api.indexnow.org/indexnow',
];

const CORE_URLS = [
  `https://${HOST}/`,
  `https://${HOST}/competitions/`,
  `https://${HOST}/competitions/?tab=archive`,
  `https://${HOST}/competitions/?tab=ranking`,
  `https://${HOST}/shows/`,
  `https://${HOST}/speed-records/`,
  `https://${HOST}/donino/championship/`,
  `https://${HOST}/donino/analytics/`,
  `https://${HOST}/guide/`,
  `https://${HOST}/about/`,
  `https://${HOST}/llms.txt`,
  `https://${HOST}/llms-full.txt`,
];

export function collectProtocolUrls(limit?: number): string[] {
  const protocolsDir = path.join(ROOT, 'frontend/public/protocols');
  if (!fs.existsSync(protocolsDir)) return [];

  const files = fs
    .readdirSync(protocolsDir)
    .filter((f) => f.endsWith('.html'))
    .sort((a, b) => b.localeCompare(a)); // newest first

  const selected = limit ? files.slice(0, limit) : files;
  return selected.map((f) => `https://${HOST}/protocols/${f}`);
}

export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  if (urls.length === 0) {
    console.log('No URLs to submit.');
    return true;
  }

  // Max 10,000 URLs per IndexNow request
  const batch = urls.slice(0, 10000);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: batch,
  };

  console.log(`Submitting ${batch.length} URLs to IndexNow...`);

  let anySuccess = false;

  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 200 || response.status === 202) {
        console.log(`  ✓ ${endpoint}: Success (${response.status})`);
        anySuccess = true;
      } else {
        const text = await response.text();
        console.warn(`  ! ${endpoint}: HTTP ${response.status} ${text}`);
      }
    } catch (err) {
      console.warn(`  ! ${endpoint}: network error (${err instanceof Error ? err.message : String(err)})`);
    }
  }

  return anySuccess;
}

async function main() {
  const submitAll = process.argv.includes('--all');
  const protocolUrls = collectProtocolUrls(submitAll ? undefined : 50);

  const allUrls = Array.from(new Set([...CORE_URLS, ...protocolUrls]));

  console.log(`IndexNow: prepared ${allUrls.length} URLs (${CORE_URLS.length} core, ${protocolUrls.length} protocols)`);
  await submitToIndexNow(allUrls);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('IndexNow failed:', err);
    process.exit(1);
  });
}
