import { useState, useCallback } from 'react'
import type { HomeRankingTab } from '../../../components/HomeRankingTabs'

export function useRankingTab(initial: HomeRankingTab = 'placement') {
  const [tab, setTabState] = useState<HomeRankingTab>(initial)
  
  const setTab = useCallback((newTab: HomeRankingTab) => {
    setTabState(newTab) // Мгновенное обновление без ожидания анимации
  }, [])
  
  return { tab, setTab }
}
