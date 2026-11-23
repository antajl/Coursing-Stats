import React from 'react';
import { BREED_SILHOUETTE_PATHS } from './dog-silhouettes-data';
import { canonicalBreed } from '../lib/breedMapping';

export type SilhouetteBreedKey =
  | 'whippet'
  | 'italiangreyhound'
  | 'greyhound'
  | 'borzoi'
  | 'saluki'
  | 'afghanhound'
  | 'basenji'
  | 'welshcorgi'
  | 'deerhound'
  | 'irishwolfhound'
  | 'azawakh'
  | 'amstaff'
  | 'magyaragar'
  | 'spanishgalgo'
  | 'ibizanhound'
  | 'canarianpodenco'
  | 'chartpolski'
  | 'rhodesianridgeback'
  | 'sloughi'
  | 'tazy'
  | 'taigan'
  | 'pharaohhound'
  | 'hortayaborzaya'
  | 'cirneco'
  | 'dachshund'
  | 'jackrussell'
  | 'minpinscher'
  | 'beagle'
  | 'bordercollie'
  | 'dobermann'
  | 'germanshepherd'
  | 'labradorretriever'
  | 'goldenretriever'
  | 'aussieshepherd'
  | 'siberianhusky'
  | 'shibainu'
  | 'rottweiler'
  | 'bullterrier'
  | 'frenchbulldog'
  | 'pug'
  | 'cavalierkingcharles'
  | 'papillon'
  | 'sheltie'
  | 'chihuahua'
  | 'dalmatian'
  | 'poodle'
  | 'pekingese'
  | 'pomeranian'
  | 'centralasianshepherd'
  | 'canecorso'
  | 'yorkshireterrier'
  | 'veo'
  | 'schnauzer'
  | 'englishcockerspaniel'
  | 'bernesemountain'
  | 'bichon'
  | 'maltese'
  | 'samoyed'
  | 'shihtzu'
  | 'akita'
  | 'thairidgeback'
  | 'irishterrier'
  | 'boxer'
  | 'staffbull';

export type SilhouetteBreed = SilhouetteBreedKey;

/**
 * Resolves a raw or canonical breed string to an available vector silhouette key.
 * Returns null if no verified silhouette exists yet for this breed (leaving an empty frame).
 */
export const resolveSilhouetteBreed = (breed?: string | null): SilhouetteBreedKey | null => {
  if (!breed) return null;

  const canon = canonicalBreed(breed);
  const lower = breed.toLowerCase().trim();

  // 1. Italian Greyhound / Левретка / Малая итальянская борзая
  if (
    canon.includes('ИТАЛЬЯНСКАЯ') ||
    lower.includes('левретк') ||
    lower.includes('italian greyhound') ||
    lower.includes('piccolo')
  ) {
    return 'italiangreyhound';
  }

  // 2. Borzoi / РПБ / Русская псовая борзая
  if (
    canon.includes('РУССКАЯ ПСОВАЯ') ||
    lower.includes('рпб') ||
    lower.includes('borzoi') ||
    lower.includes('псовая борзая')
  ) {
    return 'borzoi';
  }

  // 3. Saluki / Салюки / Персидская борзая
  if (canon.includes('САЛЮКИ') || lower.includes('салюки') || lower.includes('saluki')) {
    return 'saluki';
  }

  // 4. Afghan Hound / Афганская борзая
  if (canon.includes('АФГАН') || lower.includes('афган') || lower.includes('afghan')) {
    return 'afghanhound';
  }

  // 5. Basenji / Басенджи
  if (canon.includes('БАСЕНДЖИ') || lower.includes('басенджи') || lower.includes('basenji')) {
    return 'basenji';
  }

  // 6. Greyhound / Грейхаунд
  if (canon.includes('ГРЕЙХАУНД') || lower.includes('грейхаунд') || lower.includes('greyhound')) {
    return 'greyhound';
  }

  // 7. Welsh Corgi / Вельш-корги (пемброк и кардиган)
  if (canon.includes('КОРГИ') || lower.includes('корги') || lower.includes('corgi')) {
    return 'welshcorgi';
  }

  // 8. Deerhound / Дирхаунд / Шотландская оленья борзая
  if (canon.includes('ДИРХАУНД') || lower.includes('дирхаунд') || lower.includes('deerhound')) {
    return 'deerhound';
  }

  // 9. Irish Wolfhound / Ирландский волкодав
  if (
    canon.includes('ВОЛКОДАВ') ||
    lower.includes('волкодав') ||
    lower.includes('wolfhound') ||
    lower.includes('вольфхаунд')
  ) {
    return 'irishwolfhound';
  }

  // 10. Whippet / Уиппет
  if (canon.includes('УИППЕТ') || lower.includes('уиппет') || lower.includes('whippet')) {
    return 'whippet';
  }

  // 11. Azawakh / Азавак
  if (canon.includes('АЗАВАК') || lower.includes('азавак') || lower.includes('azawakh')) {
    return 'azawakh';
  }

  // Staffordshire Bull Terrier / Стаффордширский бультерьер (Стаффбуль)
  if (
    canon.includes('СТАФФОРДШИРСКИЙ БУЛЬТЕРЬЕР') ||
    lower.includes('стаффордширский бультерьер') ||
    lower.includes('стаффбуль') ||
    lower.includes('staffordshire bull terrier') ||
    lower.includes('staffbull') ||
    lower.includes('staffie') ||
    lower.includes('staffy')
  ) {
    return 'staffbull';
  }

  // 12. Amstaff / Американский стаффордширский терьер
  if (
    canon.includes('СТАФФОРДШИРСКИЙ ТЕРЬЕР') ||
    lower.includes('амстафф') ||
    lower.includes('amstaff') ||
    (lower.includes('стаффорд') && !lower.includes('буль'))
  ) {
    return 'amstaff';
  }

  // 13. Magyar Agar / Венгерская борзая (Мадьяр-агар)
  if (
    canon.includes('ВЕНГЕРСКАЯ БОРЗАЯ') ||
    lower.includes('мадьяр') ||
    lower.includes('magyar') ||
    lower.includes('венгерская борзая')
  ) {
    return 'magyaragar';
  }

  // 14. Spanish Galgo / Испанский гальго
  if (canon.includes('ГАЛЬГО') || lower.includes('гальго') || lower.includes('galgo')) {
    return 'spanishgalgo';
  }

  // 15. Ibizan Hound / Поденко ибиценко (Ивисская борзая)
  if (
    canon.includes('ИБИЦЕНКО') ||
    lower.includes('ибиценко') ||
    lower.includes('ивисская') ||
    lower.includes('ibizan')
  ) {
    return 'ibizanhound';
  }

  // 16. Canarian Podenco / Поденко канарио
  if (canon.includes('КАНАРИО') || lower.includes('канарио') || lower.includes('canarian')) {
    return 'canarianpodenco';
  }

  // 17. Chart Polski / Польский харт (Польская борзая)
  if (
    canon.includes('ПОЛЬСКИЙ ХАРТ') ||
    canon.includes('ПОЛЬСКАЯ БОРЗАЯ') ||
    lower.includes('польский харт') ||
    lower.includes('польская борзая') ||
    lower.includes('chart polski')
  ) {
    return 'chartpolski';
  }

  // Thai Ridgeback / Тайский риджбек
  if (
    canon.includes('ТАЙСКИЙ РИДЖБЕК') ||
    lower.includes('тайский риджбек') ||
    lower.includes('thai ridgeback') ||
    (lower.includes('риджбек') && lower.includes('тайск'))
  ) {
    return 'thairidgeback';
  }

  // 18. Rhodesian Ridgeback / Родезийский риджбек (исключая тайского риджбека)
  if (
    !canon.includes('ТАЙСКИЙ') &&
    !lower.includes('тайск') &&
    !lower.includes('thai') &&
    (canon.includes('РОДЕЗИЙСКИЙ') ||
      lower.includes('родезийск') ||
      lower.includes('rhodesian') ||
      lower.includes('ridgeback') ||
      lower.includes('риджбек'))
  ) {
    return 'rhodesianridgeback';
  }

  // 19. Sloughi / Слюги (Арабская борзая)
  if (canon.includes('СЛЮГИ') || lower.includes('слюги') || lower.includes('sloughi')) {
    return 'sloughi';
  }

  // 20. Tazy / Тазы (Казахская борзая)
  if (canon.includes('ТАЗЫ') || lower.includes('тазы') || lower.includes('tazy')) {
    return 'tazy';
  }

  // 21. Taigan / Тайган (Киргизская борзая)
  if (canon.includes('ТАЙГАН') || lower.includes('тайган') || lower.includes('taigan')) {
    return 'taigan';
  }

  // 22. Pharaoh Hound / Фараонова собака
  if (canon.includes('ФАРАОН') || lower.includes('фараон') || lower.includes('pharaoh')) {
    return 'pharaohhound';
  }

  // 23. Hortaya Borzaya / Хортая борзая
  if (canon.includes('ХОРТАЯ') || lower.includes('хортая') || lower.includes('hortaya')) {
    return 'hortayaborzaya';
  }

  // 24. Cirneco dell'Etna / Чирнеко дель’Этна
  if (canon.includes('ЧИРНЕКО') || lower.includes('чирнеко') || lower.includes('cirneco')) {
    return 'cirneco';
  }

  // 25. Dachshund / Такса
  if (canon.includes('ТАКСА') || lower.includes('такса') || lower.includes('dachshund')) {
    return 'dachshund';
  }

  // Irish Terrier / Ирландский терьер
  if (
    canon.includes('ИРЛАНДСКИЙ ТЕРЬЕР') ||
    lower.includes('ирландский терьер') ||
    lower.includes('irish terrier')
  ) {
    return 'irishterrier';
  }

  // 26. Jack Russell Terrier / Джек-рассел терьер
  if (
    canon.includes('ДЖЕК РАССЕЛ') ||
    canon.includes('ДЖЕК-РАССЕЛ') ||
    lower.includes('джек рассел') ||
    lower.includes('джек-рассел') ||
    lower.includes('jack russell')
  ) {
    return 'jackrussell';
  }

  // 27. Miniature Pinscher / Цвергпинчер
  if (
    canon.includes('ЦВЕРГПИНЧЕР') ||
    lower.includes('цвергпинчер') ||
    lower.includes('миниатюрный пинчер') ||
    lower.includes('minpin') ||
    lower.includes('pinscher')
  ) {
    return 'minpinscher';
  }

  // 28. Beagle / Бигль
  if (canon.includes('БИГЛЬ') || lower.includes('бигль') || lower.includes('beagle')) {
    return 'beagle';
  }

  // 29. Border Collie / Бордер-колли
  if (
    canon.includes('БОРДЕР КОЛЛИ') ||
    canon.includes('БОРДЕР-КОЛЛИ') ||
    lower.includes('бордер') ||
    lower.includes('border collie')
  ) {
    return 'bordercollie';
  }

  // 30. Dobermann / Доберман
  if (canon.includes('ДОБЕРМАН') || lower.includes('доберман') || lower.includes('dobermann')) {
    return 'dobermann';
  }

  // 31. German Shepherd / Немецкая овчарка
  if (
    canon.includes('НЕМЕЦКАЯ ОВЧАРКА') ||
    lower.includes('немецкая овчарка') ||
    lower.includes('german shepherd') ||
    lower === 'но' ||
    lower.startsWith('но ')
  ) {
    return 'germanshepherd';
  }

  // 32. Labrador Retriever / Лабрадор ретривер
  if (canon.includes('ЛАБРАДОР') || lower.includes('лабрадор') || lower.includes('labrador')) {
    return 'labradorretriever';
  }

  // 33. Golden Retriever / Золотистый ретривер
  if (
    canon.includes('ЗОЛОТИСТЫЙ РЕТРИВЕР') ||
    lower.includes('золотистый ретривер') ||
    lower.includes('голден') ||
    lower.includes('golden retriever')
  ) {
    return 'goldenretriever';
  }

  // 34. Australian Shepherd / Австралийская овчарка (Аусси)
  if (
    canon.includes('АВСТРАЛИЙСКАЯ ОВЧАРКА') ||
    lower.includes('австралийская овчарка') ||
    lower.includes('аусси') ||
    lower.includes('aussie') ||
    lower.includes('australian shepherd')
  ) {
    return 'aussieshepherd';
  }

  // 35. Siberian Husky / Сибирский хаски
  if (canon.includes('ХАСКИ') || lower.includes('хаски') || lower.includes('husky')) {
    return 'siberianhusky';
  }

  // 36. Shiba Inu / Сиба (Сиба-ину)
  if (
    canon.includes('СИБА') ||
    canon.includes('ШИБА') ||
    lower.includes('сиба') ||
    lower.includes('шиба') ||
    lower.includes('shiba')
  ) {
    return 'shibainu';
  }

  // 37. Rottweiler / Ротвейлер
  if (canon.includes('РОТВЕЙЛЕР') || lower.includes('ротвейлер') || lower.includes('rottweiler')) {
    return 'rottweiler';
  }

  // 38. Bull Terrier / Бультерьер
  if (
    (canon.includes('БУЛЬТЕРЬЕР') ||
      lower.includes('бультерьер') ||
      lower.includes('bull terrier') ||
      lower.includes('bullterrier')) &&
    !lower.includes('стаффорд')
  ) {
    return 'bullterrier';
  }

  // 39. French Bulldog / Французский бульдог
  if (
    canon.includes('ФРАНЦУЗСКИЙ БУЛЬДОГ') ||
    lower.includes('французский бульдог') ||
    lower.includes('француз') ||
    lower.includes('french bulldog')
  ) {
    return 'frenchbulldog';
  }

  // 40. Pug / Мопс
  if (canon.includes('МОПС') || lower.includes('мопс') || lower.includes('pug')) {
    return 'pug';
  }

  // 41. Cavalier King Charles Spaniel / Кавалер кинг чарльз спаниель
  if (canon.includes('КАВАЛЕР') || lower.includes('кавалер') || lower.includes('cavalier')) {
    return 'cavalierkingcharles';
  }

  // 42. Papillon / Папийон (Континентальный той-спаниель)
  if (
    canon.includes('ПАПИЙОН') ||
    canon.includes('ПАПИЛЬОН') ||
    lower.includes('папийон') ||
    lower.includes('папильон') ||
    lower.includes('papillon')
  ) {
    return 'papillon';
  }

  // 43. Shetland Sheepdog / Шелти (Шетландская овчарка)
  if (
    canon.includes('ШЕЛТИ') ||
    canon.includes('ШЕТЛАНДСКАЯ ОВЧАРКА') ||
    lower.includes('шелти') ||
    lower.includes('sheltie') ||
    lower.includes('shetland sheepdog')
  ) {
    return 'sheltie';
  }

  // 44. Chihuahua / Чихуахуа
  if (
    canon.includes('ЧИХУАХУА') ||
    lower.includes('чихуахуа') ||
    lower.includes('чихуа') ||
    lower.includes('chihuahua')
  ) {
    return 'chihuahua';
  }

  // 45. Dalmatian / Далматин
  if (
    canon.includes('ДАЛМАТИН') ||
    canon.includes('ДОЛМАТИН') ||
    lower.includes('далматин') ||
    lower.includes('долматин') ||
    lower.includes('dalmatian')
  ) {
    return 'dalmatian';
  }

  // 46. Poodle / Пудель (все разновидности: стандартный/королевский, малый, карликовый, той)
  if (canon.includes('ПУДЕЛЬ') || lower.includes('пудель') || lower.includes('poodle')) {
    return 'poodle';
  }

  // 47. Pekingese / Пекинес
  if (
    canon.includes('ПЕКИНЕС') ||
    lower.includes('пекинес') ||
    lower.includes('pekingese') ||
    lower.includes('pekinese')
  ) {
    return 'pekingese';
  }

  // 48. Pomeranian / Немецкий шпиц (Померанский)
  if (
    canon.includes('ШПИЦ') ||
    canon.includes('ПОМЕРАНСКИЙ') ||
    lower.includes('шпиц') ||
    lower.includes('померан') ||
    lower.includes('pomeranian') ||
    lower.includes('spitz')
  ) {
    return 'pomeranian';
  }

  // 49. Central Asian Shepherd Dog / Среднеазиатская овчарка (САО, Алабай)
  if (
    canon.includes('СРЕДНЕАЗИАТСКАЯ') ||
    canon.includes('АЛАБАЙ') ||
    canon.includes('САО') ||
    lower.includes('среднеазиатская') ||
    lower.includes('алабай') ||
    lower.includes('сао') ||
    lower.includes('central asian shepherd')
  ) {
    return 'centralasianshepherd';
  }

  // 50. Cane Corso / Итальянский кане-корсо
  if (
    canon.includes('КАНЕ КОРСО') ||
    canon.includes('КАНЕ-КОРСО') ||
    lower.includes('кане корсо') ||
    lower.includes('кане-корсо') ||
    lower.includes('cane corso')
  ) {
    return 'canecorso';
  }

  // 51. Yorkshire Terrier / Йоркширский терьер (Йорк)
  if (
    canon.includes('ЙОРКШИРСКИЙ') ||
    canon.includes('ЙОРК') ||
    lower.includes('йоркширский') ||
    lower.includes('йорк') ||
    lower.includes('yorkshire terrier') ||
    lower.includes('yorkie')
  ) {
    return 'yorkshireterrier';
  }

  // 52. East-European Shepherd / Восточноевропейская овчарка (ВЕО)
  if (
    canon.includes('ВОСТОЧНОЕВРОПЕЙСКАЯ') ||
    canon.includes('ВЕО') ||
    lower.includes('восточноевропейская') ||
    lower.includes('вео') ||
    lower.includes('east-european shepherd')
  ) {
    return 'veo';
  }

  // 53. Schnauzer / Цвергшнауцер, миттельшнауцер, ризеншнауцер
  if (
    canon.includes('ШНАУЦЕР') ||
    lower.includes('шнауцер') ||
    lower.includes('schnauzer')
  ) {
    return 'schnauzer';
  }

  // 54. English Cocker Spaniel / Английский кокер-спаниель
  if (
    (canon.includes('КОКЕР') && (canon.includes('АНГЛИЙСКИЙ') || !canon.includes('АМЕРИКАНСКИЙ'))) ||
    lower.includes('английский кокер') ||
    lower.includes('english cocker')
  ) {
    return 'englishcockerspaniel';
  }

  // 55. Bernese Mountain Dog / Бернский зенненхунд
  if (
    canon.includes('БЕРНСКИЙ') ||
    canon.includes('ЗЕННЕНХУНД') ||
    lower.includes('бернский') ||
    lower.includes('зенненхунд') ||
    lower.includes('bernese')
  ) {
    return 'bernesemountain';
  }

  // 56. Bichon Frise / Бишон фризе
  if (
    canon.includes('БИШОН') ||
    lower.includes('бишон') ||
    lower.includes('bichon')
  ) {
    return 'bichon';
  }

  // 57. Maltese / Мальтезе (Мальтийская болонка)
  if (
    canon.includes('МАЛЬТЕЗЕ') ||
    canon.includes('МАЛЬТИЙСКАЯ БОЛОНКА') ||
    lower.includes('мальтезе') ||
    lower.includes('мальтийская болонка') ||
    lower.includes('maltese')
  ) {
    return 'maltese';
  }

  // 58. Samoyed / Самоед (Самоедская собака)
  if (
    canon.includes('САМОЕД') ||
    lower.includes('самоед') ||
    lower.includes('samoyed')
  ) {
    return 'samoyed';
  }

  // 59. Shih Tzu / Ши-тцу
  if (
    canon.includes('ШИ ТЦУ') ||
    canon.includes('ШИ-ТЦУ') ||
    lower.includes('ши тцу') ||
    lower.includes('ши-тцу') ||
    lower.includes('shih tzu')
  ) {
    return 'shihtzu';
  }

  // 60. Akita / Акита (Акита-ину)
  if (
    canon.includes('АКИТА') ||
    lower.includes('акита') ||
    lower.includes('akita')
  ) {
    return 'akita';
  }

  // German Boxer / Немецкий боксер
  if (
    canon.includes('БОКСЕР') ||
    canon.includes('БОКСЁР') ||
    lower.includes('боксер') ||
    lower.includes('боксёр') ||
    lower.includes('boxer') ||
    lower.includes('german boxer')
  ) {
    return 'boxer';
  }

  // No silhouette available yet for this breed
  return null;
};

export interface DogBreedSilhouetteProps {
  breed?: string | null;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Vector silhouette of a dog breed with optical visual weight normalization for avatar frames.
 */
export const DogBreedSilhouette: React.FC<DogBreedSilhouetteProps> = ({
  breed,
  className = 'w-full h-full text-camel-700/60',
  style,
}) => {
  const key = resolveSilhouetteBreed(breed);
  if (!key) return null;
  const path = BREED_SILHOUETTE_PATHS[key];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      aria-hidden="true"
      fill="currentColor"
      fillRule="evenodd"
    >
      <path d={path} />
    </svg>
  );
};

/** Backward-compatible export for any legacy stub usage */
export const DogSilhouettes = () => null;

export const getSilhouetteType = (breed?: string | null): string => {
  return resolveSilhouetteBreed(breed);
};
