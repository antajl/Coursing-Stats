import iconv from 'iconv-lite'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/0.1 (non-commercial project)'

function toAbsoluteProcoursingUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://procoursing.ru/${url.replace(/^\//, '')}`
}

function toRawArchiveUrl(waybackUrl: string): string {
  return waybackUrl.replace(/\/web\/(\d{14})\//, '/web/$1id_/')
}

/**
 * Скачать страницу procoursing.ru из web.archive.org (windows-1251).
 * Возвращает null, если снимка нет или ответ не HTML.
 */
export async function fetchArchiveWin1251(procoursingUrl: string): Promise<string | null> {
  const absolute = toAbsoluteProcoursingUrl(procoursingUrl)
  const availabilityUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(absolute)}`

  const availabilityRes = await fetch(availabilityUrl, { headers: { 'User-Agent': UA } })
  if (!availabilityRes.ok) return null

  const availability = (await availabilityRes.json()) as {
    archived_snapshots?: { closest?: { available?: boolean; url?: string } }
  }

  const closest = availability.archived_snapshots?.closest
  if (!closest?.available || !closest.url) return null

  const rawUrl = toRawArchiveUrl(closest.url)
  const res = await fetch(rawUrl, { headers: { 'User-Agent': UA } })
  if (!res.ok) return null

  const buf = Buffer.from(await res.arrayBuffer())
  const html = iconv.decode(buf, 'win1251')
  if (!html.includes('<') || html.length < 200) return null
  return html
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
