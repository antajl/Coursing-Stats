import { useCallback } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import ToolbarSegmentControl from '../components/toolbar/ToolbarSegmentControl'
import { isLocalDev } from '../lib/env'
import TopDogs from './TopDogs'
import Judges from './Judges'
import Events from './Events'

/** Local DEV only — calendar must be an obvious hub tab, not only a nav dropdown item. */
const LOCAL_HUB_SEGMENTS = [
  { id: 'ranking', label: 'Рейтинг' },
  { id: 'calendar', label: 'Календарь' },
  { id: 'judges', label: 'Судьи' },
] as const

const VALID_TABS = isLocalDev
  ? new Set(['ranking', 'judges', 'calendar'])
  : new Set(['ranking', 'judges'])

function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'

  if (!isLocalDev && tab === 'calendar') {
    return <Navigate to="/competitions?tab=ranking" replace />
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
        title="Соревнования и рейтинги"
        description="Рейтинги собак по курсингу и бегам борзых, статистика судей, результаты соревнований. Топ собак по местам и очкам, медальный зачёт, экспертная оценка судей."
        canonicalUrl="https://coursing-stats.ru/competitions"
      />
      <div className="rounded-2xl border border-cream-300 bg-cream-50/90 px-4 py-3 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-900/90 md:px-6 md:py-4">
        {isLocalDev && (
          <div className="mb-4 overflow-x-auto scrollbar-hide">
            <ToolbarSegmentControl
              segments={[...LOCAL_HUB_SEGMENTS]}
              value={activeTab}
              onChange={handleTabChange}
              ariaLabel="Разделы соревнований"
            />
          </div>
        )}
        <div className="min-h-[480px]">
          {activeTab === 'ranking' && (
            <div id="tab-panel-ranking" role="tabpanel" aria-labelledby="tab-ranking">
              <TopDogs />
            </div>
          )}
          {activeTab === 'judges' && (
            <div id="tab-panel-judges" role="tabpanel" aria-labelledby="tab-judges">
              <Judges />
            </div>
          )}
          {isLocalDev && activeTab === 'calendar' && (
            <div id="tab-panel-calendar" role="tabpanel" aria-labelledby="tab-calendar">
              <Events />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Competitions
