export type PassportFormat = 'story' | 'certificate'

export interface DogPassportHighlight {
  placement: number
  title: string
  year?: string | number
  score?: number | string
  qualification?: string
  discipline: 'coursing' | 'racing' | 'bzmp' | 'show'
}

export interface DogPassportCoursingStats {
  hasData: boolean
  disciplineTitle?: string
  totalStarts: number
  gold: number
  silver: number
  bronze: number
  bestScore?: number | null
  avgJudgeScore?: number | null
  bestJudgeScore?: number | null
  breedRank?: number | null
  yearBreedRank?: number | null
}

export interface DogPassportRacingStats {
  hasData: boolean
  totalStarts: number
  gold: number
  silver: number
  bronze: number
  bestSpeed?: number | null
  avgSpeed?: number | null
  breedRank?: number | null
  yearBreedRank?: number | null
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
  breedRank?: number | null
  yearBreedRank?: number | null
}

export type DogPassportTitleCategory = 'supreme' | 'coursing' | 'racing' | 'shows'

export interface PassportSectionsConfig {
  coursing: boolean
  racing: boolean
  shows: boolean
  titles: boolean
}

export interface DogPassportTitle {
  badge: string
  label: string
  display?: string
  category: DogPassportTitleCategory
  count?: number
}

export interface DogPassportData {
  id: string | number
  namePrimary: string
  nameSecondary?: string | null
  breedPrimary: string
  breedVariety?: string | null
  sex?: string | null
  photoUrl?: string | null
  pedigreeUrl?: string | null
  titles: DogPassportTitle[]
  coursing: DogPassportCoursingStats
  racing: DogPassportRacingStats
  donino: DogPassportDoninoStats
  shows: DogPassportShowStats
  highlights: DogPassportHighlight[]
  dogUrl: string
  issueDate: string
}
