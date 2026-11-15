export interface FciGroupInfo {
  id: number
  code: string
  name: string
  shortName: string
  order: number
}

export const FCI_GROUPS: Record<number, FciGroupInfo> = {
  10: {
    id: 10,
    code: '10',
    name: 'FCI 10: Борзые (и нац. породы)',
    shortName: 'FCI 10: Борзые',
    order: 1,
  },
  5: {
    id: 5,
    code: '5',
    name: 'FCI 5: Шпицы и аборигенные породы',
    shortName: 'FCI 5: Шпицы и аборигенные',
    order: 2,
  },
  3: {
    id: 3,
    code: '3',
    name: 'FCI 3: Терьеры',
    shortName: 'FCI 3: Терьеры',
    order: 3,
  },
  2: {
    id: 2,
    code: '2',
    name: 'FCI 2: Пинчеры, шнауцеры, молоссы',
    shortName: 'FCI 2: Пинчеры и молоссы',
    order: 4,
  },
  1: {
    id: 1,
    code: '1',
    name: 'FCI 1: Пастушьи и скотогонные собаки',
    shortName: 'FCI 1: Пастушьи',
    order: 5,
  },
  6: {
    id: 6,
    code: '6',
    name: 'FCI 6: Гончие и родственные породы',
    shortName: 'FCI 6: Гончие',
    order: 6,
  },
  7: {
    id: 7,
    code: '7',
    name: 'FCI 7: Легавые',
    shortName: 'FCI 7: Легавые',
    order: 7,
  },
  8: {
    id: 8,
    code: '8',
    name: 'FCI 8: Ретриверы и спаниели',
    shortName: 'FCI 8: Ретриверы',
    order: 8,
  },
  9: {
    id: 9,
    code: '9',
    name: 'FCI 9: Декоративные собаки и компаньоны',
    shortName: 'FCI 9: Декоративные',
    order: 9,
  },
  4: {
    id: 4,
    code: '4',
    name: 'FCI 4: Таксы',
    shortName: 'FCI 4: Таксы',
    order: 10,
  },
  0: {
    id: 0,
    code: '0',
    name: 'Спортивный и любительский класс',
    shortName: 'Спортивный класс',
    order: 11,
  },
}

export const BREED_SLUG_TO_FCI_GROUP: Record<string, number> = {
  // 10 группа: Борзые (FCI + Стандарт РКФ)
  'whippet': 10,
  'saluki': 10,
  'borzoi': 10,
  'italian-greyhound': 10,
  'afghan-hound': 10,
  'greyhound': 10,
  'irish-wolfhound': 10,
  'deerhound': 10,
  'hortaya-borzaya': 10,
  'tazy': 10,
  'spanish-galgo': 10,
  'sloughi': 10,
  'azawakh': 10,
  'magyar-agar': 10,
  'chart-polski': 10,
  'taigan': 10,
  'stepnaya-borzaya': 10,
  'bakhmull': 10,

  // 5 группа: Шпицы и аборигенные породы
  'basenji': 5,
  'pharaoh-hound': 5,
  'cirneco-delletna': 5,
  'ibizan-hound': 5,
  'canarian-podenco': 5,
  'thai-ridgeback': 5,
  'xoloitzcuintli': 5,
  'siberian-husky': 5,
  'samoyed': 5,
  'yakutian-laika': 5,
  'akita': 5,
  'shiba-inu': 5,
  'portuguese-podengo': 5,

  // 1 группа: Пастушьи и скотогонные
  'border-collie': 1,
  'german-shepherd': 1,
  'malinois': 1,
  'white-swiss-shepherd': 1,
  'australian-cattle-dog': 1,
  'dutch-shepherd': 1,
  'south-russian-shepherd': 1,
  'australian-shepherd': 1,
  'welsh-corgi-pembroke': 1,

  // 2 группа: Пинчеры, шнауцеры, молоссы
  'dobermann': 2,
  'miniature-pinscher': 2,
  'german-pinscher': 2,
  'great-dane': 2,
  'dogo-argentino': 2,
  'rottweiler': 2,
  'schnauzer': 2,
  'cane-corso': 2,
  'entlebucher': 2,
  'central-asian-shepherd': 2,

  // 3 группа: Терьеры
  'amstaff': 3,
  'irish-terrier': 3,
  'american-hairless-terrier': 3,
  'miniature-bull-terrier': 3,
  'jack-russell-terrier': 3,
  'staffordshire-bull-terrier': 3,
  'bedlington-terrier': 3,
  'smooth-fox-terrier': 3,
  'jagdterrier': 3,
  'airedale-terrier': 3,
  'welsh-terrier': 3,

  // 4 группа: Таксы
  'dachshund': 4,

  // 6 группа: Гончие и родственные
  'rhodesian-ridgeback': 6,
  'beagle': 6,
  'dalmatian': 6,
  'segugio-italiano': 6,
  'bavarian-mountain-hound': 6,
  'hannover-hound': 6,

  // 7 группа: Легавые
  'hungarian-vizsla': 7,
  'weimaraner': 7,
  'german-shorthaired-pointer': 7,
  'english-pointer': 7,
  'irish-red-setter': 7,

  // 8 группа: Ретриверы и спаниели
  'labrador-retriever': 8,
  'golden-retriever': 8,

  // 9 группа: Декоративные и компаньоны
  'papillon': 9,
  'russian-tsvetnaya-bolonka': 9,
  'standard-poodle': 9,

  // Спортивный и любительский класс
  'pitbull': 0,
  'praiter': 0,
  'mixed-breed': 0,
  'unregistered-breed': 0,
}

export function getBreedFciGroup(slug: string): number {
  return BREED_SLUG_TO_FCI_GROUP[slug] ?? 0
}

export function getFciGroupInfo(groupId: number): FciGroupInfo | undefined {
  return FCI_GROUPS[groupId]
}
