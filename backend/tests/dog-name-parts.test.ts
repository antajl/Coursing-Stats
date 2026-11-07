import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { collectDogNameParts } from '../lib/dog-identity-match';
import { dogNamesLikelySame } from '../lib/dog-name-parts';
import { extractDogNames } from '../parsers/coursing/utils';

describe('dog-name-parts', () => {
  it('splits slash names into parts', () => {
    expect(
      collectDogNameParts(
        'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА /EMUL DE GEPARD GELILA AL RAWDA',
        null,
      ),
    ).toEqual([
      'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА',
      'EMUL DE GEPARD GELILA AL RAWDA',
    ]);
  });

  it('matches double name to single-part latin record (same breed)', () => {
    expect(
      dogNamesLikelySame(
        {
          name_lat: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА /EMUL DE GEPARD GELILA AL RAWDA',
          breed: 'САЛЮКИ',
        },
        { name_lat: 'EMUL DE GEPARD GELILA AL RAWDA', breed: 'САЛЮКИ' },
      ),
    ).toBe(true);
  });

  it('does not match different breeds', () => {
    expect(
      dogNamesLikelySame(
        { name_lat: 'FOO / BAR', breed: 'САЛЮКИ' },
        { name_lat: 'BAR', breed: 'УИППЕТ' },
      ),
    ).toBe(false);
  });

  it('extractDogNames deduplicates identical names across slash', () => {
    const $ = cheerio.load('<table><tr><td>PANDORA VON HAUS BOCCIA /<br>PANDORA VON HAUS BOCCIA</td></tr></table>');
    const res = extractDogNames($('td'));
    expect(res.name_lat).toBe('PANDORA VON HAUS BOCCIA');
    expect(res.name_ru).toBe('');
  });
});
