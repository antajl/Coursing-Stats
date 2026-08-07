import { describe, it, expect } from 'vitest';
import { collectDogNameParts, dogNamesLikelySame } from '../lib/dog-name-parts';

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
});
