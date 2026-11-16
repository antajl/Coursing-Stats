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
  | 'dobermann';

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

  // 18. Rhodesian Ridgeback / Родезийский риджбек
  if (
    canon.includes('РОДЕЗИЙСКИЙ') ||
    lower.includes('родезийск') ||
    lower.includes('ridgeback') ||
    lower.includes('риджбек')
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
