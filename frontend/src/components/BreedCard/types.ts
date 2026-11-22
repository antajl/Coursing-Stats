import type { BreedHubDefinition } from '../../lib/breed-hubs-data'

export type BreedCardDesignVariant = 'passport' | 'showcase' | 'editorial' | 'legacy'

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
  layoutVariant?: BreedCardDesignVariant
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

export function formatGoldCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count.toLocaleString('ru-RU')} побед`
  if (mod10 === 1) return `${count.toLocaleString('ru-RU')} победа`
  if (mod10 >= 2 && mod10 <= 4) return `${count.toLocaleString('ru-RU')} победы`
  return `${count.toLocaleString('ru-RU')} побед`
}

export function getShellClass(isEmbedded: boolean): string {
  return isEmbedded
    ? 'group relative flex items-center w-full min-w-0 border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 transition-colors duration-150 hover:bg-camel-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px] cursor-pointer'
    : 'group relative flex items-center w-full min-w-0 rounded-xl sm:rounded-2xl border border-old-money-200/80 bg-white px-3 sm:px-3.5 py-2.5 sm:py-3 transition-all duration-150 hover:border-camel-400 hover:bg-cream-50/70 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camel-500/60 min-h-[44px] cursor-pointer'
}
