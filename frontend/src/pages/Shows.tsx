import { Navigate, useSearchParams } from 'react-router-dom'
import RKFAttribution from '../components/RKFAttribution'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import ShowRanking from './Shows/ShowRanking'
import ShowJudges from './Shows/ShowJudges'
import ShowCalendar from './Shows/ShowCalendar'

function Shows() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'
  const calendarVisible = usePublicCalendarVisible('shows')

  if (tab === 'champions' || (!calendarVisible && tab === 'calendar')) {
    return <Navigate to="/shows?tab=ranking" replace />
  }

  const activeTab =
    tab === 'judges' || tab === 'ranking' || (calendarVisible && tab === 'calendar')
      ? tab
      : 'ranking'

  return (
    <div className="space-y-6">
      <SEO
        title="Рейтинг выставочных собак РКФ"
        description="Рейтинг собак по выставкам РКФ: награды дня (CAC, BOB, ЧРКФ и др.), профили и статистика судей. Ссылки на оригиналы rkf.online."
        canonicalUrl="https://coursing-stats.ru/shows"
        keywords="рейтинг выставок, выставки собак, РКФ, CAC, BOB, ЧРКФ, судьи выставок"
      />
      <div className="relative rounded-2xl border border-cream-300 bg-cream-50/90 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-900/90">
        <RKFAttribution variant="footnote" className="absolute right-0 top-0 z-10" />
        <div className="min-h-[480px] px-4 py-3 md:px-6 md:py-4">
          {activeTab === 'ranking' && (
            <div id="tab-panel-ranking" role="tabpanel" aria-labelledby="tab-ranking">
              <ShowRanking />
            </div>
          )}
          {calendarVisible && activeTab === 'calendar' && (
            <div id="tab-panel-calendar" role="tabpanel" aria-labelledby="tab-calendar">
              <ShowCalendar />
            </div>
          )}
          {activeTab === 'judges' && (
            <div id="tab-panel-judges" role="tabpanel" aria-labelledby="tab-judges">
              <ShowJudges />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Shows
