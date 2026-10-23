import PlacementBadge from './components/PlacementBadge'
import DogNameLink from './components/DogNameLink'
import QualificationBadges from './components/QualificationBadges'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { displayStatusReason } from '../../../lib/statusReason'
import { hasDisqualifiedHeat, parseRawScores } from './utils'
import type { Result } from './types'

interface ResultSummaryProps {
  result: Result
}

function hasHighestQualification(vc: Result['vc']): boolean {
  return Boolean(vc?.trim())
}

/**
 * Normalizes qualification and VC.
 * If VC is a long title string (e.g. "Чемпион России, CACL") and qualification is a short code (e.g. "CC"),
 * or VC contains titles while qualification is empty, swap them so awards render in QualificationBadges
 * and never occlude the Scoreboard.
 */
export function normalizeQualificationAndVc(result: Result): { qualification?: string | null; vc?: string | null } {
  let qual = result.qualification?.trim() || null
  let vc = result.vc?.trim() || null

  const isShortVcCode = (val: string | null) => {
    if (!val) return false
    const upper = val.toUpperCase()
    return upper === 'CC' || upper === 'СС' || upper === 'BCL' || upper === 'CQ' || upper === '+' || upper.length <= 4
  }

  // If vc has awards/titles (or is long) and qual is a short VC code (like "CC") or empty
  if (vc && (!isShortVcCode(vc) || vc.includes(',')) && (!qual || isShortVcCode(qual))) {
    const temp = vc
    vc = isShortVcCode(qual) ? qual : null
    qual = temp
  }

  // If vc is still not short, move it into qual so it renders in QualificationBadges instead of covering the scoreboard
  if (vc && (!isShortVcCode(vc) || vc.includes(','))) {
    if (!qual) qual = vc
    else if (!qual.includes(vc)) qual = `${qual}, ${vc}`
    vc = null
  }

  return { qualification: qual, vc }
}

export function VcBadge({ vc, corner = false }: { vc: string; corner?: boolean }) {
  const badgeClass = corner
    ? 'inline-block max-w-[3.5rem] truncate cursor-help rounded border border-camel-200 bg-camel-100 px-1 py-px text-[10px] font-semibold leading-tight text-camel-800 shadow-sm'
    : 'inline-block cursor-help rounded border border-camel-200 bg-camel-100 px-1.5 py-0.5 text-xs font-semibold text-camel-800'

  return (
    <HoverTooltip label="Высшая квалификация" placement={corner ? 'bottom' : 'top'} portal>
      <span className={badgeClass}>{vc}</span>
    </HoverTooltip>
  )
}

export function Scoreboard({ score, showVc, vc }: { score: number | string; showVc: boolean; vc: string }) {
  return (
    <div className="relative">
      {showVc && (
        <div className="absolute right-0 -top-2 z-10">
          <VcBadge vc={vc} corner />
        </div>
      )}
      <div className="flex min-w-[3.5rem] flex-col items-end rounded-lg border border-old-money-200 bg-white/90 px-2 py-1">
        <div className="font-serif text-lg font-bold tabular-nums leading-none text-camel-700 md:text-xl">
          {score}
        </div>
      </div>
    </div>
  )
}

export function ResultScorePanel({ result }: { result: Result }) {
  const statusLabel = displayStatusReason(result.status_reason)
  const { vc } = normalizeQualificationAndVc(result)
  const showVc = hasHighestQualification(vc)

  if (result.total_score) {
    return <Scoreboard score={result.total_score} showVc={showVc} vc={vc || 'СС'} />
  }
  if (showVc) return <VcBadge vc={vc || 'СС'} />

  if (statusLabel) {
    return (
      <div className="text-right text-xs italic font-semibold text-red-600 md:text-sm whitespace-nowrap">
        {statusLabel}
      </div>
    )
  }

  if (result.status === 'dismissed') {
    return <div className="text-right text-xs italic font-semibold text-red-600 md:text-sm whitespace-nowrap">Отстранение</div>
  }
  if (result.status === 'disqualified') {
    return <div className="text-right text-xs italic font-semibold text-red-600 md:text-sm whitespace-nowrap">Дисквалификация</div>
  }
  if (result.status === 'dnf') {
    return <div className="text-right text-xs italic font-semibold text-red-600 md:text-sm whitespace-nowrap">Не финишировал</div>
  }
  if (result.status === 'eliminated') {
    return <div className="text-right text-xs italic font-semibold text-red-600 md:text-sm whitespace-nowrap">Выбывание</div>
  }
  if (result.status === 'dns' || result.status === 'absent') {
    return <div className="text-right text-xs text-charcoal-600 md:text-sm whitespace-nowrap">Неявка</div>
  }

  return null
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const isNonFinisher =
    result.status === 'disqualified' ||
    result.status === 'dismissed' ||
    result.status === 'eliminated' ||
    result.status === 'dnf' ||
    result.status === 'dns' ||
    result.status === 'absent'
  const statusLabel = displayStatusReason(result.status_reason)
  const { qualification } = normalizeQualificationAndVc(result)

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
      <div className="flex-shrink-0">
        <PlacementBadge result={result} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <DogNameLink result={result} />
          {!isNonFinisher && qualification && (
            <QualificationBadges qualification={qualification} />
          )}
        </div>
        {statusLabel && (
          <div className="text-xs italic font-medium text-red-600 md:hidden mt-0.5">{statusLabel}</div>
        )}
        {(result.status === 'dns' || result.status === 'absent') && !statusLabel && (
          <div className="text-xs text-gray-600 md:hidden mt-0.5">Неявка</div>
        )}
      </div>
    </div>
  )
}
