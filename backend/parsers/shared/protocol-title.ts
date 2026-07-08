/** Краткое название из `<title>` страницы результатов procoursing (без даты, места и хвоста протокола). */
export function normalizeProtocolPageTitle(raw: string | null | undefined): string | null {
  if (!raw) return null

  let title = raw.trim()
  title = title.replace(/\s*:\s*Полные\s+результаты\s+состязания\s*$/i, '')
  title = title.replace(/,\s*\d{1,2}(?:-\d{1,2})?\.\d{1,2}\.\d{2,4}(?:\s*\([^)]*\))?\s*$/i, '')
  title = title.replace(/\s*\([^)]*\)\s*$/i, '').trim()

  return title || null
}
