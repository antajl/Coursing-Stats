export function formatRuDate(iso?: string | null): string {
  if (!iso) return '—'
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  return `${parts[2]}.${parts[1]}.${parts[0]}`
}

export function formatShowDate(raw?: string | null): string {
  if (!raw) return '—'
  if (raw.includes('.')) {
    const [day, month, year] = raw.split('.')
    if (day && month && year) return `${day}.${month}.${year}`
  }
  return raw
}

const REGION_OR_ADMIN_RE = /(?:область|обл\.?|край|республика|ао|г\.о\.|р-н|район|округ)$/i
const SETTLEMENT_PREFIX_RE = /^(?:г\.|д\.|с\.|п\.|пос\.|с\.п\.|деревня|село)\s+/i

/** Извлекает короткое название места старта («Донино», «Ставрополь», «Первитино»). */
export function formatShortLocation(raw?: string | null): string | null {
  if (!raw?.trim()) return null
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length === 0) return null

  const settlement = parts.find((p) => SETTLEMENT_PREFIX_RE.test(p))
  if (settlement) {
    const stripped = settlement.replace(SETTLEMENT_PREFIX_RE, '').trim()
    if (stripped) return stripped
  }

  for (let i = parts.length - 1; i >= 0; i--) {
    if (!REGION_OR_ADMIN_RE.test(parts[i])) {
      return parts[i].replace(SETTLEMENT_PREFIX_RE, '').trim()
    }
  }

  return parts[parts.length - 1]
    .replace(/\s+(?:г\.о\.|р-н|район|округ)$/i, '')
    .trim()
}

/** Сокращает типовую шапку выставок РКФ без потери статуса монопородности и клуба. */
export function formatCompactShowTitle(raw?: string | null): string {
  const trimmed = (raw || '').trim()
  if (!trimmed) return 'Выставка РКФ'

  let text = trimmed.replace(/\s{2,}/g, ' ')
  let prefix = ''

  if (/^монопородная\s+выставка\s+клуба\s+/i.test(text)) {
    text = text.replace(/^монопородная\s+выставка\s+клуба\s+/i, '')
    prefix = 'Моно · '
  } else if (/^монопородная\s+выставка\s+/i.test(text)) {
    text = text.replace(/^монопородная\s+выставка\s+/i, '')
    prefix = 'Моно · '
  } else if (/^выставка\s+клуба\s+/i.test(text)) {
    text = text.replace(/^выставка\s+клуба\s+/i, '')
  }

  // Снимаем лишние внешние кавычки вокруг «"МКОО "ТРЕЙЛ""»
  if (text.startsWith('"') && text.endsWith('"') && text.length > 2) {
    const inner = text.slice(1, -1).trim()
    if (inner.includes('"')) text = inner
  }

  return `${prefix}${text}`.trim()
}

function pluralRu(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} ${many}`
  if (mod10 === 1) return `${count} ${one}`
  if (mod10 >= 2 && mod10 <= 4) return `${count} ${few}`
  return `${count} ${many}`
}

export function formatCompetitionsCount(count: number): string {
  return pluralRu(count, 'состязание', 'состязания', 'состязаний')
}

export function formatRunsCount(count: number): string {
  return pluralRu(count, 'забег', 'забега', 'забегов')
}
