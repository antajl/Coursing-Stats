import type { Rabbit } from 'lucide-react'

export type DisciplineTabId = 'coursing' | 'racing' | 'shows' | 'donino'

export interface DisciplineTabItem {
  id: DisciplineTabId
  label: string
  icon: typeof Rabbit
  count: number
  theme: 'forest' | 'warm-blue' | 'camel'
}
