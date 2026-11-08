/** Breed Archive (breedarchive.com) — поиск карточек собак по registered name. */
import { canonicalBreed } from '../src/lib/breed-mapping.ts';
import { transliterateRuToLat } from './text-normalization.ts';

export interface BreedArchiveSearchHit {
  label: string;
  linkName: string;
  uuid: string;
  nameLower: string;
  desc?: string;
  registrationStatus?: number;
}

const BREED_SUBDOMAIN: Record<string, string> = {
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР': 'americanhairlessterrier',
  'АМЕРИКАНСКИЙ ВОДЯНОЙ СПАНИЕЛЬ': 'americanwaterspaniel',
  'АЗАВАК': 'azawakh',
  'БЕДЛИНГТОН ТЕРЬЕР': 'bedlingtonterrier',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА': 'belgianshepherd',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА (МАЛИНУА)': 'belgianshepherd',
  'МАЛИНУА': 'belgianshepherd',
  'БЕРЖЕ ПИКАР': 'bergerpicard',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ': 'borzoi',
  'БОРДЕР КОЛЛИ': 'bordercollie',
  'БОСТОН-ТЕРЬЕР': 'bostonterrier',
  'БОКСЕР': 'boxer',
  'ВЕЛЬШ КОРГИ КАРДИГАН': 'cardiganwelshcorgi',
  'ЧЕШСКИЙ ТЕРЬЕР': 'ceskyterrier',
  'ЦЕСКИЙ ТЕРЬЕР': 'ceskyterrier',
  'ЧАРТ': 'chartpolski',
  'ЧИХУАХУА': 'chihuahua',
  'ЧИРНЕКО ДЕЛЬ ЭТНА': 'cirneco',
  'Чирнеко дель-Этна': 'cirneco',
  'КОЛЛИ': 'collie',
  'КЁРЛИ-КОУТЕД РЕТРИВЕР': 'curlycoatedretriever',
  'ДИРХАУНД': 'deerhound',
  'ДИРХАУНД (ШОТЛАНДСКАЯ БОРЗАЯ)': 'deerhound',
  'ФИНСКАЯ ЛАППЕНДХУНД': 'finnishlapphund',
  'ФРАНЦУЗСКИЙ БУЛЬДОГ': 'frenchbulldog',
  'ГАЛЬГО': 'galgoespanol',
  'Гальго': 'galgoespanol',
  'ИСПАНСКАЯ БОРЗАЯ (ГАЛЬГО)': 'galgoespanol',
  'ИСПАНСКИЙ ГАЛЬГО': 'galgoespanol',
  'БАССЕТ ГРИФФОН ВЕНДЕЕН': 'gbgv',
  'НЕМЕЦКАЯ ОВЧАРКА': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА (СТАНДАРТНАЯ)': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА К Ш': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ': 'germanshepherd',
  'НЕМЕЦКАЯ ОВЧАРКА (К/Ш)': 'germanshepherd',
  'НЕMEЦКАЯ ОВЧАРКА ДЛИННОШЕРСТНАЯ': 'germanshepherd',
  'Немецкая овчарка': 'germanshepherd',
  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ': 'germanshorthairedpointer',
  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ (КУРЦХААР)': 'germanshorthairedpointer',
  'НЕМЕЦКИЙ ДРАТХААР': 'germanwirehairedpointer',
  'ГРЕЙХАУНД': 'greyhound',
  'ХАВАНЕЗ': 'havanese',
  'ХОККАЙДО': 'hokkaido',
  'ПОДЕНКО ИБИЦЕНКО': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО (К Ш, Г Ш)': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО (К-Ш, Г-Ш)': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО Г Ш': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО К/Ш': 'ibizanhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ': 'italiangreyhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'italiangreyhound',
  'ЛЕВРЕТКА': 'italiangreyhound',
  'Левретка': 'italiangreyhound',
  'ЯПОНСКИЙ ХИН': 'japanesechin',
  'КИНГ ЧАРЛЬЗ СПАНИЕЛЬ': 'kingcharlesspaniel',
  'КРОМФОРЛАНДЕР': 'kromfohrlaender',
  'ЛАБРАДОР РЕТРИВЕР': 'labradorretriever',
  'ЛАГОТТО': 'lagotto',
  'ЛЁВЧЕН': 'lowchen',
  'ВЕНГЕРСКАЯ БОРЗАЯ': 'magyaragar',
  'МАЛЬТЕЗЕ': 'maltese',
  'МАНЧЕСТЕРСКИЙ ТЕРЬЕР': 'manchesterterrier',
  'МИНИАТЮРНАЯ АМЕРИКАНСКАЯ ОВЧАРКА': 'miniatureamericanshepherd',
  'НЕМЕЦКИЙ ПИНЧЕР': 'miniaturepinscher',
  'ЦВЕРГПИНЧЕР': 'miniaturepinscher',
  'МУДИ': 'mudi',
  'НОРБОТТЕНСПЕТС': 'norrbottenspets',
  'НОРВЕЖСКИЙ БУХУНД': 'norwegianbuhund',
  'НОВОШОТЛАНДСКИЙ РЕТРИВЕР': 'nsdtr',
  'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН': 'papillon',
  'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ': 'papillon',
  'ПАПИЙОН': 'papillon',
  'ПАРСОН РАССЕЛ ТЕРЬЕР': 'parsonrussellterrier',
  'ПБГВ': 'pbgv',
  'ПЕКИНЕС': 'pekingese',
  'ВЕЛЬШ КОРГИ ПЕМБРОК': 'pembrokewelshcorgi',
  'ПЕРУАНСКАЯ ГОЛАЯ СОБАКА': 'peruvianhairless',
  'ФАРАОНОВА СОБАКА': 'pharaohhound',
  'Фараонова собака': 'pharaohhound',
  'ПОДЕНГО ПОРТУГАЛЬСКИЙ': 'podengoportugues',
  'ПОМЕРАНСКИЙ ШПИЦ': 'pomeranian',
  'ПОРТУГАЛЬСКАЯ ВОДЯНАЯ СОБАКА': 'portuguesewaterdog',
  'РЭТ-ТЕРЬЕР': 'ratterrier',
  'РОТВЕЙЛЕР': 'rottweiler',
  'РУССКИЙ ТОЙ': 'russiantoy',
  'САЛЮКИ': 'saluki',
  'Салюки': 'saluki',
  'ШАПЕНДУА': 'schapendoes',
  'ШЕЛТИ': 'sheltie',
  'СИБИРСКИЙ ХАСКИ': 'siberianhusky',
  'СИЛКЕН ВИНДСПРАЙТ': 'silkenwindsprite',
  'СЛЮГИ': 'sloughi',
  'ГЛАДКОШЕРСТНЫЙ ФОКСТЕРЬЕР': 'smoothfoxterrier',
  'ФОКС-ТЕРЬЕР ГЛАДКОШЕРСТНЫЙ': 'smoothfoxterrier',
  'САССЕКС-СПАНИЕЛЬ': 'sussexspaniel',
  'ШВЕДСКАЯ ЛАППЕНДХУНД': 'swedishlapphund',
  'ТИБЕТСКИЙ МАСТИФ': 'tibetanmastiff',
  'ТИБЕТСКИЙ ТЕРЬЕР': 'tibetanterrier',
  'ВЕЛЬШ СПРИНГЕР СПАНИЕЛЬ': 'welshspringerspaniel',
  'УИППЕТ': 'whippet',
  'Уиппет': 'whippet',
  'ЖЕСТКОШЕРСТНЫЙ ФОКСТЕРЬЕР': 'wirefoxterrier',
  'КСОЛОИТЦКУИНТЛИ (МЕКСИКАНСКАЯ ГОЛАЯ СОБАКА) СТАНДАРТ': 'xolo',
  'КСОЛОИТЦКУИНТЛИ СТАНДАРТ': 'xolo',
  'КСОЛОИТЦКУИНТЛИ МЕДИО': 'xolo',
  'КСОЛОИТЦКУИНТЛИ СТАНДАРТНЫЙ': 'xolo',
};

const breedLookup = new Map<string, string>();
for (const [breed, subdomain] of Object.entries(BREED_SUBDOMAIN)) {
  breedLookup.set(normalizeBreedKey(breed), subdomain);
}

export function normalizeBreedKey(breed: string): string {
  return breed
    .normalize('NFKC')
    .trim()
    .replace(/[\u2018\u2019\u201A\u201B`']/g, ' ')
    .replace(/[-–—/\\._]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function normalizeDogName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function cleanPunctuation(str: string): string {
  return stripDiacritics(str)
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B`']/g, "'")
    .replace(/[\u2013\u2014\-]/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanAlphanumeric(str: string): string {
  return cleanPunctuation(str).replace(/[^a-z0-9]/g, '');
}

export function breedArchiveSubdomain(breed: string | null | undefined): string | null {
  if (!breed?.trim()) return null;
  const direct = breedLookup.get(normalizeBreedKey(breed));
  if (direct) return direct;
  try {
    const canon = canonicalBreed(breed);
    if (canon && canon !== breed) {
      return breedLookup.get(normalizeBreedKey(canon)) ?? null;
    }
  } catch {}
  return null;
}

export function buildBreedArchiveProfileUrl(subdomain: string, hit: BreedArchiveSearchHit): string {
  return `https://${subdomain}.breedarchive.com/animal/view/${hit.linkName}-${hit.uuid}`;
}

export function pickExactBreedArchiveHit(
  hits: BreedArchiveSearchHit[],
  nameLat: string,
): BreedArchiveSearchHit | null {
  const target = normalizeDogName(nameLat);
  if (!target) return null;

  // 1. Exact match
  const exact = hits.filter(
    (hit) => normalizeDogName(hit.nameLower) === target || normalizeDogName(hit.label) === target,
  );
  if (exact.length === 1) return exact[0]!;

  // 2. Diacritics-insensitive match (e.g. Dévaj -> devaj)
  const targetClean = stripDiacritics(target);
  const diacriticMatches = hits.filter(
    (hit) =>
      stripDiacritics(normalizeDogName(hit.nameLower)) === targetClean ||
      stripDiacritics(normalizeDogName(hit.label)) === targetClean,
  );
  if (diacriticMatches.length === 1) return diacriticMatches[0]!;

  // 3. Punctuation & apostrophe agnostic match (e.g. London’s vs London's, Borzie-Senavian vs Borzie Senavian)
  const targetPunct = cleanPunctuation(target);
  if (targetPunct) {
    const punctMatches = hits.filter(
      (hit) =>
        cleanPunctuation(hit.nameLower) === targetPunct ||
        cleanPunctuation(hit.label) === targetPunct,
    );
    if (punctMatches.length === 1) return punctMatches[0]!;
  }

  // 4. Compressed alphanumeric match (e.g. Alansari's vs Alansaris)
  const targetAlpha = cleanAlphanumeric(target);
  if (targetAlpha.length >= 4) {
    const alphaMatches = hits.filter(
      (hit) =>
        cleanAlphanumeric(hit.nameLower) === targetAlpha ||
        cleanAlphanumeric(hit.label) === targetAlpha,
    );
    if (alphaMatches.length === 1) return alphaMatches[0]!;
  }

  return null;
}

export async function searchBreedArchive(
  subdomain: string,
  nameLat: string,
  fetchFn: typeof fetch = fetch,
): Promise<BreedArchiveSearchHit[]> {
  let term = nameLat
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201A\u201B`]/g, "'")
    .replace(/["“”«»]/g, '')
    .trim();
  if (!term) return [];

  const url = `https://${subdomain}.breedarchive.com/animal/search?term=${encodeURIComponent(term)}`;
  const response = await fetchFn(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Breed Archive search failed (${response.status}) for ${subdomain}: ${term}`);
  }

  const text = await response.text();
  if (text === 'search term is missing') return [];

  const data = JSON.parse(text) as unknown;
  if (!Array.isArray(data)) return [];
  return data as BreedArchiveSearchHit[];
}

export async function resolveBreedArchiveUrl(
  breed: string | null | undefined,
  nameLat: string | null | undefined,
  nameRuOrFetch?: string | null | typeof fetch,
  fetchFnArg?: typeof fetch,
): Promise<string | null> {
  const nameRu = typeof nameRuOrFetch === 'string' ? nameRuOrFetch : null;
  const fetchFn = typeof nameRuOrFetch === 'function' ? nameRuOrFetch : (fetchFnArg || fetch);

  const subdomain = breedArchiveSubdomain(breed);
  if (!subdomain) return null;

  // 1. Try search with nameLat (if available and not purely Cyrillic)
  const candidateName = nameLat?.trim() || '';
  const cyrCount = (candidateName.match(/[\u0400-\u04FF]/g) || []).length;
  const latCount = (candidateName.match(/[a-zA-Z]/g) || []).length;
  if (candidateName && latCount >= cyrCount) {
    try {
      const hits = await searchBreedArchive(subdomain, candidateName, fetchFn);
      const exact = pickExactBreedArchiveHit(hits, candidateName);
      if (exact) return buildBreedArchiveProfileUrl(subdomain, exact);
    } catch {}
  }

  // 2. Fallback to transliterated nameRu (or transliterated nameLat if it was Cyrillic)
  const ruSource = nameRu?.trim() || (cyrCount > latCount ? candidateName : '');
  if (ruSource) {
    const translit = transliterateRuToLat(ruSource);
    if (translit && cleanAlphanumeric(translit) !== cleanAlphanumeric(candidateName)) {
      try {
        const hits = await searchBreedArchive(subdomain, translit, fetchFn);
        const exact = pickExactBreedArchiveHit(hits, translit);
        if (exact) return buildBreedArchiveProfileUrl(subdomain, exact);
      } catch {}
    }
  }

  return null;
}
