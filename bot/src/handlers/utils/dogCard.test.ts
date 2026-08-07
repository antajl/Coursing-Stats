import { describe, it, expect } from 'vitest';
import { formatDogCard } from './dogCard';
import type { DogData } from '../../types';

function sampleDog(overrides: Partial<DogData['dog']> = {}): DogData {
  return {
    schema: 'test',
    exported_at: '2026-01-01',
    dog: {
      id: 42,
      dog_key: '42',
      name_lat: 'REX',
      name_ru: 'РЕКС',
      breed: 'УИППЕТ',
      sex: 'M',
      owner: null,
      pedigree_url: null,
      coursing_stats: {
        total_starts: 10,
        best_score: 300,
        avg_score: 250,
        gold: 2,
        silver: 1,
        bronze: 0,
      },
      racing_stats: {
        total_starts: 3,
        best_speed: 55.5,
        avg_speed: 50,
        gold: 1,
        silver: 0,
        bronze: 0,
      },
      ...overrides,
    },
  };
}

describe('formatDogCard', () => {
  it('shows coursing and racing medals separately (not merged)', () => {
    const text = formatDogCard(sampleDog());
    expect(text).toContain('Курсинг');
    expect(text).toContain('Бега борзых');
    expect(text).toContain('2🥇 1🥈 0🥉');
    expect(text).toContain('1🥇 0🥈 0🥉');
    expect(text).not.toContain('3🥇'); // would be merged total
    expect(text).toContain('/dog/42');
  });

  it('does not dump competition history', () => {
    const text = formatDogCard(sampleDog({
      competitions: [{ id: 1, location: 'x', title: 'Event 1' }] as never,
    }));
    expect(text).not.toContain('Event 1');
  });
});
