import { lazy, Suspense, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import RKFAttribution from '../components/RKFAttribution'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import LoadingCard from '../components/LoadingCard'
import { prefetchShowsHeavyTabs } from '../lib/prefetchShows'
import { MobileSubNavTabs } from '../components/ui/MobileSubNavTabs'
import { getLastSectionTab, setLastSectionTab } from '../lib/navState'

const ShowRanking = lazy(() => import('./Shows/ShowRanking'))
const ShowJudges = lazy(() => import('./Shows/ShowJudges'))
const ShowCalendar = lazy(() => import('./Shows/ShowCalendar'))

function Shows() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') || 'ranking'
  const calendarVisible = usePublicCalendarVisible('shows')

  // IMPORTANT: Keep this hook before any early returns to respect Rules of Hooks!
  // Warm the other heavy tab only after the active tab has finished its initial load
  // (2.5s deferred idle timer so background work never competes with the first paint).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const idle =
        typeof window !== 'undefined' && 'requestIdleCallback' in window
          ? window.requestIdleCallback.bind(window)
          : (cb: () => void) => window.setTimeout(cb, 200)
      idle(() => prefetchShowsHeavyTabs())
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [])

  const rawTabParam = searchParams.get('tab')
  if (!rawTabParam) {
    const savedTab = getLastSectionTab('shows')
    const next = new URLSearchParams(searchParams)
    next.set('tab', savedTab)
    return <Navigate to={`/shows?${next.toString()}`} replace />
  }

  if (rawTab === 'champions') {
    return <Navigate to="/shows?tab=ranking" replace />
  }

  // Redirect legacy ?tab=calendar to ?tab=archive
  if (rawTab === 'calendar') {
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'archive')
    return <Navigate to={`/shows?${next.toString()}`} replace />
  }

  if (!calendarVisible && rawTab === 'archive') {
    return <Navigate to="/shows?tab=ranking" replace />
  }

  const activeTab =
    rawTab === 'judges' || rawTab === 'ranking' || (calendarVisible && rawTab === 'archive')
      ? rawTab
      : 'ranking'

  useEffect(() => {
    setLastSectionTab('shows', activeTab)
  }, [activeTab])

  const handleTabChange = (newTab: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', newTab)
    setSearchParams(next)
  }

  const tabs = [
    { id: 'ranking', label: 'Рейтинг' },
    ...(calendarVisible ? [{ id: 'archive', label: 'Архив' }] : []),
    { id: 'judges', label: 'Судьи' },
  ]

  const fallback = <LoadingCard count={6} variant="shows" />

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
        onHoverTab={() => prefetchShowsHeavyTabs()}
        ariaLabel="Разделы выставок"
      />

      <div className="min-h-[480px]">
        {activeTab === 'ranking' && (
          <div
            key="ranking"
            id="tab-panel-ranking"
            role="tabpanel"
            aria-labelledby="tab-ranking"
            className="cs-tab-panel-enter"
          >
            <Suspense fallback={fallback}>
              <ShowRanking />
            </Suspense>
          </div>
        )}
        {calendarVisible && activeTab === 'archive' && (
          <div
            key="archive"
            id="tab-panel-archive"
            role="tabpanel"
            aria-labelledby="tab-archive"
            className="cs-tab-panel-enter"
          >
            <Suspense fallback={fallback}>
              <ShowCalendar />
            </Suspense>
          </div>
        )}
        {activeTab === 'judges' && (
          <div
            key="judges"
            id="tab-panel-judges"
            role="tabpanel"
            aria-labelledby="tab-judges"
            className="cs-tab-panel-enter"
          >
            <Suspense fallback={fallback}>
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
