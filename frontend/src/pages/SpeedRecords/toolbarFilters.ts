import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'

export function buildSpeedActiveFilterChips(
  searchQuery: string,
  filterYears: string[],
  filterBreeds: string[],
  filterSexes: string[],
  onSearchChange: (value: string) => void,
  onToggleFilter: (type: string, value: string) => void
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  for (const year of filterYears) {
    chips.push({
      key: `year-${year}`,
      label: year,
      onRemove: () => onToggleFilter('year', year),
    })
  }

  for (const breed of filterBreeds) {
    chips.push({
      key: `breed-${breed}`,
      label: breed,
      onRemove: () => onToggleFilter('breed', breed),
    })
  }

  for (const sex of filterSexes) {
    chips.push({
      key: `sex-${sex}`,
      label: sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex,
      onRemove: () => onToggleFilter('sex', sex),
    })
  }

  return chips
}

export function buildCoursingActiveFilterChips(
  searchQuery: string,
  filterYears: string[],
  filterBreeds: string[],
  onSearchChange: (value: string) => void,
  onToggleFilter: (type: string, value: string) => void
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  for (const year of filterYears) {
    chips.push({
      key: `year-${year}`,
      label: year,
      onRemove: () => onToggleFilter('year', year),
    })
  }

  for (const breed of filterBreeds) {
    chips.push({
      key: `breed-${breed}`,
      label: breed,
      onRemove: () => onToggleFilter('breed', breed),
    })
  }

  return chips
}

export function buildSpeedStatsActiveFilterChips(
  searchQuery: string,
  filterYears: string[],
  filterBreeds: string[],
  filterSexes: string[],
  filterMinSpeed: string,
  filterMaxSpeed: string,
  onSearchChange: (value: string) => void,
  onToggleYear: (year: string) => void,
  onToggleBreed: (breed: string) => void,
  onToggleSex: (sex: string) => void,
  onMinSpeedChange: (value: string) => void,
  onMaxSpeedChange: (value: string) => void
): ActiveFilterChip[] {
  const chips = buildSpeedActiveFilterChips(searchQuery, filterYears, filterBreeds, filterSexes, onSearchChange, (type, value) => {
    if (type === 'year') onToggleYear(value)
    if (type === 'breed') onToggleBreed(value)
    if (type === 'sex') onToggleSex(value)
  })

  if (filterMinSpeed.trim()) {
    chips.push({ key: 'min-speed', label: `от ${filterMinSpeed} км/ч`, onRemove: () => onMinSpeedChange('') })
  }
  if (filterMaxSpeed.trim()) {
    chips.push({ key: 'max-speed', label: `до ${filterMaxSpeed} км/ч`, onRemove: () => onMaxSpeedChange('') })
  }
  return chips
}

export function buildCoursingStatsActiveFilterChips(
  searchQuery: string,
  filterYears: string[],
  filterBreeds: string[],
  filterMinTime: string,
  filterMaxTime: string,
  onSearchChange: (value: string) => void,
  onToggleYear: (year: string) => void,
  onToggleBreed: (breed: string) => void,
  onMinTimeChange: (value: string) => void,
  onMaxTimeChange: (value: string) => void
): ActiveFilterChip[] {
  const chips = buildCoursingActiveFilterChips(searchQuery, filterYears, filterBreeds, onSearchChange, (type, value) => {
    if (type === 'year') onToggleYear(value)
    if (type === 'breed') onToggleBreed(value)
  })

  if (filterMinTime.trim()) {
    chips.push({ key: 'min-time', label: `от ${filterMinTime} с`, onRemove: () => onMinTimeChange('') })
  }
  if (filterMaxTime.trim()) {
    chips.push({ key: 'max-time', label: `до ${filterMaxTime} с`, onRemove: () => onMaxTimeChange('') })
  }
  return chips
}

export function buildTopDogsActiveFilterChips(
  searchQuery: string,
  filterYear: string,
  filterBreed: string,
  filterMinStarts: string,
  filterScoreFrom: string,
  filterSpeedFrom: string,
  onSearchChange: (value: string) => void,
  onYearChange: (value: string) => void,
  onBreedChange: (value: string) => void,
  onMinStartsChange: (value: string) => void,
  onScoreFromChange: (value: string) => void,
  onSpeedFromChange: (value: string) => void
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []

  if (filterYear) {
    chips.push({ key: 'year', label: filterYear, onRemove: () => onYearChange('') })
  }
  if (filterBreed) {
    chips.push({ key: 'breed', label: filterBreed, onRemove: () => onBreedChange('') })
  }
  if (filterMinStarts) {
    chips.push({ key: 'min-starts', label: `от ${filterMinStarts} стартов`, onRemove: () => onMinStartsChange('') })
  }
  if (filterScoreFrom) {
    chips.push({ key: 'min-score', label: `индекс CS от ${filterScoreFrom}`, onRemove: () => onScoreFromChange('') })
  }
  if (filterSpeedFrom) {
    chips.push({ key: 'min-speed', label: `от ${filterSpeedFrom} км/ч`, onRemove: () => onSpeedFromChange('') })
  }
  return chips
}

export function buildJudgesActiveFilterChips(
  searchQuery: string,
  filterYear: string,
  filterBreed: string,
  filterDiscipline: string,
  onSearchChange: (value: string) => void,
  onYearChange: (value: string) => void,
  onBreedChange: (value: string) => void,
  onDisciplineChange: (value: string) => void
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = []
  if (filterYear) {
    chips.push({ key: 'year', label: filterYear, onRemove: () => onYearChange('') })
  }
  if (filterBreed) {
    chips.push({ key: 'breed', label: filterBreed, onRemove: () => onBreedChange('') })
  }
  if (filterDiscipline) {
    const labels: Record<string, string> = { coursing: 'Курсинг', bzmp: 'БЗМП', racing: 'Бега' }
    chips.push({
      key: 'discipline',
      label: labels[filterDiscipline] ?? filterDiscipline,
      onRemove: () => onDisciplineChange(''),
    })
  }
  return chips
}
