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
    title: 'Coursing Stats — Рейтинг и статистика собак: курсинг, бега, выставки',
    description:
      'Статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года.',
    h1: 'Рейтинг и статистика собак: курсинг, бега, выставки',
    paragraph:
      'Статистика выступлений, награды, медали и рейтинги собак: курсинг и бега борзых, выставки РКФ и замеры скорости в Донино с 2015 года.',
  },
  {
    path: '/competitions',
    title: 'Рейтинг собак: курсинг и бега борзых 2026 | Coursing Stats',
    description:
      'Рейтинг собак по курсингу и бегам борзых сезона 2026 года: лидеры по породам (уиппеты, РПБ, басенджи, грейхаунды), медали, очки CS и динамика позиций.',
    h1: 'Рейтинг собак: курсинг и бега борзых 2026',
    paragraph:
      'Рейтинг собак по курсингу и бегам борзых сезона 2026: зачёт по медалям и очкам CS, динамика лидеров и статистика судей.',
  },
  {
    path: '/shows',
    title: 'Рейтинг выставочных собак РКФ 2026 — Топ чемпионов и судьи | Coursing Stats',
    description:
      'Рейтинг собак по выставкам РКФ 2026 года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей. Ссылки на оригиналы rkf.online.',
    h1: 'Рейтинг выставочных собак РКФ 2026',
    paragraph:
      'Рейтинг собак по выставкам РКФ 2026 года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей. Оригиналы отчетов — на rkf.online.',
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
  {
    path: '/about',
    title: 'О проекте Coursing Stats | Coursing Stats',
    description:
      'Информация о проекте Coursing Stats: стек технологий, архитектура, реализованные улучшения, исходный код.',
    h1: '',
    paragraph:
      'Электронный архив спортивной статистики: результаты соревнований, выставки РКФ и рекорды полигона Донино.',
  },
]

const HUB_NAV: { href: string; label: string }[] = [
  { href: '/', label: 'Главная' },
  { href: '/competitions', label: 'Соревнования' },
  { href: '/shows', label: 'Выставки' },
  { href: '/speed-records', label: 'Донино' },
  { href: '/guide', label: 'Справочник' },
  { href: '/about', label: 'О проекте' },
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

/**
 * Standalone 404 HTML for Yandex Object Storage (error_document: 404.html).
 * Retains exact Old Money theme, CSS links, fonts, Nav header and 404 dogs artwork.
 * Omits client SPA script to prevent unnecessary hydration errors or flash on dead URLs.
 */
export function build404Html(spaHtml: string): string {
  let html = spaHtml
  html = replaceTitle(html, 'Страница не найдена | Coursing Stats')
  html = replaceOrInsertMetaDescription(html, 'Страница не найдена.')
  // Remove canonical link (404 shouldn't have canonical)
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
  // Ensure noindex, nofollow for search engines
  if (/<meta\s+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']robots["'][^>]*>/i,
      '<meta name="robots" content="noindex, nofollow" />',
    )
  } else {
    html = html.replace(/<\/head>/i, '  <meta name="robots" content="noindex, nofollow" />\n</head>')
  }
  // Strip LD+JSON and OG URL
  html = html.replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '')
  html = html.replace(/<meta\s+name=["']twitter:url["'][^>]*>\s*/gi, '')
  html = replaceOrInsertMetaProperty(html, 'og:title', 'Страница не найдена | Coursing Stats')
  html = replaceOrInsertMetaProperty(html, 'og:description', 'Страница не найдена.')
  html = replaceOrInsertMetaName(html, 'twitter:title', 'Страница не найдена | Coursing Stats')
  html = replaceOrInsertMetaName(html, 'twitter:description', 'Страница не найдена.')
  // Strip client JS bundle and modulepreload so 404 is pure rock-solid standalone HTML
  html = html.replace(/<link\s+rel=["']modulepreload["'][^>]*>\s*/gi, '')
  html = html.replace(/<script\s+type=["']module["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')

  const bodyHtml = [
    `<div class="print:hidden" aria-hidden="true" style="position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.048; mix-blend-mode: multiply; background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E&quot;); background-size: 120px 120px; background-repeat: repeat;"></div>`,
    `<div class="cs-page-shell min-h-screen">`,
    `  <nav class="nav-glass sticky top-0 z-50 relative border-b border-cream-300/20 shadow-[0_4px_7px_-2px_rgba(43,37,32,0.34)] print:hidden">`,
    `    <div class="flex h-16 w-full items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">`,
    `      <a href="/" class="flex min-w-0 shrink-0 items-center gap-2 font-semibold text-lg tracking-tight text-camel-800">`,
    `        Coursing Stats`,
    `      </a>`,
    `      <div class="flex items-center gap-4 sm:gap-6 text-sm font-medium text-old-money-700">`,
    `        <a href="/competitions" class="hover:text-camel-800 transition-colors">Соревнования</a>`,
    `        <a href="/shows" class="hover:text-camel-800 transition-colors">Выставки</a>`,
    `        <a href="/speed-records" class="hover:text-camel-800 transition-colors">Донино</a>`,
    `        <a href="/guide" class="hover:text-camel-800 transition-colors">Справочник</a>`,
    `        <a href="/about" class="hover:text-camel-800 transition-colors">О проекте</a>`,
    `      </div>`,
    `    </div>`,
    `  </nav>`,
    `  <div class="fixed inset-0 z-40 overflow-hidden">`,
    `    <picture>`,
    `      <source srcset="/assets/errors/404-dogs-mobile.png" media="(max-width: 768px)">`,
    `      <img src="/assets/errors/404-dogs.png" alt="Силуэты борзых" class="absolute top-16 left-0 right-0 bottom-0 h-full w-full object-cover">`,
    `    </picture>`,
    `  </div>`,
    `</div>`,
  ].join('\n')

  html = setRootBody(html, bodyHtml)
  return html
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

  const medalSummary = gold > 0 ? `${gold} побед (золото)` : medals.length > 0 ? medals.join(', ') : ''

  const title = breed
    ? `${name} (${breed}) — профиль, медали и результаты забегов | Coursing Stats`
    : `${name} — профиль, медали и результаты забегов | Coursing Stats`
  const description =
    facts.length > 0
      ? `${name}${breed ? ` (${breed})` : ''}: ${medalSummary ? `${medalSummary}, ` : ''}${facts.join('; ')}. Профиль спортивной карьеры собаки, результаты забегов и оценки судей на Coursing Stats.`
      : `Профиль спортивной карьеры и результаты собаки ${name}${breed ? ` (${breed})` : ''}: курсинг, бега борзых, медали и рекорды на Coursing Stats.`

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
    ? `${name} (${breed}) — выставочная карьера и награды РКФ | Coursing Stats`
    : `${name} — выставочная карьера и награды РКФ | Coursing Stats`
  const description =
    facts.length > 0
      ? `${name}${breed ? ` (${breed})` : ''}: ${facts.join('; ')}. Профиль выставочной карьеры, оценки экспертов и награды РКФ на Coursing Stats.`
      : `Выставочный профиль и награды собаки ${name}${breed ? ` (${breed})` : ''} на выставках РКФ на Coursing Stats.`

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
    ? `${headline} — результаты соревнований (${date}) | Coursing Stats`
    : `${headline} — результаты соревнований | Coursing Stats`
  const description = [
    `Результаты забегов: ${kind}${date ? ` от ${date}` : ''}`,
    location ? location : null,
    n != null && n > 0 ? `${n} участников` : null,
    'Баллы за забеги, победители по породам и сертификаты на Coursing Stats.',
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
      { name: headline, url: `/event/${entry.id}/` },
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
  const title = `Судья ${name} — статистика курсинга и бегов борзых | Coursing Stats`
  const description =
    facts.length > 0
      ? `Судья по курсингу и бегам борзых ${name}: статистика судейства (${facts.join(', ')}), судимые породы, оценки собак и история стартов на Coursing Stats.`
      : `Судья по курсингу и бегам борзых ${name}: профиль, статистика судейства, оценки собак и судимые породы на Coursing Stats.`
  return {
    title,
    description,
    h1: name,
    paragraph: description,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Судьи', url: '/competitions?tab=judges' },
      { name: name, url: `/judges/${encodeURIComponent(judge.id)}/` },
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
        url: `/donino-dog/${encodeURIComponent(dog.name)}/${encodeURIComponent(dog.breed)}/`,
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
      { name: headline, url: `/shows/exhibition/${entry.id}/` },
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
  const title = `Судья РКФ ${name} — статистика выставок, строгость оценок и породы | Coursing Stats`
  const description =
    facts.length > 0
      ? `Судья РКФ / FCI ${name}: статистика судейства на выставках собак (${facts.join(', ')}), строгость оценок (% отлично), любимые породы и история выставок на Coursing Stats.`
      : `Судья РКФ / FCI ${name}: статистика судейства на выставках собак, строгость оценок (% отлично), породы и история судейства на Coursing Stats.`
  return {
    title,
    description,
    h1: name,
    paragraph: description,
    breadcrumbs: [
      { name: 'Главная', url: '/' },
      { name: 'Судьи выставок', url: '/shows?tab=judges' },
      { name: name, url: `/shows/judges/${encodeURIComponent(judge.id)}/` },
    ],
    sectionLinks: [
      { href: '/shows?tab=judges', label: 'Судьи выставок' },
      { href: '/shows', label: 'Выставки' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}
