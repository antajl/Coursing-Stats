function yearRangeBadge(
  from: number,
  to: number,
  titles: { single: (y: number) => string; range: (from: number, to: number) => string },
): { label: string; title: string } {
  const label = from === to ? String(from) : `${from}–${to}`
  return {
    label,
    title: from === to ? titles.single(from) : titles.range(from, to),
  }
}

export function dogYearBadge(
  dog: { year?: number; year_from?: number; year_to?: number },
  filterYear: string
): { label: string; title: string } | null {
  if (filterYear) {
    return {
      label: filterYear,
      title: `Соревнования за ${filterYear} год`,
    }
  }

  const from = dog.year_from ?? dog.year
  const to = dog.year_to ?? dog.year ?? from
  if (from == null || Number.isNaN(Number(from))) return null

  return yearRangeBadge(Number(from), Number(to ?? from), {
    single: (y) => `Соревнования в ${y} году`,
    range: (a, b) => `Соревнования с ${a} по ${b} год`,
  })
}

/** Год из даты выставки (DD.MM.YYYY или ISO YYYY-MM-DD). Без выдуманных значений. */
export function yearFromShowDate(date: string): number | null {
  const s = String(date || '').trim()
  if (!s) return null
  const dmy = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dmy) return Number(dmy[3])
  const iso = s.match(/^(\d{4})-\d{2}-\d{2}/)
  if (iso) return Number(iso[1])
  return null
}

/**
 * Бейдж годов для карточек рейтинга выставок.
 * При активном filterYear — этот год; иначе min–max из year_* или history.date.
 */
export function showYearBadge(
  dog: {
    year?: number
    year_from?: number
    year_to?: number
    history?: Array<{ date?: string }>
  },
  filterYear: string,
): { label: string; title: string } | null {
  if (filterYear) {
    return {
      label: filterYear,
      title: `Выставки ${filterYear}`,
    }
  }

  let from = dog.year_from ?? dog.year
  let to = dog.year_to ?? dog.year ?? from

  if (from == null || Number.isNaN(Number(from))) {
    let min: number | null = null
    let max: number | null = null
    for (const entry of dog.history ?? []) {
      const y = yearFromShowDate(entry.date ?? '')
      if (y == null) continue
      if (min == null || y < min) min = y
      if (max == null || y > max) max = y
    }
    if (min == null || max == null) return null
    from = min
    to = max
  }

  return yearRangeBadge(Number(from), Number(to ?? from), {
    single: (y) => `Выставки ${y}`,
    range: (a, b) => `Выставки с ${a} по ${b}`,
  })
}
