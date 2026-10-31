/**
 * Полное сканирование всех собак базы на наличие профилей в Breed Archive.
 *
 * Usage:
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts
 *   npx tsx backend/scripts/enrich/scan-all-breedarchive.ts --apply
 */
import fs from 'node:fs';
import path from 'node:path';
import { DATA_V1_ROOT } from '../../lib/local-data/paths.ts';
import { transliterateRuToLat } from '../../lib/text-normalization.ts';

const DOGS_DIR = path.join(DATA_V1_ROOT, 'dogs/by-id');
const DOGS_KEY_DIR = path.join(DATA_V1_ROOT, 'dogs/by-key');
const REPORT_FILE = 'backend/scripts/breedarchive-scan-results.json';

const DELAY_MS = 120;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 73 verified real Breed Archive subdomains:
const VALID_SUBS = new Set([
  'americanhairlessterrier', 'americanwaterspaniel', 'azawakh', 'bedlingtonterrier',
  'belgianshepherd', 'bergerpicard', 'bordercollie', 'borzoi', 'bostonterrier',
  'boxer', 'cardiganwelshcorgi', 'ceskyterrier', 'chartpolski', 'chihuahua',
  'cirneco', 'collie', 'curlycoatedretriever', 'deerhound', 'finnishlapphund',
  'frenchbulldog', 'galgoespanol', 'gbgv', 'germanshepherd',
  'germanshorthairedpointer', 'germanwirehairedpointer', 'greyhound', 'havanese',
  'hokkaido', 'ibizanhound', 'italiangreyhound', 'japanesechin',
  'kingcharlesspaniel', 'kromfohrlaender', 'labradorretriever', 'lagotto',
  'lowchen', 'magyaragar', 'maltese', 'manchesterterrier',
  'miniatureamericanshepherd', 'miniaturepinscher', 'mudi', 'norrbottenspets',
  'norwegianbuhund', 'nsdtr', 'papillon', 'parsonrussellterrier', 'pbgv',
  'pekingese', 'pembrokewelshcorgi', 'peruvianhairless', 'pharaohhound',
  'podengoportugues', 'pomeranian', 'portuguesewaterdog', 'ratterrier',
  'rottweiler', 'russiantoy', 'saluki', 'schapendoes', 'sheltie',
  'siberianhusky', 'silkenwindsprite', 'sloughi', 'smoothfoxterrier',
  'sussexspaniel', 'swedishlapphund', 'tibetanmastiff', 'tibetanterrier',
  'welshspringerspaniel', 'whippet', 'wirefoxterrier', 'xolo'
]);

const BREED_MAP: Record<string, string> = {
  'РУССКАЯ ПСОВАЯ БОРЗАЯ': 'borzoi',
  'УИППЕТ': 'whippet',
  'САЛЮКИ': 'saluki',
  'ФАРАОНОВА СОБАКА': 'pharaohhound',
  'ЧИРНЕКО ДЕЛЬ ЭТНА': 'cirneco',
  'ГРЕЙХАУНД': 'greyhound',
  'ЛЕВРЕТКА': 'italiangreyhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ': 'italiangreyhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'italiangreyhound',
  'ПОДЕНКО ИБИЦЕНКО': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО (К Ш, Г Ш)': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО Г Ш': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО К/Ш': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО (К-Ш, Г-Ш)': 'ibizanhound',
  'ИСПАНСКИЙ ГАЛЬГО': 'galgoespanol',
  'ИСПАНСКАЯ БОРЗАЯ (ГАЛЬГО)': 'galgoespanol',
  'ГАЛЬГО': 'galgoespanol',
  'СЛЮГИ': 'sloughi',
  'ДИРХАУНД': 'deerhound',
  'ДИРХАУНД (ШОТЛАНДСКАЯ БОРЗАЯ)': 'deerhound',
  'АЗАВАК': 'azawakh',
  'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН': 'papillon',
  'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ': 'papillon',
  'ПАПИЙОН': 'papillon',
  'НЕМЕЦКАЯ ОВЧАРКА': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА (СТАНДАРТНАЯ)': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА (К/Ш)': 'germanshepherd',
  'НЕMEЦКАЯ ОВЧАРКА ДЛИННОШЕРСТНАЯ': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА К Ш': 'germanshepherd',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА': 'belgianshepherd',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА (МАЛИНУА)': 'belgianshepherd',
  'МАЛИНУА': 'belgianshepherd',
  'КСОЛОИТЦКУИНТЛИ (МЕКСИКАНСКАЯ ГОЛАЯ СОБАКА) СТАНДАРТ': 'xolo',
  'КСОЛОИТЦКУИНТЛИ СТАНДАРТ': 'xolo',
  'КСОЛОИТЦКУИНТЛИ МЕДИО': 'xolo',
  'КСОЛОИТЦКУИНТЛИ СТАНДАРТНЫЙ': 'xolo',
  'ЦВЕРГПИНЧЕР': 'miniaturepinscher',
  'НЕМЕЦКИЙ ПИНЧЕР': 'miniaturepinscher',
  'СИБИРСКИЙ ХАСКИ': 'siberianhusky',
  'БОРДЕР КОЛЛИ': 'bordercollie',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР': 'americanhairlessterrier',
  'БЕДЛИНГТОН ТЕРЬЕР': 'bedlingtonterrier',
  'ЛАБРАДОР РЕТРИВЕР': 'labradorretriever',
  'РОТВЕЙЛЕР': 'rottweiler',
  'ВЕЛЬШ КОРГИ ПЕМБРОК': 'pembrokewelshcorgi',
  'ВЕЛЬШ КОРГИ КАРДИГАН': 'cardiganwelshcorgi',
  'ГЛАДКОШЕРСТНЫЙ ФОКСТЕРЬЕР': 'smoothfoxterrier',
  'ФОКС-ТЕРЬЕР ГЛАДКОШЕРСТНЫЙ': 'smoothfoxterrier',
  'ЖЕСТКОШЕРСТНЫЙ ФОКСТЕРЬЕР': 'wirefoxterrier',
  'РУССКИЙ ТОЙ': 'russiantoy',
  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ': 'germanshorthairedpointer',
  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (КУРЦХААР)': 'germanshorthairedpointer',
  'НЕМЕЦКИЙ ДРАТХААР': 'germanwirehairedpointer',
  'ВЕНГЕРСКАЯ БОРЗАЯ': 'magyaragar',
  'СИЛКЕН ВИНДСПРАЙТ': 'silkenwindsprite',
  'ЧАРТ': 'chartpolski',
  'БОСТОН-ТЕРЬЕР': 'bostonterrier',
  'БОКСЕР': 'boxer',
  'ЧЕШСКИЙ ТЕРЬЕР': 'ceskyterrier',
  'ЦЕСКИЙ ТЕРЬЕР': 'ceskyterrier',
  'ЧИХУАХУА': 'chihuahua',
  'КОЛЛИ': 'collie',
  'ШЕЛТИ': 'sheltie',
};

function getArchiveSubdomain(breed: string | null | undefined): string | null {
  if (!breed?.trim()) return null;
  const k = breed.trim().replace(/\s+/g, ' ').toUpperCase();
  const sub = BREED_MAP[k];
  if (sub && VALID_SUBS.has(sub)) return sub;
  return null;
}

function cleanPunctuation(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`"„“«»]/g, '')
    .replace(/[-–—/\\._]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchBreedArchiveHits(
  hits: Array<{ label: string; linkName: string; uuid: string; nameLower: string }>,
  targetName: string,
): { hit: any; matchType: 'exact' | 'punctuation' } | null {
  const targetClean = cleanPunctuation(targetName);
  if (!targetClean) return null;

  // 1. Strict exact match
  const exact = hits.filter(
    (h) =>
      h.nameLower?.trim().toLowerCase() === targetName.trim().toLowerCase() ||
      h.label?.trim().toLowerCase() === targetName.trim().toLowerCase(),
  );
  if (exact.length === 1) return { hit: exact[0], matchType: 'exact' };

  // 2. Punctuation & diacritics cleaned match
  const cleanMatches = hits.filter(
    (h) =>
      cleanPunctuation(h.nameLower || '') === targetClean ||
      cleanPunctuation(h.label || '') === targetClean,
  );
  if (cleanMatches.length === 1) return { hit: cleanMatches[0], matchType: 'punctuation' };

  return null;
}

async function searchArchive(subdomain: string, term: string): Promise<any[]> {
  const url = `https://${subdomain}.breedarchive.com/animal/search?term=${encodeURIComponent(term)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'manual',
        headers: { Accept: 'application/json' },
      });
      if (res.status === 429) {
        await sleep(2000 * (attempt + 1));
        continue;
      }
      if (res.status !== 200) return [];
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('json')) return [];
      const text = await res.text();
      if (!text || text === 'search term is missing') return [];
      const data = JSON.parse(text);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      if (attempt === 2) return [];
      await sleep(1000 * (attempt + 1));
    }
  }
  return [];
}

async function main() {
  const apply = process.argv.includes('--apply');
  console.log(`Breed Archive Scanner — Mode: ${apply ? 'APPLY (writing URLs to dog profiles)' : 'DRY-RUN (audit only)'}`);

  const files = fs
    .readdirSync(DOGS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => Number(a.replace('.json', '')) - Number(b.replace('.json', '')));

  const queue: Array<{ file: string; dog: any; sub: string }> = [];
  let alreadyHasPedigree = 0;
  let unsupportedBreed = 0;

  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(DOGS_DIR, f), 'utf8'));
    if (d.pedigree_url) {
      alreadyHasPedigree++;
      continue;
    }
    const sub = getArchiveSubdomain(d.breed);
    if (!sub) {
      unsupportedBreed++;
      continue;
    }
    if (!d.name_lat?.trim() && !d.name_ru?.trim()) {
      continue;
    }
    queue.push({ file: f, dog: d, sub });
  }

  console.log(`Total dogs in DB: ${files.length}`);
  console.log(`Already have verified pedigree_url: ${alreadyHasPedigree}`);
  console.log(`Breeds not hosted on Breed Archive: ${unsupportedBreed}`);
  console.log(`Dogs to search in Breed Archive: ${queue.length}\n`);

  const results: any[] = [];
  let matchedCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const { file, dog, sub } = queue[i];
    let target = dog.name_lat?.trim() || '';
    const isCyr = (target.match(/[\u0400-\u04FF]/g) || []).length > (target.match(/[a-zA-Z]/g) || []).length;
    if (!target || isCyr) {
      if (dog.name_ru?.trim()) target = transliterateRuToLat(dog.name_ru.trim());
    }

    if (!target) continue;

    let hits = await searchArchive(sub, target);
    let match = matchBreedArchiveHits(hits, target);

    if (!match && dog.name_ru?.trim()) {
      const translit = transliterateRuToLat(dog.name_ru.trim());
      if (cleanPunctuation(translit) !== cleanPunctuation(target)) {
        const translitHits = await searchArchive(sub, translit);
        match = matchBreedArchiveHits(translitHits, translit);
      }
    }

    if (match) {
      matchedCount++;
      const url = `https://${sub}.breedarchive.com/animal/view/${match.hit.linkName}-${match.hit.uuid}`;
      results.push({
        dogId: dog.id,
        dogKey: dog.dog_key,
        breed: dog.breed,
        name_lat: dog.name_lat,
        name_ru: dog.name_ru,
        matchedName: match.hit.label,
        matchType: match.matchType,
        url,
      });

      console.log(`✓ [${dog.id}] ${dog.breed} | ${dog.name_lat || dog.name_ru} -> ${match.hit.label} (${match.matchType})`);

      if (apply) {
        dog.pedigree_url = url;
        const filePath = path.join(DOGS_DIR, file);
        fs.writeFileSync(filePath, `${JSON.stringify(dog)}\n`, 'utf8');
        if (dog.dog_key) {
          const keyPath = path.join(DOGS_KEY_DIR, `${dog.dog_key}.json`);
          if (fs.existsSync(keyPath)) {
            fs.writeFileSync(keyPath, `${JSON.stringify(dog)}\n`, 'utf8');
          }
        }
      }
    }

    if ((i + 1) % 50 === 0 || i === queue.length - 1) {
      console.log(`Progress: ${i + 1} / ${queue.length} dogs checked (${matchedCount} matches so far)`);
      fs.writeFileSync(REPORT_FILE, JSON.stringify({
        totalChecked: i + 1,
        totalQueue: queue.length,
        matchedCount,
        results,
      }, null, 2), 'utf8');
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n=== SCAN COMPLETED ===`);
  console.log(`Total dogs searched: ${queue.length}`);
  console.log(`New matches found: ${matchedCount}`);
  if (apply) {
    console.log(`Updated all ${matchedCount} dog files in ${DOGS_DIR} and ${DOGS_KEY_DIR}.`);
    console.log(`Remember to run: npm run build-all-data`);
  }
}

main().catch(console.error);
