import { normalizeDogName, normalizeBreed } from "../parsers/coursing/utils";

export { normalizeDogName, normalizeBreed };

interface Dog {
  id: number;
  name_lat: string;
  breed: string;
}

function dogIndexKey(name: string, breed: string): string {
  return `${normalizeDogName(name)}|${normalizeBreed(breed)}`;
}

/**
 * Построить индекс собак для быстрого поиска по нормализованной кличке+породе.
 */
export function buildDogIndex(dogs: Dog[]): Map<string, number> {
  const index = new Map<string, number>();
  for (const dog of dogs) {
    const key = dogIndexKey(dog.name_lat, dog.breed);
    if (!index.has(key)) {
      index.set(key, dog.id);
    }
  }
  return index;
}

export function lookupDogId(index: Map<string, number>, name: string, breed: string): number | null {
  return index.get(dogIndexKey(name, breed)) ?? null;
}

/**
 * Найти собаку в SQLite (better-sqlite3) с учётом нормализации.
 */
export function findDogId(db: any, name: string, breed: string): number | null {
  const normName = normalizeDogName(name);
  const normBreed = normalizeBreed(breed);
  if (!normName || !normBreed) return null;

  const exact = db
    .prepare(
      `SELECT id FROM dogs
       WHERE name_lat = ? AND breed = ? AND merged_into_dog_id IS NULL`
    )
    .get(normName, normBreed);
  if (exact) return exact.id;

  const index = buildDogIndex(
    db
      .prepare(
        `SELECT id, name_lat, breed FROM dogs WHERE merged_into_dog_id IS NULL`
      )
      .all()
  );
  return lookupDogId(index, name, breed);
}

/**
 * Найти собаку через D1 API с предзагруженным индексом.
 */
export function lookupDogIdFromIndex(dogIndex: Map<string, number>, name: string, breed: string): number | null {
  return lookupDogId(dogIndex, name, breed);
}

/**
 * Загрузить индекс собак из D1.
 */
export async function loadDogIndexFromD1(db: any): Promise<Map<string, number>> {
  const { results: dogs } = await db
    .prepare(
      `SELECT id, name_lat, breed FROM dogs WHERE merged_into_dog_id IS NULL`
    )
    .all();
  return buildDogIndex(dogs);
}
