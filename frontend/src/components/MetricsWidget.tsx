import { type CalendarEvent } from '../pages/Events/eventListUtils'
import { type ShowRkfCalendarEntry } from '../lib/staticData'
import type { HeroStats, HeroShowStats } from './Hero'
import EventListCard from './EventListCard'
import MetricsCard from './MetricsCard'
import MetricsSkeleton from './MetricsSkeleton'

interface MetricsWidgetProps {
  events: CalendarEvent[]
  shows: ShowRkfCalendarEntry[]
  stats: HeroStats | null
  showStats: HeroShowStats | null
  loading: boolean
  formatDate: (date: string) => string
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} млн.`
  }
  if (value >= 10000) {
    return `${(value / 1000).toFixed(0)} тыс.`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} тыс.`
  }
  return value.toLocaleString('ru-RU')
}

export default function MetricsWidget({
  events,
  shows,
  stats,
  showStats,
  loading,
  formatDate,
}: MetricsWidgetProps) {
  if (loading) {
    return <MetricsSkeleton variant="full" />
  }

  const showEventsList = events.length > 0 || shows.length > 0

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch">
      {showEventsList && (
        <EventListCard
          events={events}
          shows={shows}
          formatDate={formatDate}
          className="flex-1 h-full"
        />
      )}
      {stats && showStats && (
        <div className="flex-1 flex flex-col gap-3 md:gap-4">
          <MetricsCard
            title="Спорт"
            variant="primary"
            metrics={[
              { value: formatNumber(stats.events), label: 'соревнований' },
              { value: formatNumber(stats.results), label: 'результатов' },
              { value: formatNumber(stats.dogs), label: 'собак' },
            ]}
          />
          <MetricsCard
            title="Выставки РКФ"
            variant="secondary"
            metrics={[
              { value: formatNumber(showStats.exhibitions), label: 'выставок' },
              { value: formatNumber(showStats.appearances), label: 'записей' },
              { value: formatNumber(showStats.dogs), label: 'собак' },
            ]}
          />
        </div>
      )}
    </div>
  )
}
