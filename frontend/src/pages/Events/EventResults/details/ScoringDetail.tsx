import type { RawScores, Result } from '../types'
import { bibColorStyle } from '../utils'
import { scoreCellClass } from '../utils/scoreStyles'
import { displayStatusReason } from '../../../../lib/statusReason'
import HoverTooltip from '../../../../components/ui/HoverTooltip'

interface ScoringDetailProps {
  rawScores: RawScores
  result: Result
}

const CRITERIA = ['М', 'Р', 'В', 'П', 'Э'] as const

function ScoreCell({ value }: { value: number | null | undefined }) {
  const display = value !== null && value !== undefined ? value : '-'
  return (
    <td className={`px-1 py-1 text-center text-charcoal-900 dark:text-charcoal-100 ${scoreCellClass(value)}`}>
      {display}
    </td>
  )
}

function HeatCard({
  heat,
  heatIdx,
  judgesCount,
  statusLabel,
}: {
  heat: NonNullable<RawScores['heats']>[number]
  heatIdx: number
  judgesCount: number
  statusLabel: string | null
}) {
  const isHeatDisqualified = heat.disqualified

  return (
    <div className="rounded-xl border border-old-money-200 bg-white p-3 dark:border-charcoal-600 dark:bg-charcoal-800">
      <div className="mb-2 flex items-center justify-center gap-2 border-b border-old-money-100 pb-2 dark:border-charcoal-600">
        {heat.bib_color && (
          <span className="inline-block h-3 w-3 rounded-full" style={bibColorStyle(heat.bib_color)} />
        )}
        <span className={`text-sm font-bold ${isHeatDisqualified ? 'text-red-600 dark:text-red-400' : 'text-camel-700 dark:text-camel-400'}`}>
          Забег {heat.bib_number || heatIdx + 1}
          {isHeatDisqualified && ' (отстранение)'}
        </span>
      </div>

      {isHeatDisqualified ? (
        <div className="py-2 text-center text-sm italic text-red-600 dark:text-red-400">
          {heat.disqualification_reason || statusLabel || 'Отстранение'}
        </div>
      ) : (
        <div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-old-money-600 dark:text-old-money-400">
                <th className="pb-1 pr-2" aria-hidden />
                {CRITERIA.map(c => (
                  <th key={c} className="pb-1 px-0.5 text-center font-medium">
                    <HoverTooltip label={criterionTitle(c)} placement="bottom">
                      <span className="cursor-help">{c}</span>
                    </HoverTooltip>
                  </th>
                ))}
                <th className="pb-1 pl-1 text-center font-bold">
                  <HoverTooltip label="Сумма" placement="bottom">
                    <span className="cursor-help">Σ</span>
                  </HoverTooltip>
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: judgesCount }).map((_, judgeIdx) => {
                const judgeLabel = judgeIdx === 0 ? 'Главный судья' : 'Судья'
                const heatJudge = heat.judges?.[judgeIdx]
                const hasScores = heatJudge?.scores?.some(s => s !== null)

                if (!hasScores) return null

                return (
                  <tr key={judgeIdx} className={judgeIdx > 0 ? 'border-t border-old-money-100 dark:border-charcoal-600' : ''}>
                    <td className="py-1 pr-2 text-charcoal-900 dark:text-charcoal-100">{judgeLabel}</td>
                    {CRITERIA.map((_, ci) => (
                      <ScoreCell key={ci} value={heatJudge?.scores?.[ci]} />
                    ))}
                    <td className="rounded bg-old-money-50 py-1 pl-1 text-center font-bold text-old-money-800 dark:bg-charcoal-700 dark:text-old-money-200">
                      {heatJudge?.sum ?? '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {heat.total && (
            <div className="mt-2 border-t border-old-money-100 pt-2 text-center dark:border-charcoal-600">
              <span className="text-xs text-old-money-500 dark:text-old-money-400">Итого забег: </span>
              <span className="text-sm font-bold text-camel-700 dark:text-camel-400">{heat.total}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function criterionTitle(c: string): string {
  const map: Record<string, string> = {
    М: 'Маневренность',
    Р: 'Резвость',
    В: 'Выносливость',
    П: 'Преследование',
    Э: 'Энтузиазм',
  }
  return map[c] ?? c
}

export default function ScoringDetail({ rawScores, result }: ScoringDetailProps) {
  const heats = rawScores.heats || []
  const statusLabel = displayStatusReason(result.status_reason)
  const judgesCount = heats[0]?.judges?.length || 0

  if (heats.length === 0) return null

  return (
    <div className="space-y-3 py-1">
      <div className={`grid gap-3 ${heats.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
        {heats.map((heat, heatIdx) => (
          <HeatCard
            key={heatIdx}
            heat={heat}
            heatIdx={heatIdx}
            judgesCount={judgesCount}
            statusLabel={statusLabel}
          />
        ))}
      </div>

      {rawScores.grand_total && (
        <div className="rounded-lg border-t-2 border-camel-300 bg-camel-50 px-3 py-2 text-center dark:border-camel-600 dark:bg-camel-950/30">
          <span className="text-sm text-old-money-600 dark:text-old-money-400">Общий итог: </span>
          <span className="font-serif text-lg font-bold tabular-nums text-camel-700 dark:text-camel-400">
            {rawScores.grand_total}
          </span>
        </div>
      )}
    </div>
  )
}
