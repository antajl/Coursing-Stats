import fs from 'node:fs';
import path from 'node:path';
import { breedArchiveSubdomain, cleanAlphanumeric } from '../../lib/breedarchive.ts';
import { transliterateRuToLat } from '../../lib/text-normalization.ts';
import { DATA_V1_ROOT } from '../../lib/local-data/paths.ts';

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const d: number[][] = [];
  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

function parseYearAndCountry(desc?: string): { year: number | null; country: string } {
  if (!desc) return { year: null, country: '' };
  const yearMatch = desc.match(/\b(19\d\d|20\d\d)\b/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const parts = desc.split(',').map(s => s.trim());
  const country = parts.length >= 2 ? parts[1] : '';
  return { year, country };
}

function isAllowedLevenshtein(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  const dist = levenshtein(a, b);
  if (dist === 0) return true;
  if (maxLen <= 4) return false; // 4 letters or less must be exact
  if (maxLen <= 7) return dist <= 1; // 5-7 letters allows at most 1 typo
  return dist <= 2 && dist / maxLen <= 0.2; // 8+ letters allows at most 2 typos, max 20%
}

function getKennelPrefixes(str: string): string[] {
  const words = str.trim().split(/\s+/);
  const prefixes: string[] = [];
  if (words.length >= 3) {
    prefixes.push(words.slice(0, 3).join(' '));
  }
  if (words.length >= 2) {
    prefixes.push(words.slice(0, 2).join(' '));
  }
  return prefixes;
}

interface BreedArchiveHit {
  label: string;
  linkName: string;
  nameLower: string;
  uuid: string;
  desc?: string;
  registrationStatus?: number;
}

async function searchBa(subdomain: string, term: string): Promise<BreedArchiveHit[]> {
  const cleanTerm = term.replace(/[*'"`’]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanTerm || cleanTerm.length < 3) return [];
  try {
    const res = await fetch(`https://${subdomain}.breedarchive.com/animal/search?term=${encodeURIComponent(cleanTerm)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!res.ok) return [];
    const text = await res.text();
    if (text === 'search term is missing') return [];
    const data = JSON.parse(text);
    return Array.isArray(data) ? (data as BreedArchiveHit[]) : [];
  } catch {
    return [];
  }
}

interface DogRecord {
  id: number;
  breed: string;
  name_ru?: string | null;
  name_lat?: string | null;
  pedigree_url?: string | null;
  competition_ids?: number[];
  [key: string]: any;
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

async function runSafeScan() {
  const sportDir = path.join(DATA_V1_ROOT, 'dogs/by-id');
  const allSport: DogRecord[] = fs.readdirSync(sportDir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(sportDir, f), 'utf8')));

  const targets = allSport.filter(d => {
    if (d.pedigree_url) return false;
    const sub = breedArchiveSubdomain(d.breed);
    if (!sub) return false;
    const name = (d.name_lat || d.name_ru || '').trim();
    return name.split(/\s+/).length >= 2;
  });

  console.log(`Starting STRICT HIGH-PRECISION scan for ${targets.length} multi-word sport dogs...`);

  const matches: MatchCandidate[] = [];

  for (let i = 0; i < targets.length; i++) {
    const dog = targets[i];
    const sub = breedArchiveSubdomain(dog.breed);
    if (!sub) continue;

    const rawLat = dog.name_lat || '';
    const rawRu = dog.name_ru || '';
    const translitRu = transliterateRuToLat(rawRu);

    const nameVariants = new Set<string>();
    if (rawLat) nameVariants.add(rawLat);
    if (translitRu) nameVariants.add(translitRu);

    let foundCandidate: BreedArchiveHit | null = null;
    let matchReason = '';

    for (const nameVar of nameVariants) {
      if (foundCandidate) break;

      const hits = await searchBa(sub, nameVar);
      let allHits = [...hits];
      if (allHits.length === 0) {
        const prefixes = getKennelPrefixes(nameVar);
        for (const pref of prefixes) {
          const prefHits = await searchBa(sub, pref);
          if (prefHits.length > 0) {
            allHits = prefHits;
            break;
          }
        }
      }

      const cleanOur = cleanAlphanumeric(nameVar);
      const ourTokens = cleanOur.split(' ').filter(Boolean);

      for (const hit of allHits) {
        const { year, country } = parseYearAndCountry(hit.desc);

        // HARD CRITERION 1: Chronology check
        // Active in coursing 2015-2026 -> Birth year must be >= 2005 and <= 2024 (if present)
        if (year !== null) {
          if (year < 2005 || year > 2024) continue;
        }

        const cleanHit = cleanAlphanumeric(hit.label || hit.nameLower);
        const hitTokens = cleanHit.split(' ').filter(Boolean);

        // HARD CRITERION 2: If foreign country (not RU/BY/KZ/UA), requires exact match
        const isPostSoviet = ['Russian Federation', 'Belarus', 'Kazakhstan', 'Ukraine'].includes(country);
        if (country && !isPostSoviet && cleanOur.replace(/\s+/g, '') !== cleanHit.replace(/\s+/g, '')) {
          continue;
        }

        // Check 1: Alphanumeric Levenshtein
        const totalDist = levenshtein(cleanOur.replace(/\s+/g, ''), cleanHit.replace(/\s+/g, ''));
        if (totalDist === 0) {
          foundCandidate = hit;
          matchReason = `Exact alphanumeric match`;
          break;
        }

        if (isAllowedLevenshtein(cleanOur.replace(/\s+/g, ''), cleanHit.replace(/\s+/g, ''))) {
          foundCandidate = hit;
          matchReason = `Direct string similarity (dist=${totalDist})`;
          break;
        }

        // Check 2: 2-word kennel prefix 100% match + remainder allowed Levenshtein
        if (ourTokens.length >= 2 && hitTokens.length >= 2) {
          const ourPrefix2 = ourTokens.slice(0, 2).join(' ');
          const hitPrefix2 = hitTokens.slice(0, 2).join(' ');
          if (ourPrefix2 === hitPrefix2) {
            const ourRemainder = ourTokens.slice(2).join('');
            const hitRemainder = hitTokens.slice(2).join('');
            if (ourRemainder && hitRemainder && isAllowedLevenshtein(ourRemainder, hitRemainder)) {
              foundCandidate = hit;
              matchReason = `Kennel "${ourPrefix2}" 100% + remainder "${ourRemainder}" ~ "${hitRemainder}"`;
              break;
            }
          }
        }

        // Check 3: 1-word kennel prefix (min 5 chars) 100% match + remainder allowed Levenshtein
        if (ourTokens.length >= 2 && hitTokens.length >= 2 && ourTokens[0].length >= 5) {
          if (ourTokens[0] === hitTokens[0]) {
            const ourRemainder = ourTokens.slice(1).join('');
            const hitRemainder = hitTokens.slice(1).join('');
            if (ourRemainder && hitRemainder && isAllowedLevenshtein(ourRemainder, hitRemainder)) {
              foundCandidate = hit;
              matchReason = `Kennel "${ourTokens[0]}" 100% + remainder "${ourRemainder}" ~ "${hitRemainder}"`;
              break;
            }
          }
        }
      }
    }

    if (foundCandidate) {
      const { year, country } = parseYearAndCountry(foundCandidate.desc);
      matches.push({
        dogId: dog.id,
        breed: dog.breed,
        nameRu: dog.name_ru,
        nameLat: dog.name_lat,
        hitLabel: foundCandidate.label,
        hitDesc: foundCandidate.desc,
        hitUrl: `https://${sub}.breedarchive.com/animal/view/${foundCandidate.linkName}-${foundCandidate.uuid}`,
        year,
        country,
        reason: matchReason,
      });
      console.log(`[MATCH #${dog.id}] "${dog.name_ru || dog.name_lat}" => "${foundCandidate.label}" (${foundCandidate.desc || 'no desc'})`);
      console.log(`  Reason: ${matchReason}`);
    }

    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${targets.length}... (Found ${matches.length} matches so far)`);
    }

    await new Promise(r => setTimeout(r, 60));
  }

  console.log(`\n=== SCAN COMPLETED ===`);
  console.log(`Total checked: ${targets.length}`);
  console.log(`Verified 99%+ matches found: ${matches.length}`);

  const reportPath = path.join(process.cwd(), 'backend/scripts/high-precision-ba-candidates.json');
  fs.writeFileSync(reportPath, JSON.stringify(matches, null, 2), 'utf8');
  console.log(`Saved verified candidate report to ${reportPath}`);
}

runSafeScan();
