import { queryClient } from './query-client'
import { getShowDogRankingPage0, getShowJudgesPage0 } from './staticData'

const CURRENT_SEASON = String(new Date().getFullYear())
const STALE_MS = 5 * 60 * 1000

let intentScheduled = false

/**
 * Prefetch only first-paint page0 indexes (+ route chunks).
 * Do NOT prefetch full ranking/judges here — they steal bandwidth and
 * JSON.parse of 12–25 MB freezes the tab right when the user opens Shows.
 */
export function prefetchShowsHeavyTabs(): void {
  if (intentScheduled) return
  intentScheduled = true

  void import('../pages/Shows/ShowRanking')
  void import('../pages/Shows/ShowJudges')

  void queryClient.prefetchQuery({
    queryKey: ['showDogRankingPage0', CURRENT_SEASON],
    queryFn: () => getShowDogRankingPage0(CURRENT_SEASON),
    staleTime: STALE_MS,
  })
  void queryClient.prefetchQuery({
    queryKey: ['showJudgesPage0'],
    queryFn: getShowJudgesPage0,
    staleTime: STALE_MS,
  })
}
