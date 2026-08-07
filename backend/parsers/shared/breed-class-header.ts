const GENDER_RE = /Кобел|Сук|Микс/i

/** Заголовок группы «порода — класс — пол» в протоколах procoursing. */
export function parseBreedClassHeader(firstCellText: string, bgColor?: string | null): string | null {
  const normalizedBgColor = bgColor ? bgColor.toLowerCase() : ''
  const text = firstCellText.replace(/\s+/g, ' ').trim()
  if (!text) return null

  if (normalizedBgColor === '#c0c0c0') return text

  if (!GENDER_RE.test(text)) return null

  if (text.includes(' - ')) return text
  if (text.includes('_')) return text.replace(/_/g, ' - ')

  return null
}
