import { lazy, Suspense, useState, useEffect, useCallback } from 'react'
import { Navigate, useSearchParams, useNavigate, useParams, useLocation } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { JsonLd, breadcrumbListSchema, faqPageSchema } from '../components/JsonLd'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import { isLocalDev } from '../lib/env'
import LoadingCard from '../components/LoadingCard'
import { MobileSubNavTabs } from '../components/ui/MobileSubNavTabs'
import { getLastSectionTab, setLastSectionTab } from '../lib/navState'

const TopDogs = lazy(() => import('./TopDogs'))
const Judges = lazy(() => import('./Judges'))
const Events = lazy(() => import('./Events'))

export type CompetitionsProps = {
  defaultTab?: string
}

function Competitions({ defaultTab }: CompetitionsProps) {
  const { tab: routeTab, id: routeId, year: routeYear } = useParams<{ tab?: string; id?: string; year?: string }>()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const calendarVisible = usePublicCalendarVisible('competitions')

  const pathTab = routeTab || (routeId === 'archive' || routeId === 'ranking' || routeId === 'judges' ? routeId : undefined)
  const rawTabParam = pathTab || defaultTab || searchParams.get('tab')

  let redirectPath: string | null = null
  const currentHash = typeof window !== 'undefined' ? window.location.hash : ''
  const hashKey = currentHash.replace(/^#/, '')

  const isBaseRoute = location.pathname === '/competitions' || location.pathname === '/competitions/'

  if (isBaseRoute) {
    let targetTab = rawTabParam || getLastSectionTab('competitions')
    if (hashKey === 'calendar' || hashKey === 'archive') {
      targetTab = 'archive'
    } else if (hashKey === 'ranking' || hashKey === 'leaders') {
      targetTab = 'ranking'
    } else if (hashKey === 'judges') {
      targetTab = 'judges'
    } else if (targetTab === 'calendar') {
      targetTab = 'archive'
    }

    if (targetTab === 'builder' || targetTab === 'protocol-builder') {
      redirectPath = isLocalDev ? '/protocol-builder/' : `/competitions/ranking/2026/${currentHash}`
    } else if (!calendarVisible && targetTab === 'archive') {
      targetTab = 'ranking'
    }

    if (!redirectPath) {
      const queryYear = searchParams.get('year')
      const targetYear = queryYear || '2026'
      const next = new URLSearchParams(searchParams)
      next.delete('tab')
      next.delete('year')
      const qs = next.toString()
      const queryPart = qs ? `?${qs}` : ''
      redirectPath = `/competitions/${targetTab}/${targetYear}/${queryPart}${currentHash}`
    }
  } else if (rawTabParam === 'calendar') {
    redirectPath = `/competitions/archive/2026/${currentHash}`
  } else if (rawTabParam === 'builder' || rawTabParam === 'protocol-builder') {
    redirectPath = isLocalDev ? '/protocol-builder/' : `/competitions/ranking/2026/${currentHash}`
  } else if (!calendarVisible && rawTabParam === 'archive') {
    redirectPath = `/competitions/ranking/2026/${currentHash}`
  }

  const resolvedTab =
    rawTabParam === 'judges' || rawTabParam === 'ranking' || (calendarVisible && rawTabParam === 'archive')
      ? rawTabParam
      : 'ranking'

  const [activeTab, setActiveTab] = useState<string>(resolvedTab)
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(() => new Set([resolvedTab]))
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false)

  useEffect(() => {
    setActiveTab(resolvedTab)
    setVisitedTabs((prev) => (prev.has(resolvedTab) ? prev : new Set(prev).add(resolvedTab)))
  }, [resolvedTab])

  useEffect(() => {
    if (!redirectPath) {
      setLastSectionTab('competitions', activeTab)
    }
  }, [activeTab, redirectPath])

  // Warm other tabs in background after initial paint
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const idle =
        typeof window !== 'undefined' && 'requestIdleCallback' in window
          ? window.requestIdleCallback.bind(window)
          : (cb: () => void) => window.setTimeout(cb, 200)
      idle(() => {
        void import('./TopDogs')
        void import('./Events')
        void import('./Judges')
      })
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isTabLoading) {
      const t = window.setTimeout(() => setIsTabLoading(false), 350)
      return () => window.clearTimeout(t)
    }
  }, [isTabLoading, activeTab])

  const prefetchCompTab = (tabId: string) => {
    if (tabId === 'ranking') void import('./TopDogs')
    else if (tabId === 'archive') void import('./Events')
    else if (tabId === 'judges') void import('./Judges')
  }

  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === 'builder') {
      if (isLocalDev) {
        navigate('/protocol-builder/')
      }
      return
    }
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
      navigate(`/competitions/${newTab}/${currentYear}/${queryPart}`)
    } else if (currentYear === 'all') {
      navigate(`/competitions/${newTab}/all/${queryPart}`)
    } else {
      navigate(`/competitions/${newTab}/2026/${queryPart}`)
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
    ...(isLocalDev ? [{ id: 'builder', label: 'Конструктор' }] : []),
  ]

  const competitionFaqs = [
    {
      question: 'Существует ли единый всероссийский рейтинг собак по курсингу?',
      answer:
        'Официального единого рейтинга по курсингу и бегам борзых РКФ не ведёт (федерация фиксирует только присуждение титулов и сертификатов). На независимом портале Coursing Stats на основе открытых протоколов соревнований и отчётов РКФ с 2015 года формируются сводный рейтинг сезона и турнирная таблица. В рейтинге учитываются результаты забегов, медали (золото, серебро, бронза), очки стабильности CS и замеры максимальной скорости по всем породам борзых (уиппеты, РПБ, салюки, басенджи и др.).',
    },
    {
      question: 'Как рассчитывается рейтинг собак в курсинге?',
      answer:
        'В едином рейтинге курсинга порядок определяет зачёт сезона: 1) Медали и эффективность (золото весомее серебра и бронзы; при равных медалях выше тот, кто собрал их за меньшее число забегов). 2) Индекс стабильности CS служит тай-брейком при равном медальном зачёте. В бегах борзых (рейсинге) порядок определяется по максимальной зафиксированной скорости в км/ч.',
    },
    {
      question: 'Какие породы борзых участвуют в рейтинге курсинга?',
      answer:
        'В рейтинге соревнуются основные породы борзых: уиппеты, русские псовые борзые (РПБ), салюки, басенджи, малая итальянская борзая (левретка), афганские борзые, грейхаунды, фараоновы собаки и другие породы 10-й и 5-й групп FCI.',
    },
    {
      question: 'Где посмотреть рекорды скорости и результаты салюки и других борзых в бегах?',
      answer:
        'В единой турнирной таблице Coursing Stats по каждой породе борзых (салюки, уиппеты, РПБ и др.) доступны результаты соревнований РКФ, медальный зачёт, скорость и очки стабильности CS. Для радарных полевых замеров полигона Донино на сайте предусмотрен специальный раздел «Донино».',
    },
  ]

  const currentYear = routeYear || searchParams.get('year')
  const displayYear = currentYear && currentYear !== 'all' ? currentYear : '2026'

  const seoTitle =
    activeTab === 'archive'
      ? `Соревнования и результаты по курсингу ${displayYear} года — Календарь и протоколы РКФ`
      : activeTab === 'judges'
      ? 'Судьи соревнований по курсингу и бегам борзых — РКФ | Курсинг Статс'
      : `Рейтинг собак по курсингу и бегам ${displayYear} — Календарь соревнований и результаты РКФ`

  const seoDescription =
    activeTab === 'archive'
      ? `Все соревнования по курсингу и бегам борзых ${displayYear} года: расписание, электронные протоколы забегов, оценки по 5 критериям и судьи РКФ на платформе Coursing Stats.`
      : activeTab === 'judges'
      ? 'Реестр и статистика работы спортивных судей РКФ по курсингу и бегам: судейские бригады, обслуженные старты и оценки.'
      : `Сводный рейтинг собак по курсингу и бегам борзых ${displayYear} года: результаты забегов, медальный зачёт, очки CS, календарь состязаний и рекорды пород на платформе Coursing Stats.`

  const canonicalPath = routeYear
    ? `/competitions/${activeTab}/${routeYear}/`
    : `/competitions/${activeTab}/`
  const canonicalUrl = `https://coursing-stats.ru${canonicalPath}`

  return (
    <>
      <h1 className="sr-only">Расписание соревнований, результаты и рейтинг собак в курсинге</h1>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        keywords="курсинг борзых расписание 2026, соревнования по курсингу расписание, календарь курсинг 2026, чемпионат ркф по курсингу результаты, рейтинг собак в курсинге, рекорд скорости салюки, рекорды скорости борзых, рейтинг салюки, рейтинг уиппетов, рейтинг РПБ, бега борзых, рейтинг собак по курсингу, рейтинг курсинг, единый рейтинг собак, турнирная таблица курсинг, лидеры сезона, медали, архив соревнований, РКФ"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Соревнования', url: '/competitions/' },
              ...(activeTab !== 'ranking' ? [{ name: activeTab === 'archive' ? 'Архив' : 'Судьи', url: canonicalPath }] : []),
              ...(routeYear ? [{ name: `Сезон ${routeYear}`, url: canonicalPath }] : []),
            ]),
            faqPageSchema(competitionFaqs),
          ],
        }}
      />
      <MobileSubNavTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        onHoverTab={prefetchCompTab}
        isLoading={isTabLoading}
        ariaLabel="Разделы соревнований"
      />

      <div className="min-h-[400px]">
        {isVisited('ranking') && (
          <div
            id="tab-panel-ranking"
            role="tabpanel"
            aria-labelledby="tab-ranking"
            className={activeTab === 'ranking' ? 'block cs-tab-panel-enter' : 'hidden'}
            aria-hidden={activeTab !== 'ranking'}
          >
            <div id="ranking" className="scroll-mt-20" />
            <Suspense fallback={<LoadingCard count={3} variant="list" />}>
              <TopDogs urlYear={routeYear} />
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
            <Suspense fallback={<LoadingCard count={3} variant="list" />}>
              <Events urlYear={routeYear} />
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
            <Suspense fallback={<LoadingCard count={3} variant="list" />}>
              <Judges urlYear={routeYear} />
            </Suspense>
          </div>
        )}
      </div>

      <footer className="mt-8 rounded-xl border border-old-money-100 bg-cream-50/30 p-3 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs leading-relaxed text-charcoal-500">
          <strong>Примечание:</strong> спортивная статистика и результаты состязаний систематизированы на основе открытых протоколов
          организаторов, полевых секретариатов и материалов ProCoursing.ru. Сведения могут содержать ошибки или быть неполными
          из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами.
        </p>
      </footer>
    </>
  )
}

export default Competitions


