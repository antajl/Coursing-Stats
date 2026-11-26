import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import {
  COURSING_CRITERIA_META,
  calculateRoundSum,
  hasRoundScores,
  calculateTotalScore,
  formatCategoryTitle,
  getDogOverallStatus,
  sortCategoryDogsForReport,
} from './types'

function escapeCsvCell(val: string | number | null | undefined): string {
  return `"${String(val ?? '').replace(/"/g, '""')}"`
}

export function exportToCSV(header: CompetitionHeader, kind: CompetitionKind, categories: CategoryGroup[]): void {
  const lines: string[] = []

  lines.push(`"Соревнование:";${escapeCsvCell(header.title)}`)
  lines.push(`"Ранг:";${escapeCsvCell(header.rank)}`)
  lines.push(`"Дата:";${escapeCsvCell(header.date)}`)
  lines.push(`"Город:";${escapeCsvCell(header.location)}`)
  lines.push(`"Клуб:";${escapeCsvCell(header.club)}`)
  lines.push(`"Судьи:";${escapeCsvCell(header.judges)}`)
  lines.push('')

  for (const cat of categories) {
    lines.push(`"=== ${formatCategoryTitle(cat).replace(/"/g, '""')} ==="`)
    const sortedDogs = sortCategoryDogsForReport(cat.dogs, cat.runsCount)

    if (kind === 'coursing') {
      const headerCols = ['Место', '№', 'Кличка собаки', 'Порода', 'Класс', 'Пол']
      for (let r = 1; r <= cat.runsCount; r++) {
        headerCols.push(`Забег ${r} (№)`, `Попона ${r}`, `Забег ${r} (Сумма)`)
        for (const c of COURSING_CRITERIA_META) {
          headerCols.push(`${c.csvShort} ${r}`)
        }
      }
      headerCols.push('Итоговый балл', 'Титулы и сертификаты', 'Статус')
      lines.push(headerCols.map((h) => escapeCsvCell(h)).join(';'))

      const anyDogHasScores = cat.dogs.some((dog) =>
        dog.runs.slice(0, cat.runsCount).some((r) => (!r.status || r.status === 'normal') && hasRoundScores(r.scores))
      )

      let placeCounter = 0
      sortedDogs.forEach((p) => {
        const dogSexLabel = p.sex === 'male' ? 'Кобель' : p.sex === 'female' ? 'Сука' : cat.sex === 'female' ? 'Сука' : 'Кобель'
        const overall = getDogOverallStatus(p, cat.runsCount)
        const place = overall.type === 'normal' ? (anyDogHasScores ? ++placeCounter : '—') : '—'
        const hasAnyScores = p.runs.slice(0, cat.runsCount).some((r) => (!r.status || r.status === 'normal') && hasRoundScores(r.scores))

        const row: Array<string | number> = [
          place,
          p.catalogNumber,
          p.dogName,
          cat.breed,
          cat.className,
          dogSexLabel,
        ]

        for (let r = 0; r < cat.runsCount; r++) {
          const prevCancelled = p.runs.slice(0, r).some((pr) => pr.status === 'withdrawn' || pr.status === 'absent')
          if (prevCancelled) {
            row.push('', '', '', '', '', '', '', '')
            continue
          }
          const run = p.runs[r]
          const blanketTitle = run?.blanket === 'red' ? 'Красная' : run?.blanket === 'blue' ? 'Синяя' : 'Белая'
          if (run?.status === 'withdrawn') {
            row.push(run.heat, blanketTitle, `Дискв.${run.reason ? ` (${run.reason})` : ''}`, '', '', '', '', '')
          } else if (run?.status === 'absent') {
            row.push(run.heat, blanketTitle, 'Неявка', '', '', '', '', '')
          } else {
            const hasScores = hasRoundScores(run?.scores)
            const sum = hasScores ? calculateRoundSum(run?.scores) : '—'
            row.push(run?.heat || '', blanketTitle, sum)
            for (const c of COURSING_CRITERIA_META) {
              row.push(hasScores ? (run?.scores?.[c.key] ?? '') : '')
            }
          }
        }

        row.push(
          overall.type === 'withdrawn' || overall.type === 'disqualified'
            ? `Дискв.${overall.reason ? ` (${overall.reason})` : ''}`
            : overall.type === 'absent'
            ? 'Неявка'
            : hasAnyScores
            ? calculateTotalScore(p, cat.runsCount)
            : '—',
          (p.awards || []).join(', '),
          overall.type === 'withdrawn' || overall.type === 'disqualified'
            ? `Дисквалификация${overall.reason ? `: ${overall.reason}` : ''}`
            : overall.type === 'absent'
            ? 'Неявка'
            : 'Финишировал'
        )

        lines.push(row.map((v) => escapeCsvCell(v)).join(';'))
      })
    } else {
      lines.push(
        [
          'Место',
          '№',
          'Кличка собаки',
          'Порода',
          'Класс',
          'Пол',
          'Бокс',
          'Время 1',
          'Время 2',
          'Итоговое время',
          'Титулы',
          'Статус',
        ]
          .map((h) => escapeCsvCell(h))
          .join(';')
      )

      sortedDogs.forEach((p, idx) => {
        const dogSexLabel = p.sex === 'male' ? 'Кобель' : p.sex === 'female' ? 'Сука' : cat.sex === 'female' ? 'Сука' : 'Кобель'
        lines.push(
          [
            p.disqualified ? 'Дискв.' : idx + 1,
            p.catalogNumber,
            p.dogName,
            cat.breed,
            cat.className,
            dogSexLabel,
            p.racing_box,
            p.racing_time1,
            p.racing_time2,
            p.racing_final_time,
            (p.awards || []).join(', '),
            p.disqualified ? 'Дисквалификация' : 'Финишировал',
          ]
            .map((v) => escapeCsvCell(v))
            .join(';')
        )
      })
    }
    lines.push('')
  }

  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Протокол_результатов_${header.date || 'соревнование'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToJSON(header: CompetitionHeader, kind: CompetitionKind, categories: CategoryGroup[]): void {
  const data = {
    schema: 'coursing-stats/protocol-builder-v3',
    exported_at: new Date().toISOString(),
    competition: header,
    kind,
    categories: categories.map((cat) => ({
      category_id: cat.id,
      breed: cat.breed,
      class: cat.className,
      sex: cat.sex,
      runs_count: cat.runsCount,
      dogs: cat.dogs.map((p) => ({
        catalog_number: p.catalogNumber,
        dog_name: p.dogName,
        sex: p.sex,
        runs: p.runs.slice(0, cat.runsCount).map((r, i) => ({
          round_index: i + 1,
          heat: r.heat,
          blanket: r.blanket,
          status: r.status || 'normal',
          reason: r.reason || '',
          scores: r.scores,
          total: r.status === 'withdrawn' || r.status === 'absent' ? 0 : calculateRoundSum(r.scores),
        })),
        racing: {
          box: p.racing_box,
          time1: p.racing_time1,
          time2: p.racing_time2,
          final_time: p.racing_final_time,
        },
        overall_status: getDogOverallStatus(p, cat.runsCount),
        grand_total: calculateTotalScore(p, cat.runsCount),
        disqualified: p.disqualified,
        awards: p.awards || [],
        comment: p.comment,
      })),
    })),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `results-${header.date || 'competition'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
