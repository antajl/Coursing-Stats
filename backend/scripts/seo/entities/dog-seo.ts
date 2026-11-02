/**
 * Dog SEO meta and profile HTML generators.
 */

import {
  SITE_ORIGIN,
  escapeHtml,
  breadcrumbJsonLd,
  type BreadcrumbItem,
} from '../html-shell.js'
import { formatEventDateRu } from './event-seo.js'

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
