import type { NavigationRouteItem, BreedHubSearchItem } from './quickSearchTypes'
import { isLocalDev } from '../../lib/env'

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

/** Породные хабы */
export const BREED_HUBS: BreedHubSearchItem[] = [
  {
    slug: 'whippet',
    nameRu: 'Уиппет',
    nameLat: 'Whippet',
    subtitle: 'Породный хаб: рекорды скорости (до 65 км/ч), статистика и история',
    to: '/breed/whippet',
    keywords: ['уиппет', 'whippet', 'малая английская борзая', 'уипет', 'уип'],
  },
  {
    slug: 'saluki',
    nameRu: 'Салюки',
    nameLat: 'Saluki',
    subtitle: 'Породный хаб: рекорд скорости 68.8 км/ч, статистика и история',
    to: '/breed/saluki',
    keywords: ['салюки', 'saluki', 'персидская борзая', 'сал'],
  },
  {
    slug: 'borzoi',
    nameRu: 'Русская псовая борзая',
    nameLat: 'Borzoi',
    subtitle: 'Породный хаб: национальное достояние, рекорды и статистика',
    to: '/breed/borzoi',
    keywords: ['русская псовая борзая', 'рпб', 'borzoi', 'псовая борзая', 'русская борзая'],
  },
  {
    slug: 'basenji',
    nameRu: 'Басенджи',
    nameLat: 'Basenji',
    subtitle: 'Породный хаб: азарт, преследование, рекорды скорости и статистика',
    to: '/breed/basenji',
    keywords: ['басенджи', 'basenji', 'нелающая собака', 'конго терьер', 'бас'],
  },
  {
    slug: 'italian-greyhound',
    nameRu: 'Левретка (Итальянский грейхаунд)',
    nameLat: 'Italian Greyhound',
    subtitle: 'Породный хаб: малая итальянская борзая, грация и спринт',
    to: '/breed/italian-greyhound',
    keywords: ['левретка', 'итальянский грейхаунд', 'italian greyhound', 'малая итальянская', 'левр'],
  },
  {
    slug: 'afghan-hound',
    nameRu: 'Афганская борзая',
    nameLat: 'Afghan Hound',
    subtitle: 'Породный хаб: горная маневренность, рекорды и история',
    to: '/breed/afghan-hound',
    keywords: ['афганская борзая', 'афган', 'afghan hound', 'афганка'],
  },
]

export const POPULAR_BREEDS = [
  'Уиппет',
  'Русская псовая борзая',
  'Салюки',
  'Басенджи',
  'Левретка',
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
