import { useState, useEffect, useMemo } from 'react'
import { Scale, Trophy } from 'lucide-react'
import { DogJudgesSection, type DogJudgesStats, type DogProfileEventItem } from './DogJudgesSection'
import { DogOrganizationsSection, computeDogOrganizationStats } from './DogOrganizationsSection'

export type AnalyticsSubTab = 'judges' | 'organizations'

interface DogAnalyticsSectionProps {
  judgeStats: DogJudgesStats | null
  competitions?: DogProfileEventItem[]
  defaultTab?: AnalyticsSubTab
}

export function DogAnalyticsSection({
  judgeStats,
  competitions = [],
  defaultTab,
}: DogAnalyticsSectionProps) {
  // Проверяем наличие судейских оценок по курсингу
  const coursingJudgesCount = useMemo(() => {
    if (!judgeStats || !Array.isArray(judgeStats.judges)) return 0
    return judgeStats.judges.filter((j) => {
      if (j.verdict === 'racing_only') return false
      if (j.disciplines && j.disciplines.length === 1 && j.disciplines[0] === 'racing') return false
      return true
    }).length
  }, [judgeStats])

  // Проверяем наличие состязаний с результатами для организаций
  const orgStats = useMemo(() => computeDogOrganizationStats(competitions), [competitions])
  const orgsCount = orgStats?.orgs_count || 0

  const hasJudges = coursingJudgesCount > 0
  const hasOrgs = orgsCount > 0

  // Если нет ни судей, ни соревнований — не рендерим ничего
  if (!hasJudges && !hasOrgs) {
    return null
  }

  // Определение начального таба с учётом доступности данных и URL hash (#judges / #organizations)
  const initialTab = useMemo<AnalyticsSubTab>(() => {
    if (defaultTab) return defaultTab
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '')
      if (hash === 'organizations' && hasOrgs) return 'organizations'
      if (hash === 'judges' && hasJudges) return 'judges'
    }
    if (hasJudges) return 'judges'
    return 'organizations'
  }, [defaultTab, hasJudges, hasOrgs])

  const [activeTab, setActiveTab] = useState<AnalyticsSubTab>(initialTab)

  // Синхронизация при смене hash
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#/, '')
      if (hash === 'organizations' && hasOrgs) {
        setActiveTab('organizations')
      } else if (hash === 'judges' && hasJudges) {
        setActiveTab('judges')
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [hasJudges, hasOrgs])

  // Если доступен только один раздел — показываем его напрямую без дублирования вкладок
  const showTabsBar = hasJudges && hasOrgs

  return (
    <div className="w-full">
      {/* 
        Стилизованные подвкладки в едином дизайне с MobileSubNavTabs («Рейтинг, Архив, Судьи»):
        капсула rounded-full, стеклянный фон cs-glass-pill-active и hover-эффекты Old Money.
      */}
      {showTabsBar && (
        <div
          role="tablist"
          aria-label="Аналитика выступлений собаки"
          className="relative mb-3.5 sm:mb-4 overflow-visible py-1 -my-1 select-none w-full"
        >
          <div className="w-full sm:w-auto sm:inline-flex flex items-center p-1 sm:p-1.5 rounded-full border border-old-money-200/90 bg-cream-100/70 backdrop-blur-md shadow-2xs gap-1 sm:gap-1.5">
            <button
              type="button"
              role="tab"
              id="tab-analytics-judges"
              aria-selected={activeTab === 'judges'}
              aria-controls="panel-analytics-judges"
              onClick={() => setActiveTab('judges')}
              className={`h-9 px-3.5 sm:px-5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-[0.97] touch-manipulation flex-1 sm:flex-initial ${
                activeTab === 'judges'
                  ? 'cs-glass-pill-active !font-semibold !text-camel-950 shadow-sm'
                  : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-cream-200/60'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>Оценки судей</span>
              <span className="text-[11px] font-medium opacity-80 tabular-nums">
                ({coursingJudgesCount})
              </span>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-analytics-organizations"
              aria-selected={activeTab === 'organizations'}
              aria-controls="panel-analytics-organizations"
              onClick={() => setActiveTab('organizations')}
              className={`h-9 px-3.5 sm:px-5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap active:scale-[0.97] touch-manipulation flex-1 sm:flex-initial ${
                activeTab === 'organizations'
                  ? 'cs-glass-pill-active !font-semibold !text-camel-950 shadow-sm'
                  : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-cream-200/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>Победы по организациям</span>
              <span className="text-[11px] font-medium opacity-80 tabular-nums">
                ({orgsCount})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Якоря для прямой плавной прокрутки #judges и #organizations */}
      <div id="judges" className="scroll-mt-24" />
      <div id="organizations" className="scroll-mt-24" />

      {/* Контент активного аналитического среза */}
      <div className="min-h-[200px]">
        {hasJudges && (
          <div
            id="panel-analytics-judges"
            role="tabpanel"
            aria-labelledby="tab-analytics-judges"
            className={activeTab === 'judges' ? 'block cs-tab-panel-enter' : 'hidden'}
            aria-hidden={activeTab !== 'judges'}
          >
            {judgeStats && <DogJudgesSection judgeStats={judgeStats} competitions={competitions} />}
          </div>
        )}

        {hasOrgs && (
          <div
            id="panel-analytics-organizations"
            role="tabpanel"
            aria-labelledby="tab-analytics-organizations"
            className={activeTab === 'organizations' ? 'block cs-tab-panel-enter' : 'hidden'}
            aria-hidden={activeTab !== 'organizations'}
          >
            <DogOrganizationsSection competitions={competitions} />
          </div>
        )}
      </div>
    </div>
  )
}
