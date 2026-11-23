import { describe, it, expect } from 'vitest';
import { detectStatusChanges, formatChangeMessage } from '../src/services/diff-engine.js';
import type { ApplicationItem } from '../src/types.js';

describe('detectStatusChanges', () => {
  it('detects transition to ready status as important', () => {
    const prev = {
      '123456': { status: 'В обработке', statusGroup: 'active' as const, lastUpdated: '2026-11-20' }
    };
    const current: ApplicationItem[] = [
      {
        barcode: '123456',
        dogName: 'Nordic Pride',
        documentName: 'Чемпион РКФ',
        pedigreeNumber: 'RKF 112233',
        currentStatus: 'Изготовлен и готов к выдаче',
        lastUpdated: '2026-11-23',
        statusGroup: 'ready',
        isReceived: false,
        history: []
      }
    ];

    const changes = detectStatusChanges(prev, current, []);
    expect(changes).toHaveLength(1);
    expect(changes[0].isImportant).toBe(true);
    expect(changes[0].statusGroup).toBe('ready');
    expect(changes[0].newStatus).toBe('Изготовлен и готов к выдаче');

    const msg = formatChangeMessage(changes[0]);
    expect(msg).toContain('[ГОТОВО К ВЫДАЧЕ]');
    expect(msg).toContain('№ 123456');
    expect(msg).toContain('Nordic Pride');
  });

  it('ignores documents marked as received', () => {
    const prev = {};
    const current: ApplicationItem[] = [
      {
        barcode: '999888',
        dogName: 'Golden Star',
        documentName: 'Гранд Чемпион',
        pedigreeNumber: 'RKF 555',
        currentStatus: 'Готов к выдаче',
        lastUpdated: '2026-11-23',
        statusGroup: 'ready',
        isReceived: true,
        history: []
      }
    ];

    const changes = detectStatusChanges(prev, current, ['999888']);
    expect(changes).toHaveLength(0);
  });
});
