import { describe, it, expect } from 'vitest';
import { determineStatusGroup } from '../src/services/rkf-api.js';

describe('determineStatusGroup', () => {
  it('correctly maps status strings to groups', () => {
    expect(determineStatusGroup('Изготовлен')).toBe('ready');
    expect(determineStatusGroup('Готов к выдаче')).toBe('ready');
    expect(determineStatusGroup('Выдан на руки')).toBe('ready');
    expect(determineStatusGroup('Выполнен')).toBe('ready');

    expect(determineStatusGroup('Отклонен')).toBe('rejected');
    expect(determineStatusGroup('Отказ в выдаче')).toBe('rejected');

    expect(determineStatusGroup('В обработке')).toBe('active');
    expect(determineStatusGroup('Передано на печать')).toBe('active');
    expect(determineStatusGroup('На проверке документов')).toBe('active');
  });
});
