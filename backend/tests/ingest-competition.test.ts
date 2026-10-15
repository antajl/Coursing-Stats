import { describe, it, expect } from 'vitest';
import {
  transliterateRuToLat,
  findMatchingDog,
  type StoredDog,
  type DraftDog,
} from '../scripts/ingest/ingest-competition';

describe('competition ingestion logic', () => {
  it('correctly transliterates Russian dog names to Latin', () => {
    expect(transliterateRuToLat('ХАРИЗМАШОУ ГРИФОН')).toBe('KHARIZMASHOU GRIFON');
    expect(transliterateRuToLat('ЛУННАЯ РАДУГА РЕЛИКВИЯ')).toBe('LUNNAYA RADUGA RELIKVIYA');
    expect(transliterateRuToLat('БАСЕНДЖИ')).toBe('BASENDZHI');
  });

  it('matches exact name and breed', () => {
    const dogs = new Map<number, StoredDog>();
    dogs.set(100, {
      id: 100,
      dog_key: 'charizma-show-gryphon--afganskaya-borzaya',
      name_lat: 'CHARIZMA SHOW GRYPHON',
      name_ru: 'ХАРИЗМАШОУ ГРИФОН',
      breed: 'Афганская борзая',
      sex: 'Кобель',
      owner: null,
      competition_ids: [],
      competition_files: [],
    });

    const draft1: DraftDog = {
      name_lat: 'CHARIZMA SHOW GRYPHON',
      breed: 'Афганская борзая',
    };
    const match1 = findMatchingDog(draft1, dogs);
    expect(match1).not.toBeNull();
    expect(match1?.matchedDog.id).toBe(100);
    expect(match1?.matchType).toBe('exact');

    const draft2: DraftDog = {
      name_ru: 'ХАРИЗМАШОУ ГРИФОН',
      breed: 'Афганская борзая',
    };
    const match2 = findMatchingDog(draft2, dogs);
    expect(match2).not.toBeNull();
    expect(match2?.matchedDog.id).toBe(100);
  });

  it('matches slash names (RU / EN)', () => {
    const dogs = new Map<number, StoredDog>();
    dogs.set(200, {
      id: 200,
      dog_key: 'house-the-rainbow--basendzhi',
      name_lat: 'HOUSE THE RAINBOW / ХАУС ЗЭ РЭЙНБОУ',
      name_ru: null,
      breed: 'Басенджи',
      sex: 'Сука',
      owner: null,
      competition_ids: [],
      competition_files: [],
    });

    const draft: DraftDog = {
      name_lat: 'HOUSE THE RAINBOW',
      breed: 'Басенджи',
    };
    const match = findMatchingDog(draft, dogs);
    expect(match).not.toBeNull();
    expect(match?.matchedDog.id).toBe(200);
  });

  it('returns null for truly new dog', () => {
    const dogs = new Map<number, StoredDog>();
    dogs.set(100, {
      id: 100,
      dog_key: 'some-dog--whippet',
      name_lat: 'SOME DOG',
      name_ru: null,
      breed: 'Уиппет',
      sex: 'Кобель',
      owner: null,
      competition_ids: [],
      competition_files: [],
    });

    const draft: DraftDog = {
      name_lat: 'COMPLETELY DIFFERENT PUPPY',
      breed: 'Уиппет',
    };
    const match = findMatchingDog(draft, dogs);
    expect(match).toBeNull();
  });

  it('does not match across different breeds', () => {
    const dogs = new Map<number, StoredDog>();
    dogs.set(100, {
      id: 100,
      dog_key: 'thunder--whippet',
      name_lat: 'THUNDER',
      name_ru: null,
      breed: 'Уиппет',
      sex: 'Кобель',
      owner: null,
      competition_ids: [],
      competition_files: [],
    });

    const draft: DraftDog = {
      name_lat: 'THUNDER',
      breed: 'Грейхаунд',
    };
    const match = findMatchingDog(draft, dogs);
    expect(match).toBeNull();
  });

  it('ensures no orphan dog IDs exist in 2026 competitions', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const ROOT = path.resolve(__dirname, '../..');
    const byIdDir = path.join(ROOT, 'data/v1/dogs/by-id');
    const comps2026Dir = path.join(ROOT, 'data/v1/competitions/2026');

    const dogsById = new Set(
      fs.readdirSync(byIdDir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => parseInt(f.replace('.json', ''), 10))
        .filter((n) => !isNaN(n))
    );

    const orphans: Array<{ comp: string; dog_id: number; name: string }> = [];

    function scan(dir: string) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (entry.name.endsWith('.json')) {
          try {
            const comp = JSON.parse(fs.readFileSync(full, 'utf-8'));
            if (Array.isArray(comp.results)) {
              for (const r of comp.results) {
                if (r && typeof r.dog_id === 'number' && !dogsById.has(r.dog_id)) {
                  orphans.push({
                    comp: entry.name,
                    dog_id: r.dog_id,
                    name: r.dog?.name_ru || r.dog?.name_lat || 'unknown',
                  });
                }
              }
            }
          } catch {}
        }
      }
    }

    scan(comps2026Dir);
    expect(orphans).toEqual([]);
  });
});

