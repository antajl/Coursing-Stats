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
      'Coursing Stats — агрегатор результатов курсинга, бегов борзых и выставок РКФ (в т.ч. протоколы с procoursing.ru): карьера собаки, награды и рейтинги с 2015 года.',
    h1: 'Статистика курсинга, бегов и выставок собак',
    paragraph:
      'Агрегатор результатов: выступления, награды, рейтинги и экспертные оценки. Курсинг и бега (протоколы с procoursing.ru), выставки РКФ — с 2015 года.',
  },
  {
    path: '/competitions',
    title: 'Рейтинг собак: курсинг и бега борзых | Coursing Stats',
    description:
      'Два отдельных рейтинга — по медалям и по очкам CS (курсинг, БЗМП, бега борзых) — плюс статистика судей. Источник протоколов — procoursing.ru, данные с 2015 года.',
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
      'Рейтинг собак по выставкам РКФ: награды дня (CAC, BOB, ЧРКФ и др.), профили и статистика судей. Оригиналы протоколов — на rkf.online.',
  },
  {
    path: '/speed-records',
    title: 'Курсинг в Донино: рекорды скорости и бега 350 м | Coursing Stats',
    description:
      'Рекорды курсинга в Донино: замер скорости (км/ч) и бега борзых на 350 м (сек) на полигоне Курсинг Донино. Таблицы по породам, статистика и история.',
    h1: 'Курсинг в Донино: рекорды скорости и бега 350 м',
    paragraph:
      'Две отдельные таблицы курсинга в Донино: замер скорости (км/ч) и бега борзых на 350 м (секунды). Данные с полигона Курсинг Донино.',
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

function replaceOrInsertMetaProperty(html: string, property: string, content: string): string {
  const safe = escapeHtml(content)
  const re = new RegExp(
    `<meta\\s+property=["']${property}["'][^>]*>`,
    'i',
  )
  const tag = `<meta property="${property}" content="${safe}" />`
  if (re.test(html)) return html.replace(re, tag)
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
}

function replaceOrInsertMetaName(html: string, name: string, content: string): string {
  const safe = escapeHtml(content)
  const re = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i')
  const tag = `<meta name="${name}" content="${safe}" />`
  if (re.test(html)) return html.replace(re, tag)
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
}

export type ApplyMetaOptions = {
  title: string
  description: string
  canonicalUrl: string
  bodyHtml: string
  jsonLd?: Record<string, unknown> | null
  ogImage?: string
}

/** Strip hub/dog patches so SPA fallback never advertises home canonical. */
export function buildNeutralSpaShell(html: string): string {
  let out = html
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
  out = out.replace(
    /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    '',
  )
  out = replaceTitle(
    out,
    'Coursing Stats — статистика курсинга, бегов и выставок собак',
  )
  out = replaceOrInsertMetaDescription(
    out,
    'Coursing Stats — рейтинги и статистика собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ, профили и судьи.',
  )
  // Do not advertise home URL on the shared SPA fallback shell.
  out = out.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '')
  out = replaceOrInsertMetaProperty(
    out,
    'og:title',
    'Coursing Stats — статистика курсинга, бегов и выставок',
  )
  out = replaceOrInsertMetaProperty(
    out,
    'og:description',
    'Рейтинги собак: курсинг и бега, рекорды Донино, выставки РКФ, профили и судьи.',
  )
  out = setRootBody(out, '')
  return out
}

/** Patch SPA shell: title, description, canonical, OG/Twitter, optional JSON-LD, #root body. */
export function applyMetaToSpaShell(spaHtml: string, options: ApplyMetaOptions): string {
  const ogImage = options.ogImage || `${SITE_ORIGIN}/og-image.svg`
  let html = spaHtml
  html = replaceTitle(html, options.title)
  html = replaceOrInsertMetaDescription(html, options.description)
  html = replaceOrInsertCanonical(html, options.canonicalUrl)
  html = replaceOrInsertMetaProperty(html, 'og:type', 'website')
  html = replaceOrInsertMetaProperty(html, 'og:url', options.canonicalUrl)
  html = replaceOrInsertMetaProperty(html, 'og:title', options.title)
  html = replaceOrInsertMetaProperty(html, 'og:description', options.description)
  html = replaceOrInsertMetaProperty(html, 'og:image', ogImage)
  html = replaceOrInsertMetaProperty(html, 'og:locale', 'ru_RU')
  html = replaceOrInsertMetaProperty(html, 'og:site_name', 'Coursing Stats')
  html = replaceOrInsertMetaName(html, 'twitter:card', 'summary_large_image')
  html = replaceOrInsertMetaName(html, 'twitter:url', options.canonicalUrl)
  html = replaceOrInsertMetaName(html, 'twitter:title', options.title)
  html = replaceOrInsertMetaName(html, 'twitter:description', options.description)
  html = replaceOrInsertMetaName(html, 'twitter:image', ogImage)
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
      ? `<h2>Недавние участия</h2><ul>${comps.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>`
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
    facts.push(`Курсинг: ${cs.total_starts} участий`)
  }
  if (rs && (rs.total_starts || 0) > 0) {
    facts.push(`Бега: ${rs.total_starts} участий`)
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

export type SimpleEntityMeta = {
  title: string
  description: string
  h1: string
  paragraph: string
  breadcrumbs: BreadcrumbItem[]
  sectionLinks: { href: string; label: string }[]
}

export function buildSimpleEntityBodyHtml(meta: Omit<SimpleEntityMeta, 'title' | 'description'>): string {
  const crumbs = meta.breadcrumbs
    .map((c, i) =>
      i === meta.breadcrumbs.length - 1
        ? `<span>${escapeHtml(c.name)}</span>`
        : `<a href="${escapeHtml(c.url)}">${escapeHtml(c.name)}</a>`,
    )
    .join(' → ')
  const links = meta.sectionLinks
    .map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`)
    .join(' · ')
  return [
    `<main>`,
    `<nav aria-label="Хлебные крошки">${crumbs}</nav>`,
    `<h1>${escapeHtml(meta.h1)}</h1>`,
    `<p>${escapeHtml(meta.paragraph)}</p>`,
    `<nav aria-label="Разделы сайта">${links}</nav>`,
    `</main>`,
  ].join('\n')
}

export function eventMetaFromEntry(entry: {
  id: string
  title?: string | null
  date_start?: string | null
  location?: string | null
  result_count?: number | null
  event_type?: string | null
  competition_kind?: string | null
}): SimpleEntityMeta {
  const headline = entry.title?.trim() || `Соревнование ${entry.id}`
  const date = entry.date_start || ''
  const location = entry.location?.trim() || ''
  const kind = entry.competition_kind || entry.event_type || 'курсинг'
  const n = entry.result_count
  const title = date
    ? `${headline} — ${date} | Coursing Stats`
    : `${headline} | Coursing Stats`
  const description = [
    `Результаты: ${kind}${date ? ` ${date}` : ''}`,
    location ? location : null,
    n != null && n > 0 ? `${n} участников` : null,
    'Протокол на Coursing Stats.',
  ]
    .filter(Boolean)
    .join('. ')
  const paragraph = [
    `Результаты соревнования по виду «${kind}»`,
    date ? `от ${date}` : null,
    location ? `в ${location}` : null,
    n != null && n > 0 ? `(${n} участников)` : null,
    'Статистика курсинга, бегов борзых и рейтинги на Coursing Stats.',
  ]
    .filter(Boolean)
    .join(' ')

  return {
    title,
    description,
    h1: headline,
    paragraph,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Соревнования', url: '/competitions' },
      { name: headline, url: `/event/${entry.id}` },
    ],
    sectionLinks: [
      { href: '/competitions?tab=calendar', label: 'Календарь' },
      { href: '/competitions?tab=ranking', label: 'Рейтинг' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}

export function sportJudgeMeta(judge: {
  id: string
  name?: string | null
  unique_events?: number | null
  unique_breeds?: number | null
  unique_dogs?: number | null
}): SimpleEntityMeta {
  const name = judge.name?.trim() || judge.id
  const facts = [
    judge.unique_events != null ? `${judge.unique_events} соревнований` : null,
    judge.unique_breeds != null ? `${judge.unique_breeds} пород` : null,
    judge.unique_dogs != null ? `${judge.unique_dogs} собак` : null,
  ].filter(Boolean)
  const title = `${name} — статистика судьи | Coursing Stats`
  const description =
    facts.length > 0
      ? `Статистика судьи ${name} по курсингу и бегам борзых: ${facts.join(', ')}.`
      : `Статистика судьи ${name} по курсингу и бегам борзых на Coursing Stats.`
  return {
    title,
    description,
    h1: name,
    paragraph: description,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Судьи', url: '/competitions?tab=judges' },
      { name: name, url: `/judges/${encodeURIComponent(judge.id)}` },
    ],
    sectionLinks: [
      { href: '/competitions?tab=judges', label: 'Судьи' },
      { href: '/competitions', label: 'Соревнования' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}

export function doninoMeta(dog: { name: string; breed: string }): SimpleEntityMeta {
  const title = `${dog.name} (${dog.breed}) — рекорды Донино | Coursing Stats`
  const description = `Рекорды ${dog.name} (${dog.breed}) на полигоне Курсинг Донино: замер скорости и бега 350 м.`
  return {
    title,
    description,
    h1: `${dog.name} (${dog.breed})`,
    paragraph: description,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Донино', url: '/speed-records' },
      {
        name: dog.name,
        url: `/donino-dog/${encodeURIComponent(dog.name)}/${encodeURIComponent(dog.breed)}`,
      },
    ],
    sectionLinks: [
      { href: '/speed-records', label: 'Рекорды Донино' },
      { href: '/competitions', label: 'Соревнования' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}

export function exhibitionMeta(entry: {
  id: string
  title?: string | null
  date?: string | null
  city?: string | null
  dogCount?: number | null
}): SimpleEntityMeta {
  const headline = entry.title?.trim() || `Выставка ${entry.id}`
  const date = entry.date || ''
  const city = entry.city || ''
  const n = entry.dogCount
  const title = date
    ? `${headline} — ${date} | Coursing Stats`
    : `${headline} | Coursing Stats`
  const description = [
    `Выставка РКФ: ${headline}`,
    date || null,
    city || null,
    n != null && n > 0 ? `${n} собак в протоколе` : null,
    'Результаты и статистика на Coursing Stats.',
  ]
    .filter(Boolean)
    .join('. ')
  return {
    title,
    description,
    h1: headline,
    paragraph: description,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Выставки', url: '/shows' },
      { name: headline, url: `/shows/exhibition/${entry.id}` },
    ],
    sectionLinks: [
      { href: '/shows?tab=calendar', label: 'Календарь выставок' },
      { href: '/shows?tab=ranking', label: 'Рейтинг' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}

export function showJudgeMeta(judge: {
  id: string
  name?: string | null
  display_name?: string | null
  total_judged?: number | null
  unique_breeds?: number | null
}): SimpleEntityMeta {
  const name = judge.display_name?.trim() || judge.name?.trim() || judge.id
  const facts = [
    judge.total_judged != null ? `${judge.total_judged} оценок` : null,
    judge.unique_breeds != null ? `${judge.unique_breeds} пород` : null,
  ].filter(Boolean)
  const title = `${name} — судья выставок | Coursing Stats`
  const description =
    facts.length > 0
      ? `Статистика судьи ${name} на выставках РКФ: ${facts.join(', ')}.`
      : `Статистика судьи ${name} на выставках РКФ на Coursing Stats.`
  return {
    title,
    description,
    h1: name,
    paragraph: description,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Судьи выставок', url: '/shows?tab=judges' },
      { name: name, url: `/shows/judges/${encodeURIComponent(judge.id)}` },
    ],
    sectionLinks: [
      { href: '/shows?tab=judges', label: 'Судьи выставок' },
      { href: '/shows', label: 'Выставки' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}
