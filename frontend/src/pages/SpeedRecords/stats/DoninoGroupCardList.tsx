import type { GroupBy } from './constants'
import type { GroupedRow } from './doninoStatsUtils'
import DoninoGroupCard from './DoninoGroupCard'

interface DoninoGroupCardListProps {
  mode: 'speed' | 'coursing'
  rows: GroupedRow[]
  groupBy: GroupBy
  expandedKey: string | null
  onToggle: (key: string) => void
}

export default function DoninoGroupCardList({
  mode,
  rows,
  groupBy,
  expandedKey,
  onToggle,
}: DoninoGroupCardListProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-old-money-200 px-4 py-6 text-center text-sm text-charcoal-500 dark:border-charcoal-600 dark:text-charcoal-400">
        Нет данных для выбранных фильтров
      </p>
    )
  }

  return (
    <div className="donino-group-list">
      <div className="donino-group-list__items">
        {rows.map((row) => (
          <DoninoGroupCard
            key={row.key}
            row={row}
            mode={mode}
            groupBy={groupBy}
            expanded={expandedKey === row.key}
            onToggle={() => onToggle(row.key)}
          />
        ))}
      </div>
    </div>
  )
}
