/**
 * HTML Shell & DOM manipulation utilities for SEO prerendering.
 */

export const SITE_ORIGIN = 'https://coursing-stats.ru'

export type BreadcrumbItem = { name: string; url: string }

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

export function replaceOrInsertMetaDescription(html: string, description: string): string {
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

export function replaceOrInsertCanonical(html: string, canonicalUrl: string): string {
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

export function replaceTitle(html: string, title: string): string {
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

export function injectJsonLd(html: string, data: Record<string, unknown> | null | undefined): string {
  if (!data) return html
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const script = `<script type="application/ld+json">${json}</script>`
  return html.replace(/<\/head>/i, `  ${script}\n</head>`)
}

export function setRootBody(html: string, bodyHtml: string): string {
  if (/<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i.test(html)) {
    return html.replace(
      /<div\s+id=["']root["'][^>]*>[\s\S]*?<\/div>/i,
      `<div id="root">${bodyHtml}</div>`,
    )
  }
  return html.replace(/<\/body>/i, `<div id="root">${bodyHtml}</div>\n</body>`)
}

export function replaceOrInsertMetaProperty(html: string, property: string, content: string): string {
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

export function replaceOrInsertMetaName(html: string, name: string, content: string): string {
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
