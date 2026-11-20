import type { DogProfileEventItem } from './DogJudgesSection'

export interface DogOrgEventDetail {
  event_id: number | string
  title: string
  date: string
  location?: string | null
  placement: number | null
  total_score: number | null
  event_type?: string
  competition_kind?: string | null
  results_url?: string | null
}

export interface DogOrgItem {
  org_name: string
  org_key: string
  short_name: string
  locations: string[]
  starts_count: number
  wins_count: number
  win_rate: number
  delta_vs_career: number
  avg_placement: number | null
  placements: number[]
  events: DogOrgEventDetail[]
}

export interface DogOrgStats {
  total_starts: number
  total_wins: number
  career_win_rate: number
  orgs_count: number
  higher_than_career: DogOrgItem[]
  lower_than_career: DogOrgItem[]
}

export type OrgDisciplineFilter = 'all' | 'coursing' | 'racing'

export const PLACEMENT_STYLES: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
  2: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-300' },
  3: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
}

/**
 * Нормализация и сопоставление названия организации
 */
export function normalizeOrgName(rawOrg?: string | null, title?: string | null, location?: string | null): string {
  if (rawOrg && rawOrg.trim()) {
    return rawOrg.trim()
  }
  const t = title || ''
  const loc = location || ''
  if (/НКП|РПБ/i.test(t)) return 'НКП «Русская псовая борзая»'
  if (/Ярослав|Левково|Левцово/i.test(t) || /Ярослав|Левково|Левцово/i.test(loc)) {
    return 'ОО «Ярославский областной клуб спортивно-прикладного собаководства»'
  }
  if (/Михайловское/i.test(t) || /Михайловское/i.test(loc)) return 'Курсинг в Михайловском'
  if (/Донино/i.test(t) || /Донино/i.test(loc)) return 'Курсинг в Донино'
  if (/Суханово/i.test(t) || /Суханово/i.test(loc)) return 'РООКО Кинологический союз «Арта»'
  if (/Головинка/i.test(t) || /Головинка/i.test(loc)) return 'РКОО «Калужский областной клуб собаководства»'
  if (/Новый Милет/i.test(t) || /Новый Милет/i.test(loc)) return 'МОРОО «Федерация спортивно-прикладного собаководства»'
  if (/Ставрополь/i.test(t) || /Ставрополь/i.test(loc)) {
    return 'ОО «Региональное кинологическое общество Ставропольского края «Альянс»'
  }
  if (/Мартовский Заяц/i.test(t)) return 'ОООК КЦ «Элита» (РАЛББ)'
  if (loc.trim()) return loc.trim()
  return 'Другие организаторы'
}

/**
 * Лаконичное название клуба для плашек и карточек
 */
export function formatOrgDisplayName(orgName: string): { primary: string; secondary?: string } {
  const clean = orgName.trim()
  if (clean.includes('Федерация спортивно-прикладного собаководства Пермского')) {
    return { primary: 'ФСПС Пермского края', secondary: clean }
  }
  if (clean.includes('Федерация спортивно-прикладного собаководства')) {
    return { primary: 'МОРОО «ФСПС»', secondary: clean }
  }
  if (clean.includes('Кинологический союз «Арта»')) {
    return { primary: 'РООКО «Арта»', secondary: clean }
  }
  if (clean.includes('Русский простор')) {
    return { primary: 'МОКО «Русский простор»', secondary: clean }
  }
  if (clean.includes('Альянс')) {
    return { primary: 'РКО СК «Альянс» (Ставрополь)', secondary: clean }
  }
  if (clean.includes('Ярославский областной клуб')) {
    return { primary: 'ЯОКСПС (Ярославль)', secondary: clean }
  }
  if (clean.includes('Радонежье')) {
    return { primary: 'СПГОО «Радонежье»', secondary: clean }
  }
  if (clean.includes('Элита') || clean.includes('РАЛББ')) {
    return { primary: 'КЦ «Элита» (РАЛББ)', secondary: clean }
  }
  if (clean.includes('Сириус')) {
    return { primary: 'ВГООКС «Сириус»', secondary: clean }
  }
  if (clean.includes('Русская псовая борзая') || clean.includes('РПБ')) {
    return { primary: 'НКП «РПБ»', secondary: clean }
  }
  if (clean.includes('Кеннел-клуб Санкт-Петербурга')) {
    return { primary: 'Кеннел-клуб СПб', secondary: clean }
  }
  if (clean.includes('Союз охотников и рыболовов Свердловской')) {
    return { primary: 'СООиР (Свердловск)', secondary: clean }
  }
  if (clean.includes('Республиканский клуб собаководов')) {
    return { primary: 'РКСиО', secondary: clean }
  }
  if (clean.includes('Калужский областной клуб')) {
    return { primary: 'КОКС (Калуга)', secondary: clean }
  }
  if (clean.includes('Артемида')) {
    return { primary: 'КОС «Артемида»', secondary: clean }
  }
  if (clean.includes('Виннер')) {
    return { primary: 'КС «Виннер»', secondary: clean }
  }
  if (clean.includes('Фауна')) {
    return { primary: 'КЛЖ «Фауна»', secondary: clean }
  }
  return { primary: clean }
}

export function formatOrgsCount(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} организаций`
  if (mod10 === 1) return `${count} организация`
  if (mod10 >= 2 && mod10 <= 4) return `${count} организации`
  return `${count} организаций`
}

export function formatAllOrgsButton(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod10 === 1 && mod100 !== 11) {
    return `Показать ${count} организацию`
  }
  return `Показать все ${count} организаций`
}

export function formatShowMoreOrgs(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `Показать ещё ${count} организаций`
  if (mod10 === 1) return `Показать ещё ${count} организацию`
  if (mod10 >= 2 && mod10 <= 4) return `Показать ещё ${count} организации`
  return `Показать ещё ${count} организаций`
}

export function formatWinsCount(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} золотых наград`
  if (mod10 === 1) return `${count} золотая награда`
  if (mod10 >= 2 && mod10 <= 4) return `${count} золотые награды`
  return `${count} золотых наград`
}

export function formatStartsCount(count: number): string {
  const mod10 = Math.abs(count) % 10
  const mod100 = Math.abs(count) % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} стартов`
  if (mod10 === 1) return `${count} старт`
  if (mod10 >= 2 && mod10 <= 4) return `${count} старта`
  return `${count} стартов`
}

export function computeDogOrganizationStats(
  competitions: DogProfileEventItem[] = [],
  discipline: OrgDisciplineFilter = 'all',
): DogOrgStats | null {
  if (!competitions || competitions.length === 0) return null

  // 1. Фильтрация по дисциплине при необходимости
  let filteredComps = competitions
  if (discipline === 'coursing') {
    filteredComps = competitions.filter(
      (c) => c.event_type === 'coursing' || c.event_type === 'bzmp' || !c.event_type,
    )
  } else if (discipline === 'racing') {
    filteredComps = competitions.filter((c) => c.event_type === 'racing')
  }

  // 2. Учитываем завершённые старты, где определено место собаки
  const validComps = filteredComps.filter((c) => {
    if (typeof c.placement === 'number' && c.placement > 0) return true
    if (typeof c.placement === 'string') {
      const p = parseInt(c.placement, 10)
      return !Number.isNaN(p) && p > 0
    }
    return false
  })

  if (validComps.length === 0) return null

  const totalStarts = validComps.length
  let totalWins = 0

  type OrgAccumulator = {
    org_name: string
    short_name: string
    locations: Set<string>
    starts_count: number
    wins_count: number
    placements: number[]
    events: DogOrgEventDetail[]
  }

  const orgMap = new Map<string, OrgAccumulator>()

  for (const comp of validComps) {
    const rawPlacement = typeof comp.placement === 'number' ? comp.placement : parseInt(String(comp.placement), 10)
    const placement = !Number.isNaN(rawPlacement) && rawPlacement > 0 ? rawPlacement : null
    const isWin = placement === 1
    if (isWin) totalWins += 1

    const rawOrg = (comp.host_club || '').trim()
    const orgName = normalizeOrgName(rawOrg, comp.title, comp.location)
    const displayInfo = formatOrgDisplayName(orgName)

    let entry = orgMap.get(orgName)
    if (!entry) {
      entry = {
        org_name: orgName,
        short_name: displayInfo.primary,
        locations: new Set<string>(),
        starts_count: 0,
        wins_count: 0,
        placements: [],
        events: [],
      }
      orgMap.set(orgName, entry)
    }

    entry.starts_count += 1
    if (isWin) entry.wins_count += 1
    if (placement) entry.placements.push(placement)

    if (comp.location && comp.location.trim()) {
      const locClean = comp.location
        .replace(/^(Московская|Калужская|Свердловская|Ярославская)\s+область,?\s*/i, '')
        .replace(/^[А-Яа-я\s]+р-н,?\s*/i, '')
        .trim()
      entry.locations.add(locClean || comp.location.trim())
    }

    const rawScore = comp.total_score != null
      ? (typeof comp.total_score === 'number' ? comp.total_score : parseFloat(String(comp.total_score)))
      : null
    const totalScore = rawScore != null && !Number.isNaN(rawScore) ? rawScore : null

    entry.events.push({
      event_id: comp.event_id ?? '',
      title: comp.title || 'Состязание',
      date: comp.date_start || '',
      location: comp.location || null,
      placement: placement,
      total_score: totalScore,
      event_type: comp.event_type,
      competition_kind: comp.competition_kind,
      results_url: comp.results_url || null,
    })
  }

  const careerWinRate = totalStarts > 0 ? Math.round((totalWins / totalStarts) * 100) : 0

  const allOrgs: DogOrgItem[] = []
  for (const entry of orgMap.values()) {
    const winRate = entry.starts_count > 0 ? Math.round((entry.wins_count / entry.starts_count) * 100) : 0
    const deltaVsCareer = winRate - careerWinRate
    const avgPlacement = entry.placements.length > 0
      ? entry.placements.reduce((a, b) => a + b, 0) / entry.placements.length
      : null

    allOrgs.push({
      org_name: entry.org_name,
      org_key: entry.org_name.toLowerCase().replace(/[^a-zа-яё0-9]+/g, '-'),
      short_name: entry.short_name,
      locations: Array.from(entry.locations),
      starts_count: entry.starts_count,
      wins_count: entry.wins_count,
      win_rate: winRate,
      delta_vs_career: deltaVsCareer,
      avg_placement: avgPlacement,
      placements: entry.placements,
      events: entry.events.sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    })
  }

  const higherThanCareer: DogOrgItem[] = []
  const lowerThanCareer: DogOrgItem[] = []

  for (const org of allOrgs) {
    if (org.win_rate >= careerWinRate && org.wins_count > 0) {
      higherThanCareer.push(org)
    } else {
      lowerThanCareer.push(org)
    }
  }

  higherThanCareer.sort((a, b) => b.win_rate - a.win_rate || b.wins_count - a.wins_count || b.delta_vs_career - a.delta_vs_career)
  lowerThanCareer.sort((a, b) => b.starts_count - a.starts_count || a.win_rate - b.win_rate)

  return {
    total_starts: totalStarts,
    total_wins: totalWins,
    career_win_rate: careerWinRate,
    orgs_count: allOrgs.length,
    higher_than_career: higherThanCareer,
    lower_than_career: lowerThanCareer,
  }
}
