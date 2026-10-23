import type Database from 'better-sqlite3';

export function normalizeSex(val: unknown): 'M' | 'F' | null {
  if (typeof val !== 'string') return null;
  const s = val.trim().toLowerCase();
  if (/^кобел|male|^m$|^к$/i.test(s)) return 'M';
  if (/^сук|female|^f$|^с$/i.test(s)) return 'F';
  return null;
}

export function detectSexFromClass(breedClass: string | null | undefined): 'M' | 'F' | null {
  if (!breedClass) return null;
  if (/кобел|male\b|\bм\b/i.test(breedClass)) return 'M';
  if (/сук|female\b|\bж\b/i.test(breedClass)) return 'F';
  return null;
}

/**
 * Загружает надёжную карту dog_id -> 'M' | 'F'.
 * Использует пол из карточки собаки, а при его отсутствии безопасно выводит
 * пол из протоколов забегов (только при 100% согласии всех записей без конфликтов).
 */
export function loadInferredSexMap(db: Database.Database): Map<number, 'M' | 'F'> {
  const sexMap = new Map<number, 'M' | 'F'>();

  // 1. Из таблицы dogs (данные из dogs/by-id)
  const dogs = db
    .prepare('SELECT id, sex FROM dogs WHERE sex IS NOT NULL')
    .all() as Array<{ id: number; sex: string }>;
  for (const d of dogs) {
    const s = normalizeSex(d.sex);
    if (s) sexMap.set(d.id, s);
  }

  // 2. Из протоколов забегов (для собак без явного пола)
  const sexRows = db
    .prepare('SELECT dog_id, breed_class FROM results WHERE breed_class IS NOT NULL')
    .all() as Array<{ dog_id: number; breed_class: string }>;
  const counters = new Map<number, { M: number; F: number }>();
  for (const r of sexRows) {
    const s = detectSexFromClass(r.breed_class);
    if (s) {
      const c = counters.get(r.dog_id) ?? { M: 0, F: 0 };
      c[s]++;
      counters.set(r.dog_id, c);
    }
  }

  for (const [id, c] of counters) {
    if (!sexMap.has(id)) {
      if (c.M > 0 && c.F === 0) sexMap.set(id, 'M');
      else if (c.F > 0 && c.M === 0) sexMap.set(id, 'F');
    }
  }

  return sexMap;
}
