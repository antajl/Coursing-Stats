/** Заголовок секции неявок в протоколах procoursing. */
export function isNonArrivedSectionHeader(firstCellText: string): boolean {
  const text = firstCellText.trim()
  return /неприбывш|неявивш/i.test(text)
}

/** Строка собаки с неявкой (в секции или по фону/тексту). */
export function isNonArrivedDataRow(rowText: string, bgColor: string | null | undefined, inSection: boolean): boolean {
  if (inSection) return true
  const normalizedBg = bgColor ? bgColor.toLowerCase() : ''
  if (normalizedBg === '#eaeaea') return true
  if (normalizedBg === '#c0c0c0' && /неявка/i.test(rowText)) return true
  return false
}
