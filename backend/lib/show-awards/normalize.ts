import { SHOW_AWARD_BADGE } from './order'
import { matchShowAwardToken } from './match'

function normalizeTitleToken(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[«»„“”']/g, '"')
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
