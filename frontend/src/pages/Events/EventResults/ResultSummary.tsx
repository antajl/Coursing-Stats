import PlacementBadge from './components/PlacementBadge'
import DogNameLink from './components/DogNameLink'
import QualificationBadges from './components/QualificationBadges'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { displayStatusReason } from '../../../lib/statusReason'
import type { Result } from './types'

interface ResultSummaryProps {
  result: Result
}

function hasHighestQualification(vc: Result['vc']): boolean {
  return Boolean(vc?.trim())
}

export function VcBadge({ corner = false }: { corner?: boolean }) {
  const badgeClass = corner
    ? 'inline-block cursor-help rounded border border-camel-200 bg-camel-100 px-1 py-px text-[10px] font-semibold leading-tight text-camel-800 shadow-sm dark:border-camel-700 dark:bg-camel-900/50 dark:text-camel-300'
    : 'inline-block cursor-help rounded border border-camel-200 bg-camel-100 px-1.5 py-0.5 text-xs font-semibold text-camel-800 dark:border-camel-700 dark:bg-camel-900/50 dark:text-camel-300'

  return (
    <HoverTooltip label="Высшая квалификация" placement={corner ? 'bottom' : 'top'}>
      <span className={badgeClass}>ВС</span>
    </HoverTooltip>
  )
}

export function Scoreboard({ score, showVc }: { score: number | string; showVc: boolean }) {
  return (
    <div className="relative">
      {showVc && (
        <div className="absolute -right-1.5 -top-1.5 z-10">
          <VcBadge corner />
        </div>
      )}
      <div className="flex min-w-[4.25rem] flex-col items-end rounded-lg border border-old-money-200 bg-white/90 px-2.5 py-1.5 dark:border-charcoal-500 dark:bg-charcoal-800/90">
        <div className="font-serif text-xl font-bold tabular-nums leading-none text-camel-700 dark:text-camel-400 md:text-2xl">
          {score}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-wide text-old-money-600 dark:text-old-money-400">
          баллов
        </div>
      </div>
    </div>
  )
}

export function ResultScorePanel({ result }: { result: Result }) {
  const isDisqualified = result.status === 'disqualified' || result.status === 'dns'
  const statusLabel = displayStatusReason(result.status_reason)
  const showVc = hasHighestQualification(result.vc)

  if (result.total_score) {
    return <Scoreboard score={result.total_score} showVc={showVc} />
  }
  if (showVc) return <VcBadge />
  if (result.status === 'disqualified' && statusLabel) {
    return (
      <div className="max-w-[8rem] text-right text-xs italic text-red-600 dark:text-red-400 md:text-sm">
        {statusLabel}
      </div>
    )
  }
  if (result.status === 'dns') {
    return <div className="text-right text-xs text-gray-600 dark:text-gray-400 md:text-sm">Неявка</div>
  }
  if (isDisqualified) return null
  return null
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const isDisqualified = result.status === 'disqualified' || result.status === 'dns'
  const statusLabel = displayStatusReason(result.status_reason)

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-4">
      <div className="flex-shrink-0">
        <PlacementBadge result={result} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col">
          <DogNameLink result={result} />
        </div>
        {!isDisqualified && result.qualification && (
          <QualificationBadges qualification={result.qualification} />
        )}
        {result.status === 'disqualified' && statusLabel && (
          <div className="mt-1 text-xs italic text-red-600 dark:text-red-400 md:hidden">{statusLabel}</div>
        )}
        {result.status === 'dns' && (
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:hidden">Неявка</div>
        )}
      </div>
    </div>
  )
}
