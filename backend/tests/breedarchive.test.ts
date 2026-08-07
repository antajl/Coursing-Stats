import { describe, expect, it } from 'vitest';
import {
  breedArchiveSubdomain,
  buildBreedArchiveProfileUrl,
  pickExactBreedArchiveHit,
  resolveBreedArchiveUrl,
} from '../lib/breedarchive';

describe('breedarchive', () => {
  it('maps saluki breed to subdomain', () => {
    expect(breedArchiveSubdomain('САЛЮКИ')).toBe('saluki');
    expect(breedArchiveSubdomain('Салюки')).toBe('saluki');
    expect(breedArchiveSubdomain('АФГАНСКАЯ БОРЗАЯ')).toBeNull();
  });

  it('builds profile URL from search hit', () => {
    const url = buildBreedArchiveProfileUrl('saluki', {
      label: 'Emul De Gepard Gelila Al Rawda',
      linkName: 'emul-de-gepard-gelila-al-rawda',
      uuid: '699f7593-397c-4b71-89a7-09e352f30907',
      nameLower: 'emul de gepard gelila al rawda',
    });
    expect(url).toBe(
      'https://saluki.breedarchive.com/animal/view/emul-de-gepard-gelila-al-rawda-699f7593-397c-4b71-89a7-09e352f30907',
    );
  });

  it('picks exact match only when unique', () => {
    const hits = [
      { label: 'Foo Bar', linkName: 'foo-bar', uuid: 'a', nameLower: 'foo bar' },
      { label: 'Foo Baz', linkName: 'foo-baz', uuid: 'b', nameLower: 'foo baz' },
    ];
    expect(pickExactBreedArchiveHit(hits, 'FOO BAR')?.uuid).toBe('a');
    expect(pickExactBreedArchiveHit(hits, 'MISSING')).toBeNull();
  });

  it('resolves URL via search API', async () => {
    const mockFetch = async () =>
      ({
        ok: true,
        text: async () =>
          JSON.stringify([
            {
              label: 'Emul De Gepard Gelila Al Rawda',
              linkName: 'emul-de-gepard-gelila-al-rawda',
              uuid: '699f7593-397c-4b71-89a7-09e352f30907',
              nameLower: 'emul de gepard gelila al rawda',
            },
          ]),
      }) as Response;

    const url = await resolveBreedArchiveUrl('САЛЮКИ', 'EMUL DE GEPARD GELILA AL RAWDA', mockFetch);
    expect(url).toContain('699f7593-397c-4b71-89a7-09e352f30907');
  });
});
