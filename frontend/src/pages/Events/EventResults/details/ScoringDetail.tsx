import type { ReactNode } from 'react'
import type { Heat, RawScores, Result } from '../types'
import PoponaCell from '../components/PoponaCell'
import { scoreCellClass } from '../utils/scoreStyles'
import { displayStatusReason } from '../../../../lib/statusReason'
import HoverTooltip from '../../../../components/ui/HoverTooltip'

interface ScoringDetailProps {
  rawScores: RawScores
  result: Result
}

const CRITERIA = ['М', 'Р', 'В', 'П', 'Э'] as const

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

function LabeledValue({
  label,
  labelTitle,
  value,
  valueClassName = '',
}: {
  label: string
  labelTitle: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <HoverTooltip label={labelTitle} placement="top" portal delayMs={0}>
      <div className="inline-flex cursor-help items-baseline gap-0.5 leading-none">
        <span className="text-[10px] font-medium text-old-money-500 opacity-0 transition-opacity duration-150 group-hover/card:opacity-100 dark:text-old-money-400">
          {label}
        </span>
        <span className={valueClassName}>{value}</span>
      </div>
    </HoverTooltip>
  )
}

function ScoreCell({
  criterion,
  value,
}: {
  criterion: (typeof CRITERIA)[number]
  value: number | null | undefined
}) {
  const display = value !== null && value !== undefined ? value : '-'
  return (
    <td className={`px-1 py-1 text-center text-charcoal-900 dark:text-charcoal-100 ${scoreCellClass(value)}`}>
      <LabeledValue
        label={criterion}
        labelTitle={criterionTitle(criterion)}
        value={display}
        valueClassName="tabular-nums"
      />
    </td>
  )
}

function heatHasContent(heat: Heat): boolean {
  if (heat.disqualified) return true
  return Boolean(heat.judges?.some(j => j.scores?.some(s => s !== null && s !== undefined)))
}

function HeatBlock({
  heat,
  statusLabel,
  showDivider,
}: {
  heat: Heat
  statusLabel: string | null
  showDivider: boolean
}) {
  const isHeatDisqualified = heat.disqualified
  const judgeRows = (heat.judges || [])
    .map((heatJudge, judgeIdx) => ({ heatJudge, judgeIdx }))
    .filter(({ heatJudge }) => heatJudge.scores?.some(s => s !== null && s !== undefined))
  const showHeatTotal = heat.total != null && heat.total !== ''

  const heatBadge = <PoponaCell number={heat.bib_number} color={heat.bib_color} compact />

  const heatTotalCell =
    showHeatTotal && !isHeatDisqualified ? (
      <HoverTooltip label="Итого за этот забег (сумма оценок судей)" placement="top" portal delayMs={0}>
        <div className="inline-flex cursor-help flex-col items-end gap-0.5 leading-none">
          <span className="text-[9px] font-medium uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
            забег
          </span>
          <span className="text-sm font-semibold tabular-nums text-charcoal-800 dark:text-charcoal-100">
            {heat.total}
          </span>
        </div>
      </HoverTooltip>
    ) : null

  if (isHeatDisqualified) {
    return (
      <div
        className={`flex items-center gap-2 text-xs ${
          showDivider ? 'border-t border-old-money-200 pt-1.5 dark:border-charcoal-600' : ''
        }`}
      >
        {heatBadge}
        <span className="italic text-red-600 dark:text-red-400">
          {heat.disqualification_reason || statusLabel || 'Отстранение'}
        </span>
      </div>
    )
  }

  return (
    <div className={showDivider ? 'border-t border-old-money-200 pt-1.5 dark:border-charcoal-600' : ''}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] table-fixed text-xs">
          <colgroup>
            <col className="w-[3.5rem]" />
            <col className="w-[6.5rem]" />
            {CRITERIA.map(c => (
              <col key={c} />
            ))}
            <col className="w-10" />
            {showHeatTotal ? <col className="w-12" /> : null}
          </colgroup>
          <tbody>
            {judgeRows.map(({ heatJudge, judgeIdx }, rowIdx) => {
              const judgeLabel = judgeIdx === 0 ? 'Главный судья' : 'Судья'
              return (
                <tr
                  key={judgeIdx}
                  className={rowIdx > 0 ? 'border-t border-old-money-100 dark:border-charcoal-600' : ''}
                >
                  {rowIdx === 0 && (
                    <td
                      className="py-1 pr-2 align-middle text-charcoal-900 dark:text-charcoal-100"
                      rowSpan={judgeRows.length}
                    >
                      {heatBadge}
                    </td>
                  )}
                  <td className="py-1 pr-2 align-middle text-charcoal-900 dark:text-charcoal-100">
                    {judgeLabel}
                  </td>
                  {CRITERIA.map((criterion, ci) => (
                    <ScoreCell key={criterion} criterion={criterion} value={heatJudge.scores?.[ci]} />
                  ))}
                  <td className="rounded bg-old-money-50 py-1 pl-1 text-center align-middle dark:bg-charcoal-700">
                    <LabeledValue
                      label="Σ"
                      labelTitle="Сумма судьи"
                      value={heatJudge.sum ?? '-'}
                      valueClassName="font-bold tabular-nums text-old-money-800 dark:text-old-money-200"
                    />
                  </td>
                  {rowIdx === 0 && showHeatTotal && (
                    <td
                      className="border-l border-old-money-200 py-1 pl-2 text-right align-middle dark:border-charcoal-500"
                      rowSpan={judgeRows.length}
                    >
                      {heatTotalCell}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ScoringDetail({ rawScores, result }: ScoringDetailProps) {
  const heats = (rawScores.heats || []).filter(heatHasContent)
  const statusLabel = displayStatusReason(result.status_reason)

  if (heats.length === 0) return null

  return (
    <div className="space-y-1.5 py-0.5">
      {heats.map((heat, heatIdx) => (
        <HeatBlock
          key={heatIdx}
          heat={heat}
          statusLabel={statusLabel}
          showDivider={heatIdx > 0}
        />
      ))}
    </div>
  )
}
