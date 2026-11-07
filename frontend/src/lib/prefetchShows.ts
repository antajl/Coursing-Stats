import { queryClient } from './query-client'
import { getShowDogRankingPage0, getShowJudgesPage0, getShowCalendar } from './staticData'

const CURRENT_SEASON = String(new Date().getFullYear())
const STALE_MS = 10 * 60 * 1000

const prefetchedTabs = new Set<string>()

/**
 * Targeted predictive prefetch for a specific tab.
 * Preloads both the JS component chunk and the initial page0/calendar JSON
 * on hover / touchstart before the user clicks.
 */
export function prefetchShowsTab(tab: string): void {
  if (prefetchedTabs.has(tab)) return
  prefetchedTabs.add(tab)

  if (tab === 'ranking') {
    void import('../pages/Shows/ShowRanking')
    void queryClient.prefetchQuery({
      queryKey: ['showDogRankingPage0', CURRENT_SEASON],
      queryFn: () => getShowDogRankingPage0(CURRENT_SEASON),
      staleTime: STALE_MS,
    })
  } else if (tab === 'archive') {
    void import('../pages/Shows/ShowCalendar')
    void queryClient.prefetchQuery({
      queryKey: ['showCalendar', CURRENT_SEASON],
      queryFn: () => getShowCalendar(CURRENT_SEASON),
      staleTime: STALE_MS,
    })
  } else if (tab === 'judges') {
    void import('../pages/Shows/ShowJudges')
    void queryClient.prefetchQuery({
      queryKey: ['showJudgesPage0'],
      queryFn: getShowJudgesPage0,
      staleTime: STALE_MS,
    })
  }
}

let allHeavyScheduled = false

/**
 * Idle warmup: prefetch initial chunks and page0 datasets
 * after first paint when browser is idle.
 */
export function prefetchShowsHeavyTabs(): void {
  if (allHeavyScheduled) return
  allHeavyScheduled = true

  prefetchShowsTab('ranking')
  prefetchShowsTab('archive')
  prefetchShowsTab('judges')
}
