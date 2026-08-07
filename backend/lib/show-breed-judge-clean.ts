/**
 * Post-processing: RKF specialty headers sometimes concatenate judge into `breed`
 * while leaving `breed_judge` empty (e.g. «БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА Горан ГЛАДИЧ»).
 *
 * Ideal fix is upstream in the show HTML parser; this module cleans data at
 * build-show-indexes time so rankings / judges / aliases stay consistent.
 */

/** Breed tokens that look like ALLCAPS “surnames” but are not people. */
const BREED_FALSE_POSITIVES = new Set(
  [
    'TERRIER',
    'SPANIEL',
    'RETRIEVER',
    'HOUND',
    'COLLIE',
    'SHEPHERD',
    'DOG',
    'DOGS',
    'BULLDOG',
    'MASTIFF',
    'POINTER',
    'SETTER',
    'SCHNAUZER',
    'PINSCHER',
    'POODLE',
    'DACHSHUND',
    'SHEEPDOG',
    'CORGI',
    'PEMBROKE',
    'CARDIGAN',
    'WHIPPET',
    'GREYHOUND',
    'BORZOI',
    'SALUKI',
    'MALINOIS',
    'CORSO',
    // RU variety / size words often trailing in breed names
    'ПЕМБРОК',
    'КАРДИГАН',
    'СТАНДАРТ',
    'СТАНДАРТНЫЙ',
    'МИНИАТЮРНЫЙ',
    'МИНИ',
    'ТОЙ',
    'ГИГАНТСКИЙ',
    'СРЕДНИЙ',
  ].map((s) => s.toUpperCase()),
)

function normKey(s: string): string {
  return s
    .normalize('NFKC')
    .replace(/[\u00a0\s]+/g, ' ')
    .trim()
    .toLowerCase()
}

function splitJudgeAlt(raw: string): string[] {
  // «Тибор КИШ / Tibor KIS»
  return raw
    .split(/\s*\/\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
}

/** Two-word Title/mixed person OR single Latin/mixed surname token. */
const PERSON_SUFFIX_RE =
  /^(.+?)\s+((?:[А-ЯЁA-Z][а-яёa-z]+|[A-Z][a-z]+)\s+[А-ЯЁA-Za-zа-яёA-Z'’\-]+|[A-Z]{4,}[A-ZА-ЯЁa-zа-яё]*)$/u

function isMostlyUpperBreedBase(base: string): boolean {
  const letters = base.replace(/[^А-ЯЁA-Za-zа-яё]/g, '')
  if (!letters) return false
  let upper = 0
  for (const ch of letters) {
    if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) upper++
  }
  return upper / letters.length >= 0.7
}

function looksLikePersonSuffix(suffix: string): boolean {
  const t = suffix.trim()
  if (t.length < 4) return false
  if (BREED_FALSE_POSITIVES.has(t.toUpperCase())) return false
  // Two tokens with a lowercase letter somewhere → person name style
  if (/\s/.test(t) && /[a-zа-яё]/.test(t)) return true
  // Single mixed Latin/Cyrillic surname (IVANISHСНEVA) — not pure English breed word
  if (!/\s/.test(t) && /[A-Za-z]/.test(t) && /[А-Яа-яЁё]/.test(t)) return true
  // Pure Latin ALLCAPS surname only if not in false-positive list (caller adds via frequency)
  if (!/\s/.test(t) && /^[A-Z]{4,}$/.test(t)) return !BREED_FALSE_POSITIVES.has(t)
  return false
}

export type BreedJudgeCleanResult = {
  breed: string
  recoveredJudge?: string
  stripped: boolean
}

/**
 * Collect judge display names from exhibition headers + per-result fields,
 * plus person-like breed suffixes that repeat across ≥2 different breed bases.
 */
export function collectJudgeNamesForBreedClean(
  exhibitions: Array<{
    judges?: string[] | null
    breed_catalog?: Array<{ breed?: string; breed_judge?: string }> | null
    results?: Array<{ breed?: string; breed_judge?: string; judge?: string }> | null
  }>,
): string[] {
  const byKey = new Map<string, string>()

  const add = (raw: string | undefined | null) => {
    const name = (raw || '').replace(/[\u00a0\s]+/g, ' ').trim()
    if (!name || name.length < 4) return
    for (const part of splitJudgeAlt(name)) {
      if (part.length < 4) continue
      const key = normKey(part)
      if (!byKey.has(key)) byKey.set(key, part)
    }
  }

  for (const exhibition of exhibitions) {
    for (const j of exhibition.judges || []) add(j)
    for (const entry of exhibition.breed_catalog || []) add(entry.breed_judge)
    for (const result of exhibition.results || []) {
      add(result.breed_judge)
      add(result.judge)
    }
  }

  // Harvest repeated person-like suffixes glued into breed / catalog.breed
  const suffixToBases = new Map<string, { display: string; bases: Set<string> }>()
  const considerBreed = (breed: string | undefined | null) => {
    const b = (breed || '').trim()
    if (!b) return
    const m = b.match(PERSON_SUFFIX_RE)
    if (!m) return
    const base = m[1]!.trim()
    const suf = m[2]!.trim()
    if (!isMostlyUpperBreedBase(base) || !looksLikePersonSuffix(suf)) return
    const key = normKey(suf)
    let acc = suffixToBases.get(key)
    if (!acc) {
      acc = { display: suf, bases: new Set() }
      suffixToBases.set(key, acc)
    }
    acc.bases.add(base.toUpperCase())
  }

  for (const exhibition of exhibitions) {
    for (const entry of exhibition.breed_catalog || []) considerBreed(entry.breed)
    for (const result of exhibition.results || []) considerBreed(result.breed)
  }

  for (const { display, bases } of suffixToBases.values()) {
    if (bases.size >= 2) add(display)
  }

  return [...byKey.values()].sort((a, b) => b.length - a.length || a.localeCompare(b, 'ru'))
}

/** «Александров В.А.» / «Хомасуридзе Р.Р.» glued after breed. */
const INITIALS_SUFFIX_RE =
  /^(.+?)\s+([А-ЯЁA-Z][а-яёa-zА-ЯЁA-Z'’\-]+)\s+([А-ЯЁA-Z]\.[А-ЯЁA-Z]\.?)$/u

/** Strip a trailing known judge name (longest first, case-insensitive). */
export function stripTrailingJudgeFromBreed(
  breed: string,
  judgesLongestFirst: string[],
): BreedJudgeCleanResult {
  const raw = (breed || '').replace(/[\u00a0\s]+/g, ' ').trim()
  if (!raw) return { breed: raw, stripped: false }

  const upper = raw.toUpperCase()
  for (const judge of judgesLongestFirst) {
    const j = judge.replace(/[\u00a0\s]+/g, ' ').trim()
    if (j.length < 4) continue
    const ju = j.toUpperCase()
    if (upper === ju) continue
    if (upper.endsWith(' ' + ju)) {
      const cleaned = raw.slice(0, raw.length - j.length).trim()
      if (cleaned.length < 2) continue
      // Avoid stripping breed-only tokens that somehow entered the judge list
      if (BREED_FALSE_POSITIVES.has(ju) || !looksLikePersonSuffix(j)) continue
      return { breed: cleaned, recoveredJudge: j, stripped: true }
    }
  }

  // Fallback: person-like suffix on mostly-uppercase breed base (no known list hit)
  const m = raw.match(PERSON_SUFFIX_RE)
  if (m && isMostlyUpperBreedBase(m[1]!) && looksLikePersonSuffix(m[2]!) && /\s/.test(m[2]!)) {
    // Only Title-case multi-token fallback without list — safer than single ALLCAPS token
    return { breed: m[1]!.trim(), recoveredJudge: m[2]!.trim(), stripped: true }
  }

  const ini = raw.match(INITIALS_SUFFIX_RE)
  if (ini && isMostlyUpperBreedBase(ini[1]!)) {
    const recovered = `${ini[2]} ${ini[3]}`.trim()
    return { breed: ini[1]!.trim(), recoveredJudge: recovered, stripped: true }
  }

  return { breed: raw, stripped: false }
}

/** Mutates exhibition catalog + results breeds / recovered breed_judge. */
export function sanitizeExhibitionBreeds<
  T extends {
    breed_catalog?: Array<{ breed?: string; breed_judge?: string }> | null
    results?: Array<{ breed?: string; breed_judge?: string; judge?: string }> | null
  },
>(exhibition: T, judgesLongestFirst: string[]): number {
  let stripped = 0

  const cleanField = (obj: { breed?: string; breed_judge?: string }) => {
    if (!obj.breed) return
    const result = stripTrailingJudgeFromBreed(obj.breed, judgesLongestFirst)
    if (!result.stripped) return
    obj.breed = result.breed
    stripped++
    if (!(obj.breed_judge || '').trim() && result.recoveredJudge) {
      obj.breed_judge = result.recoveredJudge
    }
  }

  for (const entry of exhibition.breed_catalog || []) cleanField(entry)
  for (const result of exhibition.results || []) cleanField(result)
  return stripped
}
