import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, ExternalLink, UserRound } from 'lucide-react'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import RKFAttribution from '../../components/RKFAttribution'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarChip from '../../components/toolbar/ToolbarChip'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'
import { getShowExhibition } from '../../lib/staticData'
import { TOOLBAR_CHIP, TOOLBAR_CHIP_ACTIVE, TOOLBAR_CHIP_IDLE, TOOLBAR_FILTER_PANEL } from '../../lib/toolbar'
import { titleBadgeClass } from '../../lib/qualificationTitles'
import {
  classifyCompetitionTitle,
  classifyShowCumulativeTitle,
  groupItemsByCategory,
} from '../../lib/awardCategories'
import {
  matchShowAwardToken,
  SHOW_AWARD_BADGE,
  SHOW_AWARD_CATEGORY,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import {
  buildGroupMap,
  buildResultsByBreedId,
  catalogBreedMatchesFilters,
  collectExhibitionAwardKeys,
  dogNameMatchesQuery,
  filterResultsByDogAndBreed,
  formatGradeLine,
  groupResultsBySexAndClass,
  localizeShowClass,
  resultHasAward,
  resultsForBreed,
  splitShowTitleTokens,
  splitDogNameDisplay,
  titleHighlights,
  titleRowHasAward,
  type BreedCatalogRow,
  type BreedTitleRow,
  type ClassResultGroup,
  type ShowResultRow,
} from './showExhibitionUtils'

/** Сколько наград показывать пилюлями; остальные — в выпадающем списке. */
const AWARD_PILL_CAP = 8

function classifyShowToken(token: string) {
  const key = matchShowAwardToken(token)
  if (key) return SHOW_AWARD_CATEGORY[key]
  return classifyShowCumulativeTitle(token) ?? classifyCompetitionTitle(token)
}

function TitleChips({ title }: { title: string }) {
  const tokens = splitShowTitleTokens(title)
  if (tokens.length === 0) return <span className="text-charcoal-400 dark:text-charcoal-500">—</span>
  const groups = groupItemsByCategory(tokens, classifyShowToken)
  return (
    <div className="flex flex-wrap items-center gap-1">
      {groups.map((group, gi) => (
        <span key={group.category} className="inline-flex flex-wrap items-center gap-1">
          {gi > 0 ? (
            <span
              className="mx-0.5 h-3 w-px shrink-0 self-center bg-old-money-300 dark:bg-charcoal-500"
              aria-hidden
            />
          ) : null}
          {group.items.map((token, i) => (
            <span
              key={`${token}-${i}`}
              className={`inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${titleBadgeClass(token)}`}
            >
              {token}
            </span>
          ))}
        </span>
      ))}
    </div>
  )
}

function BreedTitleRowView({ row }: { row: BreedTitleRow }) {
  return (
    <li className="rounded-md bg-camel-50/80 px-2.5 py-2 text-sm dark:bg-camel-900/20">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex rounded-md border border-camel-300 bg-white px-2 py-0.5 text-xs font-bold text-camel-800 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-300">
          {row.title_code}
        </span>
        {row.ring_number > 0 ? (
          <span className="font-mono text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
            ({row.ring_number})
          </span>
        ) : null}
        <span className="font-semibold text-charcoal-900 dark:text-charcoal-100">{row.dog_name}</span>
      </div>
      {row.owner?.trim() ? (
        <div className="mt-1 text-xs text-charcoal-500 dark:text-charcoal-400">
          Судья: {row.owner.trim()}
        </div>
      ) : null}
    </li>
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
  breed_catalog?: BreedCatalogRow[]
  results: ShowResultRow[]
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

function DetailField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium leading-snug text-charcoal-800 dark:text-charcoal-200">
        {children}
      </div>
    </div>
  )
}

function ExhibitionHeader({ exhibition, onBack }: { exhibition: ShowExhibition; onBack: () => void }) {
  const resultsCount = exhibition.results.length
  const breedsCount =
    exhibition.breed_catalog?.length ?? new Set(exhibition.results.map((r) => r.breed)).size
  const groupsCount = new Set(
    (exhibition.breed_catalog?.map((b) => b.breed_group) ??
      exhibition.results.map((r) => r.breed_group).filter(Boolean)) as string[]
  ).size
  const rkfUrl = `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${exhibition.id}`

  return (
    <div className="mb-6 rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-6">
      <div className="flex items-start gap-2 md:gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-old-money-200 bg-white/90 text-old-money-600 shadow-sm transition-colors hover:border-old-money-300 hover:bg-old-money-50 hover:text-camel-700 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-old-money-400 dark:hover:border-charcoal-500 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
          aria-label="Назад"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h1 className="min-w-0 font-serif text-xl font-bold leading-tight tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-2xl">
              <a
                href={rkfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-camel-700 dark:hover:text-camel-400"
              >
                {exhibition.title}
              </a>
            </h1>
            <a
              href={rkfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex-shrink-0 rounded-full p-1 text-old-money-400 transition-colors hover:bg-old-money-100 hover:text-camel-600 dark:text-old-money-500 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
              aria-label="Открыть на lc.rkfshow.ru"
            >
              <ExternalLink className="h-4 w-4 md:h-5 md:w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="my-4 h-px border-t border-old-money-200 dark:border-charcoal-600" />

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <StatPill value={exhibition.date || '—'} label="дата" />
        <StatPill value={resultsCount} label="результатов" />
        <StatPill value={breedsCount} label="пород" />
        <StatPill value={groupsCount || '—'} label="групп FCI" />
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

      <div className="grid gap-4 border-t border-old-money-200 pt-4 dark:border-charcoal-600 md:grid-cols-2">
        {exhibition.club && <DetailField label="Клуб-организатор">{exhibition.club}</DetailField>}
        {exhibition.rank && <DetailField label="Ранг выставки">{exhibition.rank}</DetailField>}
        {exhibition.type && <DetailField label="Тип выставки">{exhibition.type}</DetailField>}
      </div>
    </div>
  )
}

function ClassResultsTable({ classes }: { classes: ClassResultGroup[] }) {
  const placementClass = (placement: number) => {
    if (placement === 1) return 'font-bold text-camel-700 dark:text-camel-400'
    if (placement === 2 || placement === 3) return 'font-semibold text-charcoal-800 dark:text-charcoal-200'
    return 'text-charcoal-600 dark:text-charcoal-400'
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-old-money-200 bg-white/70 dark:border-charcoal-600 dark:bg-charcoal-800/30">
      <table className="w-full min-w-[640px] divide-y divide-old-money-200 text-sm dark:divide-charcoal-600">
        <thead>
          <tr className="bg-cream-50/90 dark:bg-charcoal-800/50">
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
              Класс
            </th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
              Собака
            </th>
            <th className="w-12 px-2 py-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
              Место
            </th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
              Оценка
            </th>
            <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
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
                    className="w-[9.5rem] align-top border-r border-old-money-100 bg-cream-100/60 px-3 py-2.5 text-xs font-semibold leading-snug text-charcoal-800 dark:border-charcoal-700 dark:bg-charcoal-800/40 dark:text-charcoal-100"
                  >
                    {localizeShowClass(group.className)}
                  </td>
                )}
                <td className="px-3 py-2.5 font-medium text-charcoal-900 dark:text-charcoal-100">
                  {(() => {
                    const { ring, name } = splitDogNameDisplay(row.dog_name)
                    return (
                      <>
                        {ring ? (
                          <span className="mr-1.5 font-mono text-xs tabular-nums text-charcoal-500 dark:text-charcoal-400">
                            ({ring})
                          </span>
                        ) : null}
                        <span>{name}</span>
                      </>
                    )
                  })()}
                </td>
                <td
                  className={`w-12 px-2 py-2.5 text-center tabular-nums ${placementClass(row.placement)}`}
                >
                  {row.placement > 0 ? row.placement : ''}
                </td>
                <td className="px-3 py-2.5 text-xs leading-snug text-charcoal-600 dark:text-charcoal-400">
                  {formatGradeLine(row.grade) || '—'}
                </td>
                <td className="px-3 py-2.5 text-xs font-medium text-camel-800 dark:text-camel-300">
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
}: {
  results: ShowResultRow[]
  titles?: BreedTitleRow[]
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
                  <BreedTitleRowView key={`${row.title_code}-${row.ring_number}-${idx}`} row={row} />
                ))
              : fallbackHighlights.map((row, idx) => (
                  <li
                    key={`${row.dog_name}-${idx}`}
                    className="rounded-md bg-camel-50/80 px-2.5 py-2 text-sm dark:bg-camel-900/20"
                  >
                    <TitleChips title={row.title} />
                    <div className="mt-1 font-semibold text-charcoal-800 dark:text-charcoal-100">
                      {row.dog_name}
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
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const visible = awards.slice(0, AWARD_PILL_CAP)
  const overflow = awards.slice(AWARD_PILL_CAP)
  const overflowSelected = value != null && overflow.includes(value)

  useEffect(() => {
    if (!moreOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [moreOpen])

  if (awards.length === 0) return null

  const toggle = (key: ShowAwardKey) => {
    onChange(value === key ? null : key)
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-1.5">
      {visible.map((key) => (
        <ToolbarChip key={key} active={value === key} onClick={() => toggle(key)}>
          {SHOW_AWARD_BADGE[key]}
        </ToolbarChip>
      ))}
      {overflow.length > 0 && (
        <div className="relative shrink-0" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-label="Другие награды"
            className={`${TOOLBAR_CHIP} gap-1 ${moreOpen || overflowSelected ? TOOLBAR_CHIP_ACTIVE : TOOLBAR_CHIP_IDLE}`}
          >
            {overflowSelected ? SHOW_AWARD_BADGE[value!] : 'Ещё'}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
          {moreOpen && (
            <div className={`${TOOLBAR_FILTER_PANEL} right-0 w-44`}>
              {overflow.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    toggle(key)
                    setMoreOpen(false)
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs font-medium transition-colors ${
                    value === key
                      ? 'bg-camel-50 text-camel-900 dark:bg-camel-700/40 dark:text-camel-100'
                      : 'text-charcoal-700 hover:bg-cream-50 dark:text-charcoal-200 dark:hover:bg-charcoal-700'
                  }`}
                >
                  {SHOW_AWARD_BADGE[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BreedAccordionItem({
  catalog,
  resultsByBreedId,
  allResults,
  dogQuery,
  awardKey = null,
  forceOpen = false,
}: {
  catalog: BreedCatalogRow
  resultsByBreedId: Map<number, ShowResultRow[]>
  allResults: ShowResultRow[]
  dogQuery: string
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
    return rows.filter(
      (row) =>
        dogNameMatchesQuery(row.dog_name, dogQuery) &&
        (!awardKey || resultHasAward(row, awardKey))
    )
  }, [open, catalog, resultsByBreedId, allResults, dogQuery, awardKey])

  const filteredTitles = useMemo(() => {
    const titles = catalog.titles
    if (!titles?.length) return titles
    return titles.filter(
      (row) =>
        dogNameMatchesQuery(row.dog_name, dogQuery) &&
        (!awardKey || titleRowHasAward(row, awardKey))
    )
  }, [catalog.titles, dogQuery, awardKey])

  const hasRowFilter = Boolean(dogQuery.trim() || awardKey)
  const countLabel =
    catalog.breed_count > 0 && !hasRowFilter
      ? `${catalog.breed_count} на ринге`
      : breedResults.length > 0
        ? `${breedResults.length} результатов`
        : ''

  return (
    <details
      className="group/breed rounded-lg border border-old-money-200 bg-white/60 dark:border-charcoal-600 dark:bg-charcoal-800/30"
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
      {open && <BreedResultsPanel results={breedResults} titles={filteredTitles} />}
    </details>
  )
}

function CatalogResultsSection({
  catalog,
  results,
  dogQuery,
  breedQuery,
  awardKey = null,
}: {
  catalog: BreedCatalogRow[]
  results: ShowResultRow[]
  dogQuery: string
  breedQuery: string
  awardKey?: ShowAwardKey | null
}) {
  const resultsByBreedId = useMemo(() => buildResultsByBreedId(results), [results])
  const filteredCatalog = useMemo(
    () =>
      catalog.filter((entry) =>
        catalogBreedMatchesFilters(entry, breedQuery, dogQuery, resultsByBreedId, results, awardKey)
      ),
    [catalog, breedQuery, dogQuery, resultsByBreedId, results, awardKey]
  )
  const groupMap = useMemo(() => buildGroupMap(filteredCatalog), [filteredCatalog])
  const forceOpen = Boolean(dogQuery.trim() || breedQuery.trim() || awardKey)

  if (filteredCatalog.length === 0) {
    return (
      <p className="rounded-xl border border-old-money-200 bg-cream-50 px-4 py-6 text-center text-sm text-old-money-500 dark:border-charcoal-600 dark:bg-charcoal-800/40 dark:text-old-money-400">
        Ничего не найдено по заданным фильтрам
      </p>
    )
  }

  return (
    <div className="space-y-4">
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
            {breeds.map((breed) => (
              <BreedAccordionItem
                key={breed.dog_breed_id}
                catalog={breed}
                resultsByBreedId={resultsByBreedId}
                allResults={results}
                dogQuery={dogQuery}
                awardKey={awardKey}
                forceOpen={forceOpen}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

function LegacyResultsSection({
  results,
  dogQuery,
  breedQuery,
  awardKey = null,
}: {
  results: ShowResultRow[]
  dogQuery: string
  breedQuery: string
  awardKey?: ShowAwardKey | null
}) {
  const filtered = useMemo(
    () => filterResultsByDogAndBreed(results, dogQuery, breedQuery, awardKey),
    [results, dogQuery, breedQuery, awardKey]
  )
  const forceOpen = Boolean(dogQuery.trim() || breedQuery.trim() || awardKey)

  const groupMap = useMemo(() => {
    const byGroup = new Map<string, Map<string, ShowResultRow[]>>()
    for (const row of filtered) {
      const groupKey = row.breed_group?.trim() || 'Прочие породы'
      if (!byGroup.has(groupKey)) byGroup.set(groupKey, new Map())
      const breeds = byGroup.get(groupKey)!
      if (!breeds.has(row.breed)) breeds.set(row.breed, [])
      breeds.get(row.breed)!.push(row)
    }
    return byGroup
  }, [filtered])

  if (filtered.length === 0) {
    return (
      <p className="rounded-xl border border-old-money-200 bg-cream-50 px-4 py-6 text-center text-sm text-old-money-500 dark:border-charcoal-600 dark:bg-charcoal-800/40 dark:text-old-money-400">
        Ничего не найдено по заданным фильтрам
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {[...groupMap.entries()]
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
              {[...breedsMap.entries()]
                .sort(([a], [b]) => a.localeCompare(b, 'ru'))
                .map(([breed, breedResults]) => (
                  <details
                    key={breed}
                    className="group/breed rounded-lg border border-old-money-200 bg-white/60"
                    open={forceOpen || undefined}
                  >
                    <summary className="cursor-pointer list-none px-3 py-2 font-semibold marker:content-none">
                      {breed}
                    </summary>
                    <BreedResultsPanel results={breedResults} />
                  </details>
                ))}
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
  const [dogQuery, setDogQuery] = useState('')
  const [breedQuery, setBreedQuery] = useState('')
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

  const hasActiveFilters = Boolean(dogQuery.trim() || breedQuery.trim() || awardKey)
  const activeFilterChips: ActiveFilterChip[] = useMemo(() => {
    const chips: ActiveFilterChip[] = []
    if (dogQuery.trim()) {
      chips.push({ key: 'dog', label: dogQuery.trim(), onRemove: () => setDogQuery('') })
    }
    if (breedQuery.trim()) {
      chips.push({ key: 'breed', label: breedQuery.trim(), onRemove: () => setBreedQuery('') })
    }
    if (awardKey) {
      chips.push({
        key: 'award',
        label: SHOW_AWARD_BADGE[awardKey],
        onRemove: () => setAwardKey(null),
      })
    }
    return chips
  }, [dogQuery, breedQuery, awardKey])

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
                      setDogQuery('')
                      setBreedQuery('')
                      setAwardKey(null)
                    }
                  : undefined
              }
              filters={
                <>
                  <ToolbarSearch
                    value={dogQuery}
                    onChange={setDogQuery}
                    placeholder="Кличка…"
                    className="!w-auto min-w-[160px] flex-1 max-w-xs"
                  />
                  <ToolbarSearch
                    value={breedQuery}
                    onChange={setBreedQuery}
                    placeholder="Порода…"
                    className="!w-auto min-w-[160px] flex-1 max-w-xs"
                  />
                  <ExhibitionAwardFilter
                    awards={availableAwards}
                    value={awardKey}
                    onChange={setAwardKey}
                  />
                </>
              }
            />
          </div>
        ) : null}

        {hasCatalog ? (
          <CatalogResultsSection
            catalog={exhibition.breed_catalog!}
            results={exhibition.results}
            dogQuery={dogQuery}
            breedQuery={breedQuery}
            awardKey={awardKey}
          />
        ) : exhibition.results.length > 0 ? (
          <LegacyResultsSection
            results={exhibition.results}
            dogQuery={dogQuery}
            breedQuery={breedQuery}
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
