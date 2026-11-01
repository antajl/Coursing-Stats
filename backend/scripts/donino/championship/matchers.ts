import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../../..');

export function parseLeague(breedClass?: string | null): 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры' {
  if (!breedClass) return 'Прогресс';
  const lower = breedClass.toLowerCase();
  if (lower.includes('юниор')) return 'Юниоры';
  if (lower.includes('абсолют')) return 'Абсолют';
  if (lower.includes('чемпион')) return 'Чемпионов';
  return 'Прогресс';
}

export function cleanDogNameFields(
  rawRu?: string | null,
  rawLat?: string | null,
  dogId?: number | null
): { name: string; name_ru: string; name_lat: string } {
  let ru = (rawRu || '').trim();
  let lat = (rawLat || '').trim();

  // Проверяем официальный профиль собаки по dog_id
  if (dogId) {
    const profilePath = path.join(ROOT, 'data/v1/dogs/by-id', `${dogId}.json`);
    if (fs.existsSync(profilePath)) {
      try {
        const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        if (profile.name_ru && /[а-яё]/i.test(profile.name_ru)) {
          let pRu = profile.name_ru.trim();
          if (pRu.includes('/')) {
            const parts = pRu.split('/').map((s: string) => s.trim());
            pRu = parts.find((p: string) => /[а-яё]/i.test(p)) || pRu;
          }
          ru = pRu;
        }
        if (profile.name_lat && /[a-z]/i.test(profile.name_lat)) {
          let pLat = profile.name_lat.trim();
          if (pLat.includes('/')) {
            const parts = pLat.split('/').map((s: string) => s.trim());
            pLat = parts.find((p: string) => /[a-z]/i.test(p)) || pLat;
          }
          lat = pLat;
        }
      } catch {
        // ignore
      }
    }
  }

  // Обрабатываем слеши в строках
  for (const candidate of [ru, lat]) {
    if (candidate && candidate.includes('/')) {
      const parts = candidate.split('/').map((s) => s.trim()).filter(Boolean);
      const ruPart = parts.find((p) => /[а-яё]/i.test(p));
      const latPart = parts.find((p) => /[a-z]/i.test(p));
      if (ruPart) ru = ruPart;
      if (latPart) lat = latPart;
    }
  }

  // Приоритет русской клички: если есть кириллическая кличка, она всегда name и name_ru!
  const hasCyr = /[а-яё]/i.test(ru);
  const name = hasCyr ? ru : (ru || lat || 'Неизвестная собака');
  return {
    name,
    name_ru: ru || name,
    name_lat: lat || name,
  };
}

export const BREED_SYNONYMS: Record<string, string> = {
  'ЛЕВРЕТКА': 'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ',
  'РПБ': 'РУССКАЯ ПСОВАЯ БОРЗАЯ',
  'АПБТ': 'БЕЗ ПОРОДЫ',
  'АСТ': 'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
};

export function normalizeNameForMatch(s?: string | null): string {
  return (s || '')
    .toUpperCase()
    .replace(/['’`"«»]/g, '')
    .replace(/Ё/g, 'Е')
    .replace(/[-–—/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeBreedForMatch(b?: string | null): string {
  const nb = normalizeNameForMatch(b);
  return BREED_SYNONYMS[nb] || nb;
}

export function getDogKey(dog_id: number | null | undefined, name: string, breed: string): string {
  if (dog_id) return `dog::${dog_id}`;
  return `${breed.trim().toLowerCase()}::${name.trim().toLowerCase()}`;
}

export function findStagePointEntry(
  dogName: string,
  breed: string,
  nameRu?: string,
  nameLat?: string,
  stageList?: any[]
): any {
  if (!stageList || !stageList.length) return null;
  const n = normalizeNameForMatch(dogName);
  const nRu = normalizeNameForMatch(nameRu);
  const nLat = normalizeNameForMatch(nameLat);
  const b = normalizeBreedForMatch(breed);

  const candidates = stageList.filter((item: any) => {
    const iname = normalizeNameForMatch(item.dog_name);
    return (
      iname === n || iname === nRu || iname === nLat ||
      iname.includes(n) || n.includes(iname) ||
      (nRu && (iname.includes(nRu) || nRu.includes(iname))) ||
      (nLat && (iname.includes(nLat) || nLat.includes(iname)))
    );
  });

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) {
    const bm = candidates.find((item: any) => {
      const ib = normalizeBreedForMatch(item.breed);
      return ib === b || ib.includes(b) || b.includes(ib);
    });
    if (bm) return bm;
  }

  if (n.includes('УРАЛ СПИРИТ САЛАМАНДР') || (nLat && nLat.includes('URAL SPIRIT SALAMANDER'))) {
    return stageList.find((item: any) =>
      normalizeNameForMatch(item.dog_name).includes('УРАЛ СПИРИТ САЛАМАНДР') ||
      normalizeNameForMatch(item.dog_name).includes('URAL SPIRIT')
    );
  }

  if (n.includes('БАЗИЛИО') || (nLat && nLat.includes('BASILIO'))) {
    return stageList.find((item: any) =>
      normalizeNameForMatch(item.dog_name).includes('БАЗИЛИО') ||
      normalizeNameForMatch(item.dog_name).includes('BASILIO')
    );
  }

  if (n.includes('КУПИДОН') || (nLat && nLat.includes('KUPIDON'))) {
    return stageList.find((item: any) =>
      normalizeNameForMatch(item.dog_name).includes('КУПИДОН') ||
      normalizeNameForMatch(item.dog_name).includes('KUPIDON')
    );
  }

  if (n.includes('СЭМЮЭЛЬ') || (nLat && nLat.includes('SAMUEL'))) {
    return stageList.find((item: any) =>
      normalizeNameForMatch(item.dog_name).includes('СЭМЮЭЛЬ') ||
      normalizeNameForMatch(item.dog_name).includes('SAMUEL')
    );
  }

  return null;
}
