import { describe, expect, it } from 'vitest';
import {
  breedArchiveSubdomain,
  buildBreedArchiveProfileUrl,
  cleanPunctuation,
  pickExactBreedArchiveHit,
  resolveBreedArchiveUrl,
} from '../lib/breedarchive';

describe('breedarchive', () => {
  it('maps breeds to verified subdomains', () => {
    expect(breedArchiveSubdomain('САЛЮКИ')).toBe('saluki');
    expect(breedArchiveSubdomain('Салюки')).toBe('saluki');
    expect(breedArchiveSubdomain('ЛЕВРЕТКА')).toBe('italiangreyhound');
    expect(breedArchiveSubdomain('БОРДЕР КОЛЛИ')).toBe('bordercollie');
    expect(breedArchiveSubdomain('ПОДЕНКО ИБИЦЕНКО К/Ш')).toBe('ibizanhound');
    expect(breedArchiveSubdomain('ДИРХАУНД (ШОТЛАНДСКАЯ БОРЗАЯ)')).toBe('deerhound');
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

  it('matches diacritics insensitively (e.g. Dévaj vs DEVAJ)', () => {
    const hits = [
      {
        label: 'Dévaj 1976 Zarooq',
        linkName: 'devaj-1976-zarooq',
        uuid: '69b2a2f6-adc5-406b-8309-d9c17febcc4b',
        nameLower: 'dévaj 1976 zarooq',
      },
    ];
    expect(pickExactBreedArchiveHit(hits, 'DEVAJ 1976 ZAROOQ')?.uuid).toBe('69b2a2f6-adc5-406b-8309-d9c17febcc4b');
    expect(pickExactBreedArchiveHit(hits, 'Dévaj 1976 Zarooq')?.uuid).toBe('69b2a2f6-adc5-406b-8309-d9c17febcc4b');
  });

  it('matches punctuation variations like curly apostrophes and hyphens', () => {
    const hits = [
      {
        label: "London's Fog Free Angel",
        linkName: 'londons-fog-free-angel',
        uuid: 'c001',
        nameLower: "london's fog free angel",
      },
      {
        label: 'Borzie Senavian Asterisk',
        linkName: 'borzie-senavian-asterisk',
        uuid: 'c002',
        nameLower: 'borzie senavian asterisk',
      },
    ];

    expect(pickExactBreedArchiveHit(hits, "London’s Fog Free Angel")?.uuid).toBe('c001');
    expect(pickExactBreedArchiveHit(hits, 'Borzie-Senavian Asterisk')?.uuid).toBe('c002');
  });

  it('cleans punctuation consistently', () => {
    expect(cleanPunctuation("London’s  Fog")).toBe("london s fog");
    expect(cleanPunctuation("B-Fast - 100")).toBe("b fast 100");
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
