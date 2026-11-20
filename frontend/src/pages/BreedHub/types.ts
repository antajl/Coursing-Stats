import type { AnnualDogLeader } from '../../hooks/useStaticData'
import type { AnnualDoninoLeader } from '../../lib/doninoAnnualLeaders'

export interface SpeedRecordItem {
  breed?: string
  name?: string
  sex?: string
  speed_km_h?: number
  time_seconds?: number
  date?: string
  track_type?: string
  status?: string
  history?: unknown
  screenshot_url?: string
  mode?: 'speed' | 'coursing'
}

export type ColumnTabId = 'coursing' | 'racing' | 'donino'

export interface BreedHubColumnsProps {
  annualLeaders?: AnnualDogLeader[]
  coursingLeaders?: AnnualDogLeader[]
  racingLeaders?: AnnualDogLeader[]
  doninoLeaders?: AnnualDoninoLeader[]
  annualLeadersLoading: boolean
  speedRecords?: SpeedRecordItem[]
  doninoLoading: boolean
  canonicalKey: string
  breedNameRu: string
}
