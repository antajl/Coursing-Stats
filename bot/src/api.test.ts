import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CoursingStatsAPI } from './api';

function createMockKV() {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string, type?: 'text' | 'json') => {
      const val = store.get(key);
      if (val == null) return null;
      if (type === 'json') return JSON.parse(val);
      return val;
    }),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
    _store: store,
  };
}

/** API retries fetch up to 3× with 1s/2s delays — advance fake timers in tests. */
async function runWithTimers<T>(fn: () => Promise<T>): Promise<T> {
  const promise = fn();
  await vi.runAllTimersAsync();
  return promise;
}

describe('CoursingStatsAPI', () => {
  let api: CoursingStatsAPI;
  let mockKV: ReturnType<typeof createMockKV>;
  const baseUrl = 'https://coursing-stats.ru/data/v1';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockKV = createMockKV();
    api = new CoursingStatsAPI(mockKV as never, 'https://coursing-stats.ru');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe('searchDogsByName', () => {
    it('returns empty array when index fetch fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      const result = await runWithTimers(() => api.searchDogsByName('rex'));
      expect(result).toEqual([]);
    });

    it('finds dogs via full dogs-index fallback', async () => {
      const dogs = [
        { id: 1, name_lat: 'REX', name_ru: 'Рекс', breed: 'Уиппет', competition_count: 5 },
        { id: 2, name_lat: 'BELLA', name_ru: 'Белла', breed: 'Салюки', competition_count: 2 },
      ];

      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          if (url.includes('bot-search-compact')) {
            return { ok: false, status: 404 };
          }
          if (url.includes('dogs-index')) {
            return { ok: true, text: async () => JSON.stringify(dogs) };
          }
          return { ok: false, status: 404 };
        })
      );

      const result = await runWithTimers(() => api.searchDogsByName('rex', undefined, 5));
      expect(result).toHaveLength(1);
      expect(result[0].name_lat).toBe('REX');
    });

    it('respects limit parameter', async () => {
      const dogs = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name_lat: `Dog${i}`,
        name_ru: `Собака${i}`,
        breed: 'Breed',
        competition_count: i,
      }));

      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string) => {
          if (url.includes('dogs-index')) {
            return { ok: true, text: async () => JSON.stringify(dogs) };
          }
          return { ok: false, status: 404 };
        })
      );

      const result = await runWithTimers(() => api.searchDogsByName('dog', undefined, 3));
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getDogById', () => {
    it('returns null when dog not found', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      const result = await runWithTimers(() => api.getDogById('999999'));
      expect(result).toBeNull();
    });

    it('returns dog profile when found', async () => {
      const mockDogData = {
        schema: 'coursing-stats/index-dog-profile-v1',
        exported_at: '2026-07-26',
        dog: {
          id: 1,
          dog_key: '1',
          name_lat: 'Test Dog',
          name_ru: 'Тестовая собака',
          breed: 'Breed',
          sex: 'M',
          owner: null,
          pedigree_url: null,
          coursing_stats: {
            total_starts: 10,
            best_score: 100,
            avg_score: 80,
            gold: 1,
            silver: 2,
            bronze: 3,
          },
          racing_stats: {
            total_starts: 2,
            best_speed: 50,
            avg_speed: 45,
            gold: 0,
            silver: 0,
            bronze: 0,
          },
        },
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify(mockDogData),
        })
      );

      const result = await runWithTimers(() => api.getDogById('1'));
      expect(result?.dog.id).toBe(1);
      expect(result?.dog.name_lat).toBe('Test Dog');
    });
  });

  describe('getTopRatings', () => {
    it('returns empty array when CDN responds 404', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      const result = await runWithTimers(() => api.getTopRatings('coursing', 'score', '2026'));
      expect(result).toEqual([]);
    });

    it('parses items array from top-score index', async () => {
      const mockRatings = {
        items: [
          { dog_id: 1, name_lat: 'Dog1', rating_score: 100, breed: 'Breed1' },
          { dog_id: 2, name_lat: 'Dog2', rating_score: 90, breed: 'Breed2' },
        ],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify(mockRatings),
        })
      );

      const result = await runWithTimers(() => api.getTopRatings('coursing', 'score', '2026', 10));
      expect(result).toHaveLength(2);
      expect(result[0].name_lat).toBe('Dog1');
    });

    it('uses top-speed index for racing discipline', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ items: [{ dog_id: 1, name_lat: 'Fast', best_speed: 60 }] }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await runWithTimers(() => api.getTopRatings('racing', 'placement', '2026', 5));

      expect(fetchMock).toHaveBeenCalledWith(`${baseUrl}/indexes/top-speed-2026.json`);
    });
  });

  describe('getSpeedRecords', () => {
    it('returns empty arrays when CDN fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      const result = await runWithTimers(() => api.getSpeedRecords());
      expect(result).toEqual({ speed: [], coursing: [] });
    });

    it('returns speed and coursing records', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({
            ok: true,
            text: async () => JSON.stringify({
              records: [{ name: 'Dog1', breed: 'Breed1', speed_kmh: 60, date: '2026-07-26' }],
            }),
          })
          .mockResolvedValueOnce({
            ok: true,
            text: async () => JSON.stringify({
              records: [{ name: 'Dog2', breed: 'Breed2', time_seconds: 25, date: '2026-07-26' }],
            }),
          })
      );

      const result = await runWithTimers(() => api.getSpeedRecords());
      expect(result.speed).toHaveLength(1);
      expect(result.coursing).toHaveLength(1);
    });
  });

  describe('getCalendar', () => {
    it('returns empty array when data not found', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      const result = await runWithTimers(() => api.getCalendar('2026'));
      expect(result).toEqual([]);
    });

    it('returns calendar events when data exists', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify({
            events: [{ id: 1, title: 'Event1', date_start: '2026-07-26', location: 'Location1' }],
          }),
        })
      );

      const result = await runWithTimers(() => api.getCalendar('2026'));
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Event1');
    });
  });

  describe('getShowsCalendar', () => {
    it('maps exhibitions array to Competition shape', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify({
            exhibitions: [
              { id: 100, date: '15.08.2026', title: 'Выставка', location: 'Москва' },
            ],
          }),
        })
      );

      const result = await runWithTimers(() => api.getShowsCalendar('2026'));
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(100);
      expect(result[0].date_start).toBe('2026-08-15');
      expect(result[0].event_type).toBe('show');
    });
  });

  describe('getShows', () => {
    it('returns empty array when data not found', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

      const result = await runWithTimers(() => api.getShows('2026'));
      expect(result).toEqual([]);
    });

    it('handles flat array format', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([
            { name_lat: 'Dog1', points: 100 },
            { name_lat: 'Dog2', points: 90 },
          ]),
        })
      );

      const result = await runWithTimers(() => api.getShows('2026'));
      expect(result).toHaveLength(2);
    });
  });

  describe('getJudgesSummary / getShowJudges', () => {
    it('returns judges when data exists', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([{ judge_name: 'Judge1', rings: 50 }]),
        })
      );

      const result = await runWithTimers(() => api.getJudgesSummary());
      expect(result).toHaveLength(1);
    });

    it('returns show judges when data exists', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: async () => JSON.stringify([{ judge_name: 'Judge1', rings: 30 }]),
        })
      );

      const result = await runWithTimers(() => api.getShowJudges());
      expect(result).toHaveLength(1);
    });
  });
});
