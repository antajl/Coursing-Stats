import fs from 'node:fs/promises';
import path from 'node:path';
import { dogKey } from '../../scripts/export/d1-export-utils';
import { normalizeBreed, normalizeDogName } from '../../parsers/coursing/utils';

export type EnsureDogsResult = {
  results: any[];
  createdDogs: Array<{ id: number; dog_key: string; name_lat: string; breed: string }>;
  linkedExisting: number;
};

type DogPayload = {
  schema: string;
  exported_at: string;
  id: number;
  dog_key: string;
  name_lat: string;
  name_ru: string | null;
  breed: string;
  sex: null;
  owner: null;
  competition_ids: number[];
  competition_files: string[];
};

function resolveNameBreed(result: any): { nameLat: string; nameRu: string; breed: string } {
  const nameLat = normalizeDogName(
    String(result?.dog?.name_lat ?? result?.name_lat ?? result?.dog?.name_ru ?? result?.name_ru ?? ''),
  );
  const nameRu = normalizeDogName(
    String(result?.dog?.name_ru ?? result?.name_ru ?? result?.dog?.name_lat ?? result?.name_lat ?? ''),
  );
  const breed = normalizeBreed(String(result?.dog?.breed ?? result?.breed ?? ''));
  return { nameLat: nameLat || nameRu, nameRu: nameRu || nameLat, breed };
}

async function nextDogId(dogsByIdDir: string): Promise<number> {
  let max = 0;
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dogsByIdDir);
  } catch {
    return 1;
  }
  for (const file of entries) {
    if (!file.endsWith('.json')) continue;
    const id = Number(file.replace(/\.json$/, ''));
    if (!Number.isNaN(id)) max = Math.max(max, id);
  }
  return max + 1;
}

async function readDogByKey(dogsByKeyDir: string, key: string): Promise<DogPayload | null> {
  const filePath = path.join(dogsByKeyDir, `${key}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as DogPayload;
  } catch {
    return null;
  }
}

async function writeDog(dogsByIdDir: string, dogsByKeyDir: string, dog: DogPayload): Promise<void> {
  await fs.mkdir(dogsByIdDir, { recursive: true });
  await fs.mkdir(dogsByKeyDir, { recursive: true });
  const json = JSON.stringify(dog, null, 2);
  await fs.writeFile(path.join(dogsByIdDir, `${dog.id}.json`), json, 'utf-8');
  await fs.writeFile(path.join(dogsByKeyDir, `${dog.dog_key}.json`), json, 'utf-8');
}

function touchCompetition(dog: DogPayload, eventId: number, competitionRelPath: string): boolean {
  let changed = false;
  if (!dog.competition_ids.includes(eventId)) {
    dog.competition_ids.push(eventId);
    changed = true;
  }
  if (!dog.competition_files.includes(competitionRelPath)) {
    dog.competition_files.push(competitionRelPath);
    changed = true;
  }
  return changed;
}

/**
 * For results without dog_id: find existing dog by dog_key or create one.
 * Does not mutate placement / scores / status.
 */
export async function ensureEventDogs(opts: {
  dogsByIdDir: string;
  dogsByKeyDir: string;
  eventId: number;
  competitionRelPath: string;
  results: any[];
  exportedAt?: string;
}): Promise<EnsureDogsResult> {
  const exportedAt = opts.exportedAt ?? new Date().toISOString();
  const createdDogs: EnsureDogsResult['createdDogs'] = [];
  let linkedExisting = 0;
  let nextId = await nextDogId(opts.dogsByIdDir);

  const results = opts.results.map((r) => ({ ...r, dog: r.dog ? { ...r.dog } : r.dog }));

  for (const result of results) {
    if (result.dog_id != null && result.dog_id !== '') continue;

    const { nameLat, nameRu, breed } = resolveNameBreed(result);
    if (!nameLat || !breed) continue;

    const key = dogKey(nameLat, breed);
    let dog = await readDogByKey(opts.dogsByKeyDir, key);

    if (dog) {
      linkedExisting += 1;
      if (touchCompetition(dog, opts.eventId, opts.competitionRelPath)) {
        dog.exported_at = exportedAt;
        await writeDog(opts.dogsByIdDir, opts.dogsByKeyDir, dog);
      }
    } else {
      dog = {
        schema: 'coursing-stats/dog-v1',
        exported_at: exportedAt,
        id: nextId,
        dog_key: key,
        name_lat: nameLat,
        name_ru: nameRu || null,
        breed,
        sex: null,
        owner: null,
        competition_ids: [opts.eventId],
        competition_files: [opts.competitionRelPath],
      };
      nextId += 1;
      await writeDog(opts.dogsByIdDir, opts.dogsByKeyDir, dog);
      createdDogs.push({
        id: dog.id,
        dog_key: dog.dog_key,
        name_lat: dog.name_lat,
        breed: dog.breed,
      });
    }

    result.dog_id = dog.id;
    result.dog_key = dog.dog_key;
    result.dog = {
      ...(result.dog || {}),
      id: dog.id,
      dog_key: dog.dog_key,
      name_lat: dog.name_lat,
      name_ru: dog.name_ru,
      breed: dog.breed,
      sex: dog.sex,
      owner: dog.owner,
    };
  }

  return { results, createdDogs, linkedExisting };
}
