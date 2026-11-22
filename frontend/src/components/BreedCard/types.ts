import type { BreedHubDefinition } from '../../lib/breed-hubs-data'

export interface BreedStatsData {
  dogs: number
  starts: number
  gold: number
  maxSpeed: number
  seasonsCount: number
  latestLeader?: {
    year: number
    dog_name: string
  }
}

export interface BreedCardProps {
  breed: BreedHubDefinition
  stats?: BreedStatsData
  variant?: 'embedded' | 'card'
}

export function formatDogsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} собак`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} собаки`
  return `${count.toLocaleString('ru-RU')} собак`
}

export function formatRunsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} забегов`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} забег`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} забега`
  return `${count.toLocaleString('ru-RU')} забегов`
}

export function formatSeasonsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} сезонов`
  if (mod10 === 1) return `${count} сезон`
  if (mod10 >= 2 && mod10 <= 4) return `${count} сезона`
  return `${count} сезонов`
}

export function formatGoldCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} золотых медалей`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} золотая медаль`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} золотые медали`
  return `${count.toLocaleString('ru-RU')} золотых медалей`
}

export function formatSpeedText(speed: number | undefined): string {
  if (!speed || speed <= 0) return '—'
  const val = speed % 1 === 0 ? String(speed) : speed.toFixed(1)
  return `${val}\u00A0км/ч`
}

export function getBreedDisciplinesText(slug: string, group: number): string {
  if (group === 10) return 'Курсинг, рейсинг (CACL) · Выставки (CAC / Моно)'
  if (group === 5) {
    const sighthoundLike = [
      'basenji',
      'pharaoh-hound',
      'ibizan-hound',
      'canarian-warren-hound',
      'cirneco-dell-etna',
    ]
    if (sighthoundLike.includes(slug)) return 'Курсинг (CACL) · БЗМП · Выставки (CAC / Моно)'
    return 'Бега за приманкой (БЗМП) · Выставки РКФ'
  }
  if (group === 0) return 'Бега за механической приманкой (БЗМП)'
  return 'Бега за приманкой (БЗМП) · Выставки РКФ'
}

export function getShellClass(isEmbedded: boolean): string {
  return isEmbedded
    ? 'group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-1.5 sm:py-2 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px] cursor-pointer'
    : 'group relative flex items-center w-full min-w-0 rounded-xl sm:rounded-2xl border border-old-money-200/80 bg-white px-3 sm:px-3.5 py-1.5 sm:py-2 transition-all duration-150 hover:border-camel-400 hover:bg-cream-50/70 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px] cursor-pointer'
}
