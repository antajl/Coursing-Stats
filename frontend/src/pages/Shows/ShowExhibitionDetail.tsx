import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ExternalLink, UserRound } from 'lucide-react'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import { getShowExhibition } from '../../lib/staticData'
import {
  buildGroupMap,
  buildResultsByBreedId,
  formatBreedTitleLine,
  formatGradeLine,
  formatTitleLine,
  groupResultsBySexAndClass,
  localizeShowClass,
  resultsForBreed,
  titleHighlights,
  type BreedCatalogRow,
  type BreedTitleRow,
  type ClassResultGroup,
  type ShowResultRow,
} from './showExhibitionUtils'

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
        {exhibition.judges && exhibition.judges.length > 0 && (
          <DetailField label="Судьи (Specialty)">{exhibition.judges.join(', ')}</DetailField>
        )}
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
                <td className="px-3 py-2.5 font-medium text-charcoal-900 dark:text-charcoal-100">{row.dog_name}</td>
                <td
                  className={`w-12 px-2 py-2.5 text-center tabular-nums ${placementClass(row.placement)}`}
                >
                  {row.placement > 0 ? row.placement : ''}
                </td>
                <td className="px-3 py-2.5 text-xs leading-snug text-charcoal-600 dark:text-charcoal-400">
                  {formatGradeLine(row.grade) || '—'}
                </td>
                <td className="px-3 py-2.5 text-xs font-medium text-camel-800 dark:text-camel-300">
                  {formatTitleLine(row.title)}
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
  const titleRows = titles?.length ? titles : null

  if (results.length === 0 && !titleRows?.length) {
    return (
      <p className="px-2 py-3 text-sm text-old-money-500 dark:text-old-money-400">Нет результатов по этой породе</p>
    )
  }

  return (
    <div className="space-y-4 border-t border-old-money-200 px-2 pb-3 pt-3 dark:border-charcoal-600">
      {(titleRows?.length || fallbackHighlights.length > 0) && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-old-money-600 dark:text-old-money-400">
            Титулы
          </h4>
          <ul className="space-y-1.5">
            {titleRows
              ? titleRows.map((row, idx) => (
                  <li
                    key={`${row.title_code}-${row.ring_number}-${idx}`}
                    className="rounded-md bg-camel-50/80 px-2.5 py-1.5 text-sm font-medium text-charcoal-800 dark:bg-camel-900/20 dark:text-charcoal-100"
                  >
                    {formatBreedTitleLine(row)}
                  </li>
                ))
              : fallbackHighlights.map((row, idx) => (
                  <li
                    key={`${row.dog_name}-${idx}`}
                    className="rounded-md bg-camel-50/80 px-2.5 py-1.5 text-sm dark:bg-camel-900/20"
                  >
                    <span className="font-medium text-camel-800 dark:text-camel-300">{formatTitleLine(row.title)}</span>
                    <span className="text-charcoal-700 dark:text-charcoal-300"> · {row.dog_name}</span>
                    {row.owner && (
                      <span className="text-charcoal-500 dark:text-charcoal-400"> · {row.owner}</span>
                    )}
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

function BreedAccordionItem({
  catalog,
  resultsByBreedId,
  allResults,
}: {
  catalog: BreedCatalogRow
  resultsByBreedId: Map<number, ShowResultRow[]>
  allResults: ShowResultRow[]
}) {
  const [open, setOpen] = useState(false)

  const breedResults = useMemo(() => {
    if (!open) return []
    return (
      resultsByBreedId.get(catalog.dog_breed_id) ??
      resultsForBreed(allResults, catalog.dog_breed_id, catalog.breed_en)
    )
  }, [open, catalog, resultsByBreedId, allResults])

  const countLabel =
    catalog.breed_count > 0
      ? `${catalog.breed_count} на ринге`
      : breedResults.length > 0
        ? `${breedResults.length} результатов`
        : ''

  return (
    <details
      className="group/breed rounded-lg border border-old-money-200 bg-white/60 dark:border-charcoal-600 dark:bg-charcoal-800/30"
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
      {open && <BreedResultsPanel results={breedResults} titles={catalog.titles} />}
    </details>
  )
}

function CatalogResultsSection({
  catalog,
  results,
}: {
  catalog: BreedCatalogRow[]
  results: ShowResultRow[]
}) {
  const groupMap = useMemo(() => buildGroupMap(catalog), [catalog])
  const resultsByBreedId = useMemo(() => buildResultsByBreedId(results), [results])

  return (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-600 dark:text-charcoal-400">
        Выберите группу FCI, затем породу — как на сайте РКФ. Результаты показываются при раскрытии.
      </p>
      {[...groupMap.entries()].map(([groupName, breeds]) => (
        <details
          key={groupName}
          className="group/fci rounded-xl border border-old-money-200 bg-cream-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/40"
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
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  )
}

function LegacyResultsSection({ results }: { results: ShowResultRow[] }) {
  const groupMap = useMemo(() => {
    const byGroup = new Map<string, Map<string, ShowResultRow[]>>()
    for (const row of results) {
      const groupKey = row.breed_group?.trim() || 'Прочие породы'
      if (!byGroup.has(groupKey)) byGroup.set(groupKey, new Map())
      const breeds = byGroup.get(groupKey)!
      if (!breeds.has(row.breed)) breeds.set(row.breed, [])
      breeds.get(row.breed)!.push(row)
    }
    return byGroup
  }, [results])

  return (
    <div className="space-y-4">
      {[...groupMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b, 'ru'))
        .map(([groupName, breedsMap]) => (
          <details
            key={groupName}
            className="group/fci rounded-xl border border-old-money-200 bg-cream-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/40"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden">
              <ChevronRight className="h-5 w-5 shrink-0 text-camel-600 transition-transform group-open/fci:rotate-90" />
              <h2 className="font-serif text-base font-bold text-charcoal-900 md:text-lg">{groupName}</h2>
            </summary>
            <div className="space-y-2 border-t border-old-money-200 px-3 pb-3 pt-2 dark:border-charcoal-600">
              {[...breedsMap.entries()]
                .sort(([a], [b]) => a.localeCompare(b, 'ru'))
                .map(([breed, breedResults]) => (
                  <details key={breed} className="group/breed rounded-lg border border-old-money-200 bg-white/60">
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
      } else {
        setError('Не удалось загрузить данные выставки')
      }
      setLoading(false)
    }
    void loadData()
  }, [id])

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
                to="/shows?tab=calendar"
                className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:border-camel-400 hover:bg-camel-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:bg-charcoal-700"
              >
                Вернуться к календарю
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
        {hasCatalog ? (
          <CatalogResultsSection catalog={exhibition.breed_catalog!} results={exhibition.results} />
        ) : exhibition.results.length > 0 ? (
          <LegacyResultsSection results={exhibition.results} />
        ) : (
          <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40">
            <div className="text-sm text-old-money-500 dark:text-old-money-400">Нет данных о результатах</div>
          </div>
        )}
      </div>
    </div>
  )
}
