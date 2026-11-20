import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Rabbit, Gauge, Sparkles } from 'lucide-react'
import type {
  DisciplineTabId,
  DisciplineTabItem,
  DogProfileMainTabId,
  DogProfileMainTabItem,
} from './types'
import type { DogJudgesStats } from './DogJudgesSection'
import type { ShowDogCardData } from '../Shows/ShowDogCard'

export interface UseDogProfileTabsProps {
  hasCoursingStarts: boolean
  judgeStats: DogJudgesStats | null
  hasValidCompetitionStarts: boolean
  showCoursingColumn: boolean
  coursingTotalStarts?: number
  coursingEventsCount: number
  showRacingColumn: boolean
  racingTotalStarts?: number
  racingEventsCount: number
  hasShowData: boolean
  showDog: ShowDogCardData | null
}

export function useDogProfileTabs({
  hasCoursingStarts,
  judgeStats,
  hasValidCompetitionStarts,
  showCoursingColumn,
  coursingTotalStarts,
  coursingEventsCount,
  showRacingColumn,
  racingTotalStarts,
  racingEventsCount,
  hasShowData,
  showDog,
}: UseDogProfileTabsProps) {
  const location = useLocation()

  const mainTabs = useMemo(() => {
    const tabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
      { id: 'achievements', label: 'Достижения' },
    ]
    // Вкладка «Судьи» отображается ТОЛЬКО если собака участвовала в курсинге
    if (hasCoursingStarts && judgeStats && Array.isArray(judgeStats.judges) && judgeStats.judges.length > 0) {
      tabs.push({ id: 'judges', label: 'Судьи' })
    }
    // Вкладка «Организации» отображается ТОЛЬКО если у собаки есть старты в состязаниях
    if (hasValidCompetitionStarts) {
      tabs.push({ id: 'organizations', label: 'Организации' })
    }
    return tabs
  }, [hasCoursingStarts, judgeStats, hasValidCompetitionStarts])

  const [activeMainTab, setActiveMainTab] = useState<DogProfileMainTabId>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
    if (hash === 'achievements' || hash === 'awards' || hash === 'titles') return 'achievements'
    if (hash === 'judges') return 'judges'
    if (hash === 'organizations' || hash === 'orgs') return 'organizations'
    return 'profile'
  })

  // Sync main tab when URL hash changes
  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) return
    if (hash === 'achievements' || hash === 'awards' || hash === 'titles') {
      setActiveMainTab('achievements')
    } else if (hash === 'judges' && hasCoursingStarts && judgeStats?.judges?.length) {
      setActiveMainTab('judges')
    } else if ((hash === 'organizations' || hash === 'orgs') && hasValidCompetitionStarts) {
      setActiveMainTab('organizations')
    } else if (hash === 'profile' || hash === 'coursing' || hash === 'racing' || hash === 'shows' || hash === 'donino' || hash === 'speeds') {
      setActiveMainTab('profile')
    }
  }, [location.hash, hasCoursingStarts, judgeStats, hasValidCompetitionStarts])

  // Fallback to profile if current tab is not available for this dog
  useEffect(() => {
    if (mainTabs.length > 0 && !mainTabs.some((t) => t.id === activeMainTab)) {
      setActiveMainTab('profile')
    }
  }, [mainTabs, activeMainTab])

  // Disciplines available on mobile inside the "Профиль" tab
  const availableTabs = useMemo(() => {
    const tabs: DisciplineTabItem[] = []

    if (showCoursingColumn) {
      tabs.push({
        id: 'coursing',
        label: 'Курсинг',
        icon: Rabbit,
        count: coursingTotalStarts || coursingEventsCount || 0,
        theme: 'forest',
      })
    }
    if (showRacingColumn) {
      tabs.push({
        id: 'racing',
        label: 'Бега',
        icon: Gauge,
        count: racingTotalStarts || racingEventsCount || 0,
        theme: 'warm-blue',
      })
    }
    if (hasShowData) {
      tabs.push({
        id: 'shows',
        label: 'Выставки',
        icon: Sparkles,
        count: showDog?.total_shows || showDog?.history?.length || 0,
        theme: 'camel',
      })
    }
    return tabs
  }, [
    showCoursingColumn,
    coursingTotalStarts,
    coursingEventsCount,
    showRacingColumn,
    racingTotalStarts,
    racingEventsCount,
    hasShowData,
    showDog?.total_shows,
    showDog?.history?.length,
  ])

  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineTabId>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
    if (hash === 'shows') return 'shows'
    if (hash === 'racing') return 'racing'
    if (hash === 'coursing' || hash === 'competitions') return 'coursing'
    if (showCoursingColumn) return 'coursing'
    if (showRacingColumn) return 'racing'
    if (hasShowData) return 'shows'
    return 'coursing'
  })

  // Sync mobile discipline tab when URL hash changes
  useEffect(() => {
    const hash = location.hash.replace(/^#/, '')
    if (!hash) return
    let targetTab: DisciplineTabId | null = null
    if (hash === 'shows') targetTab = 'shows'
    else if (hash === 'racing') targetTab = 'racing'
    else if (hash === 'coursing' || hash === 'competitions') targetTab = 'coursing'

    if (targetTab && availableTabs.some((t) => t.id === targetTab)) {
      setActiveDiscipline(targetTab)
    }
  }, [location.hash, availableTabs])

  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.some((t) => t.id === activeDiscipline)) {
      setActiveDiscipline(availableTabs[0].id)
    }
  }, [availableTabs, activeDiscipline])

  return {
    mainTabs,
    activeMainTab,
    setActiveMainTab,
    availableTabs,
    activeDiscipline,
    setActiveDiscipline,
  }
}
