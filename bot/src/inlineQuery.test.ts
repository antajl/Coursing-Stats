import { describe, it, expect } from 'vitest';
import {
  buildInlineDogResult,
  buildInlineDoninoResults,
  collectDoninoBreeds,
  getSpeedKmh,
  isDoninoInlineQuery,
  matchDoninoBreeds,
  parseDoninoInlineQuery,
} from './inlineQuery';
import { botStartLink } from './constants';

describe('inlineQuery', () => {
  it('includes open-in-bot deep link on each result', () => {
    const result = buildInlineDogResult({
      id: 123,
      name_lat: 'REX',
      name_ru: 'Рекс',
      breed: 'Уиппет',
      competition_count: 7,
    });

    expect(result.reply_markup).toBeDefined();
    const buttons = result.reply_markup!.inline_keyboard.flat();
    const openBot = buttons.find((b) => 'url' in b && b.url === botStartLink('dog_123'));
    const openSite = buttons.find((b) => 'url' in b && b.url === 'https://coursing-stats.ru/dog/123');
    expect(openBot).toBeDefined();
    expect(openSite).toBeDefined();
  });

  it('detects donino phrase keywords case-insensitively', () => {
    expect(isDoninoInlineQuery('донино')).toBe(true);
    expect(isDoninoInlineQuery('ДОНИНО')).toBe(true);
    expect(isDoninoInlineQuery('Donino')).toBe(true);
    expect(isDoninoInlineQuery('DONINO')).toBe(true);
    expect(isDoninoInlineQuery('донино салюки')).toBe(true);
    expect(isDoninoInlineQuery('donino whippet')).toBe(true);
    expect(isDoninoInlineQuery('рекорды')).toBe(false);
    expect(isDoninoInlineQuery('тайга')).toBe(false);
  });

  it('parses breed from donino inline query', () => {
    expect(parseDoninoInlineQuery('донино')).toEqual({});
    expect(parseDoninoInlineQuery('донино салюки')).toEqual({ breedQuery: 'салюки' });
    expect(parseDoninoInlineQuery('Donino Уиппет')).toEqual({ breedQuery: 'Уиппет' });
    expect(parseDoninoInlineQuery('донино с')).toEqual({});
    expect(parseDoninoInlineQuery('тайга')).toBeNull();
  });

  it('matches breeds by partial name', () => {
    const breeds = ['Салюки', 'Уиппет', 'Русская псовая борзая'];
    expect(matchDoninoBreeds('салюки', breeds)).toEqual(['Салюки']);
    expect(matchDoninoBreeds('уип', breeds)).toEqual(['Уиппет']);
    expect(matchDoninoBreeds('борзая', breeds)).toEqual(['Русская псовая борзая']);
    expect(matchDoninoBreeds('чих', breeds)).toEqual([]);
  });

  it('builds speed and coursing donino cards', () => {
    const results = buildInlineDoninoResults(
      [{ name: 'Fast', breed: 'Салюки', speed_kmh: 52.1, date: '2024-01-01' }],
      [{ name: 'Quick', breed: 'Уиппет', time_seconds: 19.5, date: '2024-01-02' }]
    );

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('donino_speed');
    expect(results[0].title).toContain('Личные рекорды скорости Курсинг в Донино');
    expect(results[1].id).toBe('donino_coursing');
    expect(results[1].title).toContain('Личные рекорды рейсинг Донино 350м');

    const speedText = results[0].input_message_content.message_text;
    expect(speedText).toContain('Fast');
    expect(speedText).toContain('52.1');

    const buttons = results[0].reply_markup!.inline_keyboard.flat();
    expect(buttons.some((b) => 'url' in b && b.url === botStartLink('donino'))).toBe(true);
    expect(buttons.some((b) => 'url' in b && b.url === 'https://coursing-stats.ru/speed-records')).toBe(true);
  });

  it('adds breed suffix and site filter when breed selected', () => {
    const results = buildInlineDoninoResults(
      [{ name: 'Fast', breed: 'Салюки', speed_kmh: 52.1, date: '2024-01-01' }],
      [{ name: 'Quick', breed: 'Салюки', time_seconds: 19.5, date: '2024-01-02' }],
      { breedLabel: 'Салюки', siteBreeds: ['Салюки'] }
    );

    expect(results[0].title).toContain('· Салюки');
    expect(results[0].id).toBe('donino_speed:Салюки');

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
