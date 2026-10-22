import { canonicalBreed } from './breedMapping'

/** Породы собак с хотя бы одним результатом на соревнованиях (для фильтров рейтинга). */
export interface DogsIndexEntry {
  breed?: string | null
  competition_count?: number
}

export function countCompetingBreeds(dogs: DogsIndexEntry[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const dog of dogs) {
    const raw = dog.breed?.trim()
    if (!raw || (dog.competition_count ?? 0) <= 0) continue
    // Ошибки парсера: в поле breed попадает номер каталога (напр. "18")
    if (/^\d+$/.test(raw)) continue
    const canon = canonicalBreed(raw)
    if (!canon || canon === 'БЕЗ ПОРОДЫ') continue
    counts.set(canon, (counts.get(canon) ?? 0) + 1)
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
