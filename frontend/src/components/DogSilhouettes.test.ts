import { describe, it, expect } from 'vitest';
import { resolveSilhouetteBreed } from './DogSilhouettes';

describe('resolveSilhouetteBreed', () => {
  it('returns exact breed silhouette key for available breeds', () => {
    expect(resolveSilhouetteBreed('Уиппет')).toBe('whippet');
    expect(resolveSilhouetteBreed('Русская псовая борзая')).toBe('borzoi');
    expect(resolveSilhouetteBreed('Левретка')).toBe('italiangreyhound');
    expect(resolveSilhouetteBreed('Грейхаунд')).toBe('greyhound');
    expect(resolveSilhouetteBreed('Салюки')).toBe('saluki');
    expect(resolveSilhouetteBreed('Афганская борзая')).toBe('afghanhound');
    expect(resolveSilhouetteBreed('Басенджи')).toBe('basenji');
    expect(resolveSilhouetteBreed('Вельш корги пемброк')).toBe('welshcorgi');
    expect(resolveSilhouetteBreed('Дирхаунд')).toBe('deerhound');
    expect(resolveSilhouetteBreed('Ирландский волкодав')).toBe('irishwolfhound');
  });

  it('returns null for breeds that have not been generated yet (leaving empty frame)', () => {
    expect(resolveSilhouetteBreed('Родезийский риджбек')).toBeNull();
    expect(resolveSilhouetteBreed('Доберман')).toBeNull();
    expect(resolveSilhouetteBreed('Бигль')).toBeNull();
    expect(resolveSilhouetteBreed('Такса')).toBeNull();
    expect(resolveSilhouetteBreed('Немецкая овчарка')).toBeNull();
    expect(resolveSilhouetteBreed(null)).toBeNull();
    expect(resolveSilhouetteBreed(undefined)).toBeNull();
    expect(resolveSilhouetteBreed('')).toBeNull();
  });
});
