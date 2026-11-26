import { describe, it, expect } from 'vitest';
import { encryptTrackerSecret, decryptTrackerSecret } from './crypto';
import { detectStatusChanges } from './diffEngine';
import { getTrackerDisciplineCounts } from './competitions';

describe('bot tracker module', () => {
  it('encrypts and decrypts RKF tokens with AES-GCM', async () => {
    const token = 'eyJhbGciOiJIUzI1NiJ9.example-payload-data.signature123456';
    const key = 'test-secret-encryption-key-for-unit-tests';
    const encrypted = await encryptTrackerSecret(token, key);
    expect(encrypted.startsWith('enc:v1:')).toBe(true);
    expect(encrypted).not.toContain(token);
    const decrypted = await decryptTrackerSecret(encrypted, key);
    expect(decrypted).toBe(token);
  });

  it('returns plain legacy tokens cleanly on decrypt fallback', async () => {
    const legacy = 'plain-legacy-token-123';
    expect(await decryptTrackerSecret(legacy, 'any-key')).toBe(legacy);
  });

  it('detects status transitions and ignores received barcodes', () => {
    const changes = detectStatusChanges(
      {
        '1001': { status: 'На проверке', statusGroup: 'active', lastUpdated: '2026-01-01' },
        '1002': { status: 'На проверке', statusGroup: 'active', lastUpdated: '2026-01-01' },
      },
      [
        {
          barcode: '1001',
          dogName: 'Alpha',
          documentName: 'Чемпион РФ',
          pedigreeNumber: 'RKF 1',
          currentStatus: 'Готово к выдаче',
          lastUpdated: '2026-01-02',
          statusGroup: 'ready',
          isReceived: false,
          history: [],
        },
        {
          barcode: '1002',
          dogName: 'Beta',
          documentName: 'ЮЧР',
          pedigreeNumber: 'RKF 2',
          currentStatus: 'Готово к выдаче',
          lastUpdated: '2026-01-02',
          statusGroup: 'ready',
          isReceived: true,
          history: [],
        },
      ],
      ['1002'],
    );
    expect(changes).toHaveLength(1);
    expect(changes[0].barcode).toBe('1001');
    expect(changes[0].isImportant).toBe(true);
  });

  it('loads synced 2026 competitions snapshot', () => {
    const counts = getTrackerDisciplineCounts();
    expect(counts.total).toBeGreaterThan(20);
  });
});
