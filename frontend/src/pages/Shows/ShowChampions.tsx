import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import SkeletonLoader from '../../components/SkeletonLoader'
import { getShowDogRanking } from '../../lib/staticData'
import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'
import type { ShowDogCardData } from './ShowDogCard'
import {
  TOOLBAR_FILTER_CHECKBOX_ROW,
  TOOLBAR_FILTER_SECTION_LABEL,
} from '../../lib/toolbar'
import {
  SHOW_AWARD_LABELS,
  SHOW_AWARD_ORDER,
  type ShowAwardKey,
  type ShowTitleCounts,
} from '../../../../backend/lib/show-award-ranking'

interface ChampionSection {
  award: ShowAwardKey
  label: string
  description: string
  dogs: ShowDogCardData[]
}

function ChampionCard({ dog, rank }: { dog: ShowDogCardData; rank: number }) {
  const awardKeys = SHOW_AWARD_ORDER.filter((key) => dog.titles[key] > 0)

  return (
    <Link to={`/shows/dog/${dog.id}/${encodeURIComponent(dog.breed)}`} className="block">
      <article className="flex gap-3 rounded-xl border border-cream-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-camel-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:hover:border-camel-600 sm:gap-4 sm:p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-camel-200 text-camel-900 ring-2 ring-camel-400 dark:bg-camel-800 dark:text-camel-100 dark:ring-camel-500 text-sm font-bold tabular-nums">
          {rank}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-charcoal-900 dark:text-charcoal-100 sm:text-base">
              {dog.name_lat}
            </h3>
            {dog.name_ru && (
              <p className="truncate text-xs text-charcoal-500 dark:text-charcoal-400 sm:text-sm">
                {dog.name_ru}
              </p>
            )}
            <span className="mt-1 inline-block max-w-full truncate rounded-md bg-cream-100 px-1.5 py-0.5 text-[10px] font-medium text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300">
              {dog.breed}
            </span>
          </div>

          <p className="text-[11px] leading-snug text-charcoal-500 dark:text-charcoal-400">
            <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-300">
              {dog.total_shows}
            </span>{' '}
            {dog.total_shows === 1 ? 'выставка' : dog.total_shows < 5 ? 'выставки' : 'выставок'}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center gap-1.5">
          <div className="flex max-w-[11rem] flex-wrap justify-end gap-1.5 sm:max-w-none">
            {awardKeys.length > 0 ? (
              awardKeys.map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md bg-camel-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-camel-800 dark:bg-camel-900/20 dark:text-camel-300"
                >
                  {key}
                  <span className="text-[11px] font-bold opacity-80">×{dog.titles[key]}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-charcoal-400 dark:text-charcoal-500">—</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

function ChampionSection({ section }: { section: ChampionSection }) {
  if (section.dogs.length === 0) {
    return (
      <div className="rounded-xl border border-old-money-200 bg-cream-50 p-6 dark:border-charcoal-600 dark:bg-charcoal-800/40">
        <p className="text-sm text-old-money-500 dark:text-old-money-400">
          Нет чемпионов в категории {section.label}
        </p>
      </div>
    )
  }

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-serif text-xl font-bold text-charcoal-900 dark:text-charcoal-100">
          {section.label}
        </h2>
        <span className="rounded-full bg-camel-100 px-3 py-1 text-xs font-semibold text-camel-800 dark:bg-camel-900/30 dark:text-camel-300">
          {section.dogs.length}
        </span>
      </div>
      <p className="mb-4 text-sm text-charcoal-600 dark:text-charcoal-400">
        {section.description}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {section.dogs.slice(0, 6).map((dog, index) => (
          <ChampionCard key={`${dog.id}-${dog.breed}`} dog={dog} rank={index + 1} />
        ))}
      </div>
      {section.dogs.length > 6 && (
        <div className="mt-4 text-center">
          <Link
            to={`/shows/ranking?search=${encodeURIComponent(section.award)}`}
            className="text-sm font-medium text-camel-700 underline dark:text-camel-400"
          >
            Показать всех ({section.dogs.length})
          </Link>
        </div>
      )}
    </section>
  )
}

export default function ShowChampions() {
  const [loading, setLoading] = useState(true)
  const [allDogs, setAllDogs] = useState<ShowDogCardData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterBreed, setFilterBreed] = useState('')
  const [filterGroup, setFilterGroup] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getShowDogRanking(filterYear)
      if (result.success && result.data) {
        setAllDogs(result.data)
      }
      setLoading(false)
    }
    loadData()
  }, [filterYear])

  const breeds = useMemo(() => Array.from(new Set(allDogs.map((d) => d.breed))).sort(), [allDogs])
  const years = ['2017', '2018', '2019', '2021', '2022', '2023', '2024', '2025', '2026']
  const groups = useMemo(
    () => Array.from(new Set(allDogs.map((d) => d.breed_group).filter(Boolean) as string[])).sort(),
    [allDogs]
  )

  const filteredDogs = useMemo(() => {
    return allDogs.filter((dog) => {
      if (filterBreed && dog.breed !== filterBreed) return false
      if (filterGroup && dog.breed_group !== filterGroup) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const nameMatch =
          dog.name_lat.toLowerCase().includes(query) ||
          (dog.name_ru && dog.name_ru.toLowerCase().includes(query))
        const breedMatch = dog.breed.toLowerCase().includes(query)
        if (!nameMatch && !breedMatch) return false
      }
      return true
    })
  }, [allDogs, filterBreed, filterGroup, searchQuery])

  const championSections = useMemo(() => {
    const sections: ChampionSection[] = []

    const awardConfigs: { award: ShowAwardKey; label: string; description: string }[] = [
      {
        award: 'BIS',
        label: 'Чемпионы BIS',
        description: 'Лучшие в выставке (Best in Show) — высшая награда',
      },
      {
        award: 'BOB',
        label: 'Чемпионы пород',
        description: 'Лучшие представителя породы (Best of Breed)',
      },
      {
        award: 'CACIB',
        label: 'Чемпионы CACIB',
        description: 'Кандидаты в чемпионы международного класса',
      },
      {
        award: 'CAC',
        label: 'Чемпионы CAC',
        description: 'Кандидаты в чемпионы национального класса',
      },
    ]

    for (const config of awardConfigs) {
      const dogsWithAward = filteredDogs.filter((dog) => dog.titles[config.award] > 0)
      if (dogsWithAward.length > 0) {
        sections.push({
          award: config.award,
          label: config.label,
          description: config.description,
          dogs: dogsWithAward.sort((a, b) => (b.titles[config.award] || 0) - (a.titles[config.award] || 0)),
        })
      }
    }

    return sections
  }, [filteredDogs])

  const activeFilterChips: ActiveFilterChip[] = []
  if (searchQuery) {
    activeFilterChips.push({ key: 'search', label: searchQuery, onRemove: () => setSearchQuery('') })
  }
  if (filterYear) {
    activeFilterChips.push({ key: 'year', label: filterYear, onRemove: () => setFilterYear('') })
  }
  if (filterBreed) {
    activeFilterChips.push({ key: 'breed', label: filterBreed, onRemove: () => setFilterBreed('') })
  }
  if (filterGroup) {
    activeFilterChips.push({ key: 'group', label: filterGroup, onRemove: () => setFilterGroup('') })
  }

  const hasPanelFilters = Boolean(filterYear || filterBreed || filterGroup)

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterYear('')
    setFilterBreed('')
    setFilterGroup('')
  }

  const handleResetPanelFilters = () => {
    setFilterYear('')
    setFilterBreed('')
    setFilterGroup('')
  }

  const handleYearToggle = (year: string) => {
    setFilterYear(filterYear === year ? '' : year)
  }

  const handleBreedToggle = (breed: string) => {
    setFilterBreed(filterBreed === breed ? '' : breed)
  }

  const handleGroupToggle = (group: string) => {
    setFilterGroup(filterGroup === group ? '' : group)
  }

  if (loading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <SkeletonLoader variant="card" count={6} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <PageToolbar
        bare
        activeFilterChips={activeFilterChips}
        onClearAllFilters={activeFilterChips.length > 0 ? handleResetFilters : undefined}
        filters={
          <>
            <ToolbarSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Кличка, порода…"
              className="!w-auto min-w-[200px] flex-1 max-w-lg"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              <ToolbarFiltersDropdown
                active={hasPanelFilters}
                onReset={handleResetPanelFilters}
                label="Фильтры"
              >
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Год</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {years.map((year) => (
                      <label key={year} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterYear === year}
                          onChange={() => handleYearToggle(year)}
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Порода</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {breeds.map((breed) => (
                      <label key={breed} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterBreed === breed}
                          onChange={() => handleBreedToggle(breed)}
                        />
                        <span className="truncate">{breed}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className={TOOLBAR_FILTER_SECTION_LABEL}>Группа FCI</p>
                  <div className="max-h-36 space-y-0.5 overflow-y-auto">
                    {groups.map((group) => (
                      <label key={group} className={TOOLBAR_FILTER_CHECKBOX_ROW}>
                        <input
                          type="checkbox"
                          checked={filterGroup === group}
                          onChange={() => handleGroupToggle(group)}
                        />
                        <span className="truncate">{group}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </ToolbarFiltersDropdown>
            </div>
          </>
        }
      />

      {championSections.length === 0 ? (
        <div className="rounded-xl border border-old-money-200 bg-cream-50 p-6 dark:border-charcoal-600 dark:bg-charcoal-800/40">
          <p className="text-sm text-old-money-500 dark:text-old-money-400">
            Нет данных о чемпионах. Попробуйте изменить фильтры.
          </p>
        </div>
      ) : (
        championSections.map((section) => <ChampionSection key={section.award} section={section} />)
      )}
    </div>
  )
}
