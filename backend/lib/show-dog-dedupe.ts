/**
 * Collapse show-ranking cards that are the same dog split by wrong PDF breeds.
 * Key = exact normalized full name (not catalog #). Safe when name is long enough.
 */
import { isBreedFragment } from '../parsers/shows/parse-rkf-certificate-pdf'
import {
  collectDogNameParts,
  type DogIdentityFields,
} from './dog-identity-match'
import {
  bestShowAward,
  mergeShowTitles,
  showRankScore,
  type ShowTitles,
} from './show-award-ranking'
import { bestShowGradeLabel } from './show-grades'

export type ShowDogDedupeFields = {
  id: string
  name_lat: string
  name_ru: string
  breed: string
  breed_en?: string
  breed_group?: string
  sex?: string
  total_shows: number
  best_placement: number
  rank_score: number
  best_award: string | null
  best_grade: string | null
  titles: ShowTitles
  competition_dog_id: number | null
  catalog_id?: string
  history: Array<{ date?: string; grade?: string; [k: string]: unknown }>
}

/** Prefer long / multi-word registered names — short «REX» can be real collisions. */
export function isStrongShowDogName(nameLat: string, nameRu?: string | null): boolean {
  const key = primaryShowDogNameKey(nameLat, nameRu)
  if (!key) return false
  const words = key.split(' ').filter(Boolean)
  if (key.length >= 16) return true
  if (words.length >= 3 && key.length >= 12) return true
  if (words.length >= 2 && words.every((w) => w.length >= 4) && key.length >= 12) return true
  return false
}

export function primaryShowDogNameKey(nameLat?: string | null, nameRu?: string | null): string {
  const parts = collectDogNameParts(nameLat, nameRu)
  if (parts.length === 0) return ''
  // Longest form first (full registered name beats a short alias chunk)
  return [...parts].sort((a, b) => b.length - a.length || a.localeCompare(b, 'ru'))[0]!
}

/** True if `shorter` is a full-word prefix of `longer` (e.g. truncated catalog name). */
export function isRegisteredNamePrefix(shorter: string, longer: string): boolean {
  const a = primaryShowDogNameKey(shorter)
  const b = primaryShowDogNameKey(longer)
  if (!a || !b || a.length >= b.length) return false
  if (a.split(' ').filter(Boolean).length < 3) return false
  return b.startsWith(`${a} `)
}

export function isGarbageShowBreed(breed: string): boolean {
  const t = (breed || '').trim()
  if (!t) return true
  if (isBreedFragment(t)) return true
  if (t.length > 90) return true
  if (/^(HAIRED|COLOURS?|MINIATURE|SMOOTH|LONG|WIRE|OTHER|DOG|DOGS)$/i.test(t)) return true
  // Parser glue: same breed phrase repeated
  if (/ЗОЛОТИСТЫЙ РЕТРИВЕР.*ЗОЛОТИСТЫЙ РЕТРИВЕР.*ЗОЛОТИСТЫЙ РЕТРИВЕР/i.test(t)) return true
  if (/ПУДЕЛЬ ТОЙ.*ПУДЕЛЬ ТОЙ.*ПУДЕЛЬ ТОЙ/i.test(t)) return true
  if (/ТАКСА МИНИАТЮРНАЯ.*ТАКСА МИНИАТЮРНАЯ.*ТАКСА МИНИАТЮРНАЯ/i.test(t)) return true
  return false
}

/** Display breed: drop trailing EN after « / », collapse spaces. */
export function cleanShowBreedLabel(breed: string): string {
  let t = breed.replace(/\s+/g, ' ').trim()
  const slash = t.indexOf(' / ')
  if (slash > 0) t = t.slice(0, slash).trim()
  return t
}

export function pickCanonicalShowBreed<T extends ShowDogDedupeFields>(dogs: T[]): string {
  const linked = dogs.filter((d) => d.competition_dog_id != null)
  if (linked.length === 1 && linked[0]!.breed.trim()) {
    return cleanShowBreedLabel(linked[0]!.breed)
  }

  const scored = dogs
    .map((d) => ({
      breed: cleanShowBreedLabel(d.breed),
      shows: d.total_shows || 0,
      garbage: isGarbageShowBreed(d.breed),
    }))
    .filter((x) => x.breed)

  const solid = scored.filter((x) => !x.garbage)
  const pool = solid.length > 0 ? solid : scored

  const byBreed = new Map<string, number>()
  for (const x of pool) {
    byBreed.set(x.breed, (byBreed.get(x.breed) || 0) + x.shows)
  }
  let best = ''
  let bestShows = -1
  for (const [breed, shows] of byBreed) {
    if (shows > bestShows || (shows === bestShows && breed.length > best.length)) {
      best = breed
      bestShows = shows
    }
  }
  return best || cleanShowBreedLabel(dogs[0]?.breed || '')
}

function mergeDogGroup<T extends ShowDogDedupeFields>(group: T[]): T {
  const sorted = [...group].sort((a, b) => (b.total_shows || 0) - (a.total_shows || 0))
  const base = {
    ...sorted[0]!,
    titles: { ...sorted[0]!.titles },
    history: [...sorted[0]!.history],
  } as T

  const breed = pickCanonicalShowBreed(group)
  base.breed = breed

  for (let i = 1; i < sorted.length; i++) {
    const dog = sorted[i]!
    base.total_shows += dog.total_shows
    base.titles = mergeShowTitles(base.titles, dog.titles)
    base.history = [...base.history, ...dog.history]
    if (
      dog.best_placement > 0 &&
      (base.best_placement === 0 || dog.best_placement < base.best_placement)
    ) {
      base.best_placement = dog.best_placement
    }
    if (dog.breed_en && !base.breed_en) base.breed_en = dog.breed_en
    if (dog.breed_group && !base.breed_group) base.breed_group = dog.breed_group
    if (dog.competition_dog_id != null && base.competition_dog_id == null) {
      base.competition_dog_id = dog.competition_dog_id
    }
    if (dog.catalog_id && !base.catalog_id) base.catalog_id = dog.catalog_id
  }

  base.history.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  base.rank_score = showRankScore(base.titles)
  base.best_award = bestShowAward(base.titles)
  base.best_grade = bestShowGradeLabel(base.history.map((h) => h.grade || ''))
  // Prefer competition id as card id when linked
  if (base.competition_dog_id != null) base.id = String(base.competition_dog_id)
  return base
}

export type CollapseShowDogsResult<T extends ShowDogDedupeFields> = {
  dogs: T[]
  collapsedGroups: number
  removedCards: number
}

/**
 * Merge cards that share the same strong registered name but different (often wrong) breeds.
 * Skips a group if it maps to 2+ distinct competition_dog_id values.
 */
export function collapseShowDogsByExactName<T extends ShowDogDedupeFields>(
  dogs: T[],
): CollapseShowDogsResult<T> {
  const byName = new Map<string, T[]>()
  const weak: T[] = []

  for (const dog of dogs) {
    if (!isStrongShowDogName(dog.name_lat, dog.name_ru)) {
      weak.push(dog)
      continue
    }
    const key = primaryShowDogNameKey(dog.name_lat, dog.name_ru)
    const list = byName.get(key) || []
    list.push(dog)
    byName.set(key, list)
  }

  const out: T[] = [...weak]
  let collapsedGroups = 0
  let removedCards = 0

  for (const [, group] of byName) {
    if (group.length === 1) {
      out.push(group[0]!)
      continue
    }
    const breeds = new Set(group.map((d) => cleanShowBreedLabel(d.breed)))
    if (breeds.size <= 1) {
      // Same breed split only by tiny label differences — still merge
      out.push(mergeDogGroup(group))
      if (group.length > 1) {
        collapsedGroups++
        removedCards += group.length - 1
      }
      continue
    }

    const compIds = [
      ...new Set(group.map((d) => d.competition_dog_id).filter((id): id is number => id != null)),
    ]
    if (compIds.length > 1) {
      // Real collision across competition dogs — keep separate
      out.push(...group)
      continue
    }

    out.push(mergeDogGroup(group))
    collapsedGroups++
    removedCards += group.length - 1
  }

  return { dogs: out, collapsedGroups, removedCards }
}

/**
 * Merge truncated registered names into the longer form
 * («ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА» → «… АЛЬ РАВДА»), when unambiguous.
 * O(n log n) via sorted keys + binary search (not O(n²)).
 */
export function collapseShowDogsByNamePrefix<T extends ShowDogDedupeFields>(
  dogs: T[],
): CollapseShowDogsResult<T> {
  const strong = dogs.filter((d) => isStrongShowDogName(d.name_lat, d.name_ru))
  const weak = dogs.filter((d) => !isStrongShowDogName(d.name_lat, d.name_ru))

  const byKey = new Map<string, T>()
  for (const d of strong) {
    const k = primaryShowDogNameKey(d.name_lat, d.name_ru)
    const prev = byKey.get(k)
    if (!prev) byKey.set(k, d)
    else byKey.set(k, mergeDogGroup([prev, d]))
  }

  const keys = [...byKey.keys()].sort((a, b) => a.localeCompare(b, 'ru'))
  const absorbed = new Set<string>()
  let collapsedGroups = 0
  let removedCards = 0

  const shortFirst = [...keys].sort((a, b) => a.length - b.length || a.localeCompare(b, 'ru'))
  for (const shortKey of shortFirst) {
    if (absorbed.has(shortKey)) continue
    const child = byKey.get(shortKey)
    if (!child) continue
    if (shortKey.split(' ').filter(Boolean).length < 3) continue

    const parents = findSortedPrefixExtensions(keys, shortKey).filter((k) => !absorbed.has(k))
    if (parents.length !== 1) continue
    const parentKey = parents[0]!
    const parent = byKey.get(parentKey)
    if (!parent) continue

    const compIds = [
      ...new Set(
        [child, parent]
          .map((d) => d.competition_dog_id)
          .filter((id): id is number => id != null),
      ),
    ]
    if (compIds.length > 1) continue

    const breedOk =
      cleanShowBreedLabel(child.breed) === cleanShowBreedLabel(parent.breed) ||
      isGarbageShowBreed(child.breed) ||
      isGarbageShowBreed(parent.breed) ||
      child.competition_dog_id != null ||
      parent.competition_dog_id != null
    if (!breedOk) continue

    byKey.set(parentKey, mergeDogGroup([parent, child]))
    const merged = byKey.get(parentKey)!
    if (primaryShowDogNameKey(parent.name_lat).length >= primaryShowDogNameKey(child.name_lat).length) {
      merged.name_lat = parent.name_lat
      if (parent.name_ru) merged.name_ru = parent.name_ru
    }
    byKey.delete(shortKey)
    absorbed.add(shortKey)
    collapsedGroups++
    removedCards++
  }

  return {
    dogs: [...weak, ...byKey.values()],
    collapsedGroups,
    removedCards,
  }
}

/** Keys in sorted list that start with `prefix + ' '` (full-word extension). */
function findSortedPrefixExtensions(sortedKeys: string[], prefix: string): string[] {
  const needle = `${prefix} `
  let lo = 0
  let hi = sortedKeys.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sortedKeys[mid]!.localeCompare(needle, 'ru') < 0) lo = mid + 1
    else hi = mid
  }
  const out: string[] = []
  for (let i = lo; i < sortedKeys.length; i++) {
    const k = sortedKeys[i]!
    if (!k.startsWith(needle)) break
    out.push(k)
  }
  return out
}

/**
 * If a show dog's full name uniquely matches one competition dog, link and adopt that breed.
 * (Wrong PDF breed previously blocked dogsLikelySame.)
 */
export function linkShowDogsByUniqueName<T extends ShowDogDedupeFields & DogIdentityFields>(
  showDogs: T[],
  competitionDogs: Array<DogIdentityFields & { id: number; breed?: string | null }>,
): { linked: number } {
  const byName = new Map<string, Array<DogIdentityFields & { id: number; breed?: string | null }>>()
  const byPrimary = new Map<string, Array<DogIdentityFields & { id: number; breed?: string | null }>>()
  /** First 3 words → competition primary keys (avoids O(shows×comps) prefix scan). */
  const byHead = new Map<string, string[]>()
  for (const dog of competitionDogs) {
    for (const part of collectDogNameParts(dog.name_lat, dog.name_ru)) {
      if (!isStrongShowDogName(part, null) && part.length < 16) continue
      const list = byName.get(part) || []
      list.push(dog)
      byName.set(part, list)
    }
    const primary = primaryShowDogNameKey(dog.name_lat, dog.name_ru)
    if (primary && (isStrongShowDogName(primary, null) || primary.length >= 16)) {
      const list = byPrimary.get(primary) || []
      list.push(dog)
      byPrimary.set(primary, list)
      const head = primary.split(' ').slice(0, 3).join(' ')
      if (head) {
        const heads = byHead.get(head) || []
        heads.push(primary)
        byHead.set(head, heads)
      }
    }
  }

  let linked = 0
  for (const showDog of showDogs) {
    if (showDog.competition_dog_id != null) continue
    if (!isStrongShowDogName(showDog.name_lat, showDog.name_ru)) continue

    const candidateIds = new Map<number, DogIdentityFields & { id: number; breed?: string | null }>()
    const showKey = primaryShowDogNameKey(showDog.name_lat, showDog.name_ru)
    for (const part of collectDogNameParts(showDog.name_lat, showDog.name_ru)) {
      for (const c of byName.get(part) || []) candidateIds.set(c.id, c)
    }
    // Truncated show name → longer competition registered name (same 3-word head)
    if (candidateIds.size === 0 && showKey) {
      const head = showKey.split(' ').slice(0, 3).join(' ')
      for (const compKey of byHead.get(head) || []) {
        if (!isRegisteredNamePrefix(showKey, compKey) && !isRegisteredNamePrefix(compKey, showKey)) {
          continue
        }
        for (const c of byPrimary.get(compKey) || []) candidateIds.set(c.id, c)
      }
    }
    if (candidateIds.size !== 1) continue
    const hit = [...candidateIds.values()][0]!
    showDog.competition_dog_id = hit.id
    if (hit.breed?.trim()) {
      showDog.breed = cleanShowBreedLabel(hit.breed)
    }
    const hitKey = primaryShowDogNameKey(hit.name_lat, hit.name_ru)
    if (hitKey && isRegisteredNamePrefix(showKey, hitKey)) {
      if (hit.name_ru?.trim()) showDog.name_lat = hit.name_ru.trim()
      else if (hit.name_lat?.trim()) showDog.name_lat = hit.name_lat.trim()
    }
    linked++
  }
  return { linked }
}
