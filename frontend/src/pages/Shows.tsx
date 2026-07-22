import { Navigate, useSearchParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import ShowRanking from './Shows/ShowRanking'
import ShowJudges from './Shows/ShowJudges'
import ShowCalendar from './Shows/ShowCalendar'

const VALID_TABS = new Set(['ranking', 'calendar', 'judges'])

function Shows() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'

  if (tab === 'champions') {
    return <Navigate to="/shows?tab=ranking" replace />
  }

  const activeTab = VALID_TABS.has(tab) ? tab : 'ranking'

  return (
    <div className="space-y-6">
      <SEO
        title="Выставки"
        description="Рейтинг выставочных собак, календарь и судьи по данным lc.rkfshow.ru."
        canonicalUrl="https://coursing-stats.ru/shows"
      />
      <div className="rounded-2xl border border-cream-300 bg-cream-50/90 px-4 py-3 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-900/90 md:px-6 md:py-4">
        <div className="min-h-[480px]">
          {activeTab === 'ranking' && (
            <div id="tab-panel-ranking" role="tabpanel" aria-labelledby="tab-ranking">
              <ShowRanking />
            </div>
          )}
          {activeTab === 'calendar' && (
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
