/** Породы собак с хотя бы одним результатом на соревнованиях (для фильтров рейтинга). */
export interface DogsIndexEntry {
  breed?: string | null
  competition_count?: number
}

export function deriveCompetingBreeds(dogs: DogsIndexEntry[]): string[] {
  const set = new Set<string>()
  for (const dog of dogs) {
    const breed = dog.breed?.trim()
    if (!breed || (dog.competition_count ?? 0) <= 0) continue
    // Ошибки парсера: в поле breed попадает номер каталога (напр. "18")
    if (/^\d+$/.test(breed)) continue
    set.add(breed)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}
