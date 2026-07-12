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

  const fromNum = Number(from)
  const toNum = Number(to ?? from)
  const label = fromNum === toNum ? String(fromNum) : `${fromNum}–${toNum}`

  return {
    label,
    title:
      fromNum === toNum
        ? `Соревнования в ${fromNum} году`
        : `Соревнования с ${fromNum} по ${toNum} год`,
  }
}
