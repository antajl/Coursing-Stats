import { describe, it, expect } from 'vitest';
import {
  parseRkfCalendarWorkbook,
  computeCalendarDiff,
  filterCalendarEvents,
  extractFilterFacets,
  APPROVAL_STATUS
} from '../index.js';
import { createMockRkfCalendarBuffer } from './fixtures.js';

describe('RKF Calendar In-Memory Parser (Track 4)', () => {
  it('parses real RKF structure and converts Excel date serial numbers', () => {
    const buffer = createMockRkfCalendarBuffer();
    const events = parseRkfCalendarWorkbook(buffer);

    expect(events.length).toBe(4);

    const coursingApproved = events.find(e => e.club.includes('Ярославский'));
    expect(coursingApproved).toBeDefined();
    expect(coursingApproved.discipline).toBe('Курсинг борзых');
    expect(coursingApproved.rank).toBe('ЧРКФ');
    expect(coursingApproved.dateRaw).toBe('04-05.04.2026'); // converted from 46116-46117
    expect(coursingApproved.status).toBe(APPROVAL_STATUS.APPROVED);
    expect(coursingApproved.reglament).toContain('утвержден');
    expect(coursingApproved.summary).toContain('2404/1');

    const coursingDelayed = events.find(e => e.club.includes('Альянс'));
    expect(coursingDelayed.status).toBe(APPROVAL_STATUS.DELAYED);
    expect(coursingDelayed.summary).toContain('Задержано');

    const coursingRejected = events.find(e => e.club.includes('ТГОО'));
    expect(coursingRejected.status).toBe(APPROVAL_STATUS.REJECTED);

    const racingEvent = events.find(e => e.discipline === 'Бега борзых');
    expect(racingEvent).toBeDefined();
    expect(racingEvent.status).toBe(APPROVAL_STATUS.APPROVED);
    expect(racingEvent.location).toContain('Суханово');
  });

  it('detects newly approved competitions in computeCalendarDiff', () => {
    const buffer = createMockRkfCalendarBuffer();
    const initialEvents = parseRkfCalendarWorkbook(buffer);

    // Simulate update: ОО Альянс becomes approved
    const updatedEvents = initialEvents.map(e => {
      if (e.club.includes('Альянс')) {
        return {
          ...e,
          status: APPROVAL_STATUS.APPROVED,
          reglament: 'утвержден, Карелина Н.В.',
          summary: 'Принята: Вх.№ 2596'
        };
      }
      return e;
    });

    const diff = computeCalendarDiff(initialEvents, updatedEvents);

    expect(diff.hasChanges).toBe(true);
    expect(diff.newlyApproved.length).toBe(1);
    expect(diff.newlyApproved[0].event.club).toContain('Альянс');
    expect(diff.newlyApproved[0].previousStatus).toBe(APPROVAL_STATUS.DELAYED);
  });

  it('filters events by search query, discipline and city', () => {
    const buffer = createMockRkfCalendarBuffer();
    const events = parseRkfCalendarWorkbook(buffer);

    const coursingOnly = filterCalendarEvents(events, { discipline: 'Курсинг борзых' });
    expect(coursingOnly.length).toBe(3);

    const querySearch = filterCalendarEvents(events, { query: 'Суханово' });
    expect(querySearch.length).toBe(1);
    expect(querySearch[0].discipline).toBe('Бега борзых');

    const approvedOnly = filterCalendarEvents(events, { status: APPROVAL_STATUS.APPROVED });
    expect(approvedOnly.length).toBe(2);
  });

  it('extracts unique filter facets for UI and bot dropdowns', () => {
    const buffer = createMockRkfCalendarBuffer();
    const events = parseRkfCalendarWorkbook(buffer);
    const facets = extractFilterFacets(events);

    expect(facets.disciplines).toContain('Курсинг борзых');
    expect(facets.disciplines).toContain('Бега борзых');
    expect(facets.cities.length).toBeGreaterThan(0);
  });
});
