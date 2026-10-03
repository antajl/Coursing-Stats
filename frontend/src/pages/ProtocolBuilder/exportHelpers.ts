import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import { calculateRoundSum, hasRoundScores, calculateTotalScore, formatCategoryTitle, getDogOverallStatus } from './types'

export function exportToCSV(header: CompetitionHeader, kind: CompetitionKind, categories: CategoryGroup[]): void {
  const lines: string[] = []

  // Метаданные турнира
  lines.push(`"Соревнование:";"${header.title.replace(/"/g, '""')}"`)
  lines.push(`"Ранг:";"${header.rank.replace(/"/g, '""')}"`)
  lines.push(`"Дата:";"${header.date}"`)
  lines.push(`"Город:";"${header.location.replace(/"/g, '""')}"`)
  lines.push(`"Клуб:";"${header.club.replace(/"/g, '""')}"`)
  lines.push(`"Судьи:";"${header.judges.replace(/"/g, '""')}"`)
  lines.push('')

  for (const cat of categories) {
    lines.push(`"=== ${formatCategoryTitle(cat).replace(/"/g, '""')} ==="`)

    const sortedDogs = [...cat.dogs].sort((a, b) => {
      const statusA = getDogOverallStatus(a, cat.runsCount)
      const statusB = getDogOverallStatus(b, cat.runsCount)
      const isFinA = statusA.type === 'normal'
      const isFinB = statusB.type === 'normal'
      if (isFinA && !isFinB) return -1
      if (!isFinA && isFinB) return 1
      if (!isFinA && !isFinB) {
        if (statusA.type === 'withdrawn' && statusB.type === 'absent') return -1
        if (statusA.type === 'absent' && statusB.type === 'withdrawn') return 1
        return 0
      }
      return calculateTotalScore(b, cat.runsCount) - calculateTotalScore(a, cat.runsCount)
    })

    if (kind === 'coursing') {
      const headerCols = ['Место', '№', 'Кличка собаки', 'Порода', 'Класс', 'Пол']
      for (let r = 1; r <= cat.runsCount; r++) {
        headerCols.push(`Забег ${r} (№)`, `Попона ${r}`, `Забег ${r} (Сумма)`, `Скор ${r}`, `Энт ${r}`, `Инт ${r}`, `Ман ${r}`, `Вын ${r}`)
      }
      headerCols.push('Итоговый балл', 'Титулы и сертификаты', 'Статус')
      lines.push(headerCols.map(h => `"${h}"`).join(';'))

      const anyDogHasScores = cat.dogs.some(dog =>
        dog.runs.slice(0, cat.runsCount).some(r => (!r.status || r.status === 'normal') && hasRoundScores(r.scores))
      )

      let placeCounter = 0
      sortedDogs.forEach((p) => {
        const dogSexLabel = p.sex === 'male' ? 'Кобель' : (p.sex === 'female' ? 'Сука' : (cat.sex === 'female' ? 'Сука' : 'Кобель'))
        const overall = getDogOverallStatus(p, cat.runsCount)
        const place = overall.type === 'normal' ? (anyDogHasScores ? (++placeCounter) : '—') : '—'
        const hasAnyScores = p.runs.slice(0, cat.runsCount).some(r => (!r.status || r.status === 'normal') && hasRoundScores(r.scores))

        const row: Array<string | number> = [
          place,
          p.catalogNumber,
          p.dogName,
          cat.breed,
          cat.className,
          dogSexLabel,
        ]

        for (let r = 0; r < cat.runsCount; r++) {
          const prevCancelled = p.runs.slice(0, r).some(pr => pr.status === 'withdrawn' || pr.status === 'absent')
          if (prevCancelled) {
            row.push('—', '—', '—', '', '', '', '', '')
            continue
          }
          const run = p.runs[r] || { heat: '1', blanket: 'red', scores: { speed: 0, enthusiasm: 0, intelligence: 0, agility: 0, endurance: 0 } }
          const blanketTitle = run.blanket === 'red' ? 'Красная' : run.blanket === 'blue' ? 'Синяя' : 'Белая'
          if (run.status === 'withdrawn') {
            row.push(run.heat, blanketTitle, `Дискв.${run.reason ? ` (${run.reason})` : ''}`, '', '', '', '', '')
          } else if (run.status === 'absent') {
            row.push(run.heat, blanketTitle, 'Неявка', '', '', '', '', '')
          } else {
            const hasScores = hasRoundScores(run.scores)
            const sum = hasScores ? calculateRoundSum(run.scores) : '—'
            row.push(
              run.heat,
              blanketTitle,
              sum,
              hasScores ? (run.scores.speed ?? '') : '',
              hasScores ? (run.scores.enthusiasm ?? '') : '',
              hasScores ? (run.scores.intelligence ?? '') : '',
              hasScores ? (run.scores.agility ?? '') : '',
              hasScores ? (run.scores.endurance ?? '') : ''
            )
          }
        }

        row.push(
          overall.type === 'withdrawn' || overall.type === 'disqualified' ? `ДИСКВ.${overall.reason ? ` (${overall.reason})` : ''}` :
          overall.type === 'absent' ? 'НЕЯВКА' :
          (hasAnyScores ? calculateTotalScore(p, cat.runsCount) : '—'),
          p.awards.join(', '),
          overall.type === 'withdrawn' || overall.type === 'disqualified' ? `Дисквалификация${overall.reason ? `: ${overall.reason}` : ''}` :
          overall.type === 'absent' ? 'Неявка' :
          'Финишировал'
        )

        lines.push(row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
      })
    } else {
      lines.push([
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
        'Статус'
      ].map(h => `"${h}"`).join(';'))

      sortedDogs.forEach((p, idx) => {
        const dogSexLabel = p.sex === 'male' ? 'Кобель' : (p.sex === 'female' ? 'Сука' : (cat.sex === 'female' ? 'Сука' : 'Кобель'))
        lines.push([
          p.disqualified ? 'ДИСКВ' : (idx + 1),
          p.catalogNumber,
          p.dogName,
          cat.breed,
          cat.className,
          dogSexLabel,
          p.racing_box,
          p.racing_time1,
          p.racing_time2,
          p.racing_final_time,
          p.awards.join(', '),
          p.disqualified ? 'Дисквалификация' : 'Финишировал'
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
      })
    }
    lines.push('')
  }

  // BOM для Excel на русском
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
    categories: categories.map(cat => ({
      category_id: cat.id,
      breed: cat.breed,
      class: cat.className,
      sex: cat.sex,
      runs_count: cat.runsCount,
      dogs: cat.dogs.map(p => ({
        catalog_number: p.catalogNumber,
        dog_name: p.dogName,
        runs: p.runs.slice(0, cat.runsCount).map((r, i) => ({
          round_index: i + 1,
          heat: r.heat,
          blanket: r.blanket,
          status: r.status || 'normal',
          reason: r.reason || '',
          scores: r.scores,
          total: (r.status === 'withdrawn' || r.status === 'absent') ? 0 : calculateRoundSum(r.scores)
        })),
        racing: {
          box: p.racing_box,
          time1: p.racing_time1,
          time2: p.racing_time2,
          final_time: p.racing_final_time
        },
        overall_status: getDogOverallStatus(p, cat.runsCount),
        grand_total: calculateTotalScore(p, cat.runsCount),
        disqualified: p.disqualified,
        awards: p.awards,
        comment: p.comment
      }))
    }))
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `results-${header.date || 'competition'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
