import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scrapeYearPageFromHtml } from '../parsers/calendar/scrape-year-page';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, 'fixtures/calendar', name), 'utf-8');

describe('calendar scrape-year-page', () => {
  it('2025: expected event count matches procoursing calendar rows', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2025.html'), 2025);
    expect(events.length).toBe(50);
  });

  it('2026: keeps working event count', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2026.html'), 2026);
    expect(events.length).toBeGreaterThan(40);
  });

  it('2025: multi-day date range preserved', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2025.html'), 2025);
    const yaroslavlCoursing = events.find(
      (e) =>
        e.date_start === '2025-04-05' &&
        e.date_end === '2025-04-06' &&
        e.rank_label.includes('Курсинг борзых') &&
        e.location.includes('Первитино')
    );
    expect(yaroslavlCoursing).toBeTruthy();
  });

  it('2025: combined discipline row keeps full rank_label text', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2025.html'), 2025);
    const donino = events.find(
      (e) => e.date_start === '2025-08-03' && e.location.toLowerCase().includes('донино')
    );
    expect(donino?.rank_label).toMatch(/Курсинг борзых/);
    expect(donino?.rank_label).toMatch(/БЗМП/);
    expect(donino?.rank_label).toMatch(/Американский стаффордширский терьер/);
  });

  it('2025: picks main Complete_Results href (not by_Runs)', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2025.html'), 2025);
    const donino = events.find((e) => e.date_start === '2025-08-03');
    expect(donino?.results_url).toMatch(/Complete_Results_2025-08-03\.html$/);
    expect(donino?.results_url).not.toMatch(/_by_/);
  });

  it('2025: Результаты состязания link without "Полные"', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2025.html'), 2025);
    const cacmb = events.find((e) => e.date_start === '2025-09-20' && e.competition_kind === 'CACMB');
    expect(cacmb?.results_url).toMatch(/Complete_Results_2025-09-20_B_NSB\.html$/);
  });

  it('2025: cancelled flag from rank_label', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2025.html'), 2025);
    const vologda = events.find(
      (e) => e.date_start === '2025-08-30' && e.rank_label.includes('Бега борзых')
    );
    expect(vologda?.cancelled).toBe(true);
    expect(vologda?.rank_label).toMatch(/\[отменён\]/i);
  });

  it('2026: date range and confirmed flag', () => {
    const events = scrapeYearPageFromHtml(fixture('s_2026.html'), 2026);
    const kazan = events.find(
      (e) =>
        e.date_start === '2026-04-18' &&
        e.date_end === '2026-04-19' &&
        e.rank_label.includes('Курсинг борзых')
    );
    expect(kazan?.confirmed).toBe(1);
    expect(kazan?.results_url).toMatch(/Complete_Results_Coursing\.html$/);
  });
});
