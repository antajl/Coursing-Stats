import { Navigate, useSearchParams } from 'react-router-dom'
import ProcoursingAttribution from '../components/ProcoursingAttribution'
import { SEO } from '../components/SEO'
import { isLocalDev } from '../lib/env'
import TopDogs from './TopDogs'
import Judges from './Judges'
import Events from './Events'

const VALID_TABS = isLocalDev
  ? new Set(['ranking', 'judges', 'calendar'])
  : new Set(['ranking', 'judges'])

function Competitions() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'ranking'

  if (!isLocalDev && tab === 'calendar') {
    return <Navigate to="/competitions?tab=ranking" replace />
  }

  const activeTab = VALID_TABS.has(tab) ? tab : 'ranking'

  return (
    <div className="space-y-6">
      <SEO
        title="Рейтинг собак: курсинг и бега борзых"
        description="Рейтинг собак по местам и очкам (курсинг, БЗМП, бега борзых), медальный зачёт и статистика судей. Данные с 2015 года."
        canonicalUrl="https://coursing-stats.ru/competitions"
        keywords="рейтинг курсинг, бега борзых, топ собак, медали, судьи курсинг, РКФ"
      />
      <div className="relative rounded-2xl border border-cream-300 bg-cream-50/90 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-900/90">
        <ProcoursingAttribution variant="footnote" className="absolute right-0 top-0 z-10" />
        <div className="min-h-[480px] px-4 py-3 md:px-6 md:py-4">
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
