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
  // Забеги для курсинга (динамический массив: 1, 2, 3 забега)
  runs: RunData[]
  // Для рейсинга
  racing_box: string
  racing_time1: string
  racing_time2: string
  racing_final_time: string
  // Итог
  disqualified: boolean
  comment: string
  awards: string[]
}

export interface CategoryGroup {
  id: string
  breed: string
  className: string
  sex: 'male' | 'female' | 'mixed'
  // Количество забегов в категории: по умолчанию 1, можно включить 2 и 3
  runsCount: 1 | 2 | 3
  dogs: DogParticipant[]
}

export function createEmptyScores(): CoursingScores {
  return {
    speed: '',
    enthusiasm: '',
    intelligence: '',
    agility: '',
    endurance: ''
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
    reason
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
    awards: []
  }
}

export function createNewCategory(
  breed: string = 'Басенджи',
  className: string = 'Стандартный',
  sex: 'male' | 'female' | 'mixed' = 'male',
  initialDogsCount: number = 2,
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
    dogs
  }
}

export function calculateRoundSum(scores: CoursingScores): number {
  const nums = [scores.speed, scores.enthusiasm, scores.intelligence, scores.agility, scores.endurance]
  return nums.reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)
}

export function hasRoundScores(scores: CoursingScores): boolean {
  if (!scores) return false
  const nums = [scores.speed, scores.enthusiasm, scores.intelligence, scores.agility, scores.endurance]
  return nums.some(v => typeof v === 'number')
}

export function calculateTotalScore(p: DogParticipant, runsCount: number = 1): number {
  if (p.disqualified) return 0
  let total = 0
  const activeRuns = p.runs.slice(0, runsCount)
  for (const r of activeRuns) {
    if (!r.status || r.status === 'normal') {
      total += calculateRoundSum(r.scores)
    }
  }
  return total
}

export interface DogOverallStatus {
  type: 'normal' | 'withdrawn' | 'absent' | 'disqualified'
  label: string
  reason?: string
}

export function getDogOverallStatus(p: DogParticipant, runsCount: number = 1): DogOverallStatus {
  if (p.disqualified) {
    return { type: 'disqualified', label: 'ДИСКВ.', reason: p.comment || '' }
  }

  const activeRuns = p.runs.slice(0, runsCount)
  if (activeRuns.length === 0) {
    return { type: 'normal', label: '0' }
  }

  // Если все забеги неявка
  if (activeRuns.every(r => r.status === 'absent')) {
    return { type: 'absent', label: 'НЕЯВКА' }
  }

  // Если была дисквалификация в каком-то забеге
  const withdrawnRun = activeRuns.find(r => r.status === 'withdrawn')
  if (withdrawnRun) {
    return {
      type: 'withdrawn',
      label: 'ДИСКВ.',
      reason: withdrawnRun.reason || p.comment || ''
    }
  }

  // Если неявка в каком-то забеге
  const absentRun = activeRuns.find(r => r.status === 'absent')
  if (absentRun) {
    return { type: 'absent', label: 'НЕЯВКА' }
  }

  return { type: 'normal', label: String(calculateTotalScore(p, runsCount)) }
}

export function formatCategoryTitle(cat: CategoryGroup): string {
  const sexLabel = cat.sex === 'male' ? 'Кобели' : (cat.sex === 'female' ? 'Суки' : 'Микс')
  return `${cat.breed} — ${cat.className} — ${sexLabel}`
}
