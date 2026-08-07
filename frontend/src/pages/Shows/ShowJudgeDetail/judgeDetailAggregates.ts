import { SHOW_GRADE_ORDER, type ShowGradeKey } from '../../../../../backend/lib/show-grades'
import type { ShowJudgeDetail as ShowJudgeDetailData } from '../../../lib/staticData'

export type GradeFilterKey = ShowGradeKey | 'dq'
export type ListTab = 'breeds' | 'exhibitions'

export const GRADE_TILES: Array<{ key: GradeFilterKey; label: string }> = [
  { key: 'excellent', label: 'Отлично' },
  { key: 'very_good', label: 'Оч. хор' },
  { key: 'good', label: 'Хорошо' },
  { key: 'satisfactory', label: 'Удовл' },
  { key: 'very_promising', label: 'Оч. персп.' },
  { key: 'promising', label: 'Персп.' },
  { key: 'dq', label: 'Дисквал' },
]

export function formatDate(date: string): string {
  if (!date) return '—'
  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`
  const dmy = date.match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (dmy) return date
  return date
}

export function exhibitionYear(date: string): string | null {
  const iso = date.match(/^(\d{4})/)
  if (iso) return iso[1]
  const dmy = date.match(/(\d{4})$/)
  if (dmy) return dmy[1]
  return null
}

export function emptyGrades(): Record<GradeFilterKey, number> {
  const grades = {} as Record<GradeFilterKey, number>
  for (const key of SHOW_GRADE_ORDER) grades[key] = 0
  grades.dq = 0
  return grades
}

export function sumGradeCounts(
  exhibitions: ShowJudgeDetailData['exhibitions'],
): Record<GradeFilterKey, number> {
  const grades = emptyGrades()
  for (const ex of exhibitions) {
    const gc = ex.grade_counts
    if (!gc) continue
    for (const key of GRADE_TILES) {
      const n = gc[key.key]
      if (n) grades[key.key] += n
    }
  }
  return grades
}

export function sumBreedCounts(
  exhibitions: ShowJudgeDetailData['exhibitions'],
): Array<{ breed: string; count: number }> {
  const map = new Map<string, number>()
  for (const ex of exhibitions) {
    const bc = ex.breed_counts
    if (!bc) continue
    for (const [breed, n] of Object.entries(bc)) {
      if (n > 0) map.set(breed, (map.get(breed) || 0) + n)
    }
  }
  return [...map.entries()]
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
}

export function buildStrictness(grades: Record<GradeFilterKey, number>) {
  const graded = Object.values(grades).reduce((a, b) => a + b, 0)
  if (graded === 0) {
    return {
      graded: 0,
      grades,
      excellent_rate: null as number | null,
      below_excellent_rate: null as number | null,
    }
  }
  const excellent = grades.excellent || 0
  return {
    graded,
    grades,
    excellent_rate: excellent / graded,
    below_excellent_rate: (graded - excellent) / graded,
  }
}

export type StrictnessVerdict = {
  label: string
  tone: 'soft' | 'strict' | 'neutral'
  hint: string
}

export function buildStrictnessVerdict(
  excellentRate: number | null,
  graded: number,
  baselineExcellentRate: number | null | undefined,
): StrictnessVerdict | null {
  if (baselineExcellentRate == null || excellentRate === null || graded < 30) return null
  const diff = (excellentRate - baselineExcellentRate) * 100
  const signed = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`
  if (diff > 3) {
    return {
      label: `${signed} п.п.`,
      tone: 'soft',
      hint: `Ставит «отлично» чаще среднего по сайту на ${diff.toFixed(1)} п.п.`,
    }
  }
  if (diff < -3) {
    return {
      label: `${signed} п.п.`,
      tone: 'strict',
      hint: `Ставит «отлично» реже среднего по сайту на ${Math.abs(diff).toFixed(1)} п.п.`,
    }
  }
  return {
    label: `${signed} п.п.`,
    tone: 'neutral',
    hint: `Разница с средним % «отлично» по сайту: ${signed} п.п.`,
  }
}
