const GENDER_RE = /Кобел|Сук|Микс|Общ|Смешан/i

/** Заголовок группы «порода — класс — пол» в протоколах procoursing. */
export function parseBreedClassHeader(firstCellText: string, bgColor?: string | null): string | null {
  const normalizedBgColor = bgColor ? bgColor.toLowerCase() : ''
  const text = firstCellText.replace(/\s+/g, ' ').trim()
  if (!text) return null
  if (/^\d+$/.test(text) || /неприбывш|неявка/i.test(text)) return null

  if (normalizedBgColor === '#c0c0c0' && (GENDER_RE.test(text) || text.includes(' - ') || text.includes('_'))) {
    let res = text
    if (res.includes('_')) res = res.replace(/_/g, ' - ')
    res = res.replace(/\s*-\s*общ(?:ая|ий)?\b/gi, ' - Микс')
    return res
  }

  if (!GENDER_RE.test(text)) return null

  let res = text
  if (res.includes('_')) res = res.replace(/_/g, ' - ')
  res = res.replace(/\s*-\s*общ(?:ая|ий)?\b/gi, ' - Микс')

  if (res.includes(' - ')) return res

  return null
}
