import type { FormEvent, ReactNode } from 'react'

export interface AdminCalendarFields {
  id: number
  date_start: string
  date_end?: string | null
  rank_label?: string | null
  location?: string | null
  host_club?: string | null
  event_type?: string
}

const adminLabel = 'block text-xs font-medium text-charcoal-600 dark:text-charcoal-400 mb-1'
const adminInput =
  'w-full px-3 py-1.5 text-sm border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100'
const adminSaveBtn =
  'px-3 py-1.5 text-sm bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors disabled:opacity-50 shrink-0'

interface AdminCalendarFormProps {
  event: AdminCalendarFields
  onChange: (patch: Partial<AdminCalendarFields>) => void
  onSave: (e: FormEvent) => void
  saving?: boolean
  headerExtra?: ReactNode
}

export default function AdminCalendarForm({
  event,
  onChange,
  onSave,
  saving,
  headerExtra,
}: AdminCalendarFormProps) {
  return (
    <form onSubmit={onSave} className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
            #{event.id}
          </span>
          {event.event_type && (
            <span className="text-xs text-charcoal-500 dark:text-charcoal-400">{event.event_type}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {headerExtra}
          <button type="submit" disabled={saving} className={adminSaveBtn}>
            {saving ? '…' : 'Сохранить'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-2">
        <div>
          <label className={adminLabel}>Дата начала</label>
          <input
            type="date"
            value={event.date_start?.slice(0, 10) ?? ''}
            onChange={(e) => onChange({ date_start: e.target.value })}
            className={adminInput}
            required
          />
        </div>
        <div>
          <label className={adminLabel}>Дата окончания</label>
          <input
            type="date"
            value={event.date_end?.slice(0, 10) ?? ''}
            onChange={(e) => onChange({ date_end: e.target.value || null })}
            className={adminInput}
          />
        </div>
        <div className="md:col-span-2">
          <label className={adminLabel}>Заголовок в календаре</label>
          <textarea
            rows={2}
            value={event.rank_label ?? ''}
            onChange={(e) => onChange({ rank_label: e.target.value })}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Локация</label>
          <input
            type="text"
            value={event.location ?? ''}
            onChange={(e) => onChange({ location: e.target.value })}
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel}>Клуб / организатор</label>
          <input
            type="text"
            value={event.host_club ?? ''}
            onChange={(e) => onChange({ host_club: e.target.value })}
            className={adminInput}
          />
        </div>
      </div>
    </form>
  )
}
