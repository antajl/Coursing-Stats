import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import { calculateRoundSum, calculateTotalScore, formatCategoryTitle } from './types'

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
      if (a.disqualified && !b.disqualified) return 1
      if (!a.disqualified && b.disqualified) return -1
      return calculateTotalScore(b, cat.runsCount) - calculateTotalScore(a, cat.runsCount)
    })

    if (kind === 'coursing') {
      const headerCols = ['Место', '№ кат.', 'Кличка собаки', 'Порода', 'Класс', 'Пол']
      for (let r = 1; r <= cat.runsCount; r++) {
        headerCols.push(`Забег ${r}`, `Круг ${r} (Сумма)`, `Скор ${r}`, `Энт ${r}`, `Инт ${r}`, `Ман ${r}`, `Вын ${r}`)
      }
      headerCols.push('Итоговый балл', 'Титулы и сертификаты', 'Статус')
      lines.push(headerCols.map(h => `"${h}"`).join(';'))

      sortedDogs.forEach((p, idx) => {
        const row: Array<string | number> = [
          p.disqualified ? 'ДИСКВ' : (idx + 1),
          p.catalogNumber,
          p.dogName,
          cat.breed,
          cat.className,
          cat.sex === 'male' ? 'Кобель' : (cat.sex === 'female' ? 'Сука' : 'Смешанный'),
        ]

        for (let r = 0; r < cat.runsCount; r++) {
          const run = p.runs[r] || { heat: '1', scores: { speed: 0, enthusiasm: 0, intelligence: 0, agility: 0, endurance: 0 } }
          const sum = calculateRoundSum(run.scores)
          row.push(run.heat, sum, run.scores.speed, run.scores.enthusiasm, run.scores.intelligence, run.scores.agility, run.scores.endurance)
        }

        row.push(
          calculateTotalScore(p, cat.runsCount),
          p.awards.join(', '),
          p.disqualified ? 'Дисквалификация' : 'Финишировал'
        )

        lines.push(row.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
      })
    } else {
      lines.push([
        'Место',
        '№ кат.',
        'Кличка собаки',
        'Порода',
        'Класс',
        'Бокс',
        'Время 1',
        'Время 2',
        'Итоговое время',
        'Титулы',
        'Статус'
      ].map(h => `"${h}"`).join(';'))

      sortedDogs.forEach((p, idx) => {
        lines.push([
          p.disqualified ? 'ДИСКВ' : (idx + 1),
          p.catalogNumber,
          p.dogName,
          cat.breed,
          cat.className,
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
          scores: r.scores,
          total: calculateRoundSum(r.scores)
        })),
        racing: {
          box: p.racing_box,
          time1: p.racing_time1,
          time2: p.racing_time2,
          final_time: p.racing_final_time
        },
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
