import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, UserRound } from 'lucide-react'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import RKFAttribution from '../../components/RKFAttribution'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'
import { getShowExhibition } from '../../lib/staticData'
import { resolveRkfOnlineExhibitionUrl, rkfExhibitionResultsUrl } from '../../lib/rkfLinks'
import { stableShowProfileId } from '../../lib/showDogProfilePath'
import HoverTooltip from '../../components/ui/HoverTooltip'
import BreedGroupDivider from '../Events/EventResults/components/BreedGroupDivider'
import { awardTooltipForToken, awardTooltipList } from '../../lib/awardTooltip'
import { ShowGradeChip, SHOW_AWARD_CHIP_CLASS } from '../../lib/ShowGradeChip'
import {
  displayShowAwardToken,
  matchShowAwardToken,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_WEIGHTS,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import {
  buildGroupMap,
  buildResultsByBreedId,
  catalogBreedMatchesFilters,
  catalogHasFciGroups,
  collectExhibitionAwardKeys,
  dogNameMatchesQuery,
  filterBreedRowsBySearch,
  filterResultsByDogAndBreed,
  groupResultsBySexAndClass,
  localizeShowClass,
  resultsForBreed,
  splitShowTitleTokens,
  splitDogNameDisplay,
  titleHighlights,
  titleRowHasAward,
  breedMatchesQuery,
  type BreedCatalogRow,
  type BreedTitleRow,
  type ClassResultGroup,
  type ShowResultRow,
} from './showExhibitionUtils'

/** В таблице: один бейдж + «хвостик» следующего; hover — прокрутка ряда. */
function TitleChips({ title }: { title: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  const tokens = splitShowTitleTokens(title)
  if (tokens.length === 0) return null

  const ranked = [...tokens].sort((a, b) => {
    const ka = matchShowAwardToken(a)
    const kb = matchShowAwardToken(b)
    const wa = ka ? SHOW_AWARD_WEIGHTS[ka] : 0
    const wb = kb ? SHOW_AWARD_WEIGHTS[kb] : 0
    return wb - wa
  })

  const scrollToEnd = () => {
    const track = trackRef.current
    const viewport = viewportRef.current
    if (!track || !viewport) return
    setOffset(Math.max(0, track.scrollWidth - viewport.clientWidth))
  }

  const scrollHome = () => setOffset(0)

  const chips = (
    <div
      ref={trackRef}
      className="flex w-max flex-nowrap items-center gap-1 transition-transform duration-700 ease-out"
      style={{ transform: `translateX(-${offset}px)` }}
    >
      {ranked.map((token, i) => (
        <span
          key={`${token}-${i}`}
          className={SHOW_AWARD_CHIP_CLASS}
        >
          {displayShowAwardToken(token)}
        </span>
      ))}
    </div>
  )

  if (ranked.length === 1) {
    return (
      <HoverTooltip
        label={awardTooltipForToken(ranked[0]!)}
        placement="top"
        variant="site"
        delayMs={0}
        portal
      >
        <span className="inline-flex" tabIndex={0}>
          {chips}
        </span>
      </HoverTooltip>
    )
  }

  return (
    <HoverTooltip
      label={awardTooltipList(ranked.map((token) => ({ token })))}
      placement="top"
      variant="site"
      delayMs={120}
      portal
      className="block w-full min-w-0 max-w-full"
    >
      <div
        ref={viewportRef}
        className="relative w-full min-w-0 overflow-hidden"
        tabIndex={0}
        onMouseEnter={scrollToEnd}
        onMouseLeave={scrollHome}
        onFocus={scrollToEnd}
        onBlur={scrollHome}
      >
        {chips}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white to-transparent dark:from-charcoal-800"
          aria-hidden
        />
      </div>
    </HoverTooltip>
  )
}

function exhibitionDogProfilePath(dogName: string, breed: string): string | null {
  const name = splitDogNameDisplay(dogName).name.trim()
  const breedTrim = breed.trim()
  if (!name || !breedTrim) return null
  return `/dog/${stableShowProfileId(name, breedTrim)}`
}

function ExhibitionDogNameLink({
  dogName,
  breed,
  catalogNumber,
  className = '',
}: {
  dogName: string
  breed: string
  catalogNumber?: number
  className?: string
}) {
  const { ring, name } = splitDogNameDisplay(dogName)
  const href = exhibitionDogProfilePath(dogName, breed)
  const ringLabel =
    catalogNumber != null && catalogNumber > 0
      ? String(catalogNumber)
      : ring

  const content = (
    <>
      {ringLabel ? (
        <span className="mr-1.5 font-mono text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
          ({ringLabel})
        </span>
      ) : null}
      {name || dogName || '—'}
    </>
  )

  if (!href) {
    return (
      <span className={`block truncate ${className}`} title={name || dogName}>
        {content}
      </span>
    )
  }

  return (
    <Link
      to={href}
      className={`block truncate transition-colors hover:text-camel-700 hover:underline hover:underline-offset-2 dark:hover:text-camel-400 ${className}`}
      title={name || dogName}
    >
      {content}
    </Link>
  )
}

function BreedTitleRowView({ row, breed }: { row: BreedTitleRow; breed: string }) {
  return (
    <li className="rounded-md bg-camel-50/80 px-2.5 py-2 text-sm dark:bg-camel-900/20">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className={SHOW_AWARD_CHIP_CLASS}>
          {row.title_code}
        </span>
        {row.ring_number > 0 ? (
          <span className="font-mono text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
            ({row.ring_number})
          </span>
        ) : null}
        {exhibitionDogProfilePath(row.dog_name, breed) ? (
          <Link
            to={exhibitionDogProfilePath(row.dog_name, breed)!}
            className="font-semibold text-charcoal-900 transition-colors hover:text-camel-700 hover:underline hover:underline-offset-2 dark:text-charcoal-100 dark:hover:text-camel-400"
          >
            {row.dog_name}
          </Link>
        ) : (
          <span className="font-semibold text-charcoal-900 dark:text-charcoal-100">{row.dog_name}</span>
        )}
      </div>
      {row.owner?.trim() ? (
        <div className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
          Судья: {row.owner.trim()}
        </div>
      ) : null}
    </li>
  )
}

interface MainRingRow {
  competition_key: string
  competition_label: string
  group: number | null
  place: number
  breed: string
  catalog_number: number
  dog_name: string
  pedigree?: string
  award_badge?: string
}

type MainRingTab = {
  id: string
  label: string
  shortLabel: string
  rows: MainRingRow[]
}

const MAIN_RING_KEY_ORDER: Record<string, number> = {
  BIS: 0,
  BIS_BABY: 1,
  BIS_PUPPY: 2,
  BIS_JUNIOR: 3,
  BIS_VETERAN: 4,
  BIG: 5,
  OTHER: 6,
}

function mainRingTabShortLabel(rows: MainRingRow[]): string {
  const sample = rows[0]
  if (!sample) return '—'
  const key = sample.competition_key
  if (key === 'BIG') {
    return sample.group != null ? `BIG ${sample.group}` : 'BIG'
  }
  const fromPlace1 = rows.find((r) => r.place === 1 && r.award_badge)?.award_badge
  if (fromPlace1) return fromPlace1
  if (key === 'BIS') return SHOW_AWARD_BADGE.BIS
  if (key === 'BIS_BABY') return SHOW_AWARD_BADGE.BIS_BABY
  if (key === 'BIS_PUPPY') return SHOW_AWARD_BADGE.BIS_PUPPY
  if (key === 'BIS_JUNIOR') return SHOW_AWARD_BADGE.BIS_JUNIOR
  if (key === 'BIS_VETERAN') return SHOW_AWARD_BADGE.BIS_VETERAN
  return sample.competition_label.slice(0, 24) || key
}

/** Группы главного ринга: BIS → возраст → BIG по номеру FCI. */
function groupMainRing(rows: MainRingRow[]): MainRingTab[] {
  const byId = new Map<string, MainRingRow[]>()
  for (const row of rows) {
    const id = `${row.competition_key}:${row.group ?? ''}:${row.competition_label || row.competition_key}`
    if (!byId.has(id)) byId.set(id, [])
    byId.get(id)!.push(row)
  }

  const tabs: MainRingTab[] = [...byId.entries()].map(([id, list]) => {
    const sorted = list.slice().sort((a, b) => a.place - b.place)
    return {
      id,
      label: sorted[0]?.competition_label || sorted[0]?.competition_key || id,
      shortLabel: mainRingTabShortLabel(sorted),
      rows: sorted,
    }
  })

  tabs.sort((a, b) => {
    const ka = a.rows[0]?.competition_key || 'OTHER'
    const kb = b.rows[0]?.competition_key || 'OTHER'
    const oa = MAIN_RING_KEY_ORDER[ka] ?? 9
    const ob = MAIN_RING_KEY_ORDER[kb] ?? 9
    if (oa !== ob) return oa - ob
    const ga = a.rows[0]?.group
    const gb = b.rows[0]?.group
    if (ga != null && gb != null && ga !== gb) return ga - gb
    return a.label.localeCompare(b.label, 'ru')
  })

  return tabs
}

function MainRingResultsTable({ rows }: { rows: MainRingRow[] }) {
  const placementClass = (place: number) => {
    if (place === 1) return 'font-bold text-camel-700 dark:text-camel-400'
    if (place === 2 || place === 3) return 'font-semibold text-charcoal-800 dark:text-charcoal-200'
    return 'text-charcoal-600 dark:text-charcoal-400'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed divide-y divide-old-money-200 text-sm dark:divide-charcoal-600">
        <thead>
          <tr className="border-b border-old-money-200 dark:border-charcoal-600">
            <th className="w-16 px-1.5 py-2 text-center text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Место
            </th>
            <th className="px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Собака
            </th>
            <th className="w-[38%] px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Порода
            </th>
            <th className="w-[6.5rem] px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Награды
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-old-money-100 dark:divide-charcoal-700">
          {rows.map((row) => (
            <tr
              key={`${row.place}-${row.catalog_number}-${row.dog_name}`}
              className="transition-colors hover:bg-old-money-50/80 dark:hover:bg-charcoal-700/40"
            >
              <td className={`px-1.5 py-2.5 text-center tabular-nums ${placementClass(row.place)}`}>
                {row.place > 0 ? row.place : ''}
              </td>
              <td className="min-w-0 px-2.5 py-2.5 font-medium text-charcoal-900 dark:text-charcoal-100">
                <ExhibitionDogNameLink
                  dogName={row.dog_name}
                  breed={row.breed}
                  catalogNumber={row.catalog_number}
                />
              </td>
              <td className="px-2.5 py-2.5 text-xs leading-snug text-charcoal-600 dark:text-charcoal-400">
                <span className="block truncate" title={row.breed || undefined}>
                  {row.breed || '—'}
                </span>
              </td>
              <td className="px-2 py-2.5 text-xs font-medium text-camel-800 dark:text-camel-300">
                {row.award_badge ? (
                  <HoverTooltip
                    label={awardTooltipForToken(row.award_badge)}
                    placement="top"
                    variant="site"
                    delayMs={0}
                    portal
                  >
                    <span className={SHOW_AWARD_CHIP_CLASS} tabIndex={0}>
                      {row.award_badge}
                    </span>
                  </HoverTooltip>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MainRingSection({
  rows,
  bisUrl,
}: {
  rows: MainRingRow[]
  bisUrl?: string | null
}) {
  const tabs = useMemo(() => groupMainRing(rows), [rows])
  const [activeId, setActiveId] = useState(() => tabs[0]?.id ?? '')

  useEffect(() => {
    if (tabs.length === 0) {
      setActiveId('')
      return
    }
    if (!tabs.some((t) => t.id === activeId)) {
      setActiveId(tabs[0]!.id)
    }
  }, [tabs, activeId])

  if (rows.length === 0) {
    if (!bisUrl) return null
    return (
      <section className="mb-4 rounded-xl border border-old-money-200 bg-cream-50/80 p-3 dark:border-charcoal-600 dark:bg-charcoal-800/40">
        <h2 className="font-serif text-base font-bold text-charcoal-900 dark:text-charcoal-100">
          Главный ринг
        </h2>
        <p className="mt-1 text-sm text-charcoal-600 dark:text-charcoal-400">
          Ведомость ещё не разобрана.{' '}
          <a
            href={bisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-camel-700 underline-offset-2 hover:underline dark:text-camel-400"
          >
            PDF на tables.rkf.org.ru
          </a>
        </p>
      </section>
    )
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0]

  return (
    <section className="mb-4 rounded-xl border border-old-money-200 bg-cream-50/80 p-3 dark:border-charcoal-600 dark:bg-charcoal-800/40">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-base font-bold text-charcoal-900 dark:text-charcoal-100 md:text-lg">
          Главный ринг
        </h2>
        {bisUrl ? (
          <a
            href={bisUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-camel-700 underline-offset-2 hover:underline dark:text-camel-400"
          >
            PDF ведомости
          </a>
        ) : null}
      </div>

      <div className="-mx-0.5 mb-3 flex gap-1.5 overflow-x-auto px-0.5 pb-0.5">
        {tabs.map((tab) => (
          <ToolbarChip
            key={tab.id}
            active={tab.id === active?.id}
            onClick={() => setActiveId(tab.id)}
            className="shrink-0"
          >
            <span title={tab.label}>{tab.shortLabel}</span>
          </ToolbarChip>
        ))}
      </div>

      {active ? (
        <>
          <h3 className="mb-2 font-serif text-sm font-bold leading-snug text-charcoal-900 dark:text-charcoal-100 md:text-base">
            {active.label}
          </h3>
          <MainRingResultsTable rows={active.rows} />
        </>
      ) : null}
    </section>
  )
}

interface ShowExhibition {
  id: number
  date: string
  title: string
  location: string
  rank: string
  type: string
  club: string
  judges: string[]
  url?: string
  source?: string
  reports_link?: string | null
  bis_reports_link?: string | null
  breed_catalog?: BreedCatalogRow[]
  results: ShowResultRow[]
  main_ring?: MainRingRow[]
}

function StatPill({
  value,
  label,
  className = '',
  valueClassName = '',
}: {
  value: React.ReactNode
  label: string
  className?: string
  valueClassName?: string
}) {
  return (
    <div
      className={`rounded-lg border border-old-money-200 bg-white/80 px-3 py-2 dark:border-charcoal-600 dark:bg-charcoal-800/60 ${className}`}
    >
      <div
        className={`font-serif font-bold tabular-nums leading-tight text-charcoal-900 dark:text-charcoal-100 ${valueClassName || 'text-lg md:text-xl'}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
    </div>
  )
}

function ExhibitionHeader({ exhibition, onBack }: { exhibition: ShowExhibition; onBack: () => void }) {
  const resultsCount = exhibition.results.length
  const breedsCount =
    exhibition.breed_catalog?.length ?? new Set(exhibition.results.map((r) => r.breed)).size
  const rkfUrl =
    resolveRkfOnlineExhibitionUrl(exhibition.url, exhibition.id) ??
    (exhibition.source === 'rkf-pdf' || exhibition.id >= 10_000
      ? resolveRkfOnlineExhibitionUrl(null, exhibition.id)
      : rkfExhibitionResultsUrl(exhibition.id))
  const externalLabel =
    exhibition.source === 'rkf-pdf' || exhibition.id >= 10_000
      ? 'Открыть на rkf.online'
      : 'Открыть на lc.rkfshow.ru'
  const metaLine = [exhibition.club, exhibition.rank, exhibition.type]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="relative mb-6">
      <button
        type="button"
        onClick={onBack}
        className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
        aria-label="Назад"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div className="min-w-0 rounded-xl border border-old-money-200 bg-cream-50 p-3 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="min-w-0 font-serif text-xl font-bold leading-tight tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-2xl">
            {rkfUrl ? (
              <a
                href={rkfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-camel-700 dark:hover:text-camel-400"
              >
                {exhibition.title}
              </a>
            ) : (
              exhibition.title
            )}
          </h1>
          {rkfUrl ? (
            <a
              href={rkfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-old-money-200 bg-white/90 py-1 pl-1 pr-2.5 text-xs font-semibold text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-50 hover:text-camel-800 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700 dark:hover:text-camel-300"
              aria-label={externalLabel}
              title={externalLabel}
            >
              <img
                src="/assets/rkf-online-favicon.svg"
                alt=""
                className="h-5 w-5 rounded-full"
                width={20}
                height={20}
                decoding="async"
              />
              <span>РКФ</span>
            </a>
          ) : null}
        </div>

        <BreedGroupDivider />

        <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mb-3">
          <StatPill value={exhibition.date || '—'} label="дата" />
          <StatPill value={resultsCount} label="результатов" />
          <StatPill value={breedsCount} label="пород" />
          <StatPill
            value={
              exhibition.location ? (
                <span className="line-clamp-2 text-sm leading-snug md:text-base">{exhibition.location}</span>
              ) : (
                '—'
              )
            }
            label="место"
            valueClassName="text-sm md:text-base"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {metaLine ? (
          <p className="text-sm leading-snug text-charcoal-600 dark:text-charcoal-300">{metaLine}</p>
        ) : null}
      </div>
    </div>
  )
}

function ClassResultsTable({ classes }: { classes: ClassResultGroup[] }) {
  return (
    <div className="min-w-0 w-full">
      <table className="w-full table-fixed divide-y divide-old-money-200 text-sm dark:divide-charcoal-600">
        <thead>
          <tr className="border-b border-old-money-200 dark:border-charcoal-600">
            <th className="w-[6.5rem] px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Класс
            </th>
            <th className="min-w-0 px-2.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Собака
            </th>
            <th className="w-[4.75rem] px-1.5 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Оценка
            </th>
            <th className="w-[9rem] px-2 py-2 text-left text-xs font-bold uppercase tracking-wide text-charcoal-700 dark:text-charcoal-200">
              Награды
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-old-money-100 dark:divide-charcoal-700">
          {classes.map((group) =>
            group.rows.map((row, idx) => (
              <tr
                key={`${group.className}-${row.dog_name}-${idx}`}
                className="transition-colors hover:bg-old-money-50/80 dark:hover:bg-charcoal-700/40"
              >
                {idx === 0 && (
                  <td
                    rowSpan={group.rows.length}
                    className="min-w-0 overflow-hidden align-top border-r border-old-money-100 bg-cream-100/60 px-2 py-2.5 text-xs font-semibold leading-snug text-charcoal-800 dark:border-charcoal-700 dark:bg-charcoal-800/40 dark:text-charcoal-100"
                  >
                    <span className="block break-words">{localizeShowClass(group.className)}</span>
                  </td>
                )}
                <td className="min-w-0 overflow-hidden px-2.5 py-2.5 font-medium text-charcoal-900 dark:text-charcoal-100">
                  <ExhibitionDogNameLink dogName={row.dog_name} breed={row.breed} />
                </td>
                <td className="px-1.5 py-2.5">
                  <ShowGradeChip grade={row.grade} />
                </td>
                <td className="min-w-0 overflow-hidden px-2 py-2.5 text-xs font-medium text-camel-800 dark:text-camel-300">
                  <TitleChips title={row.title} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function BreedResultsPanel({
  results,
  titles,
  breed,
}: {
  results: ShowResultRow[]
  titles?: BreedTitleRow[]
  breed: string
}) {
  const fallbackHighlights = titleHighlights(results)
  const sexSections = groupResultsBySexAndClass(results)
  const hasCatalogTitles = Array.isArray(titles)
  const titleRows = hasCatalogTitles ? titles : null

  if (results.length === 0 && !(titleRows?.length)) {
    return (
      <p className="px-2 py-3 text-sm text-old-money-500 dark:text-old-money-400">Нет результатов по этой породе</p>
    )
  }

  return (
    <div className="space-y-4 border-t border-old-money-200 px-2 pb-3 pt-3 dark:border-charcoal-600">
      {((titleRows && titleRows.length > 0) || (!hasCatalogTitles && fallbackHighlights.length > 0)) && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-old-money-600 dark:text-old-money-400">
            Титулы
          </h4>
          <ul className="space-y-1.5">
            {titleRows
              ? titleRows.map((row, idx) => (
                  <BreedTitleRowView
                    key={`${row.title_code}-${row.ring_number}-${idx}`}
                    row={row}
                    breed={breed}
                  />
                ))
              : fallbackHighlights.map((row, idx) => (
                  <li
                    key={`${row.dog_name}-${idx}`}
                    className="rounded-md bg-camel-50/80 px-2.5 py-2 text-sm dark:bg-camel-900/20"
                  >
                    <TitleChips title={row.title} />
                    <div className="mt-1 font-semibold text-charcoal-800 dark:text-charcoal-100">
                      <ExhibitionDogNameLink dogName={row.dog_name} breed={row.breed || breed} />
                    </div>
                    {row.owner ? (
                      <div className="mt-0.5 text-xs text-charcoal-500 dark:text-charcoal-400">
                        Судья: {row.owner}
                      </div>
                    ) : null}
                  </li>
                ))}
          </ul>
        </section>
      )}

      {sexSections.map((section) => (
        <section key={section.label}>
          <h4 className="mb-3 border-b border-old-money-200 pb-1.5 font-serif text-base font-bold text-charcoal-900 dark:border-charcoal-600 dark:text-charcoal-100">
            {section.label}
          </h4>
          <ClassResultsTable classes={section.classes} />
        </section>
      ))}
    </div>
  )
}

function ExhibitionAwardFilter({
  awards,
  value,
  onChange,
}: {
  awards: ShowAwardKey[]
  value: ShowAwardKey | null
  onChange: (key: ShowAwardKey | null) => void
}) {
  if (awards.length === 0) {
    return (
      <p className="text-xs text-old-money-500 dark:text-old-money-400">Нет наград в протоколе</p>
    )
  }

  const toggle = (key: ShowAwardKey) => {
    onChange(value === key ? null : key)
  }

  return (
    <div>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        Награда
      </div>
      <div className="flex flex-wrap gap-1.5">
        {awards.map((key) => (
          <ToolbarChip key={key} active={value === key} onClick={() => toggle(key)}>
            {SHOW_AWARD_BADGE[key]}
          </ToolbarChip>
        ))}
      </div>
    </div>
  )
}

function BreedAccordionItem({
  catalog,
  resultsByBreedId,
  allResults,
  searchQuery,
  awardKey = null,
  forceOpen = false,
}: {
  catalog: BreedCatalogRow
  resultsByBreedId: Map<number, ShowResultRow[]>
  allResults: ShowResultRow[]
  searchQuery: string
  awardKey?: ShowAwardKey | null
  forceOpen?: boolean
}) {
  const [open, setOpen] = useState(forceOpen)

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  const breedResults = useMemo(() => {
    if (!open) return []
    const rows =
      resultsByBreedId.get(catalog.dog_breed_id) ??
      resultsForBreed(allResults, catalog.dog_breed_id, catalog.breed_en)
    return filterBreedRowsBySearch(rows, catalog, searchQuery, awardKey)
  }, [open, catalog, resultsByBreedId, allResults, searchQuery, awardKey])

  const filteredTitles = useMemo(() => {
    const titles = catalog.titles
    if (!titles?.length) return titles
    const breedHit = breedMatchesQuery(catalog.breed, catalog.breed_en, searchQuery)
    return titles.filter((row) => {
      if (awardKey && !titleRowHasAward(row, awardKey)) return false
      if (!searchQuery.trim()) return true
      if (breedHit) return true
      return dogNameMatchesQuery(row.dog_name, searchQuery)
    })
  }, [catalog.titles, catalog.breed, catalog.breed_en, searchQuery, awardKey])

  const hasRowFilter = Boolean(searchQuery.trim() || awardKey)
  const countLabel =
    catalog.breed_count > 0 && !hasRowFilter
      ? `${catalog.breed_count} на ринге`
      : breedResults.length > 0
        ? `${breedResults.length} результатов`
        : ''

  return (
    <details
      className="group/breed rounded-lg border border-old-money-200 bg-white/70 dark:border-charcoal-600 dark:bg-charcoal-800/40"
      open={forceOpen || open}
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 marker:content-none [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className="h-4 w-4 shrink-0 text-old-money-500 transition-transform group-open/breed:rotate-90 dark:text-old-money-400"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-charcoal-900 dark:text-charcoal-100">{catalog.breed}</div>
          {catalog.breed_judge && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
              <UserRound className="h-3 w-3 shrink-0" aria-hidden />
              <span>{catalog.breed_judge}</span>
            </div>
          )}
        </div>
        {countLabel && (
          <span className="shrink-0 rounded-md bg-cream-100 px-2 py-0.5 text-xs font-medium text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
            {countLabel}
          </span>
        )}
      </summary>
      {open && (
        <BreedResultsPanel
          results={breedResults}
          titles={filteredTitles}
          breed={catalog.breed}
        />
      )}
    </details>
  )
}

function CatalogResultsSection({
  catalog,
  results,
  searchQuery,
  awardKey = null,
}: {
  catalog: BreedCatalogRow[]
  results: ShowResultRow[]
  searchQuery: string
  awardKey?: ShowAwardKey | null
}) {
  const resultsByBreedId = useMemo(() => buildResultsByBreedId(results), [results])
  const filteredCatalog = useMemo(
    () =>
      catalog.filter((entry) =>
        catalogBreedMatchesFilters(entry, searchQuery, resultsByBreedId, results, awardKey),
      ),
    [catalog, searchQuery, resultsByBreedId, results, awardKey],
  )
  const groupMap = useMemo(() => buildGroupMap(filteredCatalog), [filteredCatalog])
  const hasFciGroups = useMemo(() => catalogHasFciGroups(filteredCatalog), [filteredCatalog])
  const forceOpen = Boolean(searchQuery.trim() || awardKey)
  const autoOpenBreed = forceOpen || filteredCatalog.length === 1

  if (filteredCatalog.length === 0) {
    return (
      <p className="rounded-xl border border-old-money-200 bg-cream-50 px-4 py-6 text-center text-sm text-old-money-500 dark:border-charcoal-600 dark:bg-charcoal-800/40 dark:text-old-money-400">
        Ничего не найдено по заданным фильтрам
      </p>
    )
  }

  const breedList = (breeds: BreedCatalogRow[]) => (
    <div className="space-y-2">
      {breeds.map((breed) => (
        <BreedAccordionItem
          key={breed.dog_breed_id}
          catalog={breed}
          resultsByBreedId={resultsByBreedId}
          allResults={results}
          searchQuery={searchQuery}
          awardKey={awardKey}
          forceOpen={autoOpenBreed}
        />
      ))}
    </div>
  )

  if (!hasFciGroups) {
    return breedList(filteredCatalog)
  }

  return (
    <div className="space-y-3">
      {[...groupMap.entries()].map(([groupName, breeds]) => (
        <details
          key={groupName}
          className="group/fci rounded-xl border border-old-money-200 bg-cream-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/40"
          open={forceOpen || undefined}
        >
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
            <ChevronRight
              className="h-5 w-5 shrink-0 text-camel-600 transition-transform group-open/fci:rotate-90 dark:text-camel-400"
              aria-hidden
            />
            <h2 className="min-w-0 flex-1 font-serif text-base font-bold leading-snug text-charcoal-900 dark:text-charcoal-100 md:text-lg">
              {groupName}
            </h2>
            <span className="shrink-0 text-xs font-medium text-old-money-600 dark:text-old-money-400">
              {breeds.length} пород
            </span>
          </summary>
          <div className="space-y-2 border-t border-old-money-200 px-3 pb-3 pt-2 dark:border-charcoal-600">
            {breedList(breeds)}
          </div>
        </details>
      ))}
    </div>
  )
}

function LegacyResultsSection({
  results,
  searchQuery,
  awardKey = null,
}: {
  results: ShowResultRow[]
  searchQuery: string
  awardKey?: ShowAwardKey | null
}) {
  const filtered = useMemo(
    () => filterResultsByDogAndBreed(results, searchQuery, awardKey),
    [results, searchQuery, awardKey],
  )
  const forceOpen = Boolean(searchQuery.trim() || awardKey)

  const { byGroup, hasFciGroups } = useMemo(() => {
    const map = new Map<string, Map<string, ShowResultRow[]>>()
    const hasGroups = filtered.some((row) => Boolean(row.breed_group?.trim()))
    for (const row of filtered) {
      const groupKey = hasGroups ? row.breed_group?.trim() || 'Прочие породы' : ''
      if (!map.has(groupKey)) map.set(groupKey, new Map())
      const breeds = map.get(groupKey)!
      if (!breeds.has(row.breed)) breeds.set(row.breed, [])
      breeds.get(row.breed)!.push(row)
    }
    return { byGroup: map, hasFciGroups: hasGroups }
  }, [filtered])

  if (filtered.length === 0) {
    return (
      <p className="rounded-xl border border-old-money-200 bg-cream-50 px-4 py-6 text-center text-sm text-old-money-500 dark:border-charcoal-600 dark:bg-charcoal-800/40 dark:text-old-money-400">
        Ничего не найдено по заданным фильтрам
      </p>
    )
  }

  const renderBreeds = (breedsMap: Map<string, ShowResultRow[]>) =>
    [...breedsMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'ru'))
      .map(([breed, breedResults]) => (
        <details
          key={breed}
          className="group/breed rounded-lg border border-old-money-200 bg-white/70 dark:border-charcoal-600 dark:bg-charcoal-800/40"
          open={forceOpen || breedsMap.size === 1 || undefined}
        >
          <summary className="cursor-pointer list-none px-3 py-2 font-semibold marker:content-none">
            {breed}
          </summary>
          <BreedResultsPanel results={breedResults} breed={breed} />
        </details>
      ))

  if (!hasFciGroups) {
    const only = [...byGroup.values()][0] ?? new Map()
    return <div className="space-y-2">{renderBreeds(only)}</div>
  }

  return (
    <div className="space-y-3">
      {[...byGroup.entries()]
        .sort(([a], [b]) => a.localeCompare(b, 'ru'))
        .map(([groupName, breedsMap]) => (
          <details
            key={groupName}
            className="group/fci rounded-xl border border-old-money-200 bg-cream-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/40"
            open={forceOpen || undefined}
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
              <ChevronRight className="h-5 w-5 shrink-0 text-camel-600 transition-transform group-open/fci:rotate-90" />
              <h2 className="font-serif text-base font-bold text-charcoal-900 md:text-lg">{groupName}</h2>
            </summary>
            <div className="space-y-2 border-t border-old-money-200 px-3 pb-3 pt-2 dark:border-charcoal-600">
              {renderBreeds(breedsMap)}
            </div>
          </details>
        ))}
    </div>
  )
}

export default function ShowExhibitionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [exhibition, setExhibition] = useState<ShowExhibition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [awardKey, setAwardKey] = useState<ShowAwardKey | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('ID выставки не указан')
        setLoading(false)
        return
      }

      setLoading(true)
      const result = await getShowExhibition(id)
      if (result.success && result.data) {
        setExhibition(result.data as ShowExhibition)
        setAwardKey(null)
      } else {
        setError('Не удалось загрузить данные выставки')
      }
      setLoading(false)
    }
    void loadData()
  }, [id])

  const availableAwards = useMemo(
    () => (exhibition ? collectExhibitionAwardKeys(exhibition.results) : []),
    [exhibition]
  )

  const hasActiveFilters = Boolean(searchQuery.trim() || awardKey)
  const activeFilterChips: ActiveFilterChip[] = useMemo(() => {
    const chips: ActiveFilterChip[] = []
    if (searchQuery.trim()) {
      chips.push({ key: 'search', label: searchQuery.trim(), onRemove: () => setSearchQuery('') })
    }
    if (awardKey) {
      chips.push({
        key: 'award',
        label: SHOW_AWARD_BADGE[awardKey],
        onRemove: () => setAwardKey(null),
      })
    }
    return chips
  }, [searchQuery, awardKey])

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <div className="p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <ErrorState
            title="Выставка не найдена"
            message={error || `ID: ${id}`}
            action={
              <Link
                to="/shows?tab=ranking"
                className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:border-camel-400 hover:bg-camel-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:bg-charcoal-700"
              >
                К рейтингу выставок
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  const hasCatalog = exhibition.breed_catalog != null && exhibition.breed_catalog.length > 0

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <ExhibitionHeader exhibition={exhibition} onBack={() => navigate(-1)} />

        {exhibition.results.length > 0 || hasCatalog ? (
          <div className="mb-4">
            <PageToolbar
              bare
              trailing={<RKFAttribution />}
              activeFilterChips={activeFilterChips}
              onClearAllFilters={
                hasActiveFilters
                  ? () => {
                      setSearchQuery('')
                      setAwardKey(null)
                    }
                  : undefined
              }
              filters={
                <>
                  <ToolbarSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Кличка или порода…"
                    className="!w-auto min-w-[180px] flex-1 max-w-md"
                  />
                  {availableAwards.length > 0 ? (
                    <ToolbarFiltersDropdown
                      active={Boolean(awardKey)}
                      onReset={() => setAwardKey(null)}
                      label="Фильтры"
                    >
                      <ExhibitionAwardFilter
                        awards={availableAwards}
                        value={awardKey}
                        onChange={setAwardKey}
                      />
                    </ToolbarFiltersDropdown>
                  ) : null}
                </>
              }
            />
          </div>
        ) : null}

        <MainRingSection
          rows={exhibition.main_ring ?? []}
          bisUrl={exhibition.bis_reports_link}
        />

        {hasCatalog ? (
          <CatalogResultsSection
            catalog={exhibition.breed_catalog!}
            results={exhibition.results}
            searchQuery={searchQuery}
            awardKey={awardKey}
          />
        ) : exhibition.results.length > 0 ? (
          <LegacyResultsSection
            results={exhibition.results}
            searchQuery={searchQuery}
            awardKey={awardKey}
          />
        ) : (
          <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40">
            <div className="text-sm text-old-money-500 dark:text-old-money-400">Нет данных о результатах</div>
          </div>
        )}
      </div>
    </div>
  )
}
