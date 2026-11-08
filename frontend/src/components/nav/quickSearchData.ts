import type { NavigationRouteItem, BreedHubSearchItem } from './quickSearchTypes'
import { isLocalDev } from '../../lib/env'
import { CORE_BREED_HUBS, type BreedHubDefinition } from '../../lib/breed-hubs-data'

/** Реестр всех разделов сайта с синонимами, сокращениями и ключевыми словами */
export const SITE_NAVIGATION_ROUTES: NavigationRouteItem[] = [
  {
    id: 'competitions-ranking',
    title: 'Рейтинг соревнований',
    subtitle: 'Курсинг и рейсинг: медали, CS points, баллы и подиум 2015–2026',
    to: '/competitions?tab=ranking',
    icon: 'medal',
    keywords: [
      'рейтинг', 'рейтинг собак', 'топ', 'лидеры', 'соревнования', 'курсинг', 'бега',
      'рейсинг', 'спорт', 'баллы', 'очки', 'медали', 'подиум', 'победители', 'лучшие',
      'статистика спорта', 'cs', 'points', 'ranking', 'top', 'rating', 'leaderboard', 'рс',
    ],
  },
  {
    id: 'competitions-archive',
    title: 'Календарь и архив соревнований',
    subtitle: 'Все состязания с 2015 года: даты, организаторы и полные результаты',
    to: '/competitions?tab=archive',
    icon: 'calendar',
    keywords: [
      'архив', 'календарь', 'состязания', 'турниры', 'расписание', 'график', 'даты',
      'прошедшие', 'мероприятия', 'события', 'анонсы', 'старт', 'забеги', 'calendar',
      'events', 'archive', 'к', 'календ',
    ],
  },
  {
    id: 'competitions-judges',
    title: 'Судьи соревнований',
    subtitle: 'Судейская коллегия, стаж, статистика турниров и оценок',
    to: '/competitions?tab=judges',
    icon: 'club',
    keywords: [
      'судьи', 'судья', 'эксперты', 'судейство', 'арбитры', 'коллегия', 'оценщики',
      'спорт', 'судьи соревнований', 'judges', 'суд',
    ],
  },
  ...(isLocalDev
    ? [
        {
          id: 'protocol-builder',
          title: 'Конструктор протокола',
          subtitle: 'Векторный экспорт официальных протоколов соревнований в HTML и PDF',
          to: '/protocol-builder',
          icon: 'fileText' as const,
          keywords: [
            'конструктор', 'протокол', 'протоколы', 'билдер', 'создать протокол', 'бланк',
            'экспорт', 'печать', 'печать протокола', 'pdf', 'пдф', 'генератор', 'builder',
            'protocol', 'п', 'прот',
          ],
        },
      ]
    : []),
  {
    id: 'shows-ranking',
    title: 'Рейтинг выставок РКФ',
    subtitle: 'Выставочный рейтинг по породам и абсолютные лидеры сезона',
    to: '/shows?tab=ranking',
    icon: 'award',
    keywords: [
      'выставки', 'выставка', 'ркф', 'рейтинг выставок', 'шоу', 'ринги', 'титулы',
      'бис', 'bis', 'боб', 'bob', 'cac', 'cawc', 'cacib', 'ринговый рейтинг', 'shows',
      'в', 'выст', 'ркf',
    ],
  },
  {
    id: 'shows-calendar',
    title: 'Архив выставок РКФ',
    subtitle: 'Архив протоколов и расписание выставок РКФ 2019–2026',
    to: '/shows?tab=archive',
    icon: 'calendar',
    keywords: [
      'архив выставок', 'календарь выставок', 'график выставок', 'расписание выставок', 'выставки 2026',
      'выставки 2025', 'ринги даты', 'анонсы выставок', 'календарь ркф',
    ],
  },
  {
    id: 'shows-judges',
    title: 'Судьи выставок РКФ',
    subtitle: 'Эксперты РКФ и статистика судейства в рингах',
    to: '/shows?tab=judges',
    icon: 'club',
    keywords: [
      'судьи выставок', 'эксперты ркф', 'судья выставки', 'ринговые судьи',
      'судьи ркф', 'эксперты',
    ],
  },
  {
    id: 'donino-records',
    title: 'Рекорды Донино',
    subtitle: 'База замеров скорости радаром (км/ч), бегов на 350 м и статистика пород',
    to: '/speed-records',
    icon: 'speed',
    keywords: [
      'донино', 'донин', 'рекорды', 'замер скорости', 'скорость', 'радар', 'км/ч',
      'кмч', 'км', 'бега 350', '350м', '350 м', 'спринт', 'полигон', 'donino', 'speed',
      'д', 'дон', 'статистика донино', 'анализ скорости', 'графики скорости',
    ],
  },
  {
    id: 'donino-championship',
    title: 'Клубный чемпионат Донино',
    subtitle: 'Сводный рейтинг участников, 4 лиги, этапы I–III и регламент серии',
    to: '/donino/championship',
    icon: 'championship',
    keywords: [
      'клубный чемпионат', 'чемпионат донино', 'лиги', 'абсолют', 'чемпионов', 'прогресс',
      'юниоры', 'этап', 'регламент', 'манухин', 'донино чемпионат',
    ],
  },
  {
    id: 'guide-titles',
    title: 'Справка: Правила соревнований и титулы',
    subtitle: 'Нормативы CACL, ЧРКФ, сертификаты, правила курсинга и бегов',
    to: '/guide?tab=titles',
    icon: 'flag',
    keywords: [
      'правила', 'титулы', 'регламент', 'положение', 'cacl', 'чркф', 'квалификация',
      'сертификаты', 'нормативы', 'правила курсинга', 'правила бегов', 'guide', 'rules',
    ],
  },
  {
    id: 'guide-shows',
    title: 'Справка: Выставочные титулы и правила',
    subtitle: 'CAC, CACIB, ЧР, ЮЧР, классы собак, оценки и ринги',
    to: '/guide?tab=shows',
    icon: 'award',
    keywords: [
      'правила выставок', 'титулы выставок', 'cacib', 'cac', 'чр', 'ючр', 'кчк', 'чк',
      'классы', 'сертификаты выставок',
    ],
  },
  {
    id: 'guide-rating',
    title: 'Справка: Методика расчета рейтинга',
    subtitle: 'Формула CS Points, коэффициенты сложности и правила подсчета',
    to: '/guide?tab=rating',
    icon: 'trend',
    keywords: [
      'методика', 'формула', 'как считается', 'расчет рейтинга', 'cs points',
      'коэффициенты', 'балл', 'очки рейтинга', 'формула рейтинга',
    ],
  },
  {
    id: 'guide-protocol',
    title: 'Справка: Как читать протоколы',
    subtitle: 'Цвета попон, критерии судей, снятия и дисквалификации',
    to: '/guide?tab=protocol',
    icon: 'fileText',
    keywords: [
      'как читать протокол', 'попоны', 'критерии', 'оценки', 'дисквалификация',
      'снят', 'сошел', 'красная попона', 'белая попона', 'синяя попона',
    ],
  },
  {
    id: 'guide-donino',
    title: 'Справка: О полигоне Донино',
    subtitle: 'Методика замеров скорости, трек и регламент испытаний',
    to: '/guide?tab=donino',
    icon: 'speed',
    keywords: [
      'о донино', 'правила донино', 'полигон донино', 'замер радаром', 'хронометраж',
    ],
  },
  {
    id: 'guide-speeds',
    title: 'Справка: Скорости пород',
    subtitle: 'Справочная таблица предельных и средних скоростей борзых',
    to: '/guide?tab=speeds',
    icon: 'speed',
    keywords: [
      'скорость пород', 'скорости', 'быстрые породы', 'сравнение скоростей',
    ],
  },
  {
    id: 'about',
    title: 'О проекте',
    subtitle: 'История базы данных Coursing Stats, авторы и открытые источники',
    to: '/about',
    icon: 'club',
    keywords: [
      'о проекте', 'о сайте', 'автор', 'контакты', 'история', 'обратная связь',
      'инфо', 'информация', 'база', 'about', 'coursing stats',
    ],
  },
  {
    id: 'home',
    title: 'Главная страница',
    subtitle: 'Представительский дашборд лидеров сезона 2026',
    to: '/',
    icon: 'flag',
    keywords: ['главная', 'домой', 'старт', 'главная страница', 'дашборд', 'home'],
  },
]

function buildBreedKeywords(hub: BreedHubDefinition): string[] {
  const set = new Set<string>()

  const add = (text: string) => {
    const clean = text
      .toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[(),'’"/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (!clean) return
    set.add(clean)
    for (const word of clean.split(' ')) {
      if (word.length >= 2) set.add(word)
    }
  }

  add(hub.nameRu)
  add(hub.nameLat)
  add(hub.canonicalKey)
  if (hub.aliases) {
    for (const a of hub.aliases) add(a)
  }

  // Popular nicknames, aliases, and declinations
  const key = hub.canonicalKey.toUpperCase()
  if (key.includes('ТАКСА')) {
    set.add('такса')
    set.add('таксу')
    set.add('таксы')
    set.add('такс')
    set.add('таксой')
    set.add('таксе')
    set.add('dachshund')
    set.add('dackel')
    set.add('текель')
  }
  if (key.includes('УИППЕТ')) {
    set.add('уиппет')
    set.add('уиппета')
    set.add('уиппету')
    set.add('whippet')
    set.add('малая английская борзая')
  }
  if (key.includes('ПСОВАЯ')) {
    set.add('рпб')
    set.add('borzoi')
    set.add('русская борзая')
    set.add('борзая')
    set.add('борзую')
    set.add('борзой')
    set.add('борзые')
  }
  if (key.includes('САЛЮКИ')) {
    set.add('салюки')
    set.add('saluki')
    set.add('персидская борзая')
  }
  if (key.includes('БАСЕНДЖИ')) {
    set.add('басенджи')
    set.add('basenji')
    set.add('нелающая собака')
  }
  if (key.includes('ЛЕВРЕТКА')) {
    set.add('левретка')
    set.add('левретку')
    set.add('левретки')
    set.add('italian greyhound')
    set.add('итальянский грейхаунд')
    set.add('малая итальянская')
  }
  if (key.includes('ГРЕЙХАУНД')) {
    set.add('грейхаунд')
    set.add('грейхаунда')
    set.add('greyhound')
  }
  if (key.includes('ВОЛКОДАВ')) {
    set.add('ив')
    set.add('волкодав')
    set.add('волкодава')
    set.add('irish wolfhound')
  }
  if (key.includes('ДИРХАУНД')) {
    set.add('дирхаунд')
    set.add('deerhound')
    set.add('шотландская борзая')
  }
  if (key.includes('АФГАН')) {
    set.add('афган')
    set.add('афганка')
    set.add('afghan hound')
  }
  if (key.includes('РИДЖБЕК')) {
    set.add('риджбек')
    set.add('риджбека')
    set.add('rhodesian ridgeback')
  }
  if (key.includes('КОРГИ')) {
    set.add('корги')
    set.add('пемброк')
    set.add('кардиган')
    set.add('corgi')
  }
  if (key.includes('АВСТРАЛИЙСКАЯ ОВЧАРКА')) {
    set.add('аусси')
    set.add('aussie')
  }
  if (key.includes('СТАФФОРДШИРСКИЙ ТЕРЬЕР')) {
    set.add('амстафф')
    set.add('amstaff')
  }
  if (key.includes('СТАФФОРДШИРСКИЙ БУЛЬТЕРЬЕР')) {
    set.add('стаффбуль')
    set.add('staffbull')
  }
  if (key.includes('ДЖЕК РАССЕЛ')) {
    set.add('дрт')
    set.add('jrt')
  }
  if (key.includes('БИГЛЬ')) {
    set.add('бигль')
    set.add('бигля')
    set.add('beagle')
  }
  if (key.includes('ДОБЕРМАН')) {
    set.add('доберман')
    set.add('добермана')
    set.add('dobermann')
  }
  if (key.includes('НЕМЕЦКАЯ ОВЧАРКА')) {
    set.add('но')
    set.add('овчарка')
  }
  if (key.includes('МАЛИНУА')) {
    set.add('малинуа')
    set.add('бельгийская овчарка')
  }

  return [...set]
}

/** Породные хабы (все 82 породы из официального реестра) */
export const BREED_HUBS: BreedHubSearchItem[] = CORE_BREED_HUBS.map((hub) => ({
  slug: hub.slug,
  nameRu: hub.nameRu,
  nameLat: hub.nameLat,
  subtitle: hub.lead.length > 80 ? `${hub.lead.slice(0, 77)}...` : hub.lead,
  to: `/breeds/${hub.slug}/`,
  keywords: buildBreedKeywords(hub),
}))

export const POPULAR_BREEDS = [
  'Уиппет',
  'Русская псовая борзая',
  'Салюки',
  'Басенджи',
  'Левретка',
  'Такса',
  'Грейхаунд',
  'Афганская борзая',
]

export const QUICK_NAV_SHORTCUTS = [
  { label: 'Рейтинг спорта', to: '/competitions?tab=ranking', icon: 'medal' as const },
  { label: 'Рейтинг выставок', to: '/shows?tab=ranking', icon: 'award' as const },
  { label: 'Рекорды Донино', to: '/speed-records?tab=records', icon: 'speed' as const },
  { label: 'Календарь', to: '/competitions?tab=archive', icon: 'calendar' as const },
  { label: 'Судьи', to: '/competitions?tab=judges', icon: 'club' as const },
  ...(isLocalDev ? [{ label: 'Конструктор', to: '/protocol-builder', icon: 'fileText' as const }] : []),
]
