/**
 * Pure helpers for SEO prerender (Phase B).
 * Clone Vite SPA shell → path-specific HTML with real meta + crawlable #root body.
 */

export const SITE_ORIGIN = 'https://coursing-stats.ru'

export type HubMeta = {
  path: string
  title: string
  description: string
  h1: string
  paragraph: string
}

export type DogProfileInput = {
  id: string | number
  name: string
  breed?: string | null
  facts: string[]
  recentCompetitions?: string[]
}

export type BreadcrumbItem = { name: string; url: string }

export const HUB_PAGES: HubMeta[] = [
  {
    path: '/',
    title: 'Статистика курсинга, бегов и выставок собак | Coursing Stats',
    description:
      'Coursing Stats — вся карьера вашей собаки в одном месте: история выступлений, награды, рейтинги и статистика судей. Курсинг, бега и выставки с 2015 года.',
    h1: 'Статистика курсинга, бегов и выставок',
    paragraph:
      'Вся карьера вашей собаки — в одном месте. История выступлений, награды, рейтинги и статистика судей по курсингу, бегам и выставкам.',
  },
  {
    path: '/competitions',
    title: 'Рейтинг собак: курсинг и бега борзых | Coursing Stats',
    description:
      'Рейтинг собак по медалям и очкам (курсинг, БЗМП, бега борзых), медальный зачёт и статистика судей. Данные с 2015 года.',
    h1: 'Рейтинг собак: курсинг и бега борзых',
    paragraph:
      'Два отдельных рейтинга — по медалям и по очкам (индекс CS), плюс статистика судей. Источник протоколов — procoursing.ru.',
  },
  {
    path: '/shows',
    title: 'Рейтинг выставочных собак РКФ | Coursing Stats',
    description:
      'Рейтинг собак по выставкам РКФ: награды дня (CAC, BOB, ЧРКФ и др.), профили и статистика судей. Ссылки на оригиналы rkf.online.',
    h1: 'Рейтинг выставочных собак РКФ',
    paragraph:
      'Рейтинг по выставкам conformation: награды дня, профили собак и судьи. Оригиналы протоколов — на rkf.online.',
  },
  {
    path: '/speed-records',
    title: 'Рекорды Донино: замер скорости и бега 350 м | Coursing Stats',
    description:
      'Рекорды полигона Курсинг Донино: замер скорости (км/ч) и бега борзых на 350 м (сек). Таблицы по породам, статистика и история.',
    h1: 'Рекорды Донино: замер скорости и бега 350 м',
    paragraph:
      'Две отдельные таблицы: замер скорости (км/ч) и бега 350 м (секунды). Данные с runningdog.ru / полигона Курсинг Донино.',
  },
  {
    path: '/guide',
    title: 'Справочник — титулы, протоколы, рейтинг | Coursing Stats',
    description:
      'Справочник Coursing Stats: титулы курсинга и выставок, как читать протоколы, как устроен рейтинг, источники данных.',
    h1: 'Справочник — титулы, протоколы, рейтинг',
    paragraph:
      'Титулы и сертификаты, выставки РКФ, чтение протоколов, формула рейтинга и источники данных проекта.',
  },
]

const HUB_NAV: { href: string; label: string }[] = [
  { href: '/', label: 'Главная' },
  { href: '/competitions', label: 'Соревнования' },
  { href: '/shows', label: 'Выставки' },
  { href: '/speed-records', label: 'Донино' },
  { href: '/guide', label: 'Справочник' },
]

export function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_ORIGIN}${item.url}`,
    })),
  }
}

function replaceOrInsertMetaDescription(html: string, description: string): string {
  const desc = escapeHtml(description)
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    return html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${desc}" />`,
    )
  }
  return html.replace(/<\/head>/i, `  <meta name="description" content="${desc}" />\n</head>`)
}

function replaceOrInsertCanonical(html: string, canonicalUrl: string): string {
  const href = escapeHtml(canonicalUrl)
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${href}" />`,
    )
  }
  return html.replace(/<\/head>/i, `  <link rel="canonical" href="${href}" />\n</head>`)
}

function replaceTitle(html: string, title: string): string {
  const safe = escapeHtml(title)
  if (/<title>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safe}</title>`)
  }
  return html.replace(/<\/head>/i, `  <title>${safe}</title>\n</head>`)
}

function injectJsonLd(html: string, data: Record<string, unknown> | null | undefined): string {
  if (!data) return html
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const script = `<script type="application/ld+json">${json}</script>`
  return html.replace(/<\/head>/i, `  ${script}\n</head>`)
}

function setRootBody(html: string, bodyHtml: string): string {
  if (/<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i.test(html)) {
    return html.replace(
      /<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i,
      `<div id="root">${bodyHtml}</div>`,
    )
  }
  // Empty self-closing-ish: <div id="root"></div> already covered; fallback insert before body end
  return html.replace(/<\/body>/i, `<div id="root">${bodyHtml}</div>\n</body>`)
}

export type ApplyMetaOptions = {
  title: string
  description: string
  canonicalUrl: string
  bodyHtml: string
  jsonLd?: Record<string, unknown> | null
}

/** Patch SPA shell: title, description, canonical, optional JSON-LD, #root body. Keeps script/link assets. */
export function applyMetaToSpaShell(spaHtml: string, options: ApplyMetaOptions): string {
  let html = spaHtml
  html = replaceTitle(html, options.title)
  html = replaceOrInsertMetaDescription(html, options.description)
  html = replaceOrInsertCanonical(html, options.canonicalUrl)
  html = injectJsonLd(html, options.jsonLd)
  html = setRootBody(html, options.bodyHtml)
  return html
}

function hubNavHtml(currentPath: string): string {
  const links = HUB_NAV.map(({ href, label }) => {
    const current = href === currentPath
    const attrs = current ? ' aria-current="page"' : ''
    return `<a href="${href}"${attrs}>${escapeHtml(label)}</a>`
  }).join(' · ')
  return `<nav aria-label="Разделы сайта">${links}</nav>`
}

export function buildHubBodyHtml(hub: Pick<HubMeta, 'path' | 'h1' | 'paragraph'>): string {
  return [
    `<main>`,
    `<h1>${escapeHtml(hub.h1)}</h1>`,
    `<p>${escapeHtml(hub.paragraph)}</p>`,
    hubNavHtml(hub.path),
    `</main>`,
  ].join('\n')
}

export function buildDogBodyHtml(dog: DogProfileInput): string {
  const name = dog.name || 'Собака'
  const breed = dog.breed ? ` (${dog.breed})` : ''
  const crumbs = [
    `<a href="/">Главная</a>`,
    `<a href="/competitions">Рейтинг</a>`,
    `<span>${escapeHtml(name)}</span>`,
  ].join(' → ')

  const factItems = dog.facts
    .filter(Boolean)
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join('')
  const factsBlock = factItems
    ? `<ul>${factItems}</ul>`
    : `<p>Статистика собаки на Coursing Stats.</p>`

  const comps = (dog.recentCompetitions || []).filter(Boolean).slice(0, 5)
  const compsBlock =
    comps.length > 0
      ? `<h2>Недавние старты</h2><ul>${comps.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
      : ''

  const links = [
    `<a href="/competitions">Соревнования</a>`,
    `<a href="/shows">Выставки</a>`,
    `<a href="/speed-records">Донино</a>`,
    `<a href="/guide">Справочник</a>`,
  ].join(' · ')

  return [
    `<main>`,
    `<nav aria-label="Хлебные крошки">${crumbs}</nav>`,
    `<h1>${escapeHtml(name)}${escapeHtml(breed)}</h1>`,
    factsBlock,
    compsBlock,
    `<nav aria-label="Разделы сайта">${links}</nav>`,
    `</main>`,
  ].join('\n')
}

export function dogMetaFromProfile(profile: {
  dog?: {
    id?: number | string
    name_lat?: string | null
    name_ru?: string | null
    breed?: string | null
    coursing_stats?: { total_starts?: number; gold?: number; silver?: number; bronze?: number } | null
    racing_stats?: { total_starts?: number; gold?: number; silver?: number; bronze?: number } | null
  } | null
  competitions?: Array<{ title?: string | null; date_start?: string | null }> | null
}): { title: string; description: string; body: DogProfileInput; breadcrumbs: BreadcrumbItem[] } {
  const dog = profile.dog || {}
  const id = dog.id ?? ''
  const name = dog.name_lat || dog.name_ru || 'Собака'
  const breed = dog.breed || ''
  const facts: string[] = []
  const cs = dog.coursing_stats
  const rs = dog.racing_stats
  if (cs && (cs.total_starts || 0) > 0) {
    facts.push(`Курсинг: ${cs.total_starts} стартов`)
  }
  if (rs && (rs.total_starts || 0) > 0) {
    facts.push(`Бега: ${rs.total_starts} стартов`)
  }
  const medals: string[] = []
  const gold = (cs?.gold || 0) + (rs?.gold || 0)
  const silver = (cs?.silver || 0) + (rs?.silver || 0)
  const bronze = (cs?.bronze || 0) + (rs?.bronze || 0)
  if (gold) medals.push(`золото ${gold}`)
  if (silver) medals.push(`серебро ${silver}`)
  if (bronze) medals.push(`бронза ${bronze}`)
  if (medals.length) facts.push(`Медали: ${medals.join(', ')}`)

  const recent = [...(profile.competitions || [])]
    .sort((a, b) => String(b.date_start || '').localeCompare(String(a.date_start || '')))
    .map((c) => c.title)
    .filter((t): t is string => Boolean(t))
    .slice(0, 5)

  const title = breed
    ? `${name} (${breed}) — статистика курсинг, бега, выставки | Coursing Stats`
    : `${name} — статистика курсинг, бега, выставки | Coursing Stats`
  const description =
    facts.length > 0
      ? `${name}${breed ? ` (${breed})` : ''}: ${facts.join('; ')}. Статистика на Coursing Stats.`
      : `Статистика собаки ${name}${breed ? ` (${breed})` : ''}: курсинг, бега борзых, выставки и Донино.`

  return {
    title,
    description,
    body: { id, name, breed, facts, recentCompetitions: recent },
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Рейтинг', url: '/competitions' },
      { name, url: `/dog/${id}` },
    ],
  }
}

export function dogMetaFromShowRanking(entry: {
  id?: string | number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  total_shows?: number | null
  best_award?: string | null
}): { title: string; description: string; body: DogProfileInput; breadcrumbs: BreadcrumbItem[] } {
  const id = entry.id ?? ''
  const name = entry.name_lat || entry.name_ru || 'Собака'
  const breed = entry.breed || ''
  const facts: string[] = []
  if (entry.total_shows != null && entry.total_shows > 0) {
    facts.push(`Выставки: ${entry.total_shows}`)
  }
  if (entry.best_award) {
    facts.push(`Лучшая награда: ${entry.best_award}`)
  }

  const title = breed
    ? `${name} (${breed}) — выставки РКФ | Coursing Stats`
    : `${name} — выставки РКФ | Coursing Stats`
  const description =
    facts.length > 0
      ? `${name}${breed ? ` (${breed})` : ''}: ${facts.join('; ')}. Профиль на Coursing Stats.`
      : `Выставочный профиль ${name}${breed ? ` (${breed})` : ''} на Coursing Stats.`

  return {
    title,
    description,
    body: { id, name, breed, facts, recentCompetitions: [] },
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Рейтинг', url: '/competitions' },
      { name, url: `/dog/${id}` },
    ],
  }
}
