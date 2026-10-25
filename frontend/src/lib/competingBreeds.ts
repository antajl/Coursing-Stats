import { canonicalBreed } from './breedMapping'

/** Породы собак с хотя бы одним результатом на соревнованиях или выставках (для фильтров рейтинга). */
export interface DogsIndexEntry {
  breed?: string | null
  competition_count?: number
  dog_count?: number
}

export function countCompetingBreeds(dogs: DogsIndexEntry[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const dog of dogs) {
    const raw = dog.breed?.trim()
    if (!raw) continue
    if ((dog.competition_count ?? 0) <= 0 && (dog.dog_count ?? 0) <= 0) continue
    // Ошибки парсера: в поле breed попадает номер каталога (напр. "18")
    if (/^\d+$/.test(raw)) continue
    const canon = canonicalBreed(raw)
    if (!canon || canon.startsWith('*')) continue
    const weight = dog.dog_count ?? 1
    counts.set(canon, (counts.get(canon) ?? 0) + weight)
  }
  return counts
}

export function deriveCompetingBreeds(dogs: DogsIndexEntry[]): string[] {
  const counts = countCompetingBreeds(dogs)
  return [...counts.entries()]
    .sort((a, b) => {
      const byCount = b[1] - a[1]
      if (byCount !== 0) return byCount
      return a[0].localeCompare(b[0], 'ru')
    })
    .map(([breed]) => breed)
}
