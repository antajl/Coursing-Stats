import { describe, it, expect } from 'vitest';
import {
  buildInlineDogResult,
  buildInlineDoninoDogResults,
  buildInlineDoninoResults,
  collectDoninoBreeds,
  findDoninoDogsByName,
  getSpeedKmh,
  isDoninoInlineQuery,
  matchDoninoBreeds,
  parseDoninoInlineQuery,
  parseDoninoDiscipline,
} from './inlineQuery';
import { botStartLink } from './constants';

describe('inlineQuery', () => {
  it('builds full dog profile card for inline result', () => {
    const result = buildInlineDogResult({
      schema: 'test',
      exported_at: '2026-01-01',
      dog: {
        id: 123,
        dog_key: '123',
        name_lat: 'REX',
        name_ru: 'Рекс',
        breed: 'Уиппет',
        sex: 'M',
        owner: null,
        pedigree_url: null,
        coursing_stats: {
          total_starts: 7,
          best_score: 300,
          best_judge_score: 90,
          gold: 1,
          silver: 0,
          bronze: 0,
        },
        racing_stats: {
          total_starts: 0,
          best_speed: null,
          gold: 0,
          silver: 0,
          bronze: 0,
        },
      },
    });

    expect(result.title).toContain('REX');
    expect(result.description).toContain('Курсинг: 7');
    expect(result.input_message_content.message_text).toContain('Участий: 7');
    expect(result.input_message_content.message_text).toContain('лучший балл: 300');
    expect(result.input_message_content.message_text).not.toContain('Открыть в боте');
    expect(result.input_message_content.message_text).not.toContain('Бега борзых');

    const buttons = result.reply_markup!.inline_keyboard.flat();
    const site = buttons.find((b) => 'url' in b && b.url === 'https://coursing-stats.ru/dog/123');
    const favorite = buttons.find((b) => 'callback_data' in b && b.callback_data === 'add_favorite:123');
    expect(site).toBeDefined();
    expect(site && 'text' in site ? site.text : null).toBe('Профиль на сайте');
    expect(favorite).toBeDefined();
  });

  it('includes show titles in inline dog card', () => {
    const result = buildInlineDogResult(
      {
        schema: 'test',
        exported_at: '2026-01-01',
        dog: {
          id: 5657,
          dog_key: '5657',
          name_lat: 'LEVIATHAN',
          name_ru: null,
          breed: 'УИППЕТ',
          sex: null,
          owner: null,
          pedigree_url: null,
          coursing_stats: {
            total_starts: 1,
            best_score: 100,
            gold: 0,
            silver: 0,
            bronze: 0,
          },
          racing_stats: {
            total_starts: 0,
            best_speed: null,
            gold: 0,
            silver: 0,
            bronze: 0,
          },
        },
      },
      {
        shows: {
          total_shows: 2,
          best_award: 'YKCHP',
          title_keys: ['YKCHP', 'VKCHP'],
          title_counts: { YKCHP: 1, VKCHP: 1 },
        },
      },
    );

    expect(result.description).toContain('Выставки: 2');
    expect(result.input_message_content.message_text).toContain('ЮКЧП, ВКЧП');
  });

  it('detects donino phrase keywords case-insensitively', () => {
    expect(isDoninoInlineQuery('донино')).toBe(true);
    expect(isDoninoInlineQuery('ДОНИНО')).toBe(true);
    expect(isDoninoInlineQuery('Donino')).toBe(true);
    expect(isDoninoInlineQuery('DONINO')).toBe(true);
    expect(isDoninoInlineQuery('донино салюки')).toBe(true);
    expect(isDoninoInlineQuery('donino whippet')).toBe(true);
    expect(isDoninoInlineQuery('донино тайга')).toBe(true);
    expect(isDoninoInlineQuery('рекорды')).toBe(false);
    expect(isDoninoInlineQuery('тайга')).toBe(false);
  });

  it('parses term from donino inline query', () => {
    expect(parseDoninoInlineQuery('донино')).toEqual({});
    expect(parseDoninoInlineQuery('донино салюки')).toEqual({ term: 'салюки' });
    expect(parseDoninoInlineQuery('Donino Уиппет')).toEqual({ term: 'Уиппет' });
    expect(parseDoninoInlineQuery('донино тайга')).toEqual({ term: 'тайга' });
    expect(parseDoninoInlineQuery('донино курсинг')).toEqual({ term: 'курсинг' });
    expect(parseDoninoInlineQuery('донино рейсинг')).toEqual({ term: 'рейсинг' });
    expect(parseDoninoInlineQuery('донино с')).toEqual({});
    expect(parseDoninoInlineQuery('тайга')).toBeNull();
  });

  it('parses donino discipline keywords', () => {
    expect(parseDoninoDiscipline('курсинг')).toEqual({ discipline: 'speed' });
    expect(parseDoninoDiscipline('рейсинг')).toEqual({ discipline: 'racing' });
    expect(parseDoninoDiscipline('Курсинг')).toEqual({ discipline: 'speed' });
    expect(parseDoninoDiscipline('racing')).toEqual({ discipline: 'racing' });
    expect(parseDoninoDiscipline('курсинг салюки')).toEqual({ discipline: 'speed', rest: 'салюки' });
    expect(parseDoninoDiscipline('тайга')).toBeNull();
  });

  it('builds only one discipline when requested', () => {
    const speedOnly = buildInlineDoninoResults(
      [{ name: 'Fast', breed: 'Салюки', speed_kmh: 52.1, date: '2024-01-01' }],
      [{ name: 'Quick', breed: 'Уиппет', time_seconds: 19.5, date: '2024-01-02' }],
      { only: 'speed' }
    );
    expect(speedOnly).toHaveLength(1);
    expect(speedOnly[0].title).toBe('Рекорд скорости | Курсинг');

    const racingOnly = buildInlineDoninoResults(
      [{ name: 'Fast', breed: 'Салюки', speed_kmh: 52.1, date: '2024-01-01' }],
      [{ name: 'Quick', breed: 'Уиппет', time_seconds: 19.5, date: '2024-01-02' }],
      { only: 'racing' }
    );
    expect(racingOnly).toHaveLength(1);
    expect(racingOnly[0].title).toBe('Рекорд времени | Рейсинг 350м');
  });

  it('matches breeds by partial name', () => {
    const breeds = ['Салюки', 'Уиппет', 'Русская псовая борзая'];
    expect(matchDoninoBreeds('салюки', breeds)).toEqual(['Салюки']);
    expect(matchDoninoBreeds('уип', breeds)).toEqual(['Уиппет']);
    expect(matchDoninoBreeds('борзая', breeds)).toEqual(['Русская псовая борзая']);
    expect(matchDoninoBreeds('чих', breeds)).toEqual([]);
  });

  it('finds donino dogs by name using best records and full timeline', () => {
    const hits = findDoninoDogsByName(
      'тайга',
      [
        { name: 'Тайга', breed: 'Салюки', speed_kmh: 51, speed_km_h: 51, date: '2025-07-06', sex: 'С' },
        { name: 'Тайга', breed: 'Салюки', speed_kmh: 55, speed_km_h: 55, date: '2026-05-11', sex: 'С', track_type: 'прямая', status: 'improved' },
        { name: 'Другая', breed: 'Уиппет', speed_kmh: 50, date: '2024-01-01' },
      ],
      [{ name: 'Тайга', breed: 'Салюки', time_seconds: 26.45, date: '2026-08-01', status: 'improved', history: [{ time_seconds: 27.39, date: '2026-05-31' }] }]
    );

    expect(hits).toHaveLength(1);
    expect(hits[0].name).toBe('Тайга');
    expect(getSpeedKmh(hits[0].speed!)).toBe(55);
    expect(hits[0].speedTimeline).toHaveLength(2);
    expect(hits[0].coursing?.time_seconds).toBe(26.45);
    expect(hits[0].coursingTimeline).toHaveLength(2);
  });

  it('builds donino dog cards with site-like history', () => {
    const results = buildInlineDoninoDogResults([
      {
        name: 'Афи',
        breed: 'Уиппет',
        sex: 'С',
        speed: {
          name: 'Афи',
          breed: 'Уиппет',
          speed_kmh: 56,
          speed_km_h: 56,
          date: '2026-05-14',
          track_type: 'прямая',
          screenshot_url: 'https://example.com/shot',
        },
        speedTimeline: [
          { name: 'Афи', breed: 'Уиппет', speed_kmh: 56, speed_km_h: 56, date: '2026-05-14' },
          { name: 'Афи', breed: 'Уиппет', speed_kmh: 55, speed_km_h: 55, date: '2026-05-11' },
          { name: 'Афи', breed: 'Уиппет', speed_kmh: 56, speed_km_h: 56, date: '2025-11-22' },
          { name: 'Афи', breed: 'Уиппет', speed_kmh: 53, speed_km_h: 53, date: '2025-11-08' },
          { name: 'Афи', breed: 'Уиппет', speed_kmh: 51, speed_km_h: 51, date: '2025-07-06' },
        ],
        coursing: {
          name: 'Афи',
          breed: 'Уиппет',
          time_seconds: 25.45,
          date: '2026-06-06',
        },
        coursingTimeline: [
          { name: 'Афи', breed: 'Уиппет', time_seconds: 25.45, date: '2026-06-06' },
        ],
      },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Афи (Уиппет)');
    expect(results[0].description).toBe('56 км/ч · 25.45 сек');
    const text = results[0].input_message_content.message_text;
    expect(text).toContain('56 км/ч');
    expect(text).toContain('сука');
    expect(text).toContain('прямая');
    expect(text).not.toContain('Было:');
    expect(text).toContain('11.05.2026 — 55 км/ч');
    expect(text).toContain('06.07.2025 — 51 км/ч');

    const buttons = results[0].reply_markup!.inline_keyboard.flat();
    expect(buttons.some((b) => 'url' in b && b.url?.includes('/donino-dog/'))).toBe(true);
    expect(buttons.some((b) => 'url' in b && b.url === 'https://example.com/shot')).toBe(true);
  });

  it('builds speed and coursing donino cards', () => {
    const results = buildInlineDoninoResults(
      [{ name: 'Fast', breed: 'Салюки', speed_kmh: 52.1, date: '2024-01-01' }],
      [{ name: 'Quick', breed: 'Уиппет', time_seconds: 19.5, date: '2024-01-02' }]
    );

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('donino_speed_v8');
    expect(results[0].title).toBe('Рекорд скорости | Курсинг');
    expect(results[0].description).toBe('Fast — 52.1 км/ч (Салюки)');
    expect(results[1].id).toBe('donino_coursing_v8');
    expect(results[1].title).toBe('Рекорд времени | Рейсинг 350м');
    expect(results[1].description).toBe('Quick — 19.5 сек (Уиппет)');

    const speedText = results[0].input_message_content.message_text;
    expect(speedText).toContain('Fast');
    expect(speedText).toContain('52.1');
    expect(speedText).toBe('<b>Рекорд скорости | Курсинг</b>\n\n1. Fast — 52.1 км/ч (Салюки)');
    expect(speedText).not.toContain('<i>');

    const buttons = results[0].reply_markup!.inline_keyboard.flat();
    expect(buttons.some((b) => 'url' in b && b.url === botStartLink('donino'))).toBe(true);
    expect(buttons.some((b) => 'url' in b && b.url === 'https://coursing-stats.ru/speed-records')).toBe(true);
    expect(buttons.some((b) => 'url' in b && b.url === 'https://runningdog.ru/')).toBe(true);
    expect(buttons.map((b) => ('text' in b ? b.text : '')).sort()).toEqual([
      'Открыть Курсинг Донино',
      'Открыть в боте',
      'Открыть на сайте',
    ].sort());
  });

  it('adds breed suffix and site filter when breed selected', () => {
    const results = buildInlineDoninoResults(
      [{ name: 'Fast', breed: 'Салюки', speed_kmh: 52.1, date: '2024-01-01' }],
      [{ name: 'Quick', breed: 'Салюки', time_seconds: 19.5, date: '2024-01-02' }],
      { breedLabel: 'Салюки', siteBreeds: ['Салюки'] }
    );

    expect(results[0].title).toBe('Рекорд скорости | Курсинг · Салюки');
    expect(results[0].description).toContain('(Салюки)');
    expect(results[0].id).toBe('donino_speed_v8:Салюки');
    expect(results[0].input_message_content.message_text).toContain('Курсинг · Салюки');
    expect(results[1].title).toBe('Рекорд времени | Рейсинг 350м · Салюки');

    const buttons = results[0].reply_markup!.inline_keyboard.flat();
    const siteBtn = buttons.find((b) => 'url' in b && b.url?.includes('breeds='));
    expect(siteBtn).toBeDefined();
    expect((siteBtn as { url: string }).url).toContain(encodeURIComponent('Салюки'));
  });

  it('collects unique breeds from both datasets', () => {
    expect(
      collectDoninoBreeds(
        [{ name: 'A', breed: 'Салюки', speed_kmh: 1, date: '' }],
        [{ name: 'B', breed: 'Уиппет', time_seconds: 1, date: '' }]
      )
    ).toEqual(['Салюки', 'Уиппет']);
  });

  it('reads speed from extended field names', () => {
    expect(getSpeedKmh({ name: 'A', breed: 'B', speed_kmh: 40, date: '' })).toBe(40);
    expect(getSpeedKmh({ name: 'A', breed: 'B', speed_km_h: 41, date: '' } as never)).toBe(41);
  });
});
