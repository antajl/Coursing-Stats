import {
  type DogOrgStatsResult,
  type OrgDisciplineFilter,
  formatOrgsCount,
} from '../dogOrganizationsStats'

export interface DogOrganizationsHeaderProps {
  orgStats: DogOrgStatsResult
  showDisciplineFilter: boolean
  selectedDiscipline: OrgDisciplineFilter
  onSelectDiscipline: (d: OrgDisciplineFilter) => void
  coursingStarts: number
  racingStarts: number
}

export function DogOrganizationsHeader({
  orgStats,
  showDisciplineFilter,
  selectedDiscipline,
  onSelectDiscipline,
  coursingStarts,
  racingStarts,
}: DogOrganizationsHeaderProps) {
  return (
    <div className="flex flex-col gap-2 px-1">
      {/* Строка 1: Заголовок + десктопный фильтр дисциплин */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Статистика побед по клубам и организациям
        </h2>

        {/* Десктопная сегментная строка: чистый сдержанный Old Money переключатель */}
        {showDisciplineFilter && (
          <div className="hidden sm:inline-flex items-center gap-2 text-xs select-none">
            <button
              type="button"
              onClick={() => onSelectDiscipline('all')}
              className={`px-1.5 py-0.5 transition-colors cursor-pointer touch-manipulation ${
                selectedDiscipline === 'all'
                  ? 'font-bold text-camel-950 underline decoration-camel-600 decoration-2 underline-offset-4'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Все ({orgStats.total_starts})
            </button>
            <span className="text-old-money-300">/</span>
            <button
              type="button"
              onClick={() => onSelectDiscipline('coursing')}
              className={`px-1.5 py-0.5 transition-colors cursor-pointer touch-manipulation ${
                selectedDiscipline === 'coursing'
                  ? 'font-bold text-camel-950 underline decoration-camel-600 decoration-2 underline-offset-4'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Курсинг ({coursingStarts})
            </button>
            <span className="text-old-money-300">/</span>
            <button
              type="button"
              onClick={() => onSelectDiscipline('racing')}
              className={`px-1.5 py-0.5 transition-colors cursor-pointer touch-manipulation ${
                selectedDiscipline === 'racing'
                  ? 'font-bold text-camel-950 underline decoration-camel-600 decoration-2 underline-offset-4'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Рейсинг ({racingStarts})
            </button>
          </div>
        )}
      </div>

      {/* Строка 2: Мобильная типографика в одну строку */}
      <div className="flex sm:hidden items-center justify-between gap-1.5 pt-0.5">
        <span className="text-xs text-charcoal-600 truncate">
          Win Rate: <strong className="text-charcoal-800 font-semibold">{orgStats.career_win_rate}%</strong>
          {!showDisciplineFilter && ` (${formatOrgsCount(orgStats.orgs_count)})`}
        </span>

        {showDisciplineFilter && (
          <div className="inline-flex items-center gap-1.5 text-[11px] select-none shrink-0">
            <button
              type="button"
              onClick={() => onSelectDiscipline('all')}
              className={`px-1 py-0.5 transition-colors cursor-pointer touch-manipulation ${
                selectedDiscipline === 'all'
                  ? 'font-bold text-camel-950 underline decoration-camel-600 decoration-2 underline-offset-2'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Все ({orgStats.total_starts})
            </button>
            <span className="text-old-money-300">·</span>
            <button
              type="button"
              onClick={() => onSelectDiscipline('coursing')}
              className={`px-1 py-0.5 transition-colors cursor-pointer touch-manipulation ${
                selectedDiscipline === 'coursing'
                  ? 'font-bold text-camel-950 underline decoration-camel-600 decoration-2 underline-offset-2'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Курсинг
            </button>
            <span className="text-old-money-300">·</span>
            <button
              type="button"
              onClick={() => onSelectDiscipline('racing')}
              className={`px-1 py-0.5 transition-colors cursor-pointer touch-manipulation ${
                selectedDiscipline === 'racing'
                  ? 'font-bold text-camel-950 underline decoration-camel-600 decoration-2 underline-offset-2'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Бега
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
