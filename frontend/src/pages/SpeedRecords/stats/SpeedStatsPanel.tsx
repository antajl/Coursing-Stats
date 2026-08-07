import GroupedStatsTable from './GroupedStatsTable'
import type { GroupBy } from './constants'
import { GROUP_BY_OPTIONS } from './constants'
import ToolbarOptionBar from '../../../components/toolbar/ToolbarOptionBar'
import type { GroupedRow } from './doninoStatsUtils'
import { StatCard, DistributionChart } from './statsUi'

interface SpeedStatsPanelProps {
  groupBy: GroupBy
  onGroupByChange: (value: GroupBy) => void
  filteredCount: number
  dogCount: number
  avgSpeed: number
  bestSpeed: number | null
  bestDogName: string | null
  speeds: number[]
  grouped: GroupedRow[]
}

export default function SpeedStatsPanel({
  groupBy,
  onGroupByChange,
  filteredCount,
  dogCount,
  avgSpeed,
  bestSpeed,
  bestDogName,
  speeds,
  grouped,
}: SpeedStatsPanelProps) {
  return (
    <div className="space-y-4">
      <ToolbarOptionBar
        label="Группировка"
        options={GROUP_BY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        value={groupBy}
        onChange={(value) => onGroupByChange(value as GroupBy)}
      />

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Замеров" value={String(filteredCount)} />
        <StatCard label="Собак" value={String(dogCount)} />
        <StatCard label="Средняя" value={`${avgSpeed.toFixed(1)} км/ч`} highlight />
        <StatCard
          label="Лучшая"
          value={bestSpeed != null ? `${bestSpeed.toFixed(1)} км/ч` : '—'}
          sub={bestDogName ?? undefined}
          highlight
        />
      </div>

      <DistributionChart
        title="Распределение скоростей"
        compact
        ranges={[
          { min: 0, max: 40, label: '0–40' },
          { min: 40, max: 45, label: '40–45' },
          { min: 45, max: 50, label: '45–50' },
          { min: 50, max: 55, label: '50–55' },
          { min: 55, max: 60, label: '55–60' },
          { min: 60, max: 65, label: '60–65' },
          { min: 65, max: 100, label: '65+' },
        ]}
        values={speeds}
      />

      <GroupedStatsTable mode="speed" rows={grouped} groupBy={groupBy} compact />
    </div>
  )
}
