import GroupedStatsTable from './GroupedStatsTable'
import type { GroupBy } from './constants'
import { GROUP_BY_OPTIONS } from './constants'
import ToolbarOptionBar from '../../../components/toolbar/ToolbarOptionBar'
import type { GroupedRow } from './doninoStatsUtils'
import { StatCard, DistributionChart } from './statsUi'

interface CoursingStatsPanelProps {
  groupBy: GroupBy
  onGroupByChange: (value: GroupBy) => void
  filteredCount: number
  dogCount: number
  avgTime: number
  bestTime: number | null
  bestDogName: string | null
  times: number[]
  grouped: GroupedRow[]
}

export default function CoursingStatsPanel({
  groupBy,
  onGroupByChange,
  filteredCount,
  dogCount,
  avgTime,
  bestTime,
  bestDogName,
  times,
  grouped,
}: CoursingStatsPanelProps) {
  return (
    <div className="space-y-4">
      <ToolbarOptionBar
        label="Группировка"
        options={GROUP_BY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={groupBy}
        onChange={(value) => onGroupByChange(value as GroupBy)}
      />

      {groupBy === 'sex' && (
        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
          Пол — из таблицы замеров (в 350 м пола нет).
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Зачётов" value={String(filteredCount)} />
        <StatCard label="Собак" value={String(dogCount)} />
        <StatCard label="Среднее" value={times.length ? `${avgTime.toFixed(2)} сек` : '—'} highlight />
        <StatCard
          label="Лучшее"
          value={bestTime != null ? `${bestTime.toFixed(2)} сек` : '—'}
          sub={bestDogName ?? undefined}
          highlight
        />
      </div>

      <DistributionChart
        title="Распределение времён"
        compact
        ranges={[
          { min: 0, max: 22, label: 'до 22' },
          { min: 22, max: 24, label: '22–24' },
          { min: 24, max: 26, label: '24–26' },
          { min: 26, max: 28, label: '26–28' },
          { min: 28, max: 32, label: '28–32' },
          { min: 32, max: 100, label: '32+' },
        ]}
        values={times}
      />

      <GroupedStatsTable mode="coursing" rows={grouped} groupBy={groupBy} compact />
    </div>
  )
}
