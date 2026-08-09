import iconv from 'iconv-lite'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoursingStatsBot/0.1 (non-commercial project)'

function toAbsoluteProcoursingUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `http://procoursing.ru/${url.replace(/^\//, '')}`
}

function toRawArchiveUrl(waybackUrl: string): string {
  return waybackUrl.replace(/\/web\/(\d{14})\//, '/web/$1id_/')
}

async function resolveWaybackViewerUrl(absolute: string): Promise<string | null> {
  // 1) availability API (fast when it works)
  try {
    const availabilityUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(absolute)}`
    const availabilityRes = await fetch(availabilityUrl, { headers: { 'User-Agent': UA } })
    if (availabilityRes.ok) {
      const availability = (await availabilityRes.json()) as {
        archived_snapshots?: { closest?: { available?: boolean; url?: string } }
      }
      const closest = availability.archived_snapshots?.closest
      if (closest?.available && closest.url) return closest.url
    }
  } catch {
    /* fall through to CDX */
  }

  // 2) CDX — availability sometimes returns empty even when snapshots exist
  try {
    const cdxUrl =
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(absolute)}` +
      '&output=json&filter=statuscode:200&limit=5&fl=timestamp,original'
    const cdxRes = await fetch(cdxUrl, { headers: { 'User-Agent': UA } })
    if (!cdxRes.ok) return null
    const rows = (await cdxRes.json()) as string[][]
    // rows[0] = header; prefer newest successful snapshot
    const data = rows.slice(1).filter((r) => r[0] && /^\d{14}$/.test(r[0]))
    if (!data.length) return null
    data.sort((a, b) => a[0].localeCompare(b[0]))
    const [ts, original] = data[data.length - 1]
    return `https://web.archive.org/web/${ts}/${original || absolute}`
  } catch {
    return null
  }
}

/**
 * Скачать страницу procoursing.ru из web.archive.org (windows-1251).
 * Возвращает null, если снимка нет или ответ не HTML.
 */
export async function fetchArchiveWin1251(procoursingUrl: string): Promise<string | null> {
  const absolute = toAbsoluteProcoursingUrl(procoursingUrl)
  const viewerUrl = await resolveWaybackViewerUrl(absolute)
  if (!viewerUrl) return null

  const rawUrl = toRawArchiveUrl(viewerUrl)
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
