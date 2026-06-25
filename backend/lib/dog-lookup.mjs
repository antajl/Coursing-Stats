import { normalizeDogName, normalizeBreed } from "../parsers/parse-results-coursing.mjs";

export { normalizeDogName, normalizeBreed };

function dogIndexKey(name, breed) {
  return `${normalizeDogName(name)}|${normalizeBreed(breed)}`;
}

/**
 * Построить индекс собак для быстрого поиска по нормализованной кличке+породе.
 * @param {Array<{id: number, name_lat: string, breed: string}>} dogs
 */
export function buildDogIndex(dogs) {
  const index = new Map();
  for (const dog of dogs) {
    const key = dogIndexKey(dog.name_lat, dog.breed);
    if (!index.has(key)) {
      index.set(key, dog.id);
    }
  }
  return index;
}

export function lookupDogId(index, name, breed) {
  return index.get(dogIndexKey(name, breed)) ?? null;
}

/**
 * Найти собаку в SQLite (better-sqlite3) с учётом нормализации.
 */
export function findDogId(db, name, breed) {
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
export function lookupDogIdFromIndex(dogIndex, name, breed) {
  return lookupDogId(dogIndex, name, breed);
}

/**
 * Загрузить индекс собак из D1.
 */
export async function loadDogIndexFromD1(db) {
  const { results: dogs } = await db
    .prepare(
      `SELECT id, name_lat, breed FROM dogs WHERE merged_into_dog_id IS NULL`
    )
    .all();
  return buildDogIndex(dogs);
}
