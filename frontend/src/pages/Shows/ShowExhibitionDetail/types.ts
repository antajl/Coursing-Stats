import type { BreedCatalogRow, ShowResultRow } from '../showExhibitionUtils'

export interface MainRingRow {
  competition_key: string
  competition_label: string
  group: number | null
  place: number
  breed: string
  catalog_number: number
  dog_name: string
  pedigree?: string
  award_badge?: string
}

export interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  url?: string
  source?: string
  reports_link?: string | null
  bis_reports_link?: string | null
  breed_catalog?: BreedCatalogRow[]
  results: ShowResultRow[]
  main_ring?: MainRingRow[]
}
