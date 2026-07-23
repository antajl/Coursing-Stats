/** Веса и утилиты рейтинга выставочных наград (conformation). */

/**
 * Канонические ключи счётчиков. Алиасы протокола (ЛПП (BOB), R.CAC…) → сюда.
 * Порядок SHOW_AWARD_ORDER = приоритет для best_award и tie-break.
 */
/** От крутых к менее крутым (карточки, best_award, tie-break). */
export const SHOW_AWARD_ORDER = [
  'BIS',
  'BIG',
  'BIS_JUNIOR',
  'BIS_VETERAN',
  'BIS_PUPPY',
  'BIS_BABY',
  'BOB',
  'BOS',
  'LYU',
  'LV',
  'LSH',
  'LB',
  'CACIB',
  'R_CACIB',
  'CAC',
  'JCAC',
  'VCAC',
  'CHRKF',
  'YCHRKF',
  'VCHRKF',
  'P_RUSSIA',
  'P_MOSCOW',
  'YP_RUSSIA',
  'YP_MOSCOW',
  'VP_RUSSIA',
  'VP_MOSCOW',
  'KCHK',
  'KCHP',
  'YKCHK',
  'YKCHP',
  'VKCHK',
  'VKCHP',
  'CW',
  'R_CAC',
  'R_JCAC',
  'R_VCAC',
  'SS',
  'YSS',
  'VSS',
] as const

export type ShowAwardKey = (typeof SHOW_AWARD_ORDER)[number]

export type ShowTitleCounts = Record<ShowAwardKey, number>

/** Ключи для фильтров «минимум» в рейтинге (не все 30 полей). */
export const SHOW_FILTER_AWARD_KEYS: ShowAwardKey[] = [
  'BIS',
  'BIG',
  'BIS_JUNIOR',
  'BOB',
  'BOS',
  'CACIB',
  'CAC',
  'JCAC',
  'CW',
  'CHRKF',
  'KCHK',
  'KCHP',
]

/** Веса rank_score: главный ринг → порода → сертификаты → резервы → дипломы дня. */
export const SHOW_AWARD_WEIGHTS: Record<ShowAwardKey, number> = {
  BIS: 10_000,
  BIG: 5_000,
  BIS_JUNIOR: 3_500,
  BIS_VETERAN: 3_200,
  BIS_PUPPY: 2_800,
  BIS_BABY: 2_500,
  BOB: 2_000,
  BOS: 1_500,
  LB: 800,
  LSH: 800,
  LYU: 900,
  LV: 850,
  CACIB: 500,
  CAC: 100,
  JCAC: 80,
  VCAC: 70,
  CW: 40,
  R_CACIB: 200,
  R_CAC: 40,
  R_JCAC: 30,
  R_VCAC: 25,
  CHRKF: 60,
  YCHRKF: 50,
  VCHRKF: 45,
  KCHK: 35,
  YKCHK: 30,
  VKCHK: 28,
  KCHP: 35,
  YKCHP: 30,
  VKCHP: 28,
  P_RUSSIA: 55,
  P_MOSCOW: 50,
  YP_RUSSIA: 45,
  YP_MOSCOW: 40,
  VP_RUSSIA: 42,
  VP_MOSCOW: 38,
  SS: 15,
  YSS: 12,
  VSS: 12,
}

/**
 * Короткая подпись на бейдже — как привыкли в РФ (ЛПП, не «BOB/ЛПП»).
 * Латиница остаётся там, где её так и говорят: BIS, BIG, CAC…
 */
export const SHOW_AWARD_BADGE: Record<ShowAwardKey, string> = {
  BIS: 'BIS',
  BIG: 'BIG',
  BIS_JUNIOR: 'BIS-Ю',
  BIS_VETERAN: 'BIS-В',
  BIS_PUPPY: 'BIS-Щ',
  BIS_BABY: 'BIS-Б',
  BOB: 'ЛПП',
  BOS: 'ЛППП',
  LB: 'ЛБ',
  LSH: 'ЛЩ',
  LYU: 'ЛЮ',
  LV: 'ЛВ',
  CACIB: 'CACIB',
  CAC: 'CAC',
  JCAC: 'JCAC',
  VCAC: 'VCAC',
  CW: 'CW',
  R_CACIB: 'R.CACIB',
  R_CAC: 'R.CAC',
  R_JCAC: 'R.JCAC',
  R_VCAC: 'R.VCAC',
  CHRKF: 'ЧРКФ',
  YCHRKF: 'ЮЧРКФ',
  VCHRKF: 'ВЧРКФ',
  KCHK: 'КЧК',
  YKCHK: 'ЮКЧК',
  VKCHK: 'ВКЧК',
  KCHP: 'КЧП',
  YKCHP: 'ЮКЧП',
  VKCHP: 'ВКЧП',
  P_RUSSIA: 'П «России»',
  P_MOSCOW: 'П Москвы',
  YP_RUSSIA: 'ЮП «России»',
  YP_MOSCOW: 'ЮП Москвы',
  VP_RUSSIA: 'ВП «России»',
  VP_MOSCOW: 'ВП Москвы',
  SS: 'СС',
  YSS: 'ЮСС',
  VSS: 'ВСС',
}

export const SHOW_AWARD_LABELS: Record<ShowAwardKey, string> = {
  BIS: 'Лучшая собака выставки (Best in Show)',
  BIG: 'Лучшая в группе FCI (Best in Group)',
  BIS_JUNIOR: 'Лучший юниор выставки (BIS Junior) — главный ринг, не ЛЮ породы',
  BIS_VETERAN: 'Лучший ветеран выставки (BIS Veteran) — главный ринг, не ЛВ породы',
  BIS_PUPPY: 'Лучший щенок выставки (BIS Puppy) — главный ринг, не ЛЩ породы',
  BIS_BABY: 'Лучший беби выставки (BIS Baby) — главный ринг, не ЛБ породы',
  BOB: 'Лучший представитель породы (ЛПП / BOB)',
  BOS: 'Лучший противоположного пола (ЛППП / BOS)',
  LB: 'Лучший беби породы (ЛБ)',
  LSH: 'Лучший щенок породы (ЛЩ)',
  LYU: 'Лучший юниор породы (ЛЮ)',
  LV: 'Лучший ветеран породы (ЛВ)',
  CACIB: 'CACIB — кандидат в интернациональные чемпионы красоты (FCI)',
  CAC: 'CAC — кандидат в чемпионы России по красоте',
  JCAC: 'JCAC — кандидат в юные чемпионы России по красоте',
  VCAC: 'VCAC — кандидат в чемпионы-ветераны по красоте',
  CW: 'CW — победитель класса',
  R_CACIB: 'R.CACIB — резервный CACIB',
  R_CAC: 'R.CAC — резервный CAC',
  R_JCAC: 'R.JCAC — резервный JCAC',
  R_VCAC: 'R.VCAC — резервный VCAC',
  CHRKF: 'ЧРКФ — чемпион РКФ (диплом на выставке)',
  YCHRKF: 'ЮЧРКФ — юный чемпион РКФ (диплом на выставке)',
  VCHRKF: 'ВЧРКФ — ветеран-чемпион РКФ (диплом на выставке)',
  KCHK: 'КЧК — кандидат в чемпионы клуба (породы с НКП)',
  YKCHK: 'ЮКЧК — юный кандидат в чемпионы клуба',
  VKCHK: 'ВКЧК — ветеран — кандидат в чемпионы клуба',
  KCHP: 'КЧП — кандидат в чемпионы породы (породы без НКП)',
  YKCHP: 'ЮКЧП — юный кандидат в чемпионы породы',
  VKCHP: 'ВКЧП — ветеран — кандидат в чемпионы породы',
  P_RUSSIA: 'П «России» — победитель выставки «Россия»',
  P_MOSCOW: 'П Москвы — победитель выставки / Кубка Москвы',
  YP_RUSSIA: 'ЮП «России» — юный победитель «России»',
  YP_MOSCOW: 'ЮП Москвы — юный победитель Москвы',
  VP_RUSSIA: 'ВП «России» — ветеран-победитель «России»',
  VP_MOSCOW: 'ВП Москвы — ветеран-победитель Москвы',
  SS: 'СС — сертификат соответствия',
  YSS: 'ЮСС — юный сертификат соответствия',
  VSS: 'ВСС — ветеранский сертификат соответствия',
}

/** Категория для UI: крутые / сертификаты / титулы дня. */
export type ShowAwardCategory = 'prestige' | 'certificate' | 'diploma'

export const SHOW_AWARD_CATEGORY_ORDER: ShowAwardCategory[] = [
  'prestige',
  'certificate',
  'diploma',
]

export const SHOW_AWARD_CATEGORY_LABEL: Record<ShowAwardCategory, string> = {
  prestige: 'Крутые',
  certificate: 'Сертификаты',
  diploma: 'Титулы дня',
}

export const SHOW_AWARD_CATEGORY: Record<ShowAwardKey, ShowAwardCategory> = {
  BIS: 'prestige',
  BIG: 'prestige',
  BIS_JUNIOR: 'prestige',
  BIS_VETERAN: 'prestige',
  BIS_PUPPY: 'prestige',
  BIS_BABY: 'prestige',
  BOB: 'prestige',
  BOS: 'prestige',
  LB: 'prestige',
  LSH: 'prestige',
  LYU: 'prestige',
  LV: 'prestige',
  CACIB: 'certificate',
  R_CACIB: 'certificate',
  CAC: 'certificate',
  JCAC: 'certificate',
  VCAC: 'certificate',
  CW: 'certificate',
  R_CAC: 'certificate',
  R_JCAC: 'certificate',
  R_VCAC: 'certificate',
  CHRKF: 'diploma',
  YCHRKF: 'diploma',
  VCHRKF: 'diploma',
  KCHK: 'diploma',
  YKCHK: 'diploma',
  VKCHK: 'diploma',
  KCHP: 'diploma',
  YKCHP: 'diploma',
  VKCHP: 'diploma',
  P_RUSSIA: 'diploma',
  P_MOSCOW: 'diploma',
  YP_RUSSIA: 'diploma',
  YP_MOSCOW: 'diploma',
  VP_RUSSIA: 'diploma',
  VP_MOSCOW: 'diploma',
  SS: 'diploma',
  YSS: 'diploma',
  VSS: 'diploma',
}

export const EMPTY_SHOW_TITLES: ShowTitleCounts = Object.fromEntries(
  SHOW_AWARD_ORDER.map((k) => [k, 0]),
) as ShowTitleCounts

function normalizeTitleToken(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[«»„“”]/g, '"')
    .replace(/ё/gi, 'е')
    .trim()
}

/**
 * RKF PDF/Excel: CAC family often in Cyrillic lookalikes («САС») or mixed («CАС»).
 * Latin «CAC» is unchanged. Russian diplomas (ЧФ, КЧК) are not rewritten.
 */
export function normalizeCertLookalikes(tok: string): string {
  const u = tok.toUpperCase().replace(/\s+/g, '')
  const lat = u
    .replace(/С/g, 'C')
    .replace(/А/g, 'A')
    .replace(/В/g, 'B')
    .replace(/Е/g, 'E')
    .replace(/О/g, 'O')
    .replace(/Р/g, 'P')
    .replace(/К/g, 'K')
    .replace(/М/g, 'M')
    .replace(/Т/g, 'T')
    .replace(/Н/g, 'H')
    .replace(/Х/g, 'X')
  if (/^(R\.)?(J|V)?CAC(IB)?$/.test(lat)) return lat
  if (/^(J)?BOB$/.test(lat) || /^BOS$/.test(lat)) return lat
  return tok
}

/**
 * Узкий PDF рвёт титул: «ЮКЧ»+«К»→ЮКЧК, «ВКЧ»+«П»→ВКЧП, «КЧ»+«К»→КЧК.
 * Не трогает легитимные многословные («П России»).
 */
export function glueWrappedTitleAbbrev(raw: string): string | null {
  const spaced = normalizeTitleToken(raw)
  if (!spaced || !/\s/.test(spaced)) return null
  // Уже узнаваемый титул с пробелом — не схлопывать
  if (matchShowAwardToken(spaced)) return null

  const compact = spaced
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\s./\-]/g, '')
  if (compact.length < 3 || compact.length > 14) return null

  const key = matchShowAwardToken(compact)
  if (!key) return null
  return SHOW_AWARD_BADGE[key]
}

/** Склеить соседние куски колонки титулов PDF («ЮКЧ»,«К»→«ЮКЧК»). */
export function glueWrappedTitleParts(parts: string[]): string[] {
  const out: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const a = parts[i]!
    const b = parts[i + 1]
    if (b) {
      const glued = glueWrappedTitleAbbrev(`${a} ${b}`)
      if (glued) {
        out.push(glued)
        i++
        continue
      }
    }
    out.push(a)
  }
  return out
}

/** Сопоставление одного фрагмента протокола → канонический ключ. */
export function matchShowAwardToken(raw: string): ShowAwardKey | null {
  const t = normalizeTitleToken(raw)
  if (!t) return null
  // Prefer Latin CAC/JCAC/… when token was Cyrillic/mixed lookalikes
  const lookalike = normalizeCertLookalikes(t)
  const u = (lookalike !== t ? lookalike : t).toUpperCase()

  // Точные совпадения (кириллица: \b в JS не работает с буквами Unicode)
  const exact: Record<string, ShowAwardKey> = {
    BIS: 'BIS',
    BIG: 'BIG',
    BOB: 'BOB',
    BOS: 'BOS',
    ВОВ: 'BOB',
    'BOB/ЛПП': 'BOB',
    'BOB / ЛПП': 'BOB',
    'BOS/ЛПС': 'BOS',
    'BOS / ЛПС': 'BOS',
    CW: 'CW',
    CACIB: 'CACIB',
    CAC: 'CAC',
    JCAC: 'JCAC',
    VCAC: 'VCAC',
    'R.CACIB': 'R_CACIB',
    'R.CAC': 'R_CAC',
    'R.JCAC': 'R_JCAC',
    'R.VCAC': 'R_VCAC',
    'R CACIB': 'R_CACIB',
    'R CAC': 'R_CAC',
    'R JCAC': 'R_JCAC',
    'R VCAC': 'R_VCAC',
    ЛБ: 'LB',
    ЛЩ: 'LSH',
    ЛЮ: 'LYU',
    ЛВ: 'LV',
    ЛПП: 'BOB',
    ЛППП: 'BOS',
    'ЛПП (BOB)': 'BOB',
    'ЛППП (BOS)': 'BOS',
    ЧРКФ: 'CHRKF',
    ЮЧРКФ: 'YCHRKF',
    ВЧРКФ: 'VCHRKF',
    КЧК: 'KCHK',
    ЮКЧК: 'YKCHK',
    ВКЧК: 'VKCHK',
    КЧП: 'KCHP',
    ЮКЧП: 'YKCHP',
    ВКЧП: 'VKCHP',
    СС: 'SS',
    ЮСС: 'YSS',
    ВСС: 'VSS',
    'П "РОССИИ"': 'P_RUSSIA',
    'П РОССИИ': 'P_RUSSIA',
    'П МОСКВЫ': 'P_MOSCOW',
    'ЮП "РОССИИ"': 'YP_RUSSIA',
    'ЮП РОССИИ': 'YP_RUSSIA',
    'ЮП МОСКВЫ': 'YP_MOSCOW',
    'ВП "РОССИИ"': 'VP_RUSSIA',
    'ВП РОССИИ': 'VP_RUSSIA',
    'ВП МОСКВЫ': 'VP_MOSCOW',
  }
  if (exact[u]) return exact[u]

  // Главный ринг (до breed-level BEST JUNIOR → LYU)
  if (
    u === 'BEST IN SHOW' ||
    u === 'ЛУЧШАЯ СОБАКА ВЫСТАВКИ' ||
    /^ЛУЧШАЯ\s+СОБАКА\s+ВЫСТАВКИ/.test(u) ||
    /^BIS(?:\s*1)?$/.test(u)
  ) {
    return 'BIS'
  }
  if (
    /BEST\s+IN\s+SHOW\s+JUNIOR/.test(u) ||
    /ЛУЧШИЙ\s+ЮНИОР\s*\/\s*BEST\s+IN\s+SHOW/.test(u) ||
    /^BIS[-\s]?J(?:UNIOR)?$/.test(u) ||
    /^BIS-Ю$/.test(u)
  ) {
    return 'BIS_JUNIOR'
  }
  if (
    /BEST\s+IN\s+SHOW\s+PUPPY/.test(u) ||
    /ЛУЧШИЙ\s+ЩЕНОК\s*\/\s*BEST\s+IN\s+SHOW/.test(u) ||
    /^BIS[-\s]?P(?:UPPY)?$/.test(u) ||
    /^BIS-Щ$/.test(u)
  ) {
    return 'BIS_PUPPY'
  }
  if (
    /BEST\s+IN\s+SHOW\s+BABY/.test(u) ||
    /ЛУЧШИЙ\s+БЕБИ\s*\/\s*BEST\s+IN\s+SHOW/.test(u) ||
    /^BIS[-\s]?B(?:ABY)?$/.test(u) ||
    /^BIS-Б$/.test(u)
  ) {
    return 'BIS_BABY'
  }
  if (
    /BEST\s+IN\s+SHOW\s+VETERAN/.test(u) ||
    /ЛУЧШИЙ\s+ВЕТЕРАН\s*\/\s*BEST\s+IN\s+SHOW/.test(u) ||
    /^BIS[-\s]?V(?:ETERAN)?$/.test(u) ||
    /^BIS-В$/.test(u)
  ) {
    return 'BIS_VETERAN'
  }
  if (u === 'BEST IN GROUP' || /^BEST\s+IN\s+GROUP/.test(u) || /\bГРУППА\s+FCI\b/.test(u)) {
    return 'BIG'
  }

  // Breed-level (не главный ринг)
  if (u.startsWith('BEST OF OPPOSITE')) return 'BOS'
  if (u.startsWith('BEST OF BREED')) return 'BOB'
  if (u.startsWith('BEST BABY')) return 'LB'
  if (u.startsWith('BEST PUPPY')) return 'LSH'
  if (u.startsWith('BEST JUNIOR')) return 'LYU'
  if (u.startsWith('BEST VETERAN')) return 'LV'
  if (u.startsWith('CLASS WINNER')) return 'CW'
  if (/^RES\.?\s*CACIB/.test(u)) return 'R_CACIB'

  // Нормализация пробелов вокруг точки: «R. CAC»
  const compact = u.replace(/\s+/g, ' ')
  if (/^R\.?\s*CACIB$/.test(compact)) return 'R_CACIB'
  if (/^R\.?\s*JCAC$/.test(compact)) return 'R_JCAC'
  if (/^R\.?\s*VCAC$/.test(compact)) return 'R_VCAC'
  if (/^R\.?\s*CAC$/.test(compact)) return 'R_CAC'

  if (/^ЛППП\s*\(\s*BOS\s*\)$/.test(u)) return 'BOS'
  if (/^ЛПП\s*\(\s*BOB\s*\)$/.test(u)) return 'BOB'
  if (/^BOB\s*\/\s*ЛПП$/i.test(u)) return 'BOB'
  if (/^BOS\s*\/\s*ЛПС$/i.test(u)) return 'BOS'

  if (/^П\s*"РОССИИ"$/.test(u) || /^П\s*РОССИИ$/.test(u)) return 'P_RUSSIA'
  if (/^П\s*МОСКВЫ$/.test(u)) return 'P_MOSCOW'
  if (/^ЮП\s*"РОССИИ"$/.test(u) || /^ЮП\s*РОССИИ$/.test(u)) return 'YP_RUSSIA'
  if (/^ЮП\s*МОСКВЫ$/.test(u)) return 'YP_MOSCOW'
  if (/^ВП\s*"РОССИИ"$/.test(u) || /^ВП\s*РОССИИ$/.test(u)) return 'VP_RUSSIA'
  if (/^ВП\s*МОСКВЫ$/.test(u)) return 'VP_MOSCOW'

  return null
}

/** Разбивка колонки наград: запятые и пробелы; «CAC BOB/ЛПП» → два токена. */
export function splitShowTitleTokens(title: string | null | undefined): string[] {
  if (!title?.trim()) return []
  const normalized = title.replace(/\s+/g, ' ').trim()
  const commaParts = normalized
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const out: string[] = []

  for (const part of commaParts) {
    const gluedPart = glueWrappedTitleAbbrev(part)
    if (gluedPart) {
      out.push(gluedPart)
      continue
    }
    if (matchShowAwardToken(part)) {
      out.push(part)
      continue
    }
    const words = part.split(' ')
    let i = 0
    while (i < words.length) {
      let matched = false
      // Сначала пара слов: «ЮКЧ К» → ЮКЧК
      if (i + 1 < words.length) {
        const pairGlue = glueWrappedTitleAbbrev(`${words[i]} ${words[i + 1]}`)
        if (pairGlue) {
          out.push(pairGlue)
          i += 2
          continue
        }
      }
      for (let n = Math.min(4, words.length - i); n >= 1; n--) {
        const cand = words.slice(i, i + n).join(' ')
        if (matchShowAwardToken(cand)) {
          out.push(cand)
          i += n
          matched = true
          break
        }
      }
      if (!matched) {
        out.push(words[i]!)
        i++
      }
    }
  }
  return out
}

/** Парсинг колонки «титул» протокола; CACIB/JCAC/R.CAC не дают лишний CAC. */
export function parseShowTitles(title: string): ShowTitleCounts {
  const counts = { ...EMPTY_SHOW_TITLES }
  if (!title?.trim()) return counts

  for (const part of splitShowTitleTokens(title)) {
    const key = matchShowAwardToken(part)
    if (key) counts[key]++
  }
  return counts
}

export function mergeShowTitles(a: ShowTitleCounts, b: ShowTitleCounts): ShowTitleCounts {
  const out = { ...EMPTY_SHOW_TITLES }
  for (const key of SHOW_AWARD_ORDER) {
    out[key] = (a[key] || 0) + (b[key] || 0)
  }
  return out
}

export function showRankScore(titles: ShowTitleCounts): number {
  return SHOW_AWARD_ORDER.reduce((sum, key) => sum + (titles[key] || 0) * SHOW_AWARD_WEIGHTS[key], 0)
}

/** Лучшая категория награды по иерархии (не счётчик). */
export function bestShowAward(titles: ShowTitleCounts): ShowAwardKey | null {
  for (const key of SHOW_AWARD_ORDER) {
    if ((titles[key] || 0) > 0) return key
  }
  return null
}

export function compareShowDogs(
  a: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
  b: { rank_score?: number; titles: ShowTitleCounts; total_shows: number },
): number {
  const scoreA = a.rank_score ?? showRankScore(a.titles)
  const scoreB = b.rank_score ?? showRankScore(b.titles)
  if (scoreB !== scoreA) return scoreB - scoreA

  for (const key of SHOW_AWARD_ORDER) {
    const diff = (b.titles[key] || 0) - (a.titles[key] || 0)
    if (diff !== 0) return diff
  }

  return b.total_shows - a.total_shows
}

/** Ненулевые ключи в порядке приоритета. */
export function presentShowAwards(titles: ShowTitleCounts): ShowAwardKey[] {
  return SHOW_AWARD_ORDER.filter((key) => (titles[key] || 0) > 0)
}

/** Развернуть компактные titles (только ненулевые) в полный объект со всеми ключами. */
export function expandShowTitles(
  partial?: Partial<ShowTitleCounts> | ShowTitleCounts | null,
): ShowTitleCounts {
  if (!partial) return { ...EMPTY_SHOW_TITLES }
  return { ...EMPTY_SHOW_TITLES, ...partial }
}

/** Каноническая подпись бейджа для сырого токена протокола («BOB/ЛПП» → «ЛПП»). */
export function displayShowAwardToken(raw: string): string {
  const key = matchShowAwardToken(raw)
  return key ? SHOW_AWARD_BADGE[key] : raw.trim()
}

/**
 * Краткая «причина» места в рейтинге для главной / компактных списков:
 * «ЛПП ×18 · VCAC ×27» (до max самых весомых титулов с ненулевым счётчиком).
 */
export function formatShowRankingReason(
  titles: Partial<ShowTitleCounts> | ShowTitleCounts | null | undefined,
  max = 2,
): string {
  if (!titles) return ''
  const parts: string[] = []
  for (const key of SHOW_AWARD_ORDER) {
    const n = titles[key] || 0
    if (n <= 0) continue
    parts.push(n > 1 ? `${SHOW_AWARD_BADGE[key]} ×${n}` : SHOW_AWARD_BADGE[key])
    if (parts.length >= max) break
  }
  return parts.join(' · ')
}

/** Только ненулевые счётчики — для лёгких home-top / ranking JSON. */
export function compactShowTitles(titles: ShowTitleCounts): Partial<ShowTitleCounts> {
  const out: Partial<ShowTitleCounts> = {}
  for (const key of SHOW_AWARD_ORDER) {
    const n = titles[key] || 0
    if (n > 0) out[key] = n
  }
  return out
}

/** Шард файла подробностей: shows/indexes/dog-details/{shard}.json */
export function showDogDetailShard(id: string | number, shardCount = 256): string {
  const n = Math.abs(Number(id)) || 0
  return String(n % shardCount).padStart(3, '0')
}

/** Ключи, сгруппированные по категории (prestige → certificate → diploma). */
export function groupShowAwardsByCategory(
  keys: readonly ShowAwardKey[],
): Array<{ category: ShowAwardCategory; keys: ShowAwardKey[] }> {
  const buckets: Record<ShowAwardCategory, ShowAwardKey[]> = {
    prestige: [],
    certificate: [],
    diploma: [],
  }
  for (const key of SHOW_AWARD_ORDER) {
    if (!keys.includes(key)) continue
    buckets[SHOW_AWARD_CATEGORY[key]].push(key)
  }
  return SHOW_AWARD_CATEGORY_ORDER.filter((c) => buckets[c].length > 0).map((category) => ({
    category,
    keys: buckets[category],
  }))
}
