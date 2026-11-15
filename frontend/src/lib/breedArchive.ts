/**
 * Сопоставление пород со специализированными базами родословных The Breed Archive (breedarchive.com).
 * Позволяет формировать прямые ссылки на породные архивы для пород, у которых они запущены.
 */

const BREED_ARCHIVE_SUBDOMAINS: Record<string, string> = {
  // Борзые (FCI 10)
  whippet: 'whippet',
  saluki: 'saluki',
  borzoi: 'borzoi',
  'italian-greyhound': 'italiangreyhound',
  greyhound: 'greyhound',
  deerhound: 'deerhound',
  'spanish-galgo': 'galgoespanol',
  sloughi: 'sloughi',
  azawakh: 'azawakh',
  'magyar-agar': 'magyaragar',
  'chart-polski': 'chartpolski',

  // Примитивные и аборигенные охотничьи (FCI 5)
  'pharaoh-hound': 'pharaohhound',
  'cirneco-delletna': 'cirneco',
  'ibizan-hound': 'ibizanhound',
  'portuguese-podengo': 'podengoportugues',
  xoloitzcuintli: 'xolo',

  // Спортивные породы БЗМП и служебные
  'american-hairless-terrier': 'americanhairlessterrier',
  'miniature-pinscher': 'miniaturepinscher',
  'siberian-husky': 'siberianhusky',
  'german-pinscher': 'miniaturepinscher',
  'border-collie': 'bordercollie',
  'german-shepherd': 'germanshepherd',
  malinois: 'belgianshepherd',
  'labrador-retriever': 'labradorretriever',
  papillon: 'papillon',
  rottweiler: 'rottweiler',
  'bedlington-terrier': 'bedlingtonterrier',
  'welsh-corgi-pembroke': 'pembrokewelshcorgi',
  'smooth-fox-terrier': 'smoothfoxterrier',

  // Русские канонические названия (canonicalKey)
  'УИППЕТ': 'whippet',
  'САЛЮКИ': 'saluki',
  'РУССКАЯ ПСОВАЯ БОРЗАЯ': 'borzoi',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ': 'italiangreyhound',
  'МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ (ЛЕВРЕТКА)': 'italiangreyhound',
  'ЛЕВРЕТКА': 'italiangreyhound',
  'ГРЕЙХАУНД': 'greyhound',
  'ДИРХАУНД': 'deerhound',
  'ДИРХАУНД (ШОТЛАНДСКАЯ БОРЗАЯ)': 'deerhound',
  'ИСПАНСКАЯ БОРЗАЯ': 'galgoespanol',
  'ИСПАНСКАЯ БОРЗАЯ (ГАЛЬГО)': 'galgoespanol',
  'ИСПАНСКИЙ ГАЛЬГО': 'galgoespanol',
  'ГАЛЬГО': 'galgoespanol',
  'СЛЮГИ': 'sloughi',
  'АЗАВАК': 'azawakh',
  'ВЕНГЕРСКАЯ БОРЗАЯ': 'magyaragar',
  'ПОЛЬСКИЙ ХАРТ': 'chartpolski',
  'ЧАРТ': 'chartpolski',
  'ФАРАОНОВА СОБАКА': 'pharaohhound',
  'ЧИРНЕКО ДЕЛЬ’ЭТНА': 'cirneco',
  'ЧИРНЕКО ДЕЛЬ ЭТНА': 'cirneco',
  'ПОДЕНКО ИБИЦЕНКО': 'ibizanhound',
  'ПОРТУГАЛЬСКИЙ ПОДЕНГО': 'podengoportugues',
  'КСОЛОИТЦКУИНТЛИ': 'xolo',
  'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР': 'americanhairlessterrier',
  'ЦВЕРГПИНЧЕР': 'miniaturepinscher',
  'НЕМЕЦКИЙ ПИНЧЕР': 'miniaturepinscher',
  'СИБИРСКИЙ ХАСКИ': 'siberianhusky',
  'БОРДЕР КОЛЛИ': 'bordercollie',
  'НЕМЕЦКАЯ ОВЧАРКА': 'germanshepherd',
  'БЕЛЬГИЙСКАЯ ОВЧАРКА МАЛИНУА': 'belgianshepherd',
  'МАЛИНУА': 'belgianshepherd',
  'ЛАБРАДОР РЕТРИВЕР': 'labradorretriever',
  'КОНТИНЕНТАЛЬНЫЙ ТОЙ СПАНИЕЛЬ ПАПИЙОН': 'papillon',
  'ПАПИЙОН': 'papillon',
  'РОТВЕЙЛЕР': 'rottweiler',
  'БЕДЛИНГТОН ТЕРЬЕР': 'bedlingtonterrier',
  'ВЕЛЬШ КОРГИ ПЕМБРОК': 'pembrokewelshcorgi',
  'ВЕЛЬШ КОРГИ КАРДИГАН': 'cardiganwelshcorgi',
  'ШЕЛТИ': 'sheltie',
  'ФОКС-ТЕРЬЕР ГЛАДКОШЕРСТНЫЙ': 'smoothfoxterrier',
  'СИЛКЕН ВИНДСПРАЙТ': 'silkenwindsprite',
}

/**
 * Возвращает поддомен breedarchive для породы (или null, если отдельный архив отсутствует).
 */
export function getBreedArchiveSubdomain(identifier: string | null | undefined): string | null {
  if (!identifier) return null
  const clean = identifier.trim()
  if (BREED_ARCHIVE_SUBDOMAINS[clean]) return BREED_ARCHIVE_SUBDOMAINS[clean]

  const lower = clean.toLowerCase()
  if (BREED_ARCHIVE_SUBDOMAINS[lower]) return BREED_ARCHIVE_SUBDOMAINS[lower]

  const upper = clean.toUpperCase()
  if (BREED_ARCHIVE_SUBDOMAINS[upper]) return BREED_ARCHIVE_SUBDOMAINS[upper]

  return null
}

/**
 * Возвращает прямую ссылку на The Breed Archive для породы (или null).
 */
export function getBreedArchiveUrl(identifier: string | null | undefined): string | null {
  const sub = getBreedArchiveSubdomain(identifier)
  return sub ? `https://${sub}.breedarchive.com` : null
}
