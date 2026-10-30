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

export type DogRecentCompItem = {
  eventId?: string | number
  title: string
  date?: string | null
  placement?: number | null
  qualification?: string | null
}

export type DogProfileInput = {
  id: string | number
  name: string
  secondaryName?: string | null
  rawRuName?: string | null
  rawLatName?: string | null
  breed?: string | null
  facts: string[]
  recentCompetitions?: Array<string | DogRecentCompItem>
}

export type BreadcrumbItem = { name: string; url: string }

export const HUB_PAGES: HubMeta[] = [
  {
    path: '/',
    title: 'Курсинг Статс (Coursing Stats) — Рейтинг и статистика собак: курсинг, бега, выставки РКФ',
    description:
      'Курсинг Статс (Coursing Stats) — статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года.',
    h1: 'Курсинг Статс: рейтинг и статистика собак в курсинге, бегах и выставках',
    paragraph:
      'Курсинг Статс (Coursing Stats) — статистика выступлений, награды, медали и рейтинги собак: курсинг и бега борзых, выставки РКФ и замеры скорости в Донино с 2015 года.',
  },
  {
    path: '/competitions',
    title: 'Календарь и результаты соревнований по курсингу 2026 — Расписание и рейтинг РКФ | Курсинг Статс (Coursing Stats)',
    description:
      'Расписание и календарь соревнований по курсингу и бегам борзых 2026 года: даты состязаний РКФ, регламенты, официальные протоколы и результаты забегов. Медальный зачёт, единый рейтинг, очки CS и рекорды пород на Курсинг Статс (Coursing Stats).',
    h1: 'Расписание соревнований, результаты и рейтинг собак в курсинге',
    paragraph:
      'Календарь состязаний по курсингу и бегам борзых на 2026 год, официальные протоколы РКФ с 2015 года, турнирная таблица, медальный зачёт, очки CS и результаты забегов.',
  },
  {
    path: '/shows',
    title: 'Рейтинг выставочных собак РКФ 2026 — Топ чемпионов и судьи | Курсинг Статс (Coursing Stats)',
    description:
      'Рейтинг собак по выставкам РКФ 2026 года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей. Ссылки на оригиналы rkf.online.',
    h1: 'Рейтинг выставочных собак РКФ 2026',
    paragraph:
      'Рейтинг собак по выставкам РКФ 2026 года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей. Оригиналы отчетов — на rkf.online.',
  },
  {
    path: '/speed-records',
    title: 'Курсинг Донино — результаты забегов, замеры скорости (км/ч) и рекорды борзых | Курсинг Статс (Coursing Stats)',
    description:
      'База бегового клуба «Курсинг в Донино»: результаты забегов, радарные замеры скорости (км/ч) и таблица рекордов борзых на 350 м (сек). Салюки, уиппеты, РПБ, басенджи на полигоне в Раменском районе.',
    h1: 'Курсинг Донино: замеры скорости радаром и рекорды забегов на 350 м',
    paragraph:
      'Официальная база бегового клуба «Курсинг в Донино»: замеры пиковой скорости радаром (км/ч) и результаты бегов борзых на круговой дистанции 350 м (секунды).',
  },
  {
    path: '/donino/championship',
    title: 'Клубный чемпионат Донино по бегам борзых — результаты этапов, лиги и переходы | Курсинг Статс',
    description:
      'Серия клубных чемпионатов по рейсингу в Донино (350 м): результаты этапов, протоколы забегов, система лиг («Прогресс», «Чемпионов», «Абсолют») и официальные переходы между лигами.',
    h1: 'Клубный чемпионат Донино по бегам борзых: результаты, лиги и протоколы',
    paragraph:
      'Официальные результаты серии клубных чемпионатов по рейсингу бегового клуба «Курсинг в Донино»: дистанция 350 м, старт из боксов, фотофиниш, турнирная таблица лиг («Прогресс», «Чемпионов», «Абсолют») и правила ротации.',
  },
  {
    path: '/guide',
    title: 'Справочник — Скорость пород борзых, рекорды, титулы и протоколы | Курсинг Статс (Coursing Stats)',
    description:
      'Справочник Coursing Stats: скорость бега и рекорды пород борзых (салюки, уиппет, РПБ, левретка в км/ч), титулы курсинга и выставок РКФ, чтение протоколов забегов.',
    h1: 'Справочник: рекорды скорости пород, титулы и правила курсинга',
    paragraph:
      'Официальные стандарты и полевая метрология: максимальная скорость и рекорды пород борзых, титулы РКФ и FCI, чтение протоколов забегов и регламент соревнований.',
  },
  {
    path: '/about',
    title: 'О проекте Курсинг Статс | Coursing Stats',
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
  const tag = `<meta name="description" content="${desc}" data-rh="true" />`
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    let replaced = false
    return html.replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, () => {
      if (!replaced) {
        replaced = true
        return `${tag}\n  `
      }
      return ''
    })
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
}

function replaceOrInsertCanonical(html: string, canonicalUrl: string): string {
  const href = escapeHtml(canonicalUrl)
  const tag = `<link rel="canonical" href="${href}" data-rh="true" />`
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    let replaced = false
    return html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, () => {
      if (!replaced) {
        replaced = true
        return `${tag}\n  `
      }
      return ''
    })
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
}

function replaceTitle(html: string, title: string): string {
  const safe = escapeHtml(title)
  const tag = `<title data-rh="true">${safe}</title>`
  if (/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) {
    let replaced = false
    return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, () => {
      if (!replaced) {
        replaced = true
        return `${tag}\n  `
      }
      return ''
    })
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
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
  const re = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>\\s*`, 'gi')
  const tag = `<meta property="${property}" content="${safe}" data-rh="true" />`
  if (re.test(html)) {
    let replaced = false
    return html.replace(re, () => {
      if (!replaced) {
        replaced = true
        return `${tag}\n  `
      }
      return ''
    })
  }
  return html.replace(/<\/head>/i, `  ${tag}\n</head>`)
}

function replaceOrInsertMetaName(html: string, name: string, content: string): string {
  const safe = escapeHtml(content)
  const re = new RegExp(`<meta\\s+(?:name|property)=["']${name}["'][^>]*>\\s*`, 'gi')
  const tag = `<meta name="${name}" content="${safe}" data-rh="true" />`
  if (re.test(html)) {
    let replaced = false
    return html.replace(re, () => {
      if (!replaced) {
        replaced = true
        return `${tag}\n  `
      }
      return ''
    })
  }
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
  out = out.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>\s*/gi, '')
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
 * Preserves client SPA scripts so dynamic routes (show dogs, judges, etc.) hydrate seamlessly.
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
  html = replaceOrInsertMetaProperty(html, 'og:image', `${SITE_ORIGIN}/og-image.png`)
  html = replaceOrInsertMetaName(html, 'twitter:title', 'Страница не найдена | Coursing Stats')
  html = replaceOrInsertMetaName(html, 'twitter:description', 'Страница не найдена.')
  html = replaceOrInsertMetaName(html, 'twitter:image', `${SITE_ORIGIN}/og-image.png`)
  // Invariant: preserve client JS bundle (<script type="module">) and modulepreload
  // so when S3 or a proxy serves 404.html for dynamic SPA routes (e.g. show dogs /dog/:id, judges),
  // the React router can bootstrap, fetch the data, and render the dog profile.

  const bodyHtml = [
    `<div class="print:hidden" aria-hidden="true" style="position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.048; mix-blend-mode: multiply; background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E&quot;); background-size: 120px 120px; background-repeat: repeat;"></div>`,
    `<div class="cs-page-shell min-h-screen">`,
    `  <nav class="nav-glass sticky top-0 z-50 relative border-b border-cream-300/20 shadow-[0_4px_7px_-2px_rgba(43,37,32,0.34)] print:hidden">`,
    `    <div class="flex h-14 sm:h-16 w-full items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">`,
    `      <a href="/" class="flex min-w-0 shrink-0 items-center gap-2 transition-opacity hover:opacity-85" aria-label="Coursing Stats">`,
    `        <img src="/assets/brand/logo.svg" width="348" height="62" alt="Курсинг Статс" class="h-11 sm:h-12 w-auto" style="object-fit: contain;">`,
    `      </a>`,
    `      <div class="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-old-money-700">`,
    `        <a href="/competitions" class="hover:text-camel-800 transition-colors">Соревнования</a>`,
    `        <a href="/shows" class="hover:text-camel-800 transition-colors">Выставки</a>`,
    `        <a href="/speed-records" class="hover:text-camel-800 transition-colors">Донино</a>`,
    `        <a href="/guide" class="hover:text-camel-800 transition-colors">Справочник</a>`,
    `        <a href="/about" class="hover:text-camel-800 transition-colors">О проекте</a>`,
    `      </div>`,
    `      <a href="/" class="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cream-300/60 bg-cream-100/70 text-xs font-semibold text-camel-900 hover:text-camel-950 hover:bg-cream-200/80 transition-colors min-h-[44px]">`,
    `        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 shrink-0" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    `        <span>На главную</span>`,
    `      </a>`,
    `    </div>`,
    `  </nav>`,
    `  <div class="fixed inset-0 z-40 overflow-hidden pointer-events-none">`,
    `    <picture>`,
    `      <source srcset="/assets/errors/404-dogs-mobile.png" media="(max-width: 768px)">`,
    `      <img src="/assets/errors/404-dogs.png" alt="Силуэты борзых" class="absolute top-14 sm:top-16 left-0 right-0 bottom-0 h-full w-full object-cover">`,
    `    </picture>`,
    `  </div>`,
    `</div>`,
  ].join('\n')

  html = setRootBody(html, bodyHtml)
  return html
}

/** Patch SPA shell: title, description, canonical, OG/Twitter, optional JSON-LD, #root body. */
export function applyMetaToSpaShell(spaHtml: string, options: ApplyMetaOptions): string {
  const ogImage = options.ogImage || `${SITE_ORIGIN}/og-image.png`
  let html = spaHtml
  html = replaceTitle(html, options.title)
  html = replaceOrInsertMetaDescription(html, options.description)
  html = replaceOrInsertCanonical(html, options.canonicalUrl)
  html = replaceOrInsertMetaProperty(html, 'og:type', 'website')
  html = replaceOrInsertMetaProperty(html, 'og:url', options.canonicalUrl)
  html = replaceOrInsertMetaProperty(html, 'og:title', options.title)
  html = replaceOrInsertMetaProperty(html, 'og:description', options.description)
  html = replaceOrInsertMetaProperty(html, 'og:image', ogImage)
  html = replaceOrInsertMetaProperty(html, 'og:image:width', '1200')
  html = replaceOrInsertMetaProperty(html, 'og:image:height', '630')
  html = replaceOrInsertMetaProperty(html, 'og:image:type', 'image/png')
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

export const DEFAULT_COMPETITION_FAQS = [
  {
    question: 'Где найти актуальное расписание и календарь соревнований по курсингу борзых на 2026 год?',
    answer:
      'Актуальное расписание соревнований, квалификационных забегов и тренировок по курсингу и бегам борзых на 2026 год представлено в календаре состязаний на портале Coursing Stats. В расписании публикуются официальные даты турниров РКФ, регламенты, площадки проведения (беговой клуб в Донино, Санкт-Петербург, Минск и др.) и ссылки на регистрацию.',
  },
  {
    question: 'Существует ли единый всероссийский рейтинг собак по курсингу?',
    answer:
      'Да. Единый всероссийский рейтинг и постоянная турнирная таблица собак по курсингу и бегам борзых формируются и поддерживаются на портале Coursing Stats на основе официальных протоколов соревнований РКФ с 2015 года. В рейтинге учитываются результаты забегов, медали (золото, серебро, бронза), очки стабильности CS и замеры максимальной скорости по всем породам борзых (уиппеты, РПБ, салюки, басенджи и др.).',
  },
  {
    question: 'Как рассчитывается рейтинг собак в курсинге?',
    answer:
      'В едином рейтинге курсинга порядок определяет зачёт сезона: 1) Медали и эффективность (золото весомее серебра и бронзы; при равных медалях выше тот, кто собрал их за меньшее число забегов). 2) Индекс стабильности CS служит тай-брейком при равном медальном зачёте. В бегах борзых (рейсинге) порядок определяется по максимальной зафиксированной скорости в км/ч.',
  },
  {
    question: 'Какие породы борзых участвуют в рейтинге курсинга?',
    answer:
      'В рейтинге соревнуются основные породы борзых: уиппеты, русские псовые борзые (РПБ), салюки, басенджи, малая итальянская борзая (левретка), афганские борзые, грейхаунды, фараоновы собаки и другие породы 10-й и 5-й групп FCI.',
  },
  {
    question: 'Где посмотреть рекорды скорости и результаты салюки и других борзых в бегах?',
    answer:
      'В единой турнирной таблице Coursing Stats по каждой породе борзых (салюки, уиппеты, РПБ и др.) доступны официальные результаты соревнований РКФ, медальный зачёт, скорость и очки стабильности CS. Для радарных полевых замеров полигона Донино на сайте предусмотрен специальный раздел «Донино».',
  },
]

export function homepageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: 'Курсинг Статс (Coursing Stats)',
        alternateName: ['Курсинг Статс', 'Coursing Stats', 'КурсингСтатс', 'CoursingStats', 'coursing-stats.ru', 'ProCoursing'],
        description:
          'Единая всероссийская база и статистика курсинга, бегов борзых и выставок собак РКФ с 2015 года.',
        inLanguage: 'ru-RU',
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'Курсинг Статс (Coursing Stats)',
        alternateName: ['Курсинг Статс', 'Coursing Stats', 'CoursingStats', 'coursing-stats.ru'],
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/og-image.png`,
        sameAs: ['https://t.me/coursing_stats_bot'],
        knowsAbout: [
          'Курсинг',
          'Бега борзых',
          'Российская кинологическая федерация',
          'Борзые породы собак',
          'Замеры скорости собак Донино',
        ],
      },
    ],
  }
}

export function competitionsJsonLd(
  faqs: Array<{ question: string; answer: string }> = DEFAULT_COMPETITION_FAQS,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd([
        { name: 'Главная', url: '/' },
        { name: 'Соревнования', url: '/competitions' },
      ]),
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  }
}

export function buildCompetitionsHubHtml(
  hub: Pick<HubMeta, 'path' | 'h1' | 'paragraph'>,
  topItems?: Array<{
    dog_id: number
    name_ru?: string | null
    name_lat?: string | null
    breed: string
    gold: number
    silver: number
    bronze: number
    total_starts: number
  }>,
): string {
  const faqBlocks = DEFAULT_COMPETITION_FAQS.map(
    (f) =>
      `<section><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></section>`,
  ).join('\n')

  let topDogsSection = ''
  if (topItems && topItems.length > 0) {
    const listItems = topItems
      .slice(0, 10)
      .map((d) => {
        const { primary, secondary } = resolveDogNames(d.name_lat, d.name_ru)
        const name = primary || 'Собака'
        const breed = d.breed ? toDogTitleCase(d.breed) : ''
        const medals = []
        if (d.gold) medals.push(`золото: ${d.gold}`)
        if (d.silver) medals.push(`серебро: ${d.silver}`)
        if (d.bronze) medals.push(`бронза: ${d.bronze}`)
        const medalStr = medals.length > 0 ? ` (${medals.join(', ')})` : ''
        return `<li><a href="/dog/${d.dog_id}">${escapeHtml(name)}</a> — ${escapeHtml(breed)}${escapeHtml(medalStr)}, забегов: ${d.total_starts}</li>`
      })
      .join('\n')

    topDogsSection = [
      `<h2>Лидеры текущего сезона по курсингу</h2>`,
      `<ul>`,
      listItems,
      `</ul>`,
    ].join('\n')
  }

  return [
    `<main>`,
    `<h1>${escapeHtml(hub.h1)}</h1>`,
    `<p>${escapeHtml(hub.paragraph)}</p>`,
    topDogsSection,
    `<h2>Частые вопросы о рейтинге курсинга в России</h2>`,
    faqBlocks,
    hubNavHtml(hub.path),
    `</main>`,
  ].join('\n')
}

export const DEFAULT_GUIDE_SPEED_FAQS = [
  {
    question: 'Какова максимальная скорость салюки и рекорд породы?',
    answer:
      'Официальный рекорд скорости салюки в Книге рекордов Гиннесса составляет 68,8 км/ч (зафиксирован в 1996 году на дистанциях свыше 800 м). В отличие от спринтеров, салюки — марафонец и удерживает темп выше 50 км/ч на протяжении нескольких километров. В реальных радарных замерах на полигоне Донино рекорд салюки по прямой составляет 55 км/ч (сука Тайга), а на официальных бегах РКФ средняя скорость по 360-метровому треку — около 47,2 км/ч.',
  },
  {
    question: 'Какая максимальная скорость бега уиппета?',
    answer:
      'Максимальная скорость уиппета при стартовом ускорении за приманкой или механическим зайцем достигает 64–70 км/ч. Средняя скорость на официальных бегах РКФ по 360-метровому овалу составляет 54–56 км/ч (например, 360 м за 23,67 с). По данным радарного хронометража в Донино рекорд породы по прямой составляет 64 км/ч (кобель Драм). Уиппет считается одной из самых быстро разгоняющихся собак в мире: на первых метрах ускорение выше, чем у скаковой лошади.',
  },
  {
    question: 'Какова скорость бега русской псовой борзой (РПБ)?',
    answer:
      'Рабочая скорость русской псовой борзой на дистанции составляет 55–58 км/ч, а на коротком отрезке охотничьего рывка («броска») за зверем или приманкой может достигать 60–65 км/ч. На официальных круговых состязаниях РКФ по бегам средняя скорость лучших борзых составляет около 49 км/ч (360 м за 26,4 с, кобель Драгун), а по радарным замерам в Донино зафиксирована скорость 56 км/ч (сука Флёна).',
  },
  {
    question: 'Какую скорость развивает левретка (малая итальянская борзая)?',
    answer:
      'Средняя скорость бега левретки составляет 40–42 км/ч, а при максимальном азартном ускорении по прямой на коротких дистанциях достигает 45–50 км/ч. По данным радарных измерений полигона Донино рекорд породы зафиксирован на отметке 49 км/ч (кобель Айвенго), а 350-метровый спринт левретки преодолевают за 29,84 секунды.',
  },
  {
    question: 'Какая порода собак самая быстрая в мире?',
    answer:
      'Абсолютным рекордсменом среди собак на коротких дистанциях (спринт до 500 м) является грейхаунд, развивающий скорость до 67–72 км/ч (мировой рекорд Гиннесса — 67,32 км/ч). На средних дистанциях сильнейший спринтер — уиппет (до 64–70 км/ч в пике). На длинных дистанциях (свыше 800 м) лидерство принадлежит салюки (до 68,8 км/ч), обладающей феноменальной аэробной выносливостью.',
  },
  {
    question: 'В чём разница между пиковой скоростью по радару и средней скоростью на бегах?',
    answer:
      'Пиковая скорость (км/ч) фиксируется радаром или оптическими створами на прямом участке трассы в момент максимального броска собаки. Средняя скорость на бегах вычисляется по фотофинишу делением длины трека (например, 360 м) на чистое время прохождения круга. Из-за преодоления двух крутых виражей средняя скорость всегда на 5–10 км/ч ниже пиковой.',
  },
]

export function guideJsonLd(
  faqs: Array<{ question: string; answer: string }> = DEFAULT_GUIDE_SPEED_FAQS,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd([
        { name: 'Главная', url: '/' },
        { name: 'Справочник', url: '/guide' },
      ]),
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  }
}

export function buildGuideHubHtml(
  hub: Pick<HubMeta, 'path' | 'h1' | 'paragraph'>,
): string {
  const speedRows = [
    {
      breed: 'Грейхаунд',
      peak: 'до 67–72 км/ч',
      donino: '—',
      track: '59,4 км/ч (360 м за 21,83 с)',
      note: 'Абсолютный мировой рекордсмен спринта (рекорд Гиннесса — 67,32 км/ч)',
    },
    {
      breed: 'Уиппет',
      peak: 'до 64–70 км/ч',
      donino: '64 км/ч',
      track: '54,7 км/ч (360 м за 23,67 с)',
      note: 'Стартовое ускорение быстрее скаковой лошади; радар Донино — 64 км/ч',
    },
    {
      breed: 'Русская псовая борзая (РПБ)',
      peak: 'до 60–65 км/ч',
      donino: '56 км/ч',
      track: '49,1 км/ч (360 м за 26,41 с)',
      note: 'Охотничий взрывной бросок за зверем на 100–200 м',
    },
    {
      breed: 'Салюки (персидская борзая)',
      peak: 'до 68,8 км/ч',
      donino: '55 км/ч',
      track: '47,2 км/ч (360 м за 27,45 с)',
      note: 'Мировой рекордсмен Гиннесса на дистанциях свыше 800 м; марафонец пустыни',
    },
    {
      breed: 'Малая итальянская борзая (левретка)',
      peak: 'до 45–50 км/ч',
      donino: '49 км/ч',
      track: '40–42 км/ч (350 м за 29,84 с)',
      note: 'Маневренный мини-спринтер весом до 5 кг; радар Донино — 49 км/ч',
    },
    {
      breed: 'Басенджи',
      peak: 'до 41–42 км/ч',
      donino: '41 км/ч',
      track: '40,3 км/ч (360 м за 32,12 с)',
      note: 'Стабильный ровный темп на дистанции 350–500 м',
    },
  ]

  const tableRows = speedRows
    .map(
      (r) =>
        `<tr><td><strong>${escapeHtml(r.breed)}</strong></td><td>${escapeHtml(r.peak)}</td><td>${escapeHtml(r.donino)}</td><td>${escapeHtml(r.track)}</td><td>${escapeHtml(r.note)}</td></tr>`,
    )
    .join('\n')

  const faqBlocks = DEFAULT_GUIDE_SPEED_FAQS.map(
    (f) =>
      `<section><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></section>`,
  ).join('\n')

  return [
    `<main>`,
    `<h1>${escapeHtml(hub.h1)}</h1>`,
    `<p>${escapeHtml(hub.paragraph)}</p>`,
    `<h2>Скорость и рекорды пород борзых (км/ч)</h2>`,
    `<table>`,
    `<thead><tr><th>Порода</th><th>Пиковый спринт</th><th>Радар Донино</th><th>Бега РКФ (360 м)</th><th>Специфика</th></tr></thead>`,
    `<tbody>`,
    tableRows,
    `</tbody>`,
    `</table>`,
    `<p><a href="/competitions">Перейти в турнирную таблицу забегов РКФ</a> · <a href="/speed-records">Смотреть радарные замеры Донино</a></p>`,
    `<h2>Частые вопросы о скорости и рекордах борзых (Google AI Overview)</h2>`,
    faqBlocks,
    hubNavHtml(hub.path),
    `</main>`,
  ].join('\n')
}

const LOWER_WORDS = new Set([
  'из', 'с', 'со', 'от', 'до', 'для', 'без', 'над', 'под', 'при', 'про', 'по', 'за', 'во',
  'de', 'del', 'der', 'di', 'du', 'da', 'von', 'vom', 'van', 'den', 'la', 'le',
  'of', 'the', 'in', 'on', 'at', 'and', 'und', 'et',
])

/** Преобразует кличку или название в Title Case (Стангерс Ланд Зодиак, Rider of Rohan). */
export function toDogTitleCase(str: string): string {
  if (!str) return ''
  return str
    .split(/(\s+|[-/()'"’‘„“«»])/)
    .map((token, idx, arr) => {
      if (!token || /^\s+$/.test(token) || /^[-/()'"’‘„“«»]+$/.test(token)) {
        return token
      }
      if (/^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/i.test(token)) {
        return token.toUpperCase()
      }
      if (/^\d+$/.test(token)) {
        return token
      }
      if (/^(RKF|РКФ|FCI|ФЦИ|CACL|CACIL|CACIT|CAC)$/i.test(token)) {
        return token.toUpperCase()
      }
      const lower = token.toLowerCase()
      const hasPrevWord = arr.slice(0, idx).some((t) => /[^\s\-/()'"’‘„“«»]/.test(t))
      if (hasPrevWord && LOWER_WORDS.has(lower)) {
        return lower
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')
}

/**
 * Разделяет русское и латинское имя для SEO:
 * primary: русское имя (если есть), secondary: латинское (если есть и отличается).
 */
export function resolveDogNames(
  nameLat?: string | null,
  nameRu?: string | null,
): { primary: string; secondary: string | null } {
  let primary = ''
  let secondary: string | null = null

  if (nameLat && nameLat.includes('/')) {
    const slashParts = nameLat.split('/')
    primary = slashParts[0].trim()
    secondary = slashParts.slice(1).join('/').trim() || null
  } else if (nameRu && !nameLat) {
    primary = nameRu
  } else if (nameLat && !nameRu) {
    primary = nameLat
  } else if (nameLat && nameRu && nameLat !== nameRu) {
    primary = nameRu
    secondary = nameLat
  } else {
    primary = nameLat || nameRu || ''
  }

  return {
    primary: toDogTitleCase(primary),
    secondary: secondary ? toDogTitleCase(secondary) : null,
  }
}

/** Форматирует дату YYYY-MM-DD на русском языке без пустых скобок. */
export function formatEventDateRu(dateStr?: string | null): string {
  if (!dateStr) return ''
  const m = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return dateStr
  const [, y, mo, d] = m
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ]
  const monthName = months[parseInt(mo, 10) - 1]
  if (!monthName) return dateStr
  return `${parseInt(d, 10)} ${monthName} ${y} г.`
}

/** Преобразует дату (DD.MM.YYYY или ISO) в канонический формат ISO 8601 YYYY-MM-DD для Schema.org */
export function toIsoDate(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined
  const s = String(dateStr).trim()
  const dmy = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`
  }
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (iso) {
    return iso[1]
  }
  return undefined
}

export function buildDogBodyHtml(dog: DogProfileInput): string {
  const name = dog.name || 'Собака'
  const breed = dog.breed ? ` (${dog.breed})` : ''
  const crumbs = [
    `<a href="/">Главная</a>`,
    `<a href="/competitions">Рейтинг</a>`,
    `<span>${escapeHtml(name)}</span>`,
  ].join(' → ')

  const secondaryBlock = dog.secondaryName
    ? `<p class="dog-secondary-name"><strong>Международная кличка:</strong> ${escapeHtml(dog.secondaryName)}</p>`
    : ''

  const rawAliases = [dog.rawRuName, dog.rawLatName].filter(Boolean)
  const aliasBlock = rawAliases.length > 0
    ? `<p class="dog-aliases"><small>По каталогу: ${escapeHtml(rawAliases.join(' / '))}</small></p>`
    : ''

  const factItems = dog.facts
    .filter(Boolean)
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join('')
  const factsBlock = factItems
    ? `<ul>${factItems}</ul>`
    : `<p>Статистика собаки на Coursing Stats.</p>`

  const comps = (dog.recentCompetitions || []).filter(Boolean).slice(0, 8)
  const compsBlock =
    comps.length > 0
      ? `<h2>Недавние забеги и соревнования</h2><ul>${comps
          .map((item) => {
            if (typeof item === 'string') {
              return `<li>${escapeHtml(item)}</li>`
            }
            const link = item.eventId
              ? `<a href="/event/${item.eventId}/"><strong>${escapeHtml(item.title)}</strong></a>`
              : `<strong>${escapeHtml(item.title)}</strong>`
            const extra = [
              item.date ? formatEventDateRu(item.date) : null,
              item.placement ? `${item.placement} место` : null,
              item.qualification ? `(${escapeHtml(item.qualification)})` : null,
            ]
              .filter(Boolean)
              .join(', ')
            return `<li>${link}${extra ? ` — ${extra}` : ''}</li>`
          })
          .join('')}</ul>`
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
    secondaryBlock,
    aliasBlock,
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
}): {
  title: string
  description: string
  body: DogProfileInput
  breadcrumbs: BreadcrumbItem[]
  jsonLd: Record<string, unknown>
} {
  const dog = profile.dog || {}
  const id = dog.id ?? ''
  const { primary, secondary } = resolveDogNames(dog.name_lat, dog.name_ru)
  const name = primary || 'Собака'
  const displayName = secondary && secondary !== name ? `${name} (${secondary})` : name
  const breed = dog.breed ? toDogTitleCase(dog.breed) : ''

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

  const recent: DogRecentCompItem[] = [...(profile.competitions || [])]
    .filter((c): c is NonNullable<typeof c> => Boolean(c && (c.title || (c as any).event_id || (c as any).id)))
    .sort((a, b) => String(b.date_start || '').localeCompare(String(a.date_start || '')))
    .slice(0, 8)
    .map((c) => {
      const anyC = c as any
      return {
        eventId: anyC.event_id || anyC.id,
        title: c.title || 'Соревнование',
        date: c.date_start || null,
        placement: anyC.placement ?? null,
        qualification: anyC.qualification ?? null,
      }
    })

  const medalSummary = gold > 0 ? `${gold} побед (золото)` : medals.length > 0 ? medals.join(', ') : ''

  const title = breed
    ? `${displayName} (${breed}) — профиль собаки, результаты забегов и медали | Курсинг Статс (Coursing Stats)`
    : `${displayName} — профиль собаки, результаты забегов и медали | Курсинг Статс (Coursing Stats)`
  const description =
    facts.length > 0
      ? `${displayName}${breed ? ` (${breed})` : ''}: ${medalSummary ? `${medalSummary}, ` : ''}${facts.join('; ')}. Профиль спортивной карьеры собаки, результаты забегов и оценки судей на Курсинг Статс (Coursing Stats).`
      : `Профиль спортивной карьеры и результаты собаки ${displayName}${breed ? ` (${breed})` : ''}: курсинг, бега борзых, медали и рекорды на Курсинг Статс (Coursing Stats).`

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Рейтинг', url: '/competitions' },
    { name, url: `/dog/${id}` },
  ]

  const alternateNames = Array.from(
    new Set(
      [secondary, dog.name_ru, dog.name_lat].filter(
        (n): n is string => Boolean(n && n !== name),
      ),
    ),
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'ItemPage',
        '@id': `${SITE_ORIGIN}/dog/${id}/`,
        url: `${SITE_ORIGIN}/dog/${id}/`,
        name: displayName,
        description,
        mainEntity: {
          '@type': 'Thing',
          name,
          ...(alternateNames.length === 1
            ? { alternateName: alternateNames[0] }
            : alternateNames.length > 1
              ? { alternateName: alternateNames }
              : {}),
          ...(breed ? { description: `Порода: ${breed}` } : {}),
          url: `${SITE_ORIGIN}/dog/${id}/`,
        },
      },
    ],
  }

  return {
    title,
    description,
    body: {
      id,
      name,
      secondaryName: secondary,
      rawRuName: dog.name_ru,
      rawLatName: dog.name_lat,
      breed,
      facts,
      recentCompetitions: recent,
    },
    breadcrumbs,
    jsonLd,
  }
}

export function dogMetaFromShowRanking(entry: {
  id?: string | number
  name_lat?: string | null
  name_ru?: string | null
  breed?: string | null
  total_shows?: number | null
  best_award?: string | null
}): {
  title: string
  description: string
  body: DogProfileInput
  breadcrumbs: BreadcrumbItem[]
  jsonLd: Record<string, unknown>
} {
  const id = entry.id ?? ''
  const { primary, secondary } = resolveDogNames(entry.name_lat, entry.name_ru)
  const name = primary || 'Собака'
  const displayName = secondary && secondary !== name ? `${name} (${secondary})` : name
  const breed = entry.breed ? toDogTitleCase(entry.breed) : ''
  const facts: string[] = []
  if (entry.total_shows != null && entry.total_shows > 0) {
    facts.push(`Выставки: ${entry.total_shows}`)
  }
  if (entry.best_award) {
    facts.push(`Лучшая награда: ${entry.best_award}`)
  }

  const title = breed
    ? `${displayName} (${breed}) — выставочная карьера и награды РКФ | Курсинг Статс (Coursing Stats)`
    : `${displayName} — выставочная карьера и награды РКФ | Курсинг Статс (Coursing Stats)`
  const description =
    facts.length > 0
      ? `${displayName}${breed ? ` (${breed})` : ''}: ${facts.join('; ')}. Профиль выставочной карьеры, оценки экспертов и награды РКФ на Курсинг Статс (Coursing Stats).`
      : `Выставочный профиль и награды собаки ${displayName}${breed ? ` (${breed})` : ''} на выставках РКФ на Coursing Stats.`

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Рейтинг', url: '/competitions' },
    { name, url: `/dog/${id}` },
  ]

  const alternateNames = Array.from(
    new Set(
      [secondary, entry.name_ru, entry.name_lat].filter(
        (n): n is string => Boolean(n && n !== name),
      ),
    ),
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'ItemPage',
        '@id': `${SITE_ORIGIN}/dog/${id}/`,
        url: `${SITE_ORIGIN}/dog/${id}/`,
        name: displayName,
        description,
        mainEntity: {
          '@type': 'Thing',
          name,
          ...(alternateNames.length === 1
            ? { alternateName: alternateNames[0] }
            : alternateNames.length > 1
              ? { alternateName: alternateNames }
              : {}),
          ...(breed ? { description: `Порода: ${breed}` } : {}),
          url: `${SITE_ORIGIN}/dog/${id}/`,
        },
      },
    ],
  }

  return {
    title,
    description,
    body: {
      id,
      name,
      secondaryName: secondary,
      rawRuName: entry.name_ru,
      rawLatName: entry.name_lat,
      breed,
      facts,
      recentCompetitions: [],
    },
    breadcrumbs,
    jsonLd,
  }
}

export type SimpleEntityMeta = {
  title: string
  description: string
  h1: string
  paragraph: string
  contentHtml?: string
  breadcrumbs: BreadcrumbItem[]
  jsonLd?: Record<string, unknown>
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
    meta.contentHtml ? meta.contentHtml : '',
    `<nav aria-label="Разделы сайта">${links}</nav>`,
    `</main>`,
  ]
    .filter(Boolean)
    .join('\n')
}

export interface EventWinnerSummary {
  dogId?: number | string | null
  name: string
  breed?: string | null
  score?: number | null
  title?: string | null
  speed_kmh?: number | null
}

export function eventMetaFromEntry(entry: {
  id: string
  title?: string | null
  date_start?: string | null
  date_end?: string | null
  organizer?: string | null
  location?: string | null
  result_count?: number | null
  event_type?: string | null
  competition_kind?: string | null
  winners?: EventWinnerSummary[]
}): SimpleEntityMeta {
  const headline = (entry.title?.trim() || `Соревнование ${entry.id}`).replace(/[\s\-·—]+$/, '')
  const dateFormatted = entry.date_start ? formatEventDateRu(entry.date_start) : ''
  const location = entry.location?.trim() || ''
  const kind = entry.competition_kind || entry.event_type || 'курсинг'
  const n = entry.result_count
  const title = dateFormatted
    ? `${headline} (${dateFormatted}) — результаты соревнований | Coursing Stats`
    : `${headline} — результаты соревнований | Coursing Stats`

  const winnerTexts = (entry.winners || []).slice(0, 3).map((w) => {
    const breed = w.breed ? toDogTitleCase(w.breed) : ''
    const dogName = toDogTitleCase(w.name)
    const scoreText = w.score ? `${w.score} б.` : w.speed_kmh ? `${w.speed_kmh} км/ч` : null
    const details = [breed, scoreText, w.title || null].filter(Boolean).join(', ')
    return details ? `${dogName} (${details})` : dogName
  })
  const winnersPart = winnerTexts.length > 0 ? `Победители: ${winnerTexts.join('; ')}` : null

  const descriptionParts = [
    `Результаты состязания: ${kind}${dateFormatted ? ` от ${dateFormatted}` : ''}`,
    location ? location : null,
    n != null && n > 0 ? `${n} участников` : null,
    winnersPart,
    'Официальный протокол забегов, баллы судей и сертификаты РКФ на Coursing Stats',
  ].filter((p): p is string => Boolean(p))

  const description = descriptionParts.map((s) => s.replace(/\.+$/, '')).join('. ') + '.'
  const paragraph = [
    `Результаты состязания по виду «${kind}»`,
    dateFormatted ? `от ${dateFormatted}` : null,
    location ? `в ${location}` : null,
    n != null && n > 0 ? `(${n} участников)` : null,
    winnersPart ? `${winnersPart}.` : null,
    'Статистика курсинга, бегов борзых и официальные протоколы на Coursing Stats.',
  ]
    .filter(Boolean)
    .join(' ')

  let contentHtml = ''
  if (entry.winners && entry.winners.length > 0) {
    const listItems = entry.winners.map((w) => {
      const breed = w.breed ? ` (${escapeHtml(toDogTitleCase(w.breed))})` : ''
      const dogName = toDogTitleCase(w.name)
      const dogLink = w.dogId
        ? `<a href="/dog/${w.dogId}/"><strong>${escapeHtml(dogName)}</strong></a>`
        : `<strong>${escapeHtml(dogName)}</strong>`
      const details = [
        w.title ? `<em>${escapeHtml(w.title)}</em>` : null,
        w.score ? `${w.score} б.` : null,
        w.speed_kmh ? `${w.speed_kmh} км/ч` : null,
      ]
        .filter(Boolean)
        .join(' · ')
      return `<li>${dogLink}${breed}${details ? ` — ${details}` : ''}</li>`
    }).join('')
    contentHtml = `<h2>Результаты и призеры состязания</h2><ol>${listItems}</ol>`
  }

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Соревнования', url: '/competitions' },
    { name: headline, url: `/event/${entry.id}/` },
  ]

  const startIso = toIsoDate(entry.date_start)
  const endIso = toIsoDate(entry.date_end) || startIso
  const organizerName = entry.organizer?.trim() || 'Российская кинологическая федерация (РКФ)'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'SportsEvent',
        '@id': `${SITE_ORIGIN}/event/${entry.id}/`,
        url: `${SITE_ORIGIN}/event/${entry.id}/`,
        name: headline,
        ...(startIso ? { startDate: startIso } : {}),
        ...(endIso ? { endDate: endIso } : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        organizer: {
          '@type': 'Organization',
          name: organizerName,
          url: 'https://rkf.org.ru',
        },
        ...(location
          ? {
              location: {
                '@type': 'Place',
                name: location,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: location,
                  addressCountry: 'RU',
                },
              },
            }
          : {}),
        description,
        ...(winnerTexts.length > 0 ? { award: winnerTexts } : {}),
        ...(entry.winners && entry.winners.length > 0
          ? {
              competitor: entry.winners.slice(0, 5).map((w) => ({
                '@type': 'Thing',
                name: toDogTitleCase(w.name),
                description: [w.breed ? toDogTitleCase(w.breed) : null, w.title || null]
                  .filter(Boolean)
                  .join(', '),
              })),
            }
          : {}),
      },
    ],
  }

  return {
    title,
    description,
    h1: headline,
    paragraph,
    contentHtml,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: '/competitions?tab=calendar', label: 'Календарь' },
      { href: '/competitions?tab=ranking', label: 'Рейтинг' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}

export const SPORT_JUDGE_FULL_NAMES: Record<string, string> = {
  'Орлова М.О.': 'Орлова Марина Олеговна',
  'Богаченко В.В.': 'Богаченко Владимир Владимирович',
  'Гольдинова Л.М.': 'Гольдинова Лариса Михайловна',
  'Полякова Г.Б.': 'Полякова Галина Борисовна',
  'Кудрявцева Н.Г.': 'Кудрявцева Нина Георгиевна',
  'Коршунова И.А.': 'Коршунова Ирина Александровна',
  'Карелина Н.В.': 'Карелина Наталья Владимировна',
  'Вронская О.В.': 'Вронская Ольга Владимировна',
  'Козлова И.В.': 'Козлова Ирина Валерьевна',
  'Иванова Г.С.': 'Иванова Галина Сергеевна',
  'Лукина Д.М.': 'Лукина Дина Михайловна',
  'Серова Т.Г.': 'Серова Татьяна Геннадьевна',
  'Рубина А.В.': 'Рубина Алла Владимировна',
  'Егорова М.А.': 'Егорова Марина Анатольевна',
  'Петровас Н.Е.': 'Петровас Наталья Евгеньевна',
  'Корепанова Т.В.': 'Корепанова Татьяна Владимировна',
  'Меркушенкова О.В.': 'Меркушенкова Ольга Владимировна',
  'Кузнецова Н.Н.': 'Кузнецова Надежда Николаевна',
  'Евграфова О.Н.': 'Евграфова Ольга Николаевна',
  'Луговая К.И.': 'Луговая Ксения Игоревна',
  'Куликова Г.В.': 'Куликова Галина Владимировна',
  'Видус Г.С.': 'Видус Галина Сергеевна',
  'Минина С.В.': 'Минина Светлана Владимировна',
  'Гродинская Т.Л.': 'Гродинская Татьяна Леонидовна',
  'Мухотин Н.П.': 'Мухотин Николай Павлович',
  'Табуева Т.А.': 'Табуева Татьяна Александровна',
  'Гуриненко А.В.': 'Гуриненко Александр Васильевич',
}

export function sportJudgeMeta(judge: {
  id: string
  name?: string | null
  unique_events?: number | null
  unique_breeds?: number | null
  unique_dogs?: number | null
}): SimpleEntityMeta {
  const shortName = judge.name?.trim() || judge.id
  const fullName = SPORT_JUDGE_FULL_NAMES[shortName] || null
  const displayName = fullName ? `${fullName} (${shortName})` : shortName
  const facts = [
    judge.unique_events != null ? `${judge.unique_events} соревнований` : null,
    judge.unique_breeds != null ? `${judge.unique_breeds} пород` : null,
    judge.unique_dogs != null ? `${judge.unique_dogs} собак` : null,
  ].filter(Boolean)
  const title = `Судья РКФ ${displayName} — статистика курсинга и бегов борзых | Coursing Stats`
  const description =
    facts.length > 0
      ? `Судья РКФ по курсингу и бегам борзых ${displayName}: статистика судейства (${facts.join(', ')}), судимые породы, оценки собак и история забегов на Coursing Stats.`
      : `Судья РКФ по курсингу и бегам борзых ${displayName}: профиль, статистика судейства, оценки собак и судимые породы на Coursing Stats.`
  const url = `${SITE_ORIGIN}/judges/${encodeURIComponent(judge.id)}/`
  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Судьи', url: '/competitions?tab=judges' },
    { name: displayName, url: `/judges/${encodeURIComponent(judge.id)}/` },
  ]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'Person',
        '@id': url,
        url,
        name: fullName || shortName,
        alternateName: [shortName, fullName].filter(
          (n): n is string => Boolean(n) && n !== (fullName || shortName),
        ),
        jobTitle: 'Судья по курсингу и бегам борзых РКФ',
        description,
        worksFor: {
          '@type': 'Organization',
          name: 'Российская Кинологическая Федерация (РКФ)',
        },
      },
    ],
  }

  return {
    title,
    description,
    h1: displayName,
    paragraph: description,
    breadcrumbs,
    jsonLd,
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
  const url = `${SITE_ORIGIN}/donino-dog/${encodeURIComponent(dog.name)}/${encodeURIComponent(dog.breed)}/`
  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Донино', url: '/speed-records' },
    {
      name: dog.name,
      url: `/donino-dog/${encodeURIComponent(dog.name)}/${encodeURIComponent(dog.breed)}/`,
    },
  ]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'ItemPage',
        '@id': url,
        url,
        name: `${dog.name} (${dog.breed})`,
        description,
        mainEntity: {
          '@type': 'Thing',
          name: dog.name,
          description: `Порода: ${dog.breed}`,
          url,
        },
      },
    ],
  }

  return {
    title,
    description,
    h1: `${dog.name} (${dog.breed})`,
    paragraph: description,
    breadcrumbs,
    jsonLd,
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
  club?: string | null
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

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Выставки', url: '/shows' },
    { name: headline, url: `/shows/exhibition/${entry.id}/` },
  ]

  const startDateIso = toIsoDate(date)
  const organizerName = entry.club?.trim() || 'Российская кинологическая федерация (РКФ)'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'Event',
        '@id': `${SITE_ORIGIN}/shows/exhibition/${entry.id}/`,
        url: `${SITE_ORIGIN}/shows/exhibition/${entry.id}/`,
        name: headline,
        ...(startDateIso
          ? {
              startDate: startDateIso,
              endDate: startDateIso,
            }
          : {}),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        organizer: {
          '@type': 'Organization',
          name: organizerName,
          url: 'https://rkf.org.ru',
        },
        location: {
          '@type': 'Place',
          name: city || 'Россия',
          address: {
            '@type': 'PostalAddress',
            ...(city ? { addressLocality: city } : {}),
            addressCountry: 'RU',
          },
        },
        description,
      },
    ],
  }

  return {
    title,
    description,
    h1: headline,
    paragraph: description,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: '/shows?tab=archive', label: 'Архив выставок' },
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
  excellent_rate?: number | null
}): SimpleEntityMeta {
  const rawName = judge.display_name?.trim() || judge.name?.trim() || judge.id
  const name = toDogTitleCase(rawName)
  const facts = [
    judge.total_judged != null ? `${judge.total_judged} оценок` : null,
    judge.unique_breeds != null ? `${judge.unique_breeds} пород` : null,
    judge.excellent_rate != null ? `${Math.round(judge.excellent_rate * 100)}% отлично` : null,
  ].filter(Boolean)
  const title = `Эксперт РКФ ${name} — судья выставок собак, статистика и отзывы | Coursing Stats`
  const description =
    facts.length > 0
      ? `Эксперт РКФ / FCI ${name}: статистика судейства на выставках собак (${facts.join(', ')}), строгость оценок, судимые породы и отзывы на Coursing Stats.`
      : `Эксперт РКФ / FCI ${name}: статистика судейства на выставках собак, строгость оценок (% отлично), породы и история судейства на Coursing Stats.`
  const url = `${SITE_ORIGIN}/shows/judges/${encodeURIComponent(judge.id)}/`
  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Судьи выставок', url: '/shows?tab=judges' },
    { name: name, url: `/shows/judges/${encodeURIComponent(judge.id)}/` },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'Person',
        '@id': url,
        url,
        name,
        alternateName: [rawName, judge.name, judge.display_name].filter(
          (n): n is string => Boolean(n) && n !== name,
        ),
        jobTitle: 'Эксперт РКФ / Судья по экстерьеру собак',
        description,
        worksFor: {
          '@type': 'Organization',
          name: 'Российская Кинологическая Федерация (РКФ)',
        },
      },
    ],
  }

  return {
    title,
    description,
    h1: name,
    paragraph: description,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: '/shows?tab=judges', label: 'Судьи выставок' },
      { href: '/shows', label: 'Выставки' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}

export interface BreedHubMetaInput {
  slug: string
  canonicalKey: string
  nameRu: string
  nameLat: string
  fci: string
  lead: string
  description: string
  faqs: Array<{ question: string; answer: string }>
  topDogs?: Array<{
    id: number | string
    name: string
    starts: number
    gold: number
    silver: number
    bronze: number
  }>
  speedRecords?: Array<{ name: string; speed_kmh: number; date?: string }>
}

export function breedHubMeta(input: BreedHubMetaInput): SimpleEntityMeta {
  const title = `${input.nameRu} (${input.nameLat}) — рейтинг в курсинге, результаты забегов и рекорды скорости | Курсинг Статс (Coursing Stats)`
  const description = `Всероссийский рейтинг породы ${input.nameRu} (${input.nameLat}, ${input.fci}) в курсинге и бегах борзых: топ сезона, рекорды скорости в Донино (км/ч), протоколы соревнований РКФ и результаты забегов на Курсинг Статс (Coursing Stats).`
  const url = `${SITE_ORIGIN}/breeds/${input.slug}/`

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Соревнования', url: '/competitions' },
    { name: input.nameRu, url },
  ]

  let contentHtml = `<p class="lead">${escapeHtml(input.lead)}</p>`
  contentHtml += `<p>${escapeHtml(input.description)}</p>`

  if (input.speedRecords && input.speedRecords.length > 0) {
    contentHtml += `<h2>Рекорды скорости породы (Донино, км/ч)</h2><ul>`
    for (const r of input.speedRecords) {
      contentHtml += `<li><strong>${escapeHtml(r.name)}</strong>: ${r.speed_kmh} км/ч${r.date ? ` (${r.date})` : ''}</li>`
    }
    contentHtml += `</ul>`
  }

  if (input.topDogs && input.topDogs.length > 0) {
    contentHtml += `<h2>Лидеры сезона в курсинге и бегах</h2><ol>`
    for (const d of input.topDogs) {
      const medals: string[] = []
      if (d.gold) medals.push(`золото ${d.gold}`)
      if (d.silver) medals.push(`серебро ${d.silver}`)
      if (d.bronze) medals.push(`бронза ${d.bronze}`)
      const medalStr = medals.length > 0 ? ` (${medals.join(', ')})` : ''
      contentHtml += `<li><a href="/dog/${d.id}/"><strong>${escapeHtml(d.name)}</strong></a> — ${d.starts} забегов${medalStr}</li>`
    }
    contentHtml += `</ol>`
  }

  contentHtml += `<p><a href="/competitions?tab=ranking&breed=${encodeURIComponent(input.canonicalKey)}"><strong>Смотреть полную турнирную таблицу породы ${escapeHtml(input.nameRu)} →</strong></a></p>`

  const faqItems = input.faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
    },
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqItems,
      },
      {
        '@type': 'ItemPage',
        '@id': url,
        url,
        name: title,
        description,
      },
    ],
  }

  return {
    title,
    description,
    h1: `${input.nameRu} (${input.nameLat}) в курсинге и бегах`,
    paragraph: input.lead,
    contentHtml,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: `/competitions?tab=ranking&breed=${encodeURIComponent(input.canonicalKey)}`, label: `Рейтинг: ${input.nameRu}` },
      { href: '/speed-records', label: 'Рекорды Донино' },
      { href: '/competitions?tab=calendar', label: 'Календарь' },
      { href: '/guide', label: 'Справочник' },
    ],
  }
}
