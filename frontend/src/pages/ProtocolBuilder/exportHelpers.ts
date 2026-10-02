import type { CompetitionHeader, DogParticipant, CompetitionKind } from './types'
import { calculateRoundSum, calculateTotalScore } from './types'

export function exportToCSV(header: CompetitionHeader, kind: CompetitionKind, participants: DogParticipant[]): void {
  const lines: string[] = []

  // Метаданные турнира
  lines.push(`"Соревнование:";"${header.title.replace(/"/g, '""')}"`)
  lines.push(`"Ранг:";"${header.rank.replace(/"/g, '""')}"`)
  lines.push(`"Дата:";"${header.date}"`)
  lines.push(`"Город:";"${header.location.replace(/"/g, '""')}"`)
  lines.push(`"Клуб:";"${header.club.replace(/"/g, '""')}"`)
  lines.push(`"Судьи:";"${header.judges.replace(/"/g, '""')}"`)
  lines.push('')

  if (kind === 'coursing') {
    lines.push([
      '№ кат.',
      'Кличка собаки',
      'Порода',
      'Пол',
      'Класс',
      'Забег 1',
      'Попона 1',
      'Круг 1 (Сумма)',
      'Скорость 1',
      'Энтузиазм 1',
      'Интеллект 1',
      'Маневренность 1',
      'Выносливость 1',
      'Забег 2',
      'Попона 2',
      'Круг 2 (Сумма)',
      'Скорость 2',
      'Энтузиазм 2',
      'Интеллект 2',
      'Маневренность 2',
      'Выносливость 2',
      'Всего баллов',
      'Титулы и сертификаты',
      'Статус'
    ].map(h => `"${h}"`).join(';'))

    for (const p of participants) {
      const sum1 = calculateRoundSum(p.run1_scores)
      const sum2 = calculateRoundSum(p.run2_scores)
      const total = calculateTotalScore(p)

      lines.push([
        p.catalogNumber,
        p.dogName,
        p.breed,
        p.sex === 'male' ? 'Кобель' : (p.sex === 'female' ? 'Сука' : ''),
        p.className,
        p.run1_heat,
        p.run1_blanket,
        sum1,
        p.run1_scores.speed,
        p.run1_scores.enthusiasm,
        p.run1_scores.intelligence,
        p.run1_scores.agility,
        p.run1_scores.endurance,
        p.run2_heat,
        p.run2_blanket,
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
    }
  } else {
    lines.push([
      '№ кат.',
      'Кличка собаки',
      'Порода',
      'Пол',
      'Бокс',
      'Время 1',
      'Время 2',
      'Итоговое время',
      'Титулы',
      'Статус'
    ].map(h => `"${h}"`).join(';'))

    for (const p of participants) {
      lines.push([
        p.catalogNumber,
        p.dogName,
        p.breed,
        p.sex === 'male' ? 'Кобель' : 'Сука',
        p.racing_box,
        p.racing_time1,
        p.racing_time2,
        p.racing_final_time,
        p.awards.join(', '),
        p.disqualified ? 'Дисквалификация' : 'Финишировал'
      ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';'))
    }
  }

  // BOM для корректного открытия в Excel на русском
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Протокол_${header.date || 'соревнование'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToJSON(header: CompetitionHeader, kind: CompetitionKind, participants: DogParticipant[]): void {
  const data = {
    schema: 'coursing-stats/protocol-builder-v1',
    exported_at: new Date().toISOString(),
    competition: header,
    kind,
    participants: participants.map((p, idx) => ({
      catalog_number: p.catalogNumber || String(idx + 1),
      dog_name: p.dogName,
      breed: p.breed,
      sex: p.sex,
      class: p.className,
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
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `protocol-${header.date || 'competition'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
