interface AdminListEvent {
  date_start: string
  date_end?: string | null
}

export function formatAdminEventDate(dateStart: string, dateEnd?: string | null): string {
  const fmt = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-')
    if (!y || !m || !d) return iso
    return `${d}.${m}.${y}`
  }
  if (!dateStart) return '—'
  const start = fmt(dateStart)
  if (dateEnd && dateEnd.slice(0, 10) !== dateStart.slice(0, 10)) {
    return `${start} – ${fmt(dateEnd)}`
  }
  return start
}

export function sortAdminEventsByDateAsc<T extends AdminListEvent>(events: T[]): T[] {
  return [...events].sort((a, b) => String(a.date_start ?? '').localeCompare(String(b.date_start ?? '')))
}
