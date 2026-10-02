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
      return calculateTotalScore(b) - calculateTotalScore(a)
    })

    if (kind === 'coursing') {
      lines.push([
        'Место',
        '№ кат.',
        'Кличка собаки',
        'Порода',
        'Класс',
        'Пол',
        '1 Круг (Сумма)',
        'Скор. 1',
        'Энт. 1',
        'Инт. 1',
        'Ман. 1',
        'Вын. 1',
        '2 Круг (Сумма)',
        'Скор. 2',
        'Энт. 2',
        'Инт. 2',
        'Ман. 2',
        'Вын. 2',
        'Итоговый балл',
        'Титулы и сертификаты',
        'Статус'
      ].map(h => `"${h}"`).join(';'))

      sortedDogs.forEach((p, idx) => {
        const sum1 = calculateRoundSum(p.run1_scores)
        const sum2 = calculateRoundSum(p.run2_scores)
        const total = calculateTotalScore(p)

        lines.push([
          p.disqualified ? 'ДИСКВ' : (idx + 1),
          p.catalogNumber,
          p.dogName,
          cat.breed,
          cat.className,
          cat.sex === 'male' ? 'Кобель' : (cat.sex === 'female' ? 'Сука' : 'Смешанный'),
          sum1,
          p.run1_scores.speed,
          p.run1_scores.enthusiasm,
          p.run1_scores.intelligence,
          p.run1_scores.agility,
          p.run1_scores.endurance,
          sum2,
          p.run2_scores.speed,
          p.run2_scores.enthusiasm,
          p.run2_scores.intelligence,
          p.run2_scores.agility,
          p.run2_scores.endurance,
          total,
          p.awards.join(', '),
          p.disqualified ? 'Дисквалификация' : 'Финишировал'
        ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
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
    schema: 'coursing-stats/protocol-builder-v2',
    exported_at: new Date().toISOString(),
    competition: header,
    kind,
    categories: categories.map(cat => ({
      category_id: cat.id,
      breed: cat.breed,
      class: cat.className,
      sex: cat.sex,
      dogs: cat.dogs.map(p => ({
        catalog_number: p.catalogNumber,
        dog_name: p.dogName,
        round1: {
          heat: p.run1_heat,
          blanket: p.run1_blanket,
          scores: p.run1_scores,
          total: calculateRoundSum(p.run1_scores)
        },
        round2: {
          heat: p.run2_heat,
          blanket: p.run2_blanket,
          scores: p.run2_scores,
          total: calculateRoundSum(p.run2_scores)
        },
        racing: {
          box: p.racing_box,
          time1: p.racing_time1,
          time2: p.racing_time2,
          final_time: p.racing_final_time
        },
        grand_total: calculateTotalScore(p),
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
