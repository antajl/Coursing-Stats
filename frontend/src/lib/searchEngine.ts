/**
 * Unified Smart Search Engine for CoursingStats.
 * 
 * Provides universal bilingual (RU <-> EN) and layout-agnostic (QWERTY <-> ЙЦУКЕН)
 * matching across the entire site: Judges, Dogs, Breeds, and Calendar events.
 */

// 1. Keyboard Layout Conversion (QWERTY <-> ЙЦУКЕН)
const EN_TO_RU_KEYBOARD: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з',
  '[': 'х', ']': 'ъ', a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о',
  k: 'л', l: 'д', ';': 'ж', "'": 'э', z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и',
  n: 'т', m: 'ь', ',': 'б', '.': 'ю', '`': 'ё',
}

const RU_TO_EN_KEYBOARD: Record<string, string> = Object.fromEntries(
  Object.entries(EN_TO_RU_KEYBOARD).map(([en, ru]) => [ru, en])
)
RU_TO_EN_KEYBOARD['ё'] = '`'

/**
 * Converts a string from one keyboard layout to another if accidentally typed
 * with the wrong active language (e.g. "ufdhbkjdf" -> "гаврилова", "цфтп" -> "wang").
 */
export function convertKeyboardLayout(text: string): string {
  if (!text) return ''
  const lower = text.toLowerCase()
  const ruConverted = [...lower].map((ch) => EN_TO_RU_KEYBOARD[ch] ?? ch).join('')
  if (ruConverted !== lower && /[а-яё]/.test(ruConverted)) {
    return ruConverted
  }
  const enConverted = [...lower].map((ch) => RU_TO_EN_KEYBOARD[ch] ?? ch).join('')
  return enConverted
}

// 2. Cyrillic to Latin Transliteration (RU -> EN)
const CYRILLIC_TO_LATIN_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function transliterateRuToEn(text: string): string {
  if (!text) return ''
  return [...text.toLowerCase()]
    .map((ch) => CYRILLIC_TO_LATIN_MAP[ch] ?? ch)
    .join('')
}

// 3. Latin to Cyrillic Transliteration (EN -> RU)
const LATIN_MULTIGRAPHS: [RegExp, string][] = [
  [/shch/g, 'щ'],
  [/sch/g, 'щ'],
  [/dzh/g, 'дж'],
  [/zh/g, 'ж'],
  [/ch/g, 'ч'],
  [/sh/g, 'ш'],
  [/ts/g, 'ц'],
  [/tz/g, 'ц'],
  [/tc/g, 'ц'],
  [/kh/g, 'х'],
  [/ya/g, 'я'],
  [/ia/g, 'я'],
  [/ja/g, 'я'],
  [/yu/g, 'ю'],
  [/iu/g, 'ю'],
  [/ju/g, 'ю'],
  [/yo/g, 'ё'],
  [/jo/g, 'ё'],
  [/ye/g, 'е'],
  [/je/g, 'е'],
  [/ph/g, 'ф'],
  [/qu/g, 'кв'],
  [/ck/g, 'к'],
  [/ks/g, 'кс'],
  [/x/g, 'кс'],
]

const LATIN_SINGLE_MAP: Record<string, string> = {
  a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х',
  i: 'и', j: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п',
  q: 'к', r: 'р', s: 'с', t: 'т', u: 'у', v: 'в', w: 'в', y: 'и',
  z: 'з',
}

export function transliterateEnToRu(text: string, cAsCh: boolean = false): string {
  if (!text) return ''
  let res = text.toLowerCase()
  for (const [pattern, repl] of LATIN_MULTIGRAPHS) {
    res = res.replace(pattern, repl)
  }
  const singleMap = { ...LATIN_SINGLE_MAP }
  if (cAsCh) {
    singleMap['c'] = 'ч'
  }
  return [...res].map((ch) => singleMap[ch] ?? ch).join('')
}

/**
 * Expands common phonetic variants for Latin transliteration (v <-> w, ya <-> ia, kh <-> h, c <-> ch/ts).
 */
export function expandPhoneticVariants(text: string): string[] {
  if (!text) return []
  const base = text.toLowerCase().trim()
  const out = new Set<string>([base])

  // V <-> W
  if (base.includes('v')) out.add(base.replace(/v/g, 'w'))
  if (base.includes('w')) out.add(base.replace(/w/g, 'v'))

  // J <-> Y <-> I
  if (base.includes('j')) {
    out.add(base.replace(/j/g, 'y'))
    out.add(base.replace(/j/g, 'i'))
  }
  if (base.includes('y')) {
    out.add(base.replace(/y/g, 'j'))
    out.add(base.replace(/y/g, 'i'))
  }

  // YA <-> IA <-> JA, YU <-> IU <-> JU
  for (const s of [...out]) {
    if (s.includes('ya')) out.add(s.replace(/ya/g, 'ia'))
    if (s.includes('ia')) out.add(s.replace(/ia/g, 'ya'))
    if (s.includes('yu')) out.add(s.replace(/yu/g, 'iu'))
    if (s.includes('iu')) out.add(s.replace(/iu/g, 'yu'))
    if (s.includes('kh')) out.add(s.replace(/kh/g, 'h'))
    if (s.includes('h') && !s.includes('kh') && !s.includes('sh') && !s.includes('ch') && !s.includes('zh')) {
      out.add(s.replace(/h/g, 'kh'))
    }
    // Slavic -vic / -vich / -vits (e.g. Momcilovic <-> Momchilovich)
    if (s.endsWith('vic')) {
      out.add(s.replace(/vic$/, 'vich'))
      out.add(s.replace(/vic$/, 'vits'))
    }
    if (s.endsWith('vich')) {
      out.add(s.replace(/vich$/, 'vic'))
      out.add(s.replace(/vich$/, 'vits'))
    }
    if (s.includes('c') && !s.includes('ch')) {
      out.add(s.replace(/c/g, 'ch'))
      out.add(s.replace(/c/g, 'ts'))
    }
    if (s.includes('ch')) {
      out.add(s.replace(/ch/g, 'c'))
    }
    if (s.includes('ts')) {
      out.add(s.replace(/ts/g, 'c'))
    }
  }

  return [...out]
}

/**
 * Normalizes text for searching (removes redundant punctuation, extra whitespace).
 */
export function normalizeSearchString(text?: string | null): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[''`’"«»()[\],.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Generates an exhaustive set of normalized search tokens for any input query.
 * Handles original query, keyboard layout conversion, RU->EN, EN->RU, and phonetic variants.
 */
export function generateSearchTokens(query: string): string[] {
  const q = normalizeSearchString(query)
  if (!q) return []

  const rawSeeds = new Set<string>([q])

  // 1. Keyboard layout conversion
  const kb = normalizeSearchString(convertKeyboardLayout(q))
  if (kb && kb !== q) {
    rawSeeds.add(kb)
  }

  const tokens = new Set<string>()

  for (const seed of rawSeeds) {
    tokens.add(seed)

    const hasCyrillic = /[а-я]/.test(seed)
    const hasLatin = /[a-z]/.test(seed)

    // Cyrillic -> Latin
    if (hasCyrillic) {
      const lat = transliterateRuToEn(seed)
      if (lat) {
        for (const variant of expandPhoneticVariants(lat)) {
          tokens.add(variant)
        }
      }
    }

    // Latin -> Cyrillic
    if (hasLatin) {
      const ruStandard = transliterateEnToRu(seed, false)
      const ruCh = transliterateEnToRu(seed, true)
      if (ruStandard) tokens.add(ruStandard)
      if (ruCh) tokens.add(ruCh)

      for (const variant of expandPhoneticVariants(seed)) {
        tokens.add(variant)
        const ruVar = transliterateEnToRu(variant, false)
        const ruVarCh = transliterateEnToRu(variant, true)
        if (ruVar) tokens.add(ruVar)
        if (ruVarCh) tokens.add(ruVarCh)
      }
    }
  }

  return [...tokens].filter((t) => t.length > 0)
}

/**
 * General-purpose matcher: checks if the target text matches the query using
 * bilingual search tokens, layout correction, and reverse transliteration.
 */
export function matchesSearchText(
  targets: string | null | undefined | (string | null | undefined)[],
  query: string
): boolean {
  if (!query?.trim()) return true

  const targetList = Array.isArray(targets) ? targets : [targets]
  const cleanTargets: string[] = []

  for (const t of targetList) {
    if (!t) continue
    const norm = normalizeSearchString(t)
    if (!norm) continue
    cleanTargets.push(norm)

    // Also index target's transliterated form
    if (/[а-я]/.test(norm)) {
      cleanTargets.push(transliterateRuToEn(norm))
      for (const v of expandPhoneticVariants(transliterateRuToEn(norm))) {
        cleanTargets.push(v)
      }
    }
    if (/[a-z]/.test(norm)) {
      cleanTargets.push(transliterateEnToRu(norm, false))
      cleanTargets.push(transliterateEnToRu(norm, true))
      for (const v of expandPhoneticVariants(norm)) {
        cleanTargets.push(v)
        cleanTargets.push(transliterateEnToRu(v, false))
        cleanTargets.push(transliterateEnToRu(v, true))
      }
    }
  }

  if (cleanTargets.length === 0) return false

  const combinedHaystack = cleanTargets.join(' ')
  const tokens = generateSearchTokens(query)

  for (const token of tokens) {
    if (combinedHaystack.includes(token)) return true
  }

  return false
}

// 4. Entity Specific Matchers

export interface JudgeSearchItem {
  name?: string | null
  display_name?: string | null
  full_name?: string | null
  city?: string | null
  aliases?: string[] | null
}

/**
 * Matches a Judge against a search query (supports RU/EN, layout conversion, aliases, city).
 */
export function matchesJudge(judge: JudgeSearchItem, query: string): boolean {
  if (!query?.trim()) return true
  const fields = [
    judge.name,
    judge.display_name,
    judge.full_name,
    judge.city,
    ...(judge.aliases || []),
  ]
  return matchesSearchText(fields, query)
}

export interface DogSearchItem {
  name?: string | null
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  aliases?: string[] | null
}

/**
 * Matches a Dog against a search query across Russian and English names, aliases, and breeds.
 */
export function matchesDog(dog: DogSearchItem, query: string): boolean {
  if (!query?.trim()) return true
  const fields = [
    dog.name,
    dog.name_lat,
    dog.name_ru,
    dog.breed,
    ...(dog.aliases || []),
  ]
  return matchesSearchText(fields, query)
}
