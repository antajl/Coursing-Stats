import { type Icons } from '../../lib/icons'

import type { SearchRecordKind } from '../../../../backend/lib/search-prefix'

export interface HomeSearchDog {
  id: number | string
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  competition_count?: number
  sex?: string | null
  kind?: SearchRecordKind
  to?: string
}

export interface JudgeSearchItem {
  id: string
  name: string
  meta: string
  kind: 'js' | 'jx'
  count: number
  to: string
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

export type SearchItem =
  | { type: 'nav'; item: NavigationRouteItem; score: number }
  | { type: 'breed'; item: BreedHubSearchItem; score: number }
  | { type: 'dog'; dog: HomeSearchDog; score: number }
  | { type: 'judge'; judge: JudgeSearchItem; score: number }
  | { type: 'event'; event: CalendarSearchEvent; score: number }
