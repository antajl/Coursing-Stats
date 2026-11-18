import { SHOW_GRADE_ORDER, type ShowGradeKey } from '../../../../../backend/lib/show-grades'
import type { ShowJudgeDetail as ShowJudgeDetailData } from '../../../lib/staticData'
import { canonicalBreed, OFFICIAL_BREEDS_SET } from '../../../lib/breedMapping'

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

export function parseDateToComparable(dateStr?: string | null): number {
  if (!dateStr) return 0
  const trimmed = dateStr.trim()
  const dmy = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dmy) {
    return Number(`${dmy[3]}${dmy[2].padStart(2, '0')}${dmy[1].padStart(2, '0')}`)
  }
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    return Number(`${iso[1]}${iso[2].padStart(2, '0')}${iso[3].padStart(2, '0')}`)
  }
  return 0
}

export function compareExhibitionDates(
  a: { date?: string; id?: number },
  b: { date?: string; id?: number },
  direction: 'desc' | 'asc' = 'desc',
): number {
  const numA = parseDateToComparable(a.date)
  const numB = parseDateToComparable(b.date)
  if (numA === 0 && numB !== 0) return 1
  if (numB === 0 && numA !== 0) return -1
  if (numA !== numB) {
    return direction === 'desc' ? numB - numA : numA - numB
  }
  return direction === 'desc' ? (b.id ?? 0) - (a.id ?? 0) : (a.id ?? 0) - (b.id ?? 0)
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
  scope?: 'adult' | 'puppy' | 'all',
): Array<{ breed: string; count: number }> {
  const map = new Map<string, number>()
  for (const ex of exhibitions) {
    let bc = ex.breed_counts
    if (scope === 'puppy') {
      bc = ex.puppy_breed_counts
    } else if (scope === 'adult') {
      bc = ex.adult_breed_counts || ex.breed_counts
    }
    if (!bc) continue
    for (const [rawBreed, n] of Object.entries(bc)) {
      if (n <= 0) continue
      const canon = canonicalBreed(rawBreed)
      if (!canon || !OFFICIAL_BREEDS_SET.has(canon) || canon === 'БЕЗ ПОРОДЫ') continue
      map.set(canon, (map.get(canon) || 0) + n)
    }
  }
  return [...map.entries()]
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count || a.breed.localeCompare(b.breed, 'ru'))
}

export function buildStrictness(grades: Record<GradeFilterKey, number>) {
  const graded =
    (grades.excellent || 0) +
    (grades.very_good || 0) +
    (grades.good || 0) +
    (grades.satisfactory || 0) +
    (grades.dq || 0)
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


export function buildPuppyStrictness(grades: Record<GradeFilterKey, number>) {
  const puppyGraded = (grades.very_promising || 0) + (grades.promising || 0);
  if (puppyGraded === 0) {
    return {
      puppyGraded: 0,
      puppyRate: null,
    };
  }
  const vp = grades.very_promising || 0;
  return {
    puppyGraded,
    puppyRate: vp / puppyGraded,
  };
}
