import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CALENDAR_INDEX = path.join(ROOT, 'data/v1/indexes/calendar-index.json');
const CAL_2026 = path.join(ROOT, 'data/v1/calendar/2026.json');

describe('calendar participants count', () => {
  it('ensures all 2026 competitions with results have participants_count matching their protocol', () => {
    const raw = JSON.parse(fs.readFileSync(CAL_2026, 'utf-8')) as {
      events: Array<{
        id: number;
        title: string;
        has_results?: boolean;
        results_file?: string | null;
        result_count?: number;
        participants_count?: number;
      }>;
    };

    const targetEvents = [
      { id: 2022000, expected: 73 },
      { id: 2022001, expected: 49 },
      { id: 2022002, expected: 48 },
      { id: 2022003, expected: 105 },
    ];

    for (const target of targetEvents) {
      const ev = raw.events.find((e) => e.id === target.id);
      expect(ev).toBeDefined();
      expect(ev?.has_results).toBe(true);
      expect(ev?.participants_count).toBe(target.expected);
      expect(ev?.result_count).toBe(target.expected);
    }
  });

  it('ensures calendar-index.json contains participants_count for all events with results', () => {
    const events = JSON.parse(fs.readFileSync(CALENDAR_INDEX, 'utf-8')) as Array<{
      id: number;
      title: string;
      has_results?: boolean;
      results_file?: string | null;
      participants_count?: number;
    }>;

    const missingParticipants = events.filter(
      (e) => e.has_results && (!e.participants_count || e.participants_count === 0),
    );

    expect(missingParticipants).toEqual([]);
  });
});
