import type { QuickBreedItem } from './types'

export const CANDIDATE_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 68 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 50 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 78 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек', estWidth: 78 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 68 },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд', estWidth: 88 },
  { key: 'ИРЛАНДСКИЙ ВОЛКОДАВ', label: 'Ирл. волкодав', fullName: 'Ирландский волкодав', estWidth: 108 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 78 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака', estWidth: 72 },
  { key: 'ЛЕВРЕТКА', label: 'Левретка', fullName: 'Левретка', estWidth: 78 },
  { key: 'АФГАНСКАЯ БОРЗАЯ', label: 'Афган', fullName: 'Афганская борзая', estWidth: 68 },
  { key: 'МАДЬЯР АГАР', label: 'Мадьяр', fullName: 'Мадьяр агар', estWidth: 72 },
  { key: 'АЗАВАК', label: 'Азавак', fullName: 'Азавак', estWidth: 72 },
]

export const SHOW_CANDIDATE_BREEDS: QuickBreedItem[] = [
  { key: 'УИППЕТ', label: 'Уиппет', fullName: 'Уиппет', estWidth: 68 },
  { key: 'РУССКАЯ ПСОВАЯ БОРЗАЯ', label: 'РПБ', fullName: 'Русская псовая борзая', estWidth: 50 },
  { key: 'БАСЕНДЖИ', label: 'Басенджи', fullName: 'Басенджи', estWidth: 78 },
  { key: 'САЛЮКИ', label: 'Салюки', fullName: 'Салюки', estWidth: 68 },
  { key: 'ЛЕВРЕТКА', label: 'Левретка', fullName: 'Левретка', estWidth: 78 },
  { key: 'ИРЛАНДСКИЙ ВОЛКОДАВ', label: 'Ирл. волкодав', fullName: 'Ирландский волкодав', estWidth: 108 },
  { key: 'ГРЕЙХАУНД', label: 'Грейхаунд', fullName: 'Грейхаунд', estWidth: 88 },
  { key: 'АФГАНСКАЯ БОРЗАЯ', label: 'Афган', fullName: 'Афганская борзая', estWidth: 68 },
  { key: 'РОДЕЗИЙСКИЙ РИДЖБЕК', label: 'Риджбек', fullName: 'Родезийский риджбек', estWidth: 78 },
  { key: 'ЧИРНЕКО ДЕЛЬ ЭТНА', label: 'Чирнеко', fullName: 'Чирнеко дель Этна', estWidth: 78 },
  { key: 'ФАРАОНОВА СОБАКА', label: 'Фараон', fullName: 'Фараонова собака', estWidth: 72 },
  { key: 'ТАКСА', label: 'Такса', fullName: 'Такса', estWidth: 62 },
  { key: 'ПУДЕЛЬ', label: 'Пудель', fullName: 'Пудель', estWidth: 68 },
]

export const TOP_QUICK_BREEDS = CANDIDATE_BREEDS

export const GAP = 5 // gap-[5px] = 5px
export const BUFFER = 4 // Запас против субпиксельного округления в flex и переполнения края контейнера

export const cachedWidthByContext = new Map<string, number>()

export function getContextKey(): string {
  if (typeof window !== 'undefined') {
    const tab = new URLSearchParams(window.location.search).get('tab') || ''
    return `${window.location.pathname}:${tab}`
  }
  return 'default'
}

export function getInitialContainerWidth(): number {
  const key = getContextKey()
  const cached = cachedWidthByContext.get(key)
  if (cached && cached > 0) {
    return cached
  }
  if (typeof window !== 'undefined') {
    const effectiveLayoutWidth = Math.min(window.innerWidth - 32, 1280 - 64)
    const isRanking = window.location.pathname.includes('/ranking') || window.location.search.includes('tab=ranking')
    const estimatedLeftControls = isRanking ? 420 : 340
    return Math.max(260, effectiveLayoutWidth - estimatedLeftControls)
  }
  return 600
}
