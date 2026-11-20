import type { DogJudgesStats } from '../dogJudgesStats'
import { formatExpertsCount } from '../dogJudgesStats'

export interface DogJudgesHeaderProps {
  judgeStats: DogJudgesStats
  coursingJudgesCount: number
}

export function DogJudgesHeader({
  judgeStats,
  coursingJudgesCount,
}: DogJudgesHeaderProps) {
  const globalAvgScore = judgeStats.global_avg_score || 83.5
  const careerAvgPlace = judgeStats.dog_avg_placement ?? null

  return (
    <div className="flex flex-col gap-2 px-1">
      {/* Строка 1: Заголовок + десктопные базовые показатели в одну строку */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm sm:text-base font-bold text-charcoal-900">
          Оценки экспертов в состязаниях
        </h2>

        <div className="hidden sm:inline-flex items-center gap-2 text-xs text-charcoal-600 select-none">
          <span>
            Базовый уровень: <strong className="text-charcoal-800 font-semibold">{globalAvgScore.toFixed(1)} б.</strong>
            {careerAvgPlace !== null && (
              <> · <strong className="text-charcoal-800 font-semibold">{careerAvgPlace.toFixed(1)} место</strong></>
            )}
          </span>
          <span className="text-charcoal-400">({formatExpertsCount(coursingJudgesCount)})</span>

          {judgeStats.highest_concentration && judgeStats.highest_concentration.starts_percent >= 25 && (
            <>
              <span className="text-old-money-300">·</span>
              <span className="text-charcoal-500">
                Чаще всего: <strong className="text-charcoal-800 font-semibold">{judgeStats.highest_concentration.judge_name}</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Строка 2: Мобильная типографика в одну аккуратную строку (как во вкладке Организации) */}
      <div className="flex sm:hidden items-center justify-between gap-1.5 pt-0.5">
        <span className="text-xs text-charcoal-600 truncate">
          Базовый: <strong className="text-charcoal-800 font-semibold">{globalAvgScore.toFixed(1)} б.</strong>
          {careerAvgPlace !== null && (
            <>
              {' '}· <strong className="text-charcoal-800 font-semibold">{careerAvgPlace.toFixed(1)} место</strong>
            </>
          )}
        </span>
        <span className="text-xs text-charcoal-500 shrink-0 font-medium">
          ({formatExpertsCount(coursingJudgesCount)})
        </span>
      </div>
    </div>
  )
}
