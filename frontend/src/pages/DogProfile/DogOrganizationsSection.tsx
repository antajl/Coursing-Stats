import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Building2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
} from 'lucide-react'
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

interface DogOrganizationsSectionProps {
  competitions?: DogProfileEventItem[]
  initialDiscipline?: OrgDisciplineFilter
}

const PLACEMENT_STYLES: Record<number, { bg: string; text: string; border: string }> = {
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

export function DogOrganizationsSection({
  competitions,
  initialDiscipline = 'all',
}: DogOrganizationsSectionProps) {
  const [expandedOrgKey, setExpandedOrgKey] = useState<string | null>(null)
  const [disciplineFilter, setDisciplineFilter] = useState<OrgDisciplineFilter>(initialDiscipline)

  // Проверяем, участвовала ли собака в обеих дисциплинах
  const hasCoursing = useMemo(
    () => (competitions || []).some((c) => c.event_type === 'coursing' || c.event_type === 'bzmp' || !c.event_type),
    [competitions],
  )
  const hasRacing = useMemo(
    () => (competitions || []).some((c) => c.event_type === 'racing'),
    [competitions],
  )
  const showDisciplineToggle = hasCoursing && hasRacing

  const orgStats = useMemo(
    () => computeDogOrganizationStats(competitions, disciplineFilter),
    [competitions, disciplineFilter],
  )

  if (!orgStats || orgStats.orgs_count === 0) {
    return null
  }

  const toggleOrg = (orgKey: string) => {
    setExpandedOrgKey((prev) => (prev === orgKey ? null : orgKey))
  }

  const renderOrgRow = (
    org: DogOrgItem,
    variant: 'higher' | 'lower',
  ) => {
    const isExpanded = expandedOrgKey === org.org_key

    return (
      <div key={org.org_key} className="transition-colors hover:bg-cream-50/60">
        <button
          type="button"
          onClick={() => toggleOrg(org.org_key)}
          className="w-full text-left px-3.5 py-2.5 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 cursor-pointer min-h-[44px]"
          aria-expanded={isExpanded}
        >
          {/* Левая часть: Название, площадки, победы и дельта */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-semibold text-charcoal-900 text-xs sm:text-sm truncate" title={org.org_name}>
                {org.short_name}
              </span>
              <span className="text-[11px] text-charcoal-400 font-normal shrink-0">
                {org.starts_count} сост.
              </span>
              {org.locations.length > 0 && (
                <span className="text-[11px] text-charcoal-400 shrink-0">
                  · {org.locations.join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] leading-tight flex-wrap text-charcoal-600">
              <span className="text-charcoal-500">
                победы:{' '}
                <strong className="text-charcoal-800 font-semibold">
                  {org.wins_count}
                </strong>{' '}
                из {org.starts_count}
              </span>

              <span className="text-old-money-300">•</span>

              {/* Дельта к карьере — чистый цветной текст */}
              {variant === 'higher' ? (
                <span className="font-medium text-forest-700">
                  {org.delta_vs_career > 0
                    ? `+${org.delta_vs_career}% к ср.`
                    : '= ср. карьеры'}
                </span>
              ) : (
                <span className="font-medium text-rose-700">
                  {org.wins_count === 0
                    ? 'без побед'
                    : `${org.delta_vs_career}% от ср.`}
                </span>
              )}
            </div>
          </div>

          {/* Правая часть: Чистый Win Rate и шеврон */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right tabular-nums">
              <div className={`text-xs sm:text-sm font-bold leading-tight ${variant === 'higher' ? 'text-forest-900' : 'text-charcoal-800'}`}>
                {org.win_rate}%
              </div>
              <div className="text-[9px] text-charcoal-400 uppercase tracking-wide leading-none mt-0.5">
                win rate
              </div>
            </div>

            <div className="text-charcoal-400 ml-1">
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden />
              )}
            </div>
          </div>
        </button>

        {/* Раскрывающийся список турниров с прямыми кликабельными ссылками на протоколы */}
        {isExpanded && (
          <div className="border-t border-old-money-100 bg-cream-50/70 p-2.5 sm:p-3 space-y-1.5 text-xs">
            <div className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider px-1">
              Состязания в этой организации (кликните для перехода в протокол):
            </div>
            {org.events.map((ev, eIdx) => {
              const isWin = ev.placement === 1
              return (
                <Link
                  key={eIdx}
                  to={`/event/${ev.event_id}/`}
                  className={`group flex items-center justify-between gap-2.5 p-2 rounded-lg border transition-colors shadow-2xs ${
                    isWin
                      ? 'bg-amber-50/70 hover:bg-amber-50 border-amber-200/90'
                      : 'bg-white/90 hover:bg-white border-old-money-200/70'
                  }`}
                  title="Открыть протокол состязания"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-charcoal-900 group-hover:text-camel-800 transition-colors truncate flex items-center gap-1.5">
                      {isWin && (
                        <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden />
                      )}
                      <span className="truncate">{ev.title}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-camel-600 shrink-0" aria-hidden />
                    </div>
                    <div className="text-[10px] text-charcoal-400 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>{ev.date}</span>
                      {ev.location && (
                        <span className="truncate text-charcoal-500">• {ev.location}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {ev.placement ? (
                      <div className="flex items-center gap-1 justify-end">
                        <span
                          className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isWin
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-old-money-100 text-charcoal-700'
                          }`}
                        >
                          {ev.placement}-е место
                        </span>
                      </div>
                    ) : (
                      <div className="text-charcoal-400">—</div>
                    )}
                    {ev.total_score != null && (
                      <div className="text-[10px] text-charcoal-400 tabular-nums mt-0.5">
                        {ev.total_score} б.
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Ленивая подгрузка организаций порциями по 15 при скролле (без лишних кликов и скрытия)
  const INITIAL_BATCH = 15
  const BATCH_INCREMENT = 15

  const [visibleHigherCount, setVisibleHigherCount] = useState(INITIAL_BATCH)
  const [visibleLowerCount, setVisibleLowerCount] = useState(INITIAL_BATCH)

  const higherSentinelRef = useRef<HTMLDivElement>(null)
  const lowerSentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibleHigherCount >= orgStats.higher_than_career.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleHigherCount((prev) =>
            Math.min(prev + BATCH_INCREMENT, orgStats.higher_than_career.length),
          )
        }
      },
      { threshold: 0.1, rootMargin: '300px' },
    )
    const el = higherSentinelRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [visibleHigherCount, orgStats.higher_than_career.length])

  useEffect(() => {
    if (visibleLowerCount >= orgStats.lower_than_career.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleLowerCount((prev) =>
            Math.min(prev + BATCH_INCREMENT, orgStats.lower_than_career.length),
          )
        }
      },
      { threshold: 0.1, rootMargin: '300px' },
    )
    const el = lowerSentinelRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [visibleLowerCount, orgStats.lower_than_career.length])

  const visibleHigher = orgStats.higher_than_career.slice(0, visibleHigherCount)
  const visibleLower = orgStats.lower_than_career.slice(0, visibleLowerCount)

  return (
    <section
      aria-label="Победы по организациям"
      className="card-refined p-4 sm:p-5 md:p-6 mb-6 rounded-2xl bg-gradient-to-b from-white to-cream-50/40 border border-old-money-200/90 shadow-xs"
    >
      {/* Лаконичный заголовок с базовым уровнем собаки */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-old-money-200/80">
        <div>
          <h2 className="text-base md:text-lg font-serif font-semibold text-charcoal-900 leading-tight">
            Победы по организациям
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Базовый уровень: <strong>{orgStats.career_win_rate}% побед</strong> ({orgStats.total_wins} из{' '}
            {orgStats.total_starts} состязаний)
            {disciplineFilter === 'coursing'
              ? ' в курсинге'
              : disciplineFilter === 'racing'
                ? ' в бегах борзых'
                : ' по всем состязаниям'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          {/* Сегментированный переключатель дисциплины (если собака выступала в обеих) */}
          {showDisciplineToggle && (
            <div
              role="group"
              aria-label="Фильтр по дисциплине"
              className="inline-flex items-center p-0.5 rounded-xl border border-old-money-200 bg-cream-100/70 text-xs shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setDisciplineFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer min-h-[32px] sm:min-h-0 ${
                  disciplineFilter === 'all'
                    ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Все
              </button>
              <button
                type="button"
                onClick={() => setDisciplineFilter('coursing')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer min-h-[32px] sm:min-h-0 ${
                  disciplineFilter === 'coursing'
                    ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Курсинг
              </button>
              <button
                type="button"
                onClick={() => setDisciplineFilter('racing')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer min-h-[32px] sm:min-h-0 ${
                  disciplineFilter === 'racing'
                    ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                Бега
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-medium bg-cream-100/70 px-2.5 py-1 rounded-xl border border-old-money-200/70">
            <Building2 className="w-3.5 h-3.5 text-camel-700" aria-hidden />
            <span>{formatOrgsCount(orgStats.orgs_count)}</span>
          </div>
        </div>
      </div>

      {/* 2 сбалансированных списка без отдельных дыр и дублирующих надписей */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 items-start">
        {/* Колонка 1: Выше обычного */}
        <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-forest-50/70 border-b border-old-money-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-forest-700" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                Выше обычного
              </h3>
            </div>
            <span className="text-[11px] text-forest-800 font-semibold tabular-nums">
              {formatOrgsCount(orgStats.higher_than_career.length)}
            </span>
          </div>

          {visibleHigher.length > 0 ? (
            <div className="divide-y divide-old-money-100">
              {visibleHigher.map((org) => renderOrgRow(org, 'higher'))}
              {visibleHigherCount < orgStats.higher_than_career.length && (
                <div ref={higherSentinelRef} className="h-4" aria-hidden="true" />
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-charcoal-400">
              Пока нет организаций с процентом побед выше среднего
            </div>
          )}
        </div>

        {/* Колонка 2: Сложнее победить */}
        <div className="rounded-2xl border border-old-money-200/90 bg-white overflow-hidden shadow-2xs">
          <div className="px-3.5 py-2.5 bg-rose-50/70 border-b border-old-money-200/80 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-700" aria-hidden />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal-800">
                Сложнее победить
              </h3>
            </div>
            <span className="text-[11px] text-rose-800 font-semibold tabular-nums">
              {formatOrgsCount(orgStats.lower_than_career.length)}
            </span>
          </div>

          {visibleLower.length > 0 ? (
            <div className="divide-y divide-old-money-100">
              {visibleLower.map((org) => renderOrgRow(org, 'lower'))}
              {visibleLowerCount < orgStats.lower_than_career.length && (
                <div ref={lowerSentinelRef} className="h-4" aria-hidden="true" />
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-charcoal-400">
              Все состязания завершились победами собаки
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
