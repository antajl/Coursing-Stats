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

export interface DogParticipant {
  id: string
  catalogNumber: string
  dogName: string
  // Забег 1
  run1_heat: string
  run1_blanket: 'red' | 'white' | 'blue' | ''
  run1_scores: CoursingScores
  // Забег 2
  run2_heat: string
  run2_blanket: 'red' | 'white' | 'blue' | ''
  run2_scores: CoursingScores
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

export function createNewParticipant(catalogNum: number = 1): DogParticipant {
  return {
    id: 'dog_' + Math.random().toString(36).substring(2, 9),
    catalogNumber: String(catalogNum),
    dogName: '',
    run1_heat: '1',
    run1_blanket: 'red',
    run1_scores: createEmptyScores(),
    run2_heat: '1',
    run2_blanket: 'white',
    run2_scores: createEmptyScores(),
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
  startingCatalogNum: number = 1
): CategoryGroup {
  const dogs: DogParticipant[] = []
  for (let i = 0; i < initialDogsCount; i++) {
    dogs.push(createNewParticipant(startingCatalogNum + i))
  }
  return {
    id: 'cat_' + Math.random().toString(36).substring(2, 9),
    breed,
    className,
    sex,
    dogs
  }
}

export function calculateRoundSum(scores: CoursingScores): number {
  const nums = [scores.speed, scores.enthusiasm, scores.intelligence, scores.agility, scores.endurance]
  return nums.reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)
}

export function calculateTotalScore(p: DogParticipant): number {
  if (p.disqualified) return 0
  return calculateRoundSum(p.run1_scores) + calculateRoundSum(p.run2_scores)
}

export function formatCategoryTitle(cat: CategoryGroup): string {
  const sexLabel = cat.sex === 'male' ? 'Кобели' : (cat.sex === 'female' ? 'Суки' : 'Смешанный')
  return `${cat.breed} — ${cat.className} — ${sexLabel}`
}
