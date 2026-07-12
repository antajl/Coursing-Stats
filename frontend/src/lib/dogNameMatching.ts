/**
 * Утилиты для сопоставления собак между shows и competitions
 */

export function normalizeDogName(name: string): string {
  return name
    .toUpperCase()
    .replace(/['"`\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeBreedName(breed: string): string {
  return breed
    .toUpperCase()
    .replace(/['"`\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ShowDog {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_group?: string
  sex: string
  total_shows: number
  best_placement?: number
  best_award?: string | null
  rank_score?: number
  titles: any
}

export interface CompetitionDog {
  id: number
  name_lat: string
  name_ru?: string
  breed: string
}

export interface DogForMatching {
  id: string | number
  name_lat: string
  name_ru?: string
  breed: string
}

/**
 * Находит соответствующую собаку в competitions для собаки из shows
 */
export function findMatchingCompetitionDog(
  showDog: ShowDog,
  competitionDogs: CompetitionDog[]
): CompetitionDog | null {
  const normalizedShowName = normalizeDogName(showDog.name_lat)
  const normalizedShowBreed = normalizeBreedName(showDog.breed)

  // Сначала точное совпадение по кличке
  const exactMatch = competitionDogs.find(
    (dog) => normalizeDogName(dog.name_lat) === normalizedShowName
  )

  if (exactMatch) {
    // Проверяем породу (если есть различия в названиях пород)
    const normalizedCompBreed = normalizeBreedName(exactMatch.breed)
    if (normalizedShowBreed === normalizedCompBreed) {
      return exactMatch
    }
    // Если породы не совпадают, всё равно возвращаем - это может быть разное написание
    return exactMatch
  }

  return null
}

/**
 * Находит соответствующую собаку в shows для собаки из competitions
 */
export function findMatchingShowDog(
  competitionDog: DogForMatching,
  showDogs: ShowDog[]
): ShowDog | null {
  const normalizedCompName = normalizeDogName(competitionDog.name_lat)
  const normalizedCompBreed = normalizeBreedName(competitionDog.breed)

  const exactMatch = showDogs.find(
    (dog) => normalizeDogName(dog.name_lat) === normalizedCompName
  )

  if (exactMatch) {
    const normalizedShowBreed = normalizeBreedName(exactMatch.breed)
    if (normalizedCompBreed === normalizedShowBreed) {
      return exactMatch
    }
    return exactMatch
  }

  return null
}
