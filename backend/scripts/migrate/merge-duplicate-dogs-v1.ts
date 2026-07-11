/**
 * Склеить дубликаты собак в data/v1 по правилу dogNamesLikelySame (одна порода + пересечение частей клички).
 *
 * Usage:
 *   npx tsx backend/scripts/migrate/merge-duplicate-dogs-v1.ts --dry-run
 *   npx tsx backend/scripts/migrate/merge-duplicate-dogs-v1.ts
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { dogNamesLikelySame, type DogNameFields } from '../../lib/dog-name-parts';
import { dogKey, writeJson } from '../export/d1-export-utils';
import { DATA_V1_ROOT } from '../../lib/local-data/paths';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

type DogRecord = DogNameFields & {
  id: number;
  dog_key?: string;
  sex?: string | null;
  owner?: string | null;
  pedigree_url?: string | null;
  competition_ids?: number[];
  competition_files?: string[];
  [key: string]: unknown;
};

type ResultRow = {
  dog_id?: number;
  event_id?: number;
  breed_class?: string;
  dog?: DogRecord | null;
  dog_key?: string;
  [key: string]: unknown;
};

type CompetitionFile = {
  event_id?: number;
  results?: ResultRow[];
  [key: string]: unknown;
};

type ResultSlot = {
  event_id: number;
  breed_class: string;
};

class UnionFind {
  private parent = new Map<number, number>();

  find(x: number): number {
    if (!this.parent.has(x)) this.parent.set(x, x);
    let root = this.parent.get(x)!;
    while (root !== this.parent.get(root)!) {
      root = this.parent.get(root)!;
    }
    let cur = x;
    while (cur !== root) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    return root;
  }

  union(a: number, b: number) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(rb, ra);
  }
}

function normalizeBreed(breed?: string | null): string {
  return (breed ?? '').trim().toUpperCase();
}

async function listJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(current: string) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.json')) out.push(full);
    }
  }
  await walk(dir);
  return out.sort();
}

function pickCanonical(ids: number[], resultCounts: Map<number, number>, dogs: Map<number, DogRecord>): number {
  return [...ids].sort((a, b) => {
    const rcA = resultCounts.get(a) ?? 0;
    const rcB = resultCounts.get(b) ?? 0;
    if (rcB !== rcA) return rcB - rcA;
    const compA = dogs.get(a)?.competition_ids?.length ?? 0;
    const compB = dogs.get(b)?.competition_ids?.length ?? 0;
    if (compB !== compA) return compB - compA;
    return b - a;
  })[0];
}

function mergeDogFields(target: DogRecord, source: DogRecord): DogRecord {
  const pick = <T>(a: T | null | undefined, b: T | null | undefined): T | null | undefined => {
    if (a != null && a !== '') return a;
    return b;
  };
  const pickLonger = (a?: string | null, b?: string | null) => {
    const aa = (a ?? '').trim();
    const bb = (b ?? '').trim();
    if (bb.length > aa.length) return bb;
    return aa || bb || null;
  };

  return {
    ...target,
    name_lat: pickLonger(target.name_lat, source.name_lat) ?? target.name_lat,
    name_ru: pickLonger(target.name_ru, source.name_ru) ?? target.name_ru,
    sex: pick(target.sex, source.sex) ?? null,
    owner: pick(target.owner, source.owner) ?? null,
    pedigree_url: pick(target.pedigree_url, source.pedigree_url) ?? null,
  };
}

function groupHasConflict(
  ids: number[],
  slotsByDog: Map<number, ResultSlot[]>,
): { conflict: boolean; detail?: string } {
  const seen = new Map<string, number>();
  for (const id of ids) {
    for (const slot of slotsByDog.get(id) ?? []) {
      const key = `${slot.event_id}::${slot.breed_class}`;
      const prev = seen.get(key);
      if (prev != null && prev !== id) {
        return { conflict: true, detail: `${key} dogs ${prev} and ${id}` };
      }
      seen.set(key, id);
    }
  }
  return { conflict: false };
}

async function main() {
  const dogsDir = path.join(DATA_V1_ROOT, 'dogs/by-id');
  const compDir = path.join(DATA_V1_ROOT, 'competitions');
  const byKeyDir = path.join(DATA_V1_ROOT, 'dogs/by-key');

  const dogFiles = await listJsonFiles(dogsDir);
  const dogs = new Map<number, DogRecord>();
  for (const file of dogFiles) {
    const data = JSON.parse(await fs.readFile(file, 'utf-8')) as DogRecord;
    dogs.set(data.id, data);
  }

  const resultCounts = new Map<number, number>();
  const slotsByDog = new Map<number, ResultSlot[]>();
  const competitionPaths = await listJsonFiles(compDir);

  for (const file of competitionPaths) {
    const rel = path.relative(DATA_V1_ROOT, file).replace(/\\/g, '/');
    const data = JSON.parse(await fs.readFile(file, 'utf-8')) as CompetitionFile;
    const eventId = data.event_id ?? 0;
    for (const result of data.results ?? []) {
      const dogId = result.dog_id ?? result.dog?.id;
      if (dogId == null) continue;
      resultCounts.set(dogId, (resultCounts.get(dogId) ?? 0) + 1);
      const breedClass = String(result.breed_class ?? '');
      const slots = slotsByDog.get(dogId) ?? [];
      slots.push({ event_id: eventId, breed_class: breedClass });
      slotsByDog.set(dogId, slots);
    }
    void rel;
  }

  const byBreed = new Map<string, DogRecord[]>();
  for (const dog of dogs.values()) {
    const breed = normalizeBreed(dog.breed);
    if (!byBreed.has(breed)) byBreed.set(breed, []);
    byBreed.get(breed)!.push(dog);
  }

  const uf = new UnionFind();
  for (const group of byBreed.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        if (dogNamesLikelySame(group[i], group[j])) {
          uf.union(group[i].id, group[j].id);
        }
      }
    }
  }

  const components = new Map<number, number[]>();
  for (const dog of dogs.values()) {
    const root = uf.find(dog.id);
    if (!components.has(root)) components.set(root, []);
    components.get(root)!.push(dog.id);
  }

  const mergeGroups = [...components.values()].filter((ids) => ids.length > 1);
  const idRemap = new Map<number, number>();
  const skipped: Array<{ ids: number[]; reason: string }> = [];
  const merges: Array<{ target: number; sources: number[]; names: string[] }> = [];

  for (const ids of mergeGroups) {
    const conflict = groupHasConflict(ids, slotsByDog);
    if (conflict.conflict) {
      skipped.push({ ids, reason: conflict.detail ?? 'event conflict' });
      continue;
    }

    const target = pickCanonical(ids, resultCounts, dogs);
    const sources = ids.filter((id) => id !== target);
    for (const source of sources) {
      idRemap.set(source, target);
    }

    let canonical = dogs.get(target)!;
    for (const sourceId of sources) {
      canonical = mergeDogFields(canonical, dogs.get(sourceId)!);
    }
    dogs.set(target, canonical);

    merges.push({
      target,
      sources,
      names: ids.map((id) => `${id}:${dogs.get(id)?.name_lat ?? '?'}`),
    });
  }

  console.log(`Dogs loaded: ${dogs.size}`);
  console.log(`Duplicate groups: ${mergeGroups.length}`);
  console.log(`Merges to apply: ${merges.length} (${idRemap.size} ids remapped)`);
  console.log(`Skipped (conflict): ${skipped.length}`);

  for (const m of merges) {
    console.log(`  ${m.sources.join(', ')} → ${m.target}  [${m.names.join(' | ')}]`);
  }
  for (const s of skipped) {
    console.log(`  SKIP ${s.ids.join(', ')}: ${s.reason}`);
  }

  if (DRY_RUN) {
    console.log('\n--dry-run: no files changed');
    return;
  }

  if (idRemap.size === 0) {
    console.log('\nNothing to merge.');
    return;
  }

  const exportedAt = new Date().toISOString();
  let competitionUpdates = 0;

  for (const file of competitionPaths) {
    const data = JSON.parse(await fs.readFile(file, 'utf-8')) as CompetitionFile;
    let changed = false;

    for (const result of data.results ?? []) {
      const oldId = result.dog_id ?? result.dog?.id;
      if (oldId == null) continue;
      const newId = idRemap.get(oldId) ?? oldId;
      if (newId === oldId) continue;

      const canonical = dogs.get(newId)!;
      const dk = dogKey(String(canonical.name_lat ?? ''), String(canonical.breed ?? ''));
      result.dog_id = newId;
      result.dog_key = dk;
      result.dog = {
        id: newId,
        dog_key: dk,
        name_lat: canonical.name_lat,
        name_ru: canonical.name_ru,
        breed: canonical.breed,
        sex: canonical.sex ?? null,
        owner: canonical.owner ?? null,
      };
      changed = true;
      competitionUpdates += 1;
    }

    if (changed) {
      await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
    }
  }

  const compIdsByDog = new Map<number, { ids: Set<number>; files: Set<string> }>();
  for (const file of competitionPaths) {
    const rel = path.relative(DATA_V1_ROOT, file).replace(/\\/g, '/');
    const data = JSON.parse(await fs.readFile(file, 'utf-8')) as CompetitionFile;
    const eventId = data.event_id ?? 0;
    for (const result of data.results ?? []) {
      const dogId = result.dog_id ?? result.dog?.id;
      if (dogId == null) continue;
      if (!compIdsByDog.has(dogId)) compIdsByDog.set(dogId, { ids: new Set(), files: new Set() });
      const bucket = compIdsByDog.get(dogId)!;
      bucket.ids.add(eventId);
      bucket.files.add(rel);
    }
  }

  const affectedTargets = new Set<number>();
  for (const [source, target] of idRemap) {
    affectedTargets.add(target);
    void source;
  }

  for (const targetId of affectedTargets) {
    const dog = dogs.get(targetId)!;
    const bucket = compIdsByDog.get(targetId) ?? { ids: new Set<number>(), files: new Set<string>() };
    const dk = dogKey(String(dog.name_lat ?? ''), String(dog.breed ?? ''));
    const payload = {
      schema: 'coursing-stats/dog-v1',
      exported_at: exportedAt,
      id: targetId,
      dog_key: dk,
      name_lat: dog.name_lat,
      name_ru: dog.name_ru,
      breed: dog.breed,
      sex: dog.sex ?? null,
      owner: dog.owner ?? null,
      pedigree_url: dog.pedigree_url ?? null,
      competition_ids: [...bucket.ids].sort((a, b) => a - b),
      competition_files: [...bucket.files].sort(),
    };
    writeJson(path.join(DATA_V1_ROOT, `dogs/by-id/${targetId}.json`), payload);
    writeJson(path.join(DATA_V1_ROOT, `dogs/by-key/${dk}.json`), payload);
  }

  for (const sourceId of idRemap.keys()) {
    const sourceDog = dogs.get(sourceId)!;
    await fs.rm(path.join(DATA_V1_ROOT, `dogs/by-id/${sourceId}.json`), { force: true });
    if (sourceDog.dog_key) {
      const keyPath = path.join(byKeyDir, `${sourceDog.dog_key}.json`);
      try {
        const keyData = JSON.parse(await fs.readFile(keyPath, 'utf-8')) as DogRecord;
        if (keyData.id === sourceId) await fs.rm(keyPath, { force: true });
      } catch {
        /* key may already point elsewhere */
      }
    }
  }

  const reportPath = path.join(DATA_V1_ROOT, 'reports/merge-duplicate-dogs.json');
  writeJson(reportPath, {
    exported_at: exportedAt,
    merge_count: merges.length,
    id_remap: Object.fromEntries([...idRemap.entries()].map(([k, v]) => [String(k), v])),
    merges,
    skipped,
    competition_result_updates: competitionUpdates,
  });

  console.log(`\nUpdated ${competitionUpdates} results in competitions`);
  console.log(`Report: ${reportPath}`);
  console.log('Run: npm run build-all-data');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
