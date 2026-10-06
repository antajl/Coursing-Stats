import { lazy, Suspense, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import RKFAttribution from '../components/RKFAttribution'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import LoadingCard from '../components/LoadingCard'
import { prefetchShowsHeavyTabs } from '../lib/prefetchShows'
import { MobileSubNavTabs } from '../components/ui/MobileSubNavTabs'

const ShowRanking = lazy(() => import('./Shows/ShowRanking'))
const ShowJudges = lazy(() => import('./Shows/ShowJudges'))
const ShowCalendar = lazy(() => import('./Shows/ShowCalendar'))

function Shows() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'
  const calendarVisible = usePublicCalendarVisible('shows')

  if (tab === 'champions' || (!calendarVisible && tab === 'calendar')) {
    return <Navigate to="/shows?tab=ranking" replace />
  }

  const activeTab =
    tab === 'judges' || tab === 'ranking' || (calendarVisible && tab === 'calendar')
      ? tab
      : 'ranking'

  const handleTabChange = (newTab: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', newTab)
    setSearchParams(next)
  }

  const tabs = [
    { id: 'ranking', label: 'Рейтинг' },
    ...(calendarVisible ? [{ id: 'calendar', label: 'Календарь' }] : []),
    { id: 'judges', label: 'Судьи' },
  ]

  // Warm the other heavy tab while the user is already on /shows.
  useEffect(() => {
    const idle =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback.bind(window)
        : (cb: () => void) => window.setTimeout(cb, 400)
    const id = idle(() => prefetchShowsHeavyTabs())
    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof id === 'number') {
        window.cancelIdleCallback(id)
      } else {
        window.clearTimeout(id as number)
      }
    }
  }, [])

  const fallback = <LoadingCard count={6} variant="shows" />

  return (
    <>
      <SEO
        title="Рейтинг выставочных собак РКФ"
        description="Рейтинг собак по выставкам РКФ: награды дня (CAC, BOB, ЧРКФ и др.), профили и статистика судей. Ссылки на оригиналы rkf.online."
        canonicalUrl="https://coursing-stats.ru/shows"
        keywords="рейтинг выставок, выставки собак, РКФ, CAC, BOB, ЧРКФ, судьи выставок"
      />
      <MobileSubNavTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
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
        {calendarVisible && activeTab === 'calendar' && (
          <div
            key="calendar"
            id="tab-panel-calendar"
            role="tabpanel"
            aria-labelledby="tab-calendar"
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
