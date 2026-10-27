import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Icons } from '../../lib/icons'
import { canonicalBreed, displayBreed } from '../../lib/breedMapping'
import {
  dogNameMatchesQuery,
  dogNameSearchText,
  dogQuerySearchTokens,
  parseDogName,
  transliterateCyrillicToLatin,
} from '../../lib/dogName'
import DogSexIcon from '../DogSexIcon'

export interface HomeSearchDog {
  id: number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  competition_count?: number
  sex?: string | null
}

export interface CalendarSearchEvent {
  id: number
  year: number
  date_start: string
  title: string
  rank_code?: string
  location?: string
  event_type?: string
}

export interface NavigationRouteItem {
  id: string
  title: string
  subtitle: string
  to: string
  icon: keyof typeof Icons
  keywords: string[]
}

export interface BreedHubSearchItem {
  slug: string
  nameRu: string
  nameLat: string
  subtitle: string
  to: string
  keywords: string[]
}

type SearchItem =
  | { type: 'nav'; item: NavigationRouteItem; score: number }
  | { type: 'breed'; item: BreedHubSearchItem; score: number }
  | { type: 'dog'; dog: HomeSearchDog; score: number }
  | { type: 'event'; event: CalendarSearchEvent; score: number }

function normalizeText(q: string): string {
  return q
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s'-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Реестр всех разделов сайта с синонимами, сокращениями и ключевыми словами */
const SITE_NAVIGATION_ROUTES: NavigationRouteItem[] = [
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
  {
    id: 'protocol-builder',
    title: 'Конструктор протокола',
    subtitle: 'Векторный экспорт официальных протоколов соревнований в HTML и PDF',
    to: '/protocol-builder',
    icon: 'fileText',
    keywords: [
      'конструктор', 'протокол', 'протоколы', 'билдер', 'создать протокол', 'бланк',
      'экспорт', 'печать', 'печать протокола', 'pdf', 'пдф', 'генератор', 'builder',
      'protocol', 'п', 'прот',
    ],
  },
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
    title: 'Рекорды Курсинг Донино',
    subtitle: 'Рекорды пиковой скорости радаром (км/ч) и бегов на дистанцию 350 м',
    to: '/speed-records?tab=records',
    icon: 'speed',
    keywords: [
      'донино', 'донин', 'рекорды', 'замер скорости', 'скорость', 'радар', 'км/ч',
      'кмч', 'км', 'бега 350', '350м', '350 м', 'спринт', 'полигон', 'donino', 'speed',
      'д', 'дон',
    ],
  },
  {
    id: 'donino-stats',
    title: 'Статистика Курсинг Донино',
    subtitle: 'Аналитика, средние скорости пород, распределение и сравнение',
    to: '/speed-records?tab=stats',
    icon: 'trend',
    keywords: [
      'статистика донино', 'анализ скорости', 'графики скорости', 'сравнение пород',
      'средняя скорость', 'замеры',
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
const BREED_HUBS: BreedHubSearchItem[] = [
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

function scoreNavigation(item: NavigationRouteItem, q: string): number {
  const qClean = normalizeText(q)
  if (!qClean) return 0

  const title = normalizeText(item.title)
  const subtitle = normalizeText(item.subtitle)

  if (title === qClean) return 110
  for (const kw of item.keywords) {
    if (kw === qClean) return 105
  }

  if (title.startsWith(qClean) || title.includes(` ${qClean}`)) return 95
  for (const kw of item.keywords) {
    if (kw.startsWith(qClean) || kw.includes(` ${qClean}`)) return 90
  }

  if (title.includes(qClean)) return 85
  for (const kw of item.keywords) {
    if (kw.includes(qClean)) return 80
  }

  if (subtitle.includes(qClean)) return 60
  return 0
}

function scoreBreedHub(hub: BreedHubSearchItem, q: string): number {
  const qClean = normalizeText(q)
  if (!qClean) return 0

  const nameRu = normalizeText(hub.nameRu)
  const nameLat = normalizeText(hub.nameLat)

  if (nameRu === qClean || nameLat === qClean) return 110
  for (const kw of hub.keywords) {
    if (kw === qClean) return 105
  }

  if (nameRu.startsWith(qClean) || nameLat.startsWith(qClean)) return 95
  for (const kw of hub.keywords) {
    if (kw.startsWith(qClean)) return 90
  }

  if (nameRu.includes(qClean) || nameLat.includes(qClean)) return 80
  for (const kw of hub.keywords) {
    if (kw.includes(qClean)) return 75
  }

  return 0
}

function dogDedupeKey(dog: HomeSearchDog): string {
  const { primary } = parseDogName(dog.name_lat, dog.name_ru)
  const base = primary.split('/')[0]?.trim() || ''
  const lat = transliterateCyrillicToLatin(base)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
  const breed = canonicalBreed(dog.breed || '')
  return `${lat}|${breed}`
}

function scoreDog(dog: HomeSearchDog, q: string): number {
  if (!q.trim()) return 0
  const breedQ = normalizeText(q)
  const breed = normalizeText(dog.breed || '')
  const display = dog.breed ? displayBreed(dog.breed) : null
  const displayPrimary = display?.primary ? normalizeText(display.primary) : ''
  const displaySecondary = display?.secondary ? normalizeText(display.secondary) : ''
  const breedHit =
    breedQ.length >= 2 &&
    (breed.includes(breedQ) ||
      (displayPrimary && displayPrimary.includes(breedQ)) ||
      (displaySecondary && displaySecondary.includes(breedQ)))

  if (!dogNameMatchesQuery(dog.name_lat, dog.name_ru, q) && !breedHit) return 0

  const hay = dogNameSearchText(dog.name_lat, dog.name_ru)
  const tokens = dogQuerySearchTokens(q)
  let best = breedHit ? 35 : 0
  for (const token of tokens) {
    if (hay === token) best = Math.max(best, 100)
    else if (hay.startsWith(token) || hay.includes(` ${token}`)) best = Math.max(best, 80)
    else if (hay.includes(token)) best = Math.max(best, 55)
  }
  return best
}

function scoreEvent(event: CalendarSearchEvent, q: string): number {
  const qClean = normalizeText(q)
  if (!qClean || qClean.length < 2) return 0
  const title = normalizeText(event.title || '')
  const loc = normalizeText(event.location || '')
  const rank = normalizeText(event.rank_code || '')
  const yearStr = String(event.year || '')

  if (title.includes(qClean)) return 90
  if (loc.includes(qClean)) return 70
  if (rank.includes(qClean)) return 60
  if (yearStr === qClean) return 50
  return 0
}

const POPULAR_BREEDS = [
  'Уиппет',
  'Русская псовая борзая',
  'Салюки',
  'Басенджи',
  'Левретка',
  'Афганская борзая',
]

const QUICK_NAV_SHORTCUTS = [
  { label: 'Рейтинг спорта', to: '/competitions?tab=ranking', icon: 'medal' as const },
  { label: 'Выставки РКФ', to: '/shows?tab=ranking', icon: 'award' as const },
  { label: 'Рекорды Донино', to: '/speed-records?tab=records', icon: 'speed' as const },
  { label: 'Календарь', to: '/competitions?tab=archive', icon: 'calendar' as const },
  { label: 'Судьи', to: '/competitions?tab=judges', icon: 'club' as const },
  { label: 'Конструктор', to: '/protocol-builder', icon: 'fileText' as const },
]

interface QuickSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

let cachedDogs: HomeSearchDog[] | null = null
let cachedEvents: CalendarSearchEvent[] | null = null

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [dogs, setDogs] = useState<HomeSearchDog[] | null>(cachedDogs)
  const [events, setEvents] = useState<CalendarSearchEvent[] | null>(cachedEvents)

  // Fetch indexes when opened
  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    if (!cachedDogs) {
      fetch('/data/v1/indexes/dogs-index.json')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: HomeSearchDog[]) => {
          if (cancelled) return
          cachedDogs = Array.isArray(data) ? data : []
          setDogs(cachedDogs)
        })
        .catch(() => {})
    }

    if (!cachedEvents) {
      fetch('/data/v1/indexes/calendar-index.json')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: CalendarSearchEvent[]) => {
          if (cancelled) return
          cachedEvents = Array.isArray(data) ? data : []
          setEvents(cachedEvents)
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
  }, [isOpen])

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (!isOpen) return

    setQuery('')
    setSelectedIndex(0)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 40)

    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(timer)
    }
  }, [isOpen])

  // Compute matched items
  const { navItems, breedItems, dogItems, eventItems, allItems } = useMemo(() => {
    const q = query.trim()
    if (!q) {
      return { navItems: [], breedItems: [], dogItems: [], eventItems: [], allItems: [] }
    }

    // Match Navigation sections
    const matchedNav: { type: 'nav'; item: NavigationRouteItem; score: number }[] =
      SITE_NAVIGATION_ROUTES.map((route) => ({
        type: 'nav' as const,
        item: route,
        score: scoreNavigation(route, q),
      }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)

    // Match Breed Hubs
    const matchedBreeds: { type: 'breed'; item: BreedHubSearchItem; score: number }[] =
      BREED_HUBS.map((hub) => ({
        type: 'breed' as const,
        item: hub,
        score: scoreBreedHub(hub, q),
      }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

    // Match Dogs (only if query >= 2 chars)
    let matchedDogs: { type: 'dog'; dog: HomeSearchDog; score: number }[] = []
    if (q.length >= 2 && dogs) {
      const bestByKey = new Map<string, { dog: HomeSearchDog; score: number }>()
      for (const dog of dogs) {
        if (!dog.id || /^\d+$/.test(String(dog.breed || ''))) continue
        const s = scoreDog(dog, q)
        if (s <= 0) continue
        const key = dogDedupeKey(dog)
        const prev = bestByKey.get(key)
        if (
          !prev ||
          s > prev.score ||
          (s === prev.score && (dog.competition_count || 0) > (prev.dog.competition_count || 0)) ||
          (s === prev.score &&
            (dog.competition_count || 0) === (prev.dog.competition_count || 0) &&
            dog.id < prev.dog.id)
        ) {
          bestByKey.set(key, { dog, score: s })
        }
      }
      matchedDogs = [...bestByKey.values()]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return (b.dog.competition_count || 0) - (a.dog.competition_count || 0)
        })
        .slice(0, 6)
        .map((x) => ({ type: 'dog' as const, dog: x.dog, score: x.score }))
    }

    // Match Events (only if query >= 2 chars)
    let matchedEvents: { type: 'event'; event: CalendarSearchEvent; score: number }[] = []
    if (q.length >= 2 && events) {
      matchedEvents = events
        .map((ev) => ({ type: 'event' as const, event: ev, score: scoreEvent(ev, q) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          return (b.event.year || 0) - (a.event.year || 0)
        })
        .slice(0, 3)
    }

    const combined: SearchItem[] = [
      ...matchedNav,
      ...matchedBreeds,
      ...matchedDogs,
      ...matchedEvents,
    ]

    return {
      navItems: matchedNav,
      breedItems: matchedBreeds,
      dogItems: matchedDogs,
      eventItems: matchedEvents,
      allItems: combined,
    }
  }, [dogs, events, query])

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelectItem = (item: SearchItem) => {
    onClose()
    if (item.type === 'nav') {
      navigate(item.item.to)
    } else if (item.type === 'breed') {
      navigate(item.item.to)
    } else if (item.type === 'dog') {
      navigate(`/dog/${item.dog.id}`)
    } else {
      navigate(`/event/${item.event.id}`)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (allItems.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % allItems.length)
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length)
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const selected = allItems[selectedIndex]
      if (selected) {
        handleSelectItem(selected)
      }
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Быстрый поиск и навигация"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[11vh] px-3 sm:px-4 bg-charcoal-900/40 backdrop-blur-sm transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-xl bg-cream-50 rounded-2xl shadow-[0_20px_50px_-10px_rgba(43,37,32,0.35)] border border-old-money-200 overflow-hidden flex flex-col will-change-transform animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-3.5 sm:px-4 py-3 sm:py-3.5 border-b border-old-money-200 bg-white">
          <Icons.search className="w-4 h-4 sm:w-5 sm:h-5 text-camel-700 shrink-0 mr-2.5 sm:mr-3" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Поиск по сайту: собака, порода, турнир или раздел..."
            className="min-w-0 flex-1 bg-transparent border-0 !outline-none focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus-visible:!ring-0 text-sm sm:text-base text-charcoal-900 placeholder:text-charcoal-400 font-medium mr-2"
            style={{ outline: 'none' }}
          />
          <div className="flex items-center shrink-0 gap-1.5 ml-auto">
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="p-1 rounded text-charcoal-400 hover:text-charcoal-700 transition-colors cursor-pointer"
                aria-label="Очистить"
              >
                <Icons.close className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border border-old-money-200 bg-old-money-100/70 text-charcoal-500 select-none shadow-2xs">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results Container */}
        <div ref={listRef} className="max-h-[58vh] overflow-y-auto overscroll-contain py-2 divide-y divide-old-money-100">
          {!query.trim() ? (
            <div className="p-4 sm:p-5">
              {/* Quick Navigation Shortcuts */}
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2.5">
                Быстрый переход по сайту
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {QUICK_NAV_SHORTCUTS.map((item) => {
                  const ItemIcon = Icons[item.icon]
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => {
                        onClose()
                        navigate(item.to)
                      }}
                      className="px-2.5 py-2 text-left rounded-xl border border-old-money-200 bg-white hover:bg-old-money-50 hover:border-camel-300 text-charcoal-800 transition-all flex items-center gap-2 group cursor-pointer"
                    >
                      <ItemIcon className="w-4 h-4 text-camel-700 shrink-0 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Popular Breeds */}
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 mb-2">
                Популярные породы
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                {POPULAR_BREEDS.map((breed) => (
                  <button
                    key={breed}
                    type="button"
                    onClick={() => {
                      setQuery(breed)
                      inputRef.current?.focus()
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg border border-old-money-200 bg-white hover:bg-old-money-50 hover:border-camel-300 text-charcoal-700 transition-colors cursor-pointer"
                  >
                    {breed}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-charcoal-400 leading-relaxed border-t border-old-money-100 pt-3">
                Введите кличку собаки, породу, турнир или раздел сайта (например: «судьи», «календарь», «правила», «донино», «протокол», «рпб»).
              </p>
            </div>
          ) : allItems.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <p className="text-sm font-medium text-charcoal-700 mb-1">
                Ничего не найдено по запросу «{query}»
              </p>
              <p className="text-xs text-charcoal-400">
                Попробуйте ввести кличку собаки, название раздела (например «судьи», «донино», «календарь») или породу
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Sections */}
              {navItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Разделы сайта</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Навигация</span>
                  </div>
                  {navItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex
                    const NavIcon = Icons[item.item.icon] || Icons.flag

                    return (
                      <button
                        key={`nav-${item.item.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-old-money-100 border border-old-money-200 flex items-center justify-center shrink-0 text-camel-800">
                            <NavIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-charcoal-900 truncate">
                                {item.item.title}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                Раздел
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                              {item.item.subtitle}
                            </p>
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Breed Hubs */}
              {breedItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Породы</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Породный хаб</span>
                  </div>
                  {breedItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex

                    return (
                      <button
                        key={`breed-${item.item.slug}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
                            <Icons.paw className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-charcoal-900 truncate">
                                {item.item.nameRu} ({item.item.nameLat})
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                Хаб
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal-500 truncate mt-0.5">
                              {item.item.subtitle}
                            </p>
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Dogs Section */}
              {dogItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Собаки ({dogItems.length})</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">База собак</span>
                  </div>
                  {dogItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex
                    const { primary, secondary } = parseDogName(item.dog.name_lat, item.dog.name_ru)
                    const display = item.dog.breed ? displayBreed(item.dog.breed) : null

                    return (
                      <button
                        key={`dog-${item.dog.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-charcoal-900 truncate">
                              {primary}
                            </span>
                            {secondary && (
                              <span className="text-xs text-charcoal-500 truncate hidden sm:inline">
                                / {secondary}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-0.5">
                            <span className="font-medium text-charcoal-700 truncate">
                              {display?.primary || item.dog.breed}
                            </span>
                            {item.dog.sex && (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <DogSexIcon sex={item.dog.sex} size={11} variant="neutral" />
                              </>
                            )}
                            {item.dog.competition_count ? (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <span>{item.dog.competition_count} заб.</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Events Section */}
              {eventItems.length > 0 && (
                <div className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-camel-800 flex items-center justify-between">
                    <span>Соревнования ({eventItems.length})</span>
                    <span className="text-[10px] text-charcoal-400 font-normal">Турниры</span>
                  </div>
                  {eventItems.map((item) => {
                    const idx = allItems.indexOf(item)
                    const isSelected = idx === selectedIndex

                    return (
                      <button
                        key={`event-${item.event.id}`}
                        type="button"
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-camel-100/75 border-l-2 border-camel-600'
                            : 'hover:bg-old-money-50/70 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-charcoal-900 truncate">
                            {item.event.title}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-charcoal-500 mt-0.5 truncate">
                            <span>{item.event.date_start}</span>
                            {item.event.rank_code && (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <span className="font-medium text-camel-800">{item.event.rank_code}</span>
                              </>
                            )}
                            {item.event.location && (
                              <>
                                <span className="text-charcoal-300">·</span>
                                <span className="truncate">{item.event.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Icons.chevronRight className="w-4 h-4 text-charcoal-400 shrink-0" />
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info & hotkey hints */}
        <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-old-money-50/90 border-t border-old-money-200 flex items-center justify-between text-[11px] text-charcoal-500">
          <span>
            {allItems.length > 0 ? `Найдено результатов: ${allItems.length}` : 'База данных Coursing Stats'}
          </span>
          <div className="flex items-center gap-2.5 sm:gap-3 text-charcoal-500">
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="font-mono bg-white border border-old-money-200 px-1 rounded text-[10px]">↑</kbd>
              <kbd className="font-mono bg-white border border-old-money-200 px-1 rounded text-[10px]">↓</kbd>
              <span>выбор</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="font-mono bg-white border border-old-money-200 px-1.5 rounded text-[10px]">↵</kbd>
              <span>открыть</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
