import { useState, useEffect } from 'react'
import type { GradeScope } from '../../../components/ShowJudgeCard'
import type { GradeFilterKey, StrictnessVerdict } from './judgeDetailAggregates'
import {
  formatJudgeDisplayName,
  getStrictnessBadge,
  getPuppyStrictnessBadge,
} from '../../../lib/judgeUiUtils'
import type { PeriodStrictness } from './Header/constants'
import { JudgePhotoModal } from './Header/JudgePhotoModal'
import { JudgeProfileCard } from './Header/JudgeProfileCard'
import { JudgeStatsOverview } from './Header/JudgeStatsOverview'
import { JudgeGradeTiles } from './Header/JudgeGradeTiles'
import { JudgeStrictnessBar } from './Header/JudgeStrictnessBar'

export type { PeriodStrictness }

export function JudgeDetailHeader({
  judgeName,
  yearParam,
  availableYears,
  onYearChange,
  gradeScope,
  onGradeScopeChange,
  periodExhibitionCount,
  periodBreedCount,
  periodGrades,
  periodStrictness,
  periodPuppyStrictness,
  puppyPct,
  gradeFilter,
  hasGrades,
  hasPerExhibitionGrades,
  excellentPct,
  sitePct,
  baselineExcellentRate,
  strictnessVerdict,
  onSelectExhibitions,
  onSelectBreeds,
  onToggleGrade,
  city,
  ranks,
  certNumber,
  photoUrl,
  konuraUrl,
}: {
  judgeName: string
  yearParam: string
  availableYears: string[]
  onYearChange: (year: string) => void
  gradeScope: GradeScope
  onGradeScopeChange: (scope: GradeScope) => void
  city?: string
  ranks?: string
  certNumber?: number
  photoUrl?: string | null
  konuraUrl?: string | null
  periodExhibitionCount: number
  periodBreedCount: number
  periodGrades: Record<GradeFilterKey, number>
  periodStrictness: PeriodStrictness
  periodPuppyStrictness: { puppyGraded: number; puppyRate: number | null }
  puppyPct: string | null
  gradeFilter: GradeFilterKey | null
  hasGrades: boolean
  hasPerExhibitionGrades: boolean
  excellentPct: string | null
  sitePct: string | null
  baselineExcellentRate: number | null
  strictnessVerdict: StrictnessVerdict | null
  onSelectExhibitions: () => void
  onSelectBreeds: () => void
  onToggleGrade: (key: GradeFilterKey) => void
}) {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)

  useEffect(() => {
    if (!isPhotoOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPhotoOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPhotoOpen])

  const displayName = formatJudgeDisplayName(judgeName)
  const strictnessBadge = getStrictnessBadge(
    periodStrictness.excellent_rate,
    periodStrictness.graded,
  )
  const puppyStrictnessBadge = getPuppyStrictnessBadge(
    periodPuppyStrictness.puppyRate,
    periodPuppyStrictness.puppyGraded,
  )

  const judgePctNumber =
    periodStrictness.excellent_rate != null
      ? periodStrictness.excellent_rate * 100
      : null
  const sitePctNumber =
    baselineExcellentRate != null ? baselineExcellentRate * 100 : null

  const puppyDiff =
    periodPuppyStrictness.puppyRate != null
      ? (periodPuppyStrictness.puppyRate - 0.94) * 100
      : null

  const puppyVerdictHint =
    puppyDiff != null
      ? puppyDiff > 0.5
        ? `Ставит «оч. персп.» чаще среднего по сайту на ${puppyDiff.toFixed(1)} п.п.`
        : puppyDiff < -0.5
          ? `Ставит «оч. персп.» реже среднего по сайту на ${Math.abs(puppyDiff).toFixed(1)} п.п.`
          : 'Ставит «оч. персп.» на уровне среднего по сайту'
      : null

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Карточка профиля судьи: фото, имя, реестровые данные РКФ и стиль экспертизы */}
      <JudgeProfileCard
        displayName={displayName}
        photoUrl={photoUrl}
        city={city}
        certNumber={certNumber}
        ranks={ranks}
        strictnessBadge={strictnessBadge}
        puppyStrictnessBadge={puppyStrictnessBadge}
        puppyGraded={periodPuppyStrictness.puppyGraded}
        yearParam={yearParam}
        availableYears={availableYears}
        onYearChange={onYearChange}
        onOpenPhoto={() => setIsPhotoOpen(true)}
      />

      {/* 2. Карточка сводной статистики и аналитики судейства */}
      <div className="min-w-0 rounded-2xl border border-old-money-200/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
        <JudgeStatsOverview
          periodExhibitionCount={periodExhibitionCount}
          periodBreedCount={periodBreedCount}
          gradeScope={gradeScope}
          onGradeScopeChange={onGradeScopeChange}
          onSelectExhibitions={onSelectExhibitions}
          onSelectBreeds={onSelectBreeds}
          excellentPct={excellentPct}
          puppyPct={puppyPct}
          strictnessBadge={strictnessBadge}
          puppyStrictnessBadge={puppyStrictnessBadge}
          periodStrictness={periodStrictness}
          periodPuppyStrictness={periodPuppyStrictness}
        />

        <JudgeGradeTiles
          hasGrades={hasGrades}
          periodGrades={periodGrades}
          gradeFilter={gradeFilter}
          gradeScope={gradeScope}
          onToggleGrade={onToggleGrade}
        />

        <JudgeStrictnessBar
          gradeScope={gradeScope}
          periodStrictness={periodStrictness}
          periodPuppyStrictness={periodPuppyStrictness}
          puppyStrictnessBadge={puppyStrictnessBadge}
          strictnessBadge={strictnessBadge}
          puppyPct={puppyPct}
          puppyVerdictHint={puppyVerdictHint}
          excellentPct={excellentPct}
          sitePct={sitePct}
          strictnessVerdict={strictnessVerdict}
          judgePctNumber={judgePctNumber}
          sitePctNumber={sitePctNumber}
        />

        {yearParam && !hasPerExhibitionGrades && hasGrades && (
          <p className="mt-3 text-xs text-amber-700">
            Для фильтра оценок по году нужна пересборка индексов (`build-show-indexes`).
          </p>
        )}
      </div>

      {/* Full-size Photo Modal (Old Money portal) */}
      {photoUrl && (
        <JudgePhotoModal
          isOpen={isPhotoOpen}
          onClose={() => setIsPhotoOpen(false)}
          photoUrl={photoUrl}
          displayName={displayName}
          konuraUrl={konuraUrl}
        />
      )}
    </div>
  )
}
