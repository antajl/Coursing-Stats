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

    // Batch 4 (14 breeds)
    expect(resolveSilhouetteBreed('Немецкая овчарка')).toBe('germanshepherd');
    expect(resolveSilhouetteBreed('Лабрадор ретривер')).toBe('labradorretriever');
    expect(resolveSilhouetteBreed('Золотистый ретривер')).toBe('goldenretriever');
    expect(resolveSilhouetteBreed('Австралийская овчарка')).toBe('aussieshepherd');
    expect(resolveSilhouetteBreed('Сибирский хаски')).toBe('siberianhusky');
    expect(resolveSilhouetteBreed('Сиба-ину')).toBe('shibainu');
    expect(resolveSilhouetteBreed('Ротвейлер')).toBe('rottweiler');
    expect(resolveSilhouetteBreed('Бультерьер стандартный')).toBe('bullterrier');
    expect(resolveSilhouetteBreed('Французский бульдог')).toBe('frenchbulldog');
    expect(resolveSilhouetteBreed('Мопс')).toBe('pug');
    expect(resolveSilhouetteBreed('Кавалер кинг чарльз спаниель')).toBe('cavalierkingcharles');
    expect(resolveSilhouetteBreed('Континентальный той спаниель папийон')).toBe('papillon');
    expect(resolveSilhouetteBreed('Шелти')).toBe('sheltie');
    expect(resolveSilhouetteBreed('Чихуахуа')).toBe('chihuahua');

    // Batch 5 (Dalmatian & Poodle)
    expect(resolveSilhouetteBreed('Далматин')).toBe('dalmatian');
    expect(resolveSilhouetteBreed('Пудель стандартный черный')).toBe('poodle');
    expect(resolveSilhouetteBreed('Королевский пудель')).toBe('poodle');

    // Batch 6 (Pekingese)
    expect(resolveSilhouetteBreed('Пекинес')).toBe('pekingese');
    expect(resolveSilhouetteBreed('Pekingese')).toBe('pekingese');

    // Batch 7 (Cane Corso, York, VEO)
    expect(resolveSilhouetteBreed('Итальянский кане корсо')).toBe('canecorso');
    expect(resolveSilhouetteBreed('Йоркширский терьер')).toBe('yorkshireterrier');
    expect(resolveSilhouetteBreed('Восточноевропейская овчарка')).toBe('veo');

    // Batch 8 (Schnauzer, Cocker, Bernese, Bichon, Maltese, Samoyed, Shih Tzu, Akita)
    expect(resolveSilhouetteBreed('Цвергшнауцер черный')).toBe('schnauzer');
    expect(resolveSilhouetteBreed('Английский кокер спаниель')).toBe('englishcockerspaniel');
    expect(resolveSilhouetteBreed('Бернский зенненхунд')).toBe('bernesemountain');
    expect(resolveSilhouetteBreed('Бишон фризе')).toBe('bichon');
    expect(resolveSilhouetteBreed('Мальтезе')).toBe('maltese');
    expect(resolveSilhouetteBreed('Самоед')).toBe('samoyed');
    expect(resolveSilhouetteBreed('Ши-тцу')).toBe('shihtzu');
    expect(resolveSilhouetteBreed('Акита')).toBe('akita');

    // Batch 9 (Thai Ridgeback, Irish Terrier, Boxer, Staffbull)
    expect(resolveSilhouetteBreed('Тайский риджбек')).toBe('thairidgeback');
    expect(resolveSilhouetteBreed('Thai Ridgeback')).toBe('thairidgeback');
    expect(resolveSilhouetteBreed('Ирландский терьер')).toBe('irishterrier');
    expect(resolveSilhouetteBreed('Irish Terrier')).toBe('irishterrier');
    expect(resolveSilhouetteBreed('Немецкий боксер')).toBe('boxer');
    expect(resolveSilhouetteBreed('Боксёр')).toBe('boxer');
    expect(resolveSilhouetteBreed('Boxer')).toBe('boxer');
    expect(resolveSilhouetteBreed('Стаффордширский бультерьер')).toBe('staffbull');
    expect(resolveSilhouetteBreed('Стаффбуль')).toBe('staffbull');
    expect(resolveSilhouetteBreed('Staffordshire Bull Terrier')).toBe('staffbull');
  });

  it('returns null for breeds that have not been generated yet (leaving empty frame)', () => {
    expect(resolveSilhouetteBreed('Колли')).toBeNull();
    expect(resolveSilhouetteBreed('Кавказская овчарка')).toBeNull();
    expect(resolveSilhouetteBreed('Эрдельтерьер')).toBeNull();
    expect(resolveSilhouetteBreed(null)).toBeNull();
    expect(resolveSilhouetteBreed(undefined)).toBeNull();
    expect(resolveSilhouetteBreed('')).toBeNull();
  });
});
