export type CompetitionKind = 'coursing' | 'racing' | 'bzmp'

export interface CompetitionHeader {
  title: string
  rank: string
  date: string
  location: string
  club: string
  judges: string
}

export interface CoursingScores {
  speed: number | ''
  enthusiasm: number | ''
  intelligence: number | ''
  agility: number | ''
  endurance: number | ''
}

export interface CoursingCriterionMeta {
  key: keyof CoursingScores
  short: 'М' | 'Р' | 'В' | 'П' | 'Э'
  label: string
  csvShort: string
}

/** Canonical FCI/RKF order matching protocol tables and dog analytics */
export const COURSING_CRITERIA_META: readonly CoursingCriterionMeta[] = [
  { key: 'agility', short: 'М', label: 'Маневренность', csvShort: 'Ман' },
  { key: 'speed', short: 'Р', label: 'Резвость', csvShort: 'Резв' },
  { key: 'endurance', short: 'В', label: 'Выносливость', csvShort: 'Вын' },
  { key: 'intelligence', short: 'П', label: 'Преследование', csvShort: 'Преслед' },
  { key: 'enthusiasm', short: 'Э', label: 'Энтузиазм', csvShort: 'Энт' },
]

export type RunStatus = 'normal' | 'withdrawn' | 'absent'

export interface RunData {
  heat: string
  blanket: 'red' | 'white' | 'blue' | ''
  scores: CoursingScores
  status?: RunStatus
  reason?: string
}

export interface DogParticipant {
  id: string
  catalogNumber: string
  dogName: string
  sex: 'male' | 'female' | ''
  runs: RunData[]
  racing_box: string
  racing_time1: string
  racing_time2: string
  racing_final_time: string
  disqualified: boolean
  comment: string
  awards: string[]
}

export interface CategoryGroup {
  id: string
  breed: string
  className: string
  sex: 'male' | 'female' | 'mixed'
  runsCount: 1 | 2 | 3
  dogs: DogParticipant[]
}

export function createEmptyScores(): CoursingScores {
  return {
    speed: '',
    enthusiasm: '',
    intelligence: '',
    agility: '',
    endurance: '',
  }
}

export function createRunData(
  heat = '1',
  blanket: 'red' | 'white' | 'blue' | '' = 'red',
  status: RunStatus = 'normal',
  reason = ''
): RunData {
  return {
    heat,
    blanket,
    scores: createEmptyScores(),
    status,
    reason,
  }
}

export function createNewParticipant(catalogNum: number = 1, runsCount = 1): DogParticipant {
  const blankets: Array<'red' | 'white' | 'blue'> = ['red', 'white', 'blue']
  const runs: RunData[] = []
  for (let r = 0; r < runsCount; r++) {
    runs.push(createRunData('1', blankets[r % 3]))
  }

  return {
    id: 'dog_' + Math.random().toString(36).substring(2, 9),
    catalogNumber: String(catalogNum),
    dogName: '',
    sex: 'male',
    runs,
    racing_box: '1',
    racing_time1: '',
    racing_time2: '',
    racing_final_time: '',
    disqualified: false,
    comment: '',
    awards: [],
  }
}

export function createNewCategory(
  breed: string = 'Уиппет',
  className: string = 'Стандартный',
  sex: 'male' | 'female' | 'mixed' = 'male',
  initialDogsCount: number = 1,
  startingCatalogNum: number = 1,
  runsCount: 1 | 2 | 3 = 2
): CategoryGroup {
  const dogs: DogParticipant[] = []
  for (let i = 0; i < initialDogsCount; i++) {
    dogs.push(createNewParticipant(startingCatalogNum + i, runsCount))
  }
  return {
    id: 'cat_' + Math.random().toString(36).substring(2, 9),
    breed,
    className,
    sex,
    runsCount,
    dogs,
  }
}

export function getCanonicalScoreValues(scores?: CoursingScores | null): Array<number | ''> {
  if (!scores) return ['', '', '', '', '']
  return COURSING_CRITERIA_META.map((c) => scores[c.key])
}

export function calculateRoundSum(scores?: CoursingScores | null): number {
  if (!scores) return 0
  return COURSING_CRITERIA_META.reduce<number>((acc, c) => {
    const v = scores[c.key]
    return acc + (typeof v === 'number' ? v : 0)
  }, 0)
}

export function hasRoundScores(scores?: CoursingScores | null): boolean {
  if (!scores) return false
  return COURSING_CRITERIA_META.some((c) => typeof scores[c.key] === 'number')
}

export function calculateTotalScore(p?: DogParticipant | null, runsCount: number = 1): number {
  if (!p || p.disqualified) return 0
  let total = 0
  const activeRuns = (p.runs || []).slice(0, runsCount)
  for (const r of activeRuns) {
    if (!r?.status || r.status === 'normal') {
      total += calculateRoundSum(r?.scores)
    }
  }
  return total
}

export interface DogOverallStatus {
  type: 'normal' | 'withdrawn' | 'absent' | 'disqualified'
  label: string
  reason?: string
}

export function getDogOverallStatus(p?: DogParticipant | null, runsCount: number = 1): DogOverallStatus {
  if (!p) {
    return { type: 'normal', label: '0' }
  }
  if (p.disqualified) {
    return { type: 'disqualified', label: 'Дискв.', reason: p.comment || '' }
  }

  const activeRuns = (p.runs || []).slice(0, runsCount)
  if (activeRuns.length === 0) {
    return { type: 'normal', label: '0' }
  }

  if (activeRuns.every((r) => r?.status === 'absent')) {
    return { type: 'absent', label: 'Неявка' }
  }

  const withdrawnRun = activeRuns.find((r) => r?.status === 'withdrawn')
  if (withdrawnRun) {
    return {
      type: 'withdrawn',
      label: 'Дискв.',
      reason: withdrawnRun.reason || p.comment || '',
    }
  }

  const absentRun = activeRuns.find((r) => r?.status === 'absent')
  if (absentRun) {
    return { type: 'absent', label: 'Неявка' }
  }

  return { type: 'normal', label: String(calculateTotalScore(p, runsCount)) }
}

export function sortCategoryDogsForReport(dogs: DogParticipant[], runsCount: number): DogParticipant[] {
  return [...(dogs || [])].sort((a, b) => {
    const statusA = getDogOverallStatus(a, runsCount)
    const statusB = getDogOverallStatus(b, runsCount)
    const isFinA = statusA.type === 'normal'
    const isFinB = statusB.type === 'normal'
    if (isFinA && !isFinB) return -1
    if (!isFinA && isFinB) return 1
    if (!isFinA && !isFinB) {
      if (statusA.type === 'withdrawn' && statusB.type === 'absent') return -1
      if (statusA.type === 'absent' && statusB.type === 'withdrawn') return 1
      return 0
    }
    return calculateTotalScore(b, runsCount) - calculateTotalScore(a, runsCount)
  })
}

export function formatCategoryTitle(cat: CategoryGroup): string {
  const sexLabel = cat.sex === 'male' ? 'Кобели' : cat.sex === 'female' ? 'Суки' : 'Микс'
  return `${cat.breed} — ${cat.className} — ${sexLabel}`
}

export function normalizeDogNameKey(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function findDuplicateDogNames(categories: CategoryGroup[]): Set<string> {
  const counts = new Map<string, number>()
  for (const cat of categories) {
    for (const dog of cat.dogs) {
      const key = normalizeDogNameKey(dog.dogName)
      if (!key) continue
      counts.set(key, (counts.get(key) || 0) + 1)
    }
  }
  const dupes = new Set<string>()
  for (const [k, count] of counts.entries()) {
    if (count > 1) dupes.add(k)
  }
  return dupes
}

export interface ActiveRunMenuState {
  catId: string
  dogId: string
  rIdx: number
  rect: { top: number; bottom: number; left: number; right: number }
}

export interface ActiveSearchDogState {
  catId: string
  dogId: string
  rect: { top: number; bottom: number; left: number; width: number }
}

export interface ActiveAwardsMenuState {
  catId: string
  dogId: string
  rect: { top: number; bottom: number; left: number; right: number; width: number }
}

export interface ActiveCategoryMenuState {
  catId: string
  rect: { top: number; bottom: number; left: number; right: number; width: number }
}

export interface ActiveDogSexMenuState {
  catId: string
  dogId: string
  rect: { top: number; bottom: number; left: number; right: number; width: number }
}
