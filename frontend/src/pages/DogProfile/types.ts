import type { LucideIcon } from 'lucide-react'

export type DogProfileMainTabId = 'profile' | 'achievements' | 'judges' | 'organizations'

export type DisciplineTabId =
  | 'coursing'
  | 'racing'
  | 'shows'
  | 'judges'
  | 'organizations'

export interface DogProfileMainTabItem {
  id: DogProfileMainTabId
  label: string
}

export interface DisciplineTabItem {
  id: DisciplineTabId
  label: string
  icon?: LucideIcon
  count?: number
  theme?: 'forest' | 'warm-blue' | 'camel'
}
