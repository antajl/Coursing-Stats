/** Breed Archive (breedarchive.com) — поиск карточек собак по registered name. */

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
  'МАЛИНУА': 'belgianshepherd',
  'БЕРЖЕ ПИКАР': 'bergerpicard',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ': 'borzoi',
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
  'Немецкая овчарка': 'germanshepherd',
  'НЕМЕЦКАЯ КОРОТКОШЕРСТНАЯ ЛЕГАВАЯ': 'germanshorthairedpointer',
  'НЕМЕЦКИЙ ДРАТХААР': 'germanwirehairedpointer',
  'ГРЕЙХАУНД': 'greyhound',
  'ХАВАНЕЗ': 'havanese',
  'ХОККАЙДО': 'hokkaido',
  'ПОДЕНКО ИБИЦЕНКО': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО (К Ш, Г Ш)': 'ibizanhound',
  'ПОДЕНКО ИБИЦЕНКО Г Ш': 'ibizanhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ': 'italiangreyhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'italiangreyhound',
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
};

const breedLookup = new Map<string, string>();
for (const [breed, subdomain] of Object.entries(BREED_SUBDOMAIN)) {
  breedLookup.set(normalizeBreedKey(breed), subdomain);
}

export function normalizeBreedKey(breed: string): string {
  return breed.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function normalizeDogName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function breedArchiveSubdomain(breed: string | null | undefined): string | null {
  if (!breed?.trim()) return null;
  return breedLookup.get(normalizeBreedKey(breed)) ?? null;
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
  const exact = hits.filter(
    (hit) => normalizeDogName(hit.nameLower) === target || normalizeDogName(hit.label) === target,
  );
  if (exact.length === 1) return exact[0]!;
  return null;
}

export async function searchBreedArchive(
  subdomain: string,
  nameLat: string,
  fetchFn: typeof fetch = fetch,
): Promise<BreedArchiveSearchHit[]> {
  const term = nameLat.trim();
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
  fetchFn: typeof fetch = fetch,
): Promise<string | null> {
  if (!nameLat?.trim()) return null;
  const subdomain = breedArchiveSubdomain(breed);
  if (!subdomain) return null;

  const hits = await searchBreedArchive(subdomain, nameLat, fetchFn);
  const exact = pickExactBreedArchiveHit(hits, nameLat);
  return exact ? buildBreedArchiveProfileUrl(subdomain, exact) : null;
}
