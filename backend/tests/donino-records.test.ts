import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import {
  resolveDoninoDog,
  findDoninoDogSex,
  DONINO_MANUAL_MAPPINGS,
} from '../scripts/speed/match-donino-dog';

describe('Donino Dog Mappings and Identity', () => {
  it('correctly maps Saluki Tundra / Kayala to canonical Tundra with sport dog 10742', () => {
    const fromTundra = resolveDoninoDog('Тундра', 'Салюки');
    expect(fromTundra.canonicalName).toBe('Тундра');
    expect(fromTundra.sportDogId).toBe(10742);
    expect(fromTundra.aliases).toContain('Каяла');

    const fromKayala = resolveDoninoDog('Каяла', 'Салюки');
    expect(fromKayala.canonicalName).toBe('Тундра');
    expect(fromKayala.sportDogId).toBe(10742);
    expect(fromKayala.aliases).toContain('Каяла');
  });

  it('correctly maps Saluki Tayga to sport dog 5782', () => {
    const res = resolveDoninoDog('Тайга', 'Салюки');
    expect(res.canonicalName).toBe('Тайга');
    expect(res.sportDogId).toBe(5782);
  });

  it('correctly merges Saluki Gracie and Jazzy variants', () => {
    const gracie1 = resolveDoninoDog('Грэйси', 'Салюки');
    const gracie2 = resolveDoninoDog('Грейси', 'Салюки');
    expect(gracie1.canonicalName).toBe('Грейси');
    expect(gracie2.canonicalName).toBe('Грейси');
    expect(gracie1.aliases).toContain('Грэйси');

    const jazzy1 = resolveDoninoDog('Джаззи', 'Салюки');
    const jazzy2 = resolveDoninoDog('Джази', 'Салюки');
    expect(jazzy1.canonicalName).toBe('Джази');
    expect(jazzy2.canonicalName).toBe('Джази');
    expect(jazzy1.sportDogId).toBe(7256);
    expect(jazzy2.sportDogId).toBe(7256);
    expect(jazzy1.aliases).toContain('Джаззи');
  });

  it('finds dog sex from speed records or sport dog index', () => {
    const sexTundra = findDoninoDogSex('Тундра', 'Салюки');
    expect(sexTundra).toBe('С');

    const sexJazzy = findDoninoDogSex('Джази', 'Салюки');
    expect(sexJazzy).toBe('К');

    const sexTayga = findDoninoDogSex('Тайга', 'Салюки');
    expect(sexTayga).toBe('С');
  });
});

describe('Donino Data Files Integrity', () => {
  const speedPath = path.resolve(process.cwd(), 'data/v1/donino/speed_records.json');
  const coursingPath = path.resolve(process.cwd(), 'data/v1/donino/coursing_records.json');

  it('speed_records.json contains valid records with Saluki canonical dogs', () => {
    expect(existsSync(speedPath)).toBe(true);
    const data = JSON.parse(readFileSync(speedPath, 'utf-8'));
    expect(data.records.length).toBeGreaterThan(150);

    const salukis = data.records.filter((r: { breed: string }) => r.breed === 'Салюки');
    const names = salukis.map((s: { name: string }) => s.name);
    expect(names).toContain('Тундра');
    expect(names).not.toContain('Каяла');
    expect(names).toContain('Тайга');
    expect(names).toContain('Грейси');
    expect(names).toContain('Джази');
  });

  it('coursing_records.json enriches dog sex and canonical names', () => {
    expect(existsSync(coursingPath)).toBe(true);
    const data = JSON.parse(readFileSync(coursingPath, 'utf-8'));
    expect(data.records.length).toBeGreaterThan(180);

    const withSex = data.records.filter((r: { sex?: string }) => r.sex === 'К' || r.sex === 'С');
    expect(withSex.length).toBeGreaterThan(140);

    const salukis = data.records.filter((r: { breed: string }) => r.breed === 'Салюки');
    const tundra = salukis.find((s: { name: string }) => s.name === 'Тундра');
    expect(tundra).toBeDefined();
    expect(tundra.dog_id).toBe(10742);
    expect(tundra.sex).toBe('С');
    expect(tundra.aliases).toContain('Каяла');

    const jazzy = salukis.find((s: { name: string }) => s.name === 'Джази');
    expect(jazzy).toBeDefined();
    expect(jazzy.dog_id).toBe(7256);
    expect(jazzy.sex).toBe('К');

    const gracie = salukis.find((s: { name: string }) => s.name === 'Грейси');
    expect(gracie).toBeDefined();
    expect(gracie.sex).toBe('С');
  });
});
