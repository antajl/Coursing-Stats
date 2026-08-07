import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, UserRound } from 'lucide-react'
import ToolbarChip from '../../../components/toolbar/ToolbarChip'
import { ShowGradeChip } from '../../../lib/ShowGradeChip'
import {
  SHOW_AWARD_BADGE,
  type ShowAwardKey,
} from '../../../../../backend/lib/show-award-ranking'
import {
  buildGroupMap,
  buildResultsByBreedId,
  catalogBreedMatchesFilters,
  catalogHasFciGroups,
  dogNameMatchesQuery,
  filterBreedRowsBySearch,
  groupResultsBySexAndClass,
  localizeShowClass,
  resultsForBreed,
  titleHighlights,
  titleRowHasAward,
  breedMatchesQuery,
  type BreedCatalogRow,
  type BreedTitleRow,
  type ClassResultGroup,
  type ShowResultRow,
} from '../showExhibitionUtils'
import { TitleChips } from './TitleChips'
import { BreedTitleRowView, ExhibitionDogNameLink } from './ExhibitionDogNameLink'

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

export function BreedResultsPanel({
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

export function ExhibitionAwardFilter({
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

export function CatalogResultsSection({
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
