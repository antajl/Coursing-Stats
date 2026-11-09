import fs from 'node:fs';
import path from 'node:path';
import { DATA_V1_ROOT } from '../../lib/local-data/paths.ts';

function unescapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .trim();
}

function safeWrite(filePath: string, content: string) {
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const tmp = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp, content, 'utf8');
      fs.copyFileSync(tmp, filePath);
      try { fs.unlinkSync(tmp); } catch {}
      return;
    } catch {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
    }
  }
}

interface MatchCandidate {
  dogId: number;
  breed: string;
  nameRu?: string | null;
  nameLat?: string | null;
  hitLabel: string;
  hitDesc?: string;
  hitUrl: string;
  year?: number | null;
  country?: string;
  reason: string;
}

interface CachedDetail {
  sex: 'M' | 'F' | null;
  photo_url: string | null;
  fetched_at: string;
}

const REPORT_PATH = path.join(process.cwd(), 'backend/scripts/high-precision-ba-candidates.json');
const CACHE_PATH = path.join(process.cwd(), 'backend/scripts/breedarchive-details-cache.json');
const DOGS_DIR = path.join(DATA_V1_ROOT, 'dogs/by-id');
const KEYS_DIR = path.join(DATA_V1_ROOT, 'dogs/by-key');

async function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error(`Report file not found: ${REPORT_PATH}`);
    process.exit(1);
  }

  const candidates: MatchCandidate[] = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  console.log(`Loaded ${candidates.length} candidates from report.`);

  let cache: Record<string, CachedDetail> = {};
  if (fs.existsSync(CACHE_PATH)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    } catch {}
  }

  // Fetch missing photos and sex in batches of 15
  console.log(`Fetching details (photos, sex, canonical titles) from Breed Archive...`);
  const BATCH_SIZE = 15;
  const enrichedDetails = new Map<string, { sex: 'M' | 'F' | null; photo_url: string | null; ogTitle: string | null }>();

  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (c) => {
      let cached = cache[c.hitUrl];
      let ogTitle = c.hitLabel;

      if (!cached) {
        try {
          const res = await fetch(c.hitUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          });
          if (res.ok) {
            const html = await res.text();
            const sexMatch = html.match(/\\"sex\\":\s*([0-2])/);
            const sex: 'M' | 'F' | null = sexMatch ? (sexMatch[1] === '1' ? 'M' : sexMatch[1] === '2' ? 'F' : null) : null;
            const ogImage = html.match(/content="([^"]*photo\/download[^"]*)"/);
            const photo_url = ogImage ? ogImage[1] : null;
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
            if (titleMatch) ogTitle = titleMatch[1];

            cached = { sex, photo_url, fetched_at: new Date().toISOString() };
            cache[c.hitUrl] = cached;
          }
        } catch {}
      }

      enrichedDetails.set(c.hitUrl, {
        sex: cached?.sex || null,
        photo_url: cached?.photo_url || null,
        ogTitle: unescapeHtml(ogTitle || c.hitLabel),
      });
    }));

    if ((i + BATCH_SIZE) % 60 === 0 || i + BATCH_SIZE >= candidates.length) {
      console.log(`  Fetched ${Math.min(i + BATCH_SIZE, candidates.length)}/${candidates.length}...`);
    }
    await new Promise(r => setTimeout(r, 100));
  }

  safeWrite(CACHE_PATH, JSON.stringify(cache, null, 2) + '\n');
  console.log(`Saved updated details cache.`);

  // Apply to dog files
  let updatedById = 0;
  let updatedByKey = 0;
  let addedPhotos = 0;

  for (const c of candidates) {
    const idPath = path.join(DOGS_DIR, `${c.dogId}.json`);
    if (!fs.existsSync(idPath)) {
      console.warn(`File not found: ${idPath}`);
      continue;
    }

    const dog = JSON.parse(fs.readFileSync(idPath, 'utf8'));
    const details = enrichedDetails.get(c.hitUrl);
    const cleanLatinName = unescapeHtml(details?.ogTitle || c.hitLabel).toUpperCase();

    // Preserve Russian name
    if (!dog.name_ru || dog.name_ru.trim() === '') {
      if (/[\u0400-\u04FF]/.test(dog.name_lat || '')) {
        dog.name_ru = dog.name_lat;
      }
    }

    dog.name_lat = cleanLatinName;
    dog.pedigree_url = c.hitUrl;

    if (details?.photo_url && !dog.photo_url) {
      dog.photo_url = details.photo_url;
      addedPhotos++;
    }

    if (details?.sex && (!dog.sex || dog.sex.trim() === '')) {
      dog.sex = details.sex === 'M' ? 'Кобель' : 'Сука';
    }

    safeWrite(idPath, JSON.stringify(dog, null, 2) + '\n');
    updatedById++;

    if (dog.dog_key) {
      const keyPath = path.join(KEYS_DIR, `${dog.dog_key}.json`);
      if (fs.existsSync(keyPath)) {
        const keyDog = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        keyDog.name_lat = dog.name_lat;
        keyDog.name_ru = dog.name_ru;
        keyDog.pedigree_url = dog.pedigree_url;
        if (dog.photo_url) keyDog.photo_url = dog.photo_url;
        if (dog.sex) keyDog.sex = dog.sex;
        safeWrite(keyPath, JSON.stringify(keyDog, null, 2) + '\n');
        updatedByKey++;
      }
    }
  }

  console.log(`\nSuccessfully applied Breed Archive links and metadata:`);
  console.log(`  Updated dogs in dogs/by-id: ${updatedById} files`);
  console.log(`  Updated dogs in dogs/by-key: ${updatedByKey} files`);
  console.log(`  Added new photos: ${addedPhotos}`);
}

main();
