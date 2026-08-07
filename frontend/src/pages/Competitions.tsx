import { lazy, Suspense, useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import ProcoursingAttribution from '../components/ProcoursingAttribution'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import LoadingCard from '../components/LoadingCard'

const TopDogs = lazy(() => import('./TopDogs'))
const Judges = lazy(() => import('./Judges'))
const Events = lazy(() => import('./Events'))

function Competitions() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'
  const calendarVisible = usePublicCalendarVisible('competitions')

  if (!calendarVisible && tab === 'calendar') {
    return <Navigate to="/competitions?tab=ranking" replace />
  }

  const activeTab =
    tab === 'judges' || tab === 'ranking' || (calendarVisible && tab === 'calendar')
      ? tab
      : 'ranking'

  return (
    <div className="space-y-6">
      <SEO
        title="Рейтинг собак: курсинг и бега борзых"
        description="Рейтинг собак по медалям и очкам (курсинг, БЗМП, бега борзых), медальный зачёт и статистика судей. Данные с 2015 года."
        canonicalUrl="https://coursing-stats.ru/competitions"
        keywords="рейтинг курсинг, бега борзых, топ собак, медали, судьи курсинг, РКФ"
      />
      <div className="relative rounded-2xl border border-cream-300 bg-cream-50/90 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-900/90">
        <ProcoursingAttribution variant="footnote" className="absolute right-0 top-0 z-10" />
        <div className="min-h-[400px] px-4 py-3 md:px-6 md:py-4">
          {activeTab === 'ranking' && (
            <div
              key="ranking"
              id="tab-panel-ranking"
              role="tabpanel"
              aria-labelledby="tab-ranking"
              className="cs-tab-panel-enter"
            >
              <Suspense fallback={<LoadingCard count={3} variant="list" />}>
                <TopDogs />
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
              <Suspense fallback={<LoadingCard count={3} variant="list" />}>
                <Judges />
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
              <Suspense fallback={<LoadingCard count={3} variant="list" />}>
                <Events />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Competitions
