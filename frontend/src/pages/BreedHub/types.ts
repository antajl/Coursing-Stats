import type { AnnualDogLeader, AnnualShowDogLeader } from '../../hooks/useStaticData'
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

export type ColumnTabId = 'coursing' | 'racing' | 'shows_cac' | 'shows_mono' | 'donino'

export interface BreedHubColumnsProps {
  annualLeaders?: AnnualDogLeader[]
  coursingLeaders?: AnnualDogLeader[]
  racingLeaders?: AnnualDogLeader[]
  doninoLeaders?: AnnualDoninoLeader[]
  showsCacLeaders?: AnnualShowDogLeader[]
  showsMonoLeaders?: AnnualShowDogLeader[]
  annualLeadersLoading: boolean
  speedRecords?: SpeedRecordItem[]
  doninoLoading: boolean
  canonicalKey: string
  breedNameRu: string
  breedSlug?: string
}
