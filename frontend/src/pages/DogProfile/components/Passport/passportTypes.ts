export type PassportFormat = 'story' | 'certificate'

export interface DogPassportSportStats {
  hasData: boolean
  totalStarts: number
  gold: number
  silver: number
  bronze: number
  bestScore?: number | null
  avgScore?: number | null
  bestSpeed?: number | null
  rank?: number | null
}

export interface DogPassportDoninoStats {
  hasData: boolean
  bestSpeed?: number | null
  avgSpeed?: number | null
  speedRank?: number | null
  speedTotal?: number | null
  bestTime?: number | null
  timeRank?: number | null
  timeTotal?: number | null
}

export interface DogPassportShowStats {
  hasData: boolean
  totalShows: number
  bestAward?: string | null
  bestGrade?: string | null
  bisCount: number
  bigCount: number
  bobCount: number
  rankScore?: number | null
}

export interface DogPassportData {
  id: string | number
  namePrimary: string
  nameSecondary?: string | null
  breedPrimary: string
  breedVariety?: string | null
  sex?: string | null
  photoUrl?: string | null
  titles: string[]
  sport: DogPassportSportStats
  donino: DogPassportDoninoStats
  shows: DogPassportShowStats
  dogUrl: string
  issueDate: string
}
