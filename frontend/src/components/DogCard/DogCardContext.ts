import { createContext, useContext } from 'react'

export type DogCardVariant = 'card' | 'embedded'

export interface DogCardProps {
  dog: {
    dog_id: number
    name_lat: string
    name_ru?: string
    breed: string
    year?: number
    year_from?: number
    year_to?: number
    gold?: number
    silver?: number
    bronze?: number
    total_starts?: number
    best_score?: number
    avg_judge_score?: number
    best_judge_score?: number
    rating_score?: number
    judge_eval_count?: number
    best_speed?: number
    avg_speed?: number
    aggression_count?: number
    sex?: string | null
  }
  type: 'placement' | 'score' | 'speed' | 'combined'
  filterYear: string
  /**
   * Place in the visible list (re-ranked after breed/search filters).
   */
  rank?: number
  /**
   * `card` — standalone bordered tile (default).
   * `embedded` — flat row inside DoninoColumnShell (no nested card chrome).
   */
  variant?: DogCardVariant
}

export interface DogCardContextValue {
  dog: DogCardProps['dog']
  type: DogCardProps['type']
  filterYear: string
  rank?: number
  variant: DogCardVariant
}

export const DogCardContext = createContext<DogCardContextValue | null>(null)

export function useDogCardContext() {
  const context = useContext(DogCardContext)
  if (!context) {
    throw new Error('DogCard compound components must be used within DogCard')
  }
  return context
}
