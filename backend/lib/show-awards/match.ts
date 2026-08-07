import type { ShowAwardKey } from './order'
import { glueWrappedTitleAbbrev, normalizeCertLookalikes } from './normalize'

function normalizeTitleToken(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[«»„“”']/g, '"')
    .replace(/ё/gi, 'е')
    .trim()
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
