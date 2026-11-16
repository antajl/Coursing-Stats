import { describe, it, expect } from 'vitest';
import { resolveSilhouetteBreed } from './DogSilhouettes';

describe('resolveSilhouetteBreed', () => {
  it('returns exact breed silhouette key for all 30 available breeds', () => {
    // Original 7
    expect(resolveSilhouetteBreed('Уиппет')).toBe('whippet');
    expect(resolveSilhouetteBreed('Русская псовая борзая')).toBe('borzoi');
    expect(resolveSilhouetteBreed('Левретка')).toBe('italiangreyhound');
    expect(resolveSilhouetteBreed('Грейхаунд')).toBe('greyhound');
    expect(resolveSilhouetteBreed('Салюки')).toBe('saluki');
    expect(resolveSilhouetteBreed('Афганская борзая')).toBe('afghanhound');
    expect(resolveSilhouetteBreed('Басенджи')).toBe('basenji');

    // Batch 1 (3 breeds)
    expect(resolveSilhouetteBreed('Вельш корги пемброк')).toBe('welshcorgi');
    expect(resolveSilhouetteBreed('Дирхаунд')).toBe('deerhound');
    expect(resolveSilhouetteBreed('Ирландский волкодав')).toBe('irishwolfhound');

    // Batch 2 (14 breeds)
    expect(resolveSilhouetteBreed('Азавак')).toBe('azawakh');
    expect(resolveSilhouetteBreed('Американский стаффордширский терьер')).toBe('amstaff');
    expect(resolveSilhouetteBreed('Амстафф')).toBe('amstaff');
    expect(resolveSilhouetteBreed('Венгерская борзая (Мадьяр-агар)')).toBe('magyaragar');
    expect(resolveSilhouetteBreed('Испанский гальго')).toBe('spanishgalgo');
    expect(resolveSilhouetteBreed('Поденко ибиценко')).toBe('ibizanhound');
    expect(resolveSilhouetteBreed('Поденко канарио')).toBe('canarianpodenco');
    expect(resolveSilhouetteBreed('Польский харт')).toBe('chartpolski');
    expect(resolveSilhouetteBreed('Родезийский риджбек')).toBe('rhodesianridgeback');
    expect(resolveSilhouetteBreed('Слюги')).toBe('sloughi');
    expect(resolveSilhouetteBreed('Тазы (Казахская борзая)')).toBe('tazy');
    expect(resolveSilhouetteBreed('Тайган (Киргизская борзая)')).toBe('taigan');
    expect(resolveSilhouetteBreed('Фараонова собака')).toBe('pharaohhound');
    expect(resolveSilhouetteBreed('Хортая борзая')).toBe('hortayaborzaya');
    expect(resolveSilhouetteBreed('Чирнеко дель’Этна')).toBe('cirneco');

    // Batch 3 (6 breeds)
    expect(resolveSilhouetteBreed('Такса стандартная гладкошерстная')).toBe('dachshund');
    expect(resolveSilhouetteBreed('Джек рассел терьер')).toBe('jackrussell');
    expect(resolveSilhouetteBreed('Цвергпинчер')).toBe('minpinscher');
    expect(resolveSilhouetteBreed('Бигль')).toBe('beagle');
    expect(resolveSilhouetteBreed('Бордер колли')).toBe('bordercollie');
    expect(resolveSilhouetteBreed('Доберман')).toBe('dobermann');
  });

  it('returns null for breeds that have not been generated yet (leaving empty frame)', () => {
    expect(resolveSilhouetteBreed('Немецкая овчарка')).toBeNull();
    expect(resolveSilhouetteBreed('Сибирский хаски')).toBeNull();
    expect(resolveSilhouetteBreed('Самоед')).toBeNull();
    expect(resolveSilhouetteBreed(null)).toBeNull();
    expect(resolveSilhouetteBreed(undefined)).toBeNull();
    expect(resolveSilhouetteBreed('')).toBeNull();
  });
});
