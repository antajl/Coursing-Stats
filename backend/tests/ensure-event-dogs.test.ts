import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ensureEventDogs } from '../lib/local-data/ensure-event-dogs';

describe('ensureEventDogs', () => {
  let root: string;
  let dogsByIdDir: string;
  let dogsByKeyDir: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'ensure-dogs-'));
    dogsByIdDir = path.join(root, 'by-id');
    dogsByKeyDir = path.join(root, 'by-key');
    await fs.mkdir(dogsByIdDir, { recursive: true });
    await fs.mkdir(dogsByKeyDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('creates a new dog when missing and assigns dog_id', async () => {
    const results = [
      {
        id: 1,
        dog_id: null,
        placement: 2,
        total_score: 88.5,
        dog: { name_lat: 'TEST DOG ALPHA', name_ru: 'ТЕСТ СОБАКА АЛЬФА', breed: 'УИППЕТ' },
      },
    ];

    const out = await ensureEventDogs({
      dogsByIdDir,
      dogsByKeyDir,
      eventId: 9999,
      competitionRelPath: 'competitions/2026/01-январь/9999-test.json',
      results,
    });

    expect(out.createdDogs).toHaveLength(1);
    expect(out.results[0].dog_id).toBe(out.createdDogs[0].id);
    expect(out.results[0].placement).toBe(2);
    expect(out.results[0].total_score).toBe(88.5);

    const idFile = path.join(dogsByIdDir, `${out.createdDogs[0].id}.json`);
    const saved = JSON.parse(await fs.readFile(idFile, 'utf-8'));
    expect(saved.schema).toBe('coursing-stats/dog-v1');
    expect(saved.competition_ids).toContain(9999);
  });

  it('links existing dog by dog_key instead of creating a duplicate', async () => {
    const existing = {
      schema: 'coursing-stats/dog-v1',
      exported_at: '2026-01-01T00:00:00.000Z',
      id: 42,
      dog_key: 'existing-dog--uippet',
      name_lat: 'EXISTING DOG',
      name_ru: 'EXISTING DOG',
      breed: 'УИППЕТ',
      sex: null,
      owner: null,
      competition_ids: [1],
      competition_files: ['competitions/2025/01-январь/1-x.json'],
    };
    // Use real dogKey shape via ensure after first create — seed by writing matching key file
    const { dogKey } = await import('../scripts/export/d1-export-utils');
    const dk = dogKey('EXISTING DOG', 'УИППЕТ');
    existing.dog_key = dk;
    await fs.writeFile(path.join(dogsByIdDir, '42.json'), JSON.stringify(existing, null, 2));
    await fs.writeFile(path.join(dogsByKeyDir, `${dk}.json`), JSON.stringify(existing, null, 2));

    const out = await ensureEventDogs({
      dogsByIdDir,
      dogsByKeyDir,
      eventId: 100,
      competitionRelPath: 'competitions/2026/02-февраль/100-y.json',
      results: [
        {
          id: 7,
          dog_id: null,
          placement: 1,
          dog: { name_lat: 'EXISTING DOG', breed: 'УИППЕТ' },
        },
      ],
    });

    expect(out.createdDogs).toHaveLength(0);
    expect(out.linkedExisting).toBe(1);
    expect(out.results[0].dog_id).toBe(42);
    expect(out.results[0].placement).toBe(1);

    const updated = JSON.parse(await fs.readFile(path.join(dogsByIdDir, '42.json'), 'utf-8'));
    expect(updated.competition_ids).toContain(100);
  });

  it('skips rows that already have dog_id', async () => {
    const out = await ensureEventDogs({
      dogsByIdDir,
      dogsByKeyDir,
      eventId: 1,
      competitionRelPath: 'competitions/2026/01-январь/1.json',
      results: [{ id: 1, dog_id: 147, placement: 3, dog: { name_lat: 'X', breed: 'Y' } }],
    });
    expect(out.createdDogs).toHaveLength(0);
    expect(out.linkedExisting).toBe(0);
    expect(out.results[0].dog_id).toBe(147);
  });

  it('skips rows without name and breed', async () => {
    const out = await ensureEventDogs({
      dogsByIdDir,
      dogsByKeyDir,
      eventId: 1,
      competitionRelPath: 'competitions/2026/01-январь/1.json',
      results: [{ id: 1, dog_id: null, dog: {} }],
    });
    expect(out.createdDogs).toHaveLength(0);
    expect(out.results[0].dog_id).toBeNull();
  });
});
