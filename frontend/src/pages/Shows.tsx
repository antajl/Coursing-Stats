import { useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import ToolbarSegmentControl from '../components/toolbar/ToolbarSegmentControl'
import { isLocalDev } from '../lib/env'
import ShowRanking from './Shows/ShowRanking'
import ShowJudges from './Shows/ShowJudges'
import ShowCalendar from './Shows/ShowCalendar'

/** Local DEV only — calendar hub tab, same pattern as competitions. */
const LOCAL_HUB_SEGMENTS = [
  { id: 'ranking', label: 'Рейтинг' },
  { id: 'calendar', label: 'Календарь' },
  { id: 'judges', label: 'Судьи' },
] as const

const VALID_TABS = isLocalDev
  ? new Set(['ranking', 'calendar', 'judges'])
  : new Set(['ranking', 'judges'])

function Shows() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'

  if (tab === 'champions' || (!isLocalDev && tab === 'calendar')) {
    return <Navigate to="/shows?tab=ranking" replace />
  }

  const activeTab = VALID_TABS.has(tab) ? tab : 'ranking'

  const handleTabChange = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('tab', next)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  return (
    <div className="space-y-6">
      <SEO
        title="Выставки"
        description="Рейтинг выставочных собак и судьи по данным lc.rkfshow.ru."
        canonicalUrl="https://coursing-stats.ru/shows"
      />
      <div className="rounded-2xl border border-cream-300 bg-cream-50/90 px-4 py-3 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-900/90 md:px-6 md:py-4">
        {isLocalDev && (
          <div className="mb-4 overflow-x-auto scrollbar-hide">
            <ToolbarSegmentControl
              segments={[...LOCAL_HUB_SEGMENTS]}
              value={activeTab}
              onChange={handleTabChange}
              ariaLabel="Разделы выставок"
            />
          </div>
        )}
        <div className="min-h-[480px]">
          {activeTab === 'ranking' && (
            <div id="tab-panel-ranking" role="tabpanel" aria-labelledby="tab-ranking">
              <ShowRanking />
            </div>
          )}
          {isLocalDev && activeTab === 'calendar' && (
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
