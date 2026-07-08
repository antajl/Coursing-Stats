export function toProcoursingArchiveUrl(url: string | null | undefined): string | null {
  const raw = (url || '').trim()
  if (!raw) return null

  if (raw.includes('web.archive.org/web/')) return raw

  const absolute =
    raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `http://procoursing.ru/${raw.replace(/^\//, '')}`

  if (!/procoursing\.ru/i.test(absolute)) return absolute

  return `https://web.archive.org/web/*/${absolute}`
}
