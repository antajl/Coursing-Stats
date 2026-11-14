import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { Navigate, useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom'
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

export type ShowsProps = {
  defaultTab?: string
}

function Shows({ defaultTab }: ShowsProps) {
  const { tab: routeTab, id: routeId, year: routeYear } = useParams<{ tab?: string; id?: string; year?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const calendarVisible = usePublicCalendarVisible('shows')

  const pathTab = routeTab || (routeId === 'archive' || routeId === 'ranking' || routeId === 'judges' ? routeId : undefined)
  const rawTabParam = pathTab || defaultTab || searchParams.get('tab')
  const rawTab = rawTabParam || 'ranking'
  const currentHash = typeof window !== 'undefined' ? window.location.hash : ''
  const hashKey = currentHash.replace(/^#/, '')

  let redirectPath: string | null = null
  const isBaseRoute = location.pathname === '/shows' || location.pathname === '/shows/'

  if (isBaseRoute) {
    let targetTab = rawTabParam || getLastSectionTab('shows')
    if (hashKey === 'calendar' || hashKey === 'archive') {
      targetTab = 'archive'
    } else if (hashKey === 'ranking' || hashKey === 'champions') {
      targetTab = 'ranking'
    } else if (hashKey === 'judges') {
      targetTab = 'judges'
    } else if (targetTab === 'calendar' || targetTab === 'champions') {
      targetTab = targetTab === 'calendar' ? 'archive' : 'ranking'
    }

    if (!calendarVisible && targetTab === 'archive') {
      targetTab = 'ranking'
    }

    const queryYear = searchParams.get('year')
    const targetYear = queryYear || '2026'
    const next = new URLSearchParams(searchParams)
    next.delete('tab')
    next.delete('year')
    const qs = next.toString()
    const queryPart = qs ? `?${qs}` : ''
    redirectPath = `/shows/${targetTab}/${targetYear}/${queryPart}${currentHash}`
  } else if (rawTab === 'champions') {
    redirectPath = `/shows/ranking/2026/${currentHash}`
  } else if (rawTab === 'calendar') {
    redirectPath = `/shows/archive/2026/${currentHash}`
  } else if (!calendarVisible && rawTab === 'archive') {
    redirectPath = `/shows/ranking/2026/${currentHash}`
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
    if (!redirectPath) {
      setLastSectionTab('shows', activeTab)
    }
  }, [activeTab, redirectPath])

  // Clear loading bar shortly after new tab mounts
  useEffect(() => {
    if (isTabLoading) {
      const t = window.setTimeout(() => setIsTabLoading(false), 350)
      return () => window.clearTimeout(t)
    }
  }, [isTabLoading, activeTab])

  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === activeTab) return

    setActiveTab(newTab)
    const isFirstVisit = !visitedTabs.has(newTab)
    if (isFirstVisit) {
      setVisitedTabs((prev) => new Set(prev).add(newTab))
      setIsTabLoading(true)
    }

    const currentYear = routeYear || searchParams.get('year') || '2026'
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('tab')
    nextParams.delete('year')
    const qs = nextParams.toString()
    const queryPart = qs ? `?${qs}` : ''

    if (currentYear && currentYear !== 'all') {
      navigate(`/shows/${newTab}/${currentYear}/${queryPart}`)
    } else if (currentYear === 'all') {
      navigate(`/shows/${newTab}/all/${queryPart}`)
    } else {
      navigate(`/shows/${newTab}/2026/${queryPart}`)
    }
  }, [activeTab, visitedTabs, navigate, searchParams, routeYear])

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  const isVisited = (tabId: string) => visitedTabs.has(tabId) || activeTab === tabId

  const tabs = [
    { id: 'ranking', label: 'Рейтинг' },
    ...(calendarVisible ? [{ id: 'archive', label: 'Архив' }] : []),
    { id: 'judges', label: 'Судьи' },
  ]

  const currentYear = routeYear || searchParams.get('year')
  const displayYear = currentYear && currentYear !== 'all' ? currentYear : '2026'

  const seoTitle =
    activeTab === 'archive'
      ? `Календарь и выставки собак РКФ ${displayYear} года — Отчеты и результаты | Курсинг Статс`
      : activeTab === 'judges'
      ? 'Судьи выставок собак РКФ — Статистика экспертиз | Курсинг Статс'
      : `Рейтинг выставочных собак РКФ ${displayYear} года — Топ чемпионов | Курсинг Статс`

  const seoDescription =
    activeTab === 'archive'
      ? `Все выставки собак РКФ сезона ${displayYear} года: даты, города, клубы-организаторы, судьи и электронные отчеты с rkf.online.`
      : activeTab === 'judges'
      ? 'Статистика судей выставок РКФ: количество отсуженных выставок, строгость судейства, процент отличных оценок.'
      : `Рейтинг собак по выставкам РКФ ${displayYear} года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей.`

  const canonicalPath = routeYear
    ? `/shows/${activeTab}/${routeYear}/`
    : `/shows/${activeTab}/`
  const canonicalUrl = `https://coursing-stats.ru${canonicalPath}`

  return (
    <>
      <h1 className="sr-only">Рейтинг выставочных собак РКФ {displayYear}</h1>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
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
            <div id="ranking" className="scroll-mt-20" />
            <div id="champions" className="scroll-mt-20" />
            <Suspense fallback={<LoadingCard count={6} variant="shows" />}>
              <ShowRanking urlYear={routeYear} />
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
            <div id="archive" className="scroll-mt-20" />
            <div id="calendar" className="scroll-mt-20" />
            <Suspense fallback={<SkeletonLoader count={6} variant="cards" />}>
              <ShowCalendar urlYear={routeYear} />
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
            <div id="judges" className="scroll-mt-20" />
            <Suspense fallback={<SkeletonLoader count={6} variant="cards" />}>
              <ShowJudges urlYear={routeYear} />
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
