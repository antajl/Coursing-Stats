import { lazy, Suspense, useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import LoadingCard from '../components/LoadingCard'

const TopDogs = lazy(() => import('./TopDogs'))
const Judges = lazy(() => import('./Judges'))
const Events = lazy(() => import('./Events'))

function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'
  const calendarVisible = usePublicCalendarVisible('competitions')

  if (tab === 'calendar') {
    return <Navigate to="/competitions?tab=archive" replace />
  }

  if (!calendarVisible && tab === 'archive') {
    return <Navigate to="/competitions?tab=ranking" replace />
  }

  const activeTab =
    tab === 'judges' || tab === 'ranking' || (calendarVisible && tab === 'archive')
      ? tab
      : 'ranking'

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

  return (
    <div className="space-y-6">
      <SEO
        title="Рейтинг собак: курсинг и бега борзых"
        description="Два отдельных рейтинга — по медалям и по очкам CS (курсинг, БЗМП, бега борзых) — плюс архив соревнований и статистика судей. Данные с 2015 года."
        canonicalUrl="https://coursing-stats.ru/competitions"
        keywords="рейтинг курсинг, бега борзых, топ собак, медали, архив соревнований, судьи курсинг, РКФ"
      />
      <div className="relative rounded-2xl border border-cream-300 bg-cream-50/90 shadow-xl backdrop-blur-lg">
        <div className="min-h-[400px] px-4 py-3 md:px-6 md:py-4">
          <div className="mb-4 flex items-center justify-between border-b border-old-money-200/60 pb-3">
            <div className="flex w-full items-center gap-1.5 rounded-xl border border-old-money-200/60 bg-cream-100 p-1 sm:w-auto">
              {tabs.map((t) => {
                const active = activeTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTabChange(t.id)}
                    className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg py-1.5 px-3.5 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-camel-500 text-charcoal-900 shadow-sm'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-50/50'
                    }`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
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
          {calendarVisible && activeTab === 'archive' && (
            <div
              key="archive"
              id="tab-panel-archive"
              role="tabpanel"
              aria-labelledby="tab-archive"
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
