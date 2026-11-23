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
  it('parses multi-sheet Excel calendar workbook directly in memory', () => {
    const buffer = createMockRkfCalendarBuffer();
    const events = parseRkfCalendarWorkbook(buffer);

    expect(events.length).toBe(4);

    const coursingApproved = events.find(e => e.club === 'МОКО Русский простор');
    expect(coursingApproved).toBeDefined();
    expect(coursingApproved.discipline).toBe('Курсинг борзых');
    expect(coursingApproved.rank).toBe('ЧРКФ-CACL');
    expect(coursingApproved.dateRaw).toBe('10-11.05.2026');
    expect(coursingApproved.status).toBe(APPROVAL_STATUS.APPROVED);
    expect(coursingApproved.calendarCode).toBe('2026/К-12');
    expect(coursingApproved.judges).toBe('Козлова И.В.');

    const coursingPending = events.find(e => e.club === 'СООК Догвилл');
    expect(coursingPending.status).toBe(APPROVAL_STATUS.PENDING);

    const coursingRejected = events.find(e => e.club === 'ТГОО Клуб Борзых');
    expect(coursingRejected.status).toBe(APPROVAL_STATUS.REJECTED);

    const agilityEvent = events.find(e => e.discipline === 'Аджилити');
    expect(agilityEvent).toBeDefined();
    expect(agilityEvent.status).toBe(APPROVAL_STATUS.APPROVED);
    expect(agilityEvent.location).toBe('Москва');
  });

  it('detects newly approved competitions in computeCalendarDiff', () => {
    const buffer = createMockRkfCalendarBuffer();
    const initialEvents = parseRkfCalendarWorkbook(buffer);

    // Simulate update: СООК Догвилл gets approved
    const updatedEvents = initialEvents.map(e => {
      if (e.club === 'СООК Догвилл') {
        return {
          ...e,
          status: APPROVAL_STATUS.APPROVED,
          calendarCode: '2026/К-15'
        };
      }
      return e;
    });

    const diff = computeCalendarDiff(initialEvents, updatedEvents);

    expect(diff.hasChanges).toBe(true);
    expect(diff.newlyApproved.length).toBe(1);
    expect(diff.newlyApproved[0].event.club).toBe('СООК Догвилл');
    expect(diff.newlyApproved[0].previousStatus).toBe(APPROVAL_STATUS.PENDING);
  });

  it('filters events by search query, discipline and city', () => {
    const buffer = createMockRkfCalendarBuffer();
    const events = parseRkfCalendarWorkbook(buffer);

    const coursingOnly = filterCalendarEvents(events, { discipline: 'Курсинг борзых' });
    expect(coursingOnly.length).toBe(3);

    const querySearch = filterCalendarEvents(events, { query: 'Тверь' });
    expect(querySearch.length).toBe(1);
    expect(querySearch[0].club).toBe('ТГОО Клуб Борзых');

    const approvedOnly = filterCalendarEvents(events, { status: APPROVAL_STATUS.APPROVED });
    expect(approvedOnly.length).toBe(2);
  });

  it('extracts unique filter facets for UI and bot dropdowns', () => {
    const buffer = createMockRkfCalendarBuffer();
    const events = parseRkfCalendarWorkbook(buffer);
    const facets = extractFilterFacets(events);

    expect(facets.disciplines).toContain('Курсинг борзых');
    expect(facets.disciplines).toContain('Аджилити');
    expect(facets.cities.length).toBeGreaterThan(0);
  });
});
