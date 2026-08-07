import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRacingHTML } from '../parsers/racing/index';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, 'fixtures/racing', name), 'utf-8');

describe('racing heat bib numbers', () => {
  it('2025 CC: парсит номер забега и цвет попоны (не 1,2,3 подряд)', async () => {
    const html = await fetch('http://procoursing.ru/2025/Complete_Results_2025-06-08.html')
      .then((r) => r.arrayBuffer())
      .then((buf) => new TextDecoder('windows-1251').decode(buf))
      .catch(() => null);

    if (!html || html.includes('Ошибка 404') || !html.includes('<table')) {
      // offline или 404 — пропускаем live fetch
      return;
    }

    const { results } = await parseRacingHTML(html);
    const woken = results.find((r) => r.name?.includes('WOKEN UP IN HIGHLANDS'));
    expect(woken).toBeTruthy();
    const heats = JSON.parse(woken!.raw_scores_json).heats;
    expect(heats.map((h: { bib_number: number }) => h.bib_number)).toEqual([1, 4]);
    expect(heats.map((h: { bib_color: string }) => h.bib_color)).toEqual(['red', 'black']);
    expect(heats.map((h: { heat_number: number }) => h.heat_number)).toEqual([32, 40]);

    const ingrid = results.find((r) => r.name?.includes('INGRID ELEGANT'));
    const ingridHeats = JSON.parse(ingrid!.raw_scores_json).heats;
    expect(ingridHeats.map((h: { bib_number: number }) => h.bib_number)).toEqual([2, 1, 4]);
    expect(ingridHeats.map((h: { bib_color: string }) => h.bib_color)).toEqual(['blue', 'red', 'black']);
  });

  it('fixture sample: два забега с номерами из колонки «Попона»', async () => {
    const { results } = await parseRacingHTML(fixture('Complete_Results_2025-cc-sample.html'));
    const dog = results.find((r) => r.name?.includes('ARISTOKRATIYA'));
    expect(dog).toBeTruthy();
    const heats = JSON.parse(dog!.raw_scores_json).heats;
    expect(heats).toHaveLength(2);
    expect(heats[0].heat_number).toBe(46);
    expect(heats[0].bib_number).toBe(1);
    expect(heats[0].bib_color).toBe('red');
    expect(heats[1].heat_number).toBe(63);
    expect(heats[1].bib_number).toBe(1);
    expect(dog?.vc).toBe('CC');
  });

  it('2025 CC: парсит группы «Микс» без bgcolor на заголовке', async () => {
    const html = await fetch('http://procoursing.ru/2025/Complete_Results_2025-06-08.html')
      .then((r) => r.arrayBuffer())
      .then((buf) => new TextDecoder('windows-1251').decode(buf))
      .catch(() => null);

    if (!html || html.includes('Ошибка 404') || !html.includes('<table')) return;

    const { results } = await parseRacingHTML(html);
    const classes = [...new Set(results.map((r) => r.breed_class))];
    expect(classes).toContain('Басенджи - Стандартный - Микс');
    expect(classes).toContain('Малая итальянская борзая - Юниоры - Микс');
    expect(classes).toContain('Фараонова собака - Стандартный - Микс');
  });
});
