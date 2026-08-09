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
        best_judge_score: 93,
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
    expect(text).toContain('Участий: 10');
    expect(text).toContain('лучший балл: 300');
    expect(text).toContain('Лучшая оценка от судьи: 93');
    expect(text).toContain('2🥇 1🥈 0🥉');
    expect(text).toContain('1🥇 0🥈 0🥉');
    expect(text).not.toContain('3🥇');
    expect(text).not.toContain('Полная история');
    expect(text).not.toContain('/dog/');
  });

  it('hides empty racing block', () => {
    const text = formatDogCard(
      sampleDog({
        racing_stats: {
          total_starts: 0,
          best_speed: null,
          gold: 0,
          silver: 0,
          bronze: 0,
        },
      }),
    );
    expect(text).toContain('Курсинг');
    expect(text).not.toContain('Бега борзых');
  });

  it('shows shows summary when provided', () => {
    const text = formatDogCard(sampleDog(), {
      shows: {
        total_shows: 2,
        best_award: 'YKCHP',
        title_keys: ['YKCHP', 'VKCHP'],
        title_counts: { YKCHP: 1, VKCHP: 1 },
      },
    });
    expect(text).toContain('Выставки');
    expect(text).toContain('Участий: 2');
    expect(text).toContain('лучшая награда: ЮКЧП');
    expect(text).toContain('ЮКЧП, ВКЧП');
    expect(text).not.toContain('Титулов:');
  });

  it('formats title counts inline', () => {
    const text = formatDogCard(sampleDog(), {
      shows: {
        total_shows: 10,
        best_award: 'BIS',
        title_keys: ['BIS', 'BIG', 'BOB', 'CAC', 'CHRKF'],
        title_counts: { BIS: 1, BIG: 1, BOB: 5, CAC: 7, CHRKF: 1 },
      },
    });
    expect(text).toContain('BIS, BIG, ЛПП ×5, CAC ×7, ЧРКФ');
  });

  it('does not dump competition history', () => {
    const text = formatDogCard(
      sampleDog({
        competitions: [{ id: 1, location: 'x', title: 'Event 1' }] as never,
      }),
    );
    expect(text).not.toContain('Event 1');
  });
});
