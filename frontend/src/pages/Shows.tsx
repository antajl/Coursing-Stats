import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import RKFAttribution from '../components/RKFAttribution'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import LoadingCard from '../components/LoadingCard'
import SkeletonLoader from '../components/SkeletonLoader'
import { prefetchShowsHeavyTabs, prefetchShowsTab } from '../lib/prefetchShows'
import { MobileSubNavTabs } from '../components/ui/MobileSubNavTabs'
import { getLastSectionTab, setLastSectionTab } from '../lib/navState'

const ShowRanking = lazy(() => import('./Shows/ShowRanking'))
const ShowJudges = lazy(() => import('./Shows/ShowJudges'))
const ShowCalendar = lazy(() => import('./Shows/ShowCalendar'))

function Shows() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTabParam = searchParams.get('tab')
  const rawTab = rawTabParam || 'ranking'
  const calendarVisible = usePublicCalendarVisible('shows')

  let redirectTab: string | null = null
  if (!rawTabParam) {
    redirectTab = getLastSectionTab('shows')
  } else if (rawTab === 'champions') {
    redirectTab = 'ranking'
  } else if (rawTab === 'calendar') {
    redirectTab = 'archive'
  } else if (!calendarVisible && rawTab === 'archive') {
    redirectTab = 'ranking'
  }

  const resolvedTab =
    rawTab === 'judges' || rawTab === 'ranking' || (calendarVisible && rawTab === 'archive')
      ? rawTab
      : 'ranking'

  // Local activeTab state guarantees 0ms synchronized rendering between the tab pill and panels
  const [activeTab, setActiveTab] = useState<string>(resolvedTab)
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set([resolvedTab]))
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false)

  // Sync with URL when external navigation (browser Back / Forward) happens
  useEffect(() => {
    setActiveTab(resolvedTab)
    setVisitedTabs((prev) => (prev.has(resolvedTab) ? prev : new Set(prev).add(resolvedTab)))
  }, [resolvedTab])

  // Warm other tabs in background after initial paint
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const idle =
        typeof window !== 'undefined' && 'requestIdleCallback' in window
          ? window.requestIdleCallback.bind(window)
          : (cb: () => void) => window.setTimeout(cb, 200)
      idle(() => prefetchShowsHeavyTabs())
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!redirectTab) {
      setLastSectionTab('shows', activeTab)
    }
  }, [activeTab, redirectTab])

  // Clear loading bar shortly after new tab mounts
  useEffect(() => {
    if (isTabLoading) {
      const t = window.setTimeout(() => setIsTabLoading(false), 350)
      return () => window.clearTimeout(t)
    }
  }, [isTabLoading, activeTab])

  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === activeTab) return

    // Immediately update both the tab button and the content panel in one render frame
    setActiveTab(newTab)
    const isFirstVisit = !visitedTabs.has(newTab)
    if (isFirstVisit) {
      setVisitedTabs((prev) => new Set(prev).add(newTab))
      setIsTabLoading(true)
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('tab', newTab)
        return next
      },
      { replace: false }
    )
  }, [activeTab, visitedTabs, setSearchParams])

  if (redirectTab) {
    return <Navigate to={`/shows?tab=${redirectTab}`} replace />
  }

  const isVisited = (tabId: string) => visitedTabs.has(tabId) || activeTab === tabId

  const tabs = [
    { id: 'ranking', label: 'Рейтинг' },
    ...(calendarVisible ? [{ id: 'archive', label: 'Архив' }] : []),
    { id: 'judges', label: 'Судьи' },
  ]

  return (
    <>
      <h1 className="sr-only">Рейтинг выставочных собак РКФ 2026</h1>
      <SEO
        title="Рейтинг выставочных собак РКФ"
        description="Рейтинг собак по выставкам РКФ: награды дня (CAC, BOB, ЧРКФ и др.), профили и статистика судей. Ссылки на оригиналы rkf.online."
        canonicalUrl="https://coursing-stats.ru/shows/"
        keywords="рейтинг выставок, выставки собак, РКФ, CAC, BOB, ЧРКФ, судьи выставок"
      />
      <MobileSubNavTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        onHoverTab={(tabId) => prefetchShowsTab(tabId)}
        isLoading={isTabLoading}
        ariaLabel="Разделы выставок"
      />

      <div className="min-h-[480px]">
        {isVisited('ranking') && (
          <div
            id="tab-panel-ranking"
            role="tabpanel"
            aria-labelledby="tab-ranking"
            className={activeTab === 'ranking' ? 'block cs-tab-panel-enter' : 'hidden'}
            aria-hidden={activeTab !== 'ranking'}
          >
            <Suspense fallback={<LoadingCard count={6} variant="shows" />}>
              <ShowRanking />
            </Suspense>
          </div>
        )}
        {calendarVisible && isVisited('archive') && (
          <div
            id="tab-panel-archive"
            role="tabpanel"
            aria-labelledby="tab-archive"
            className={activeTab === 'archive' ? 'block cs-tab-panel-enter' : 'hidden'}
            aria-hidden={activeTab !== 'archive'}
          >
            <Suspense fallback={<SkeletonLoader count={6} variant="cards" />}>
              <ShowCalendar />
            </Suspense>
          </div>
        )}
        {isVisited('judges') && (
          <div
            id="tab-panel-judges"
            role="tabpanel"
            aria-labelledby="tab-judges"
            className={activeTab === 'judges' ? 'block cs-tab-panel-enter' : 'hidden'}
            aria-hidden={activeTab !== 'judges'}
          >
            <Suspense fallback={<SkeletonLoader count={6} variant="cards" />}>
              <ShowJudges />
            </Suspense>
          </div>
        )}
      </div>

      <div className="pt-2 text-center">
        <RKFAttribution variant="inline" />
      </div>
    </>
  )
}

export default Shows
