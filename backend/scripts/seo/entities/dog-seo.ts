/**
 * Dog SEO meta and profile HTML generators.
 */

import {
  SITE_ORIGIN,
  escapeHtml,
  breadcrumbJsonLd,
  pluralizeRu,
  type BreadcrumbItem,
} from '../html-shell.js'
import { formatEventDateRu } from './event-seo.js'
import { transliterateRuToLat } from '../../../lib/text-normalization.js'

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
      if (/^([а-яёa-z]\.)+$/i.test(token)) {
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
    `<a href="/competitions/ranking/2026/">Рейтинг</a>`,
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
      ? `<section id="competitions"><h2 id="competitions-title">Недавние забеги и соревнования</h2><ul>${comps
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
          .join('')}</ul></section>`
      : ''

  const links = [
    `<a href="/competitions/">Соревнования</a>`,
    `<a href="/shows/">Выставки</a>`,
    `<a href="/speed-records/">Донино</a>`,
    `<a href="/guide/">Справочник</a>`,
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
  const displayName = secondary && secondary !== name ? `${name} / ${secondary}` : name
  const breed = dog.breed ? toDogTitleCase(dog.breed) : ''

  const facts: string[] = []
  const cs = dog.coursing_stats
  const rs = dog.racing_stats
  const coursingStarts = cs?.total_starts || 0
  const racingStarts = rs?.total_starts || 0
  const totalStarts = coursingStarts + racingStarts

  const gold = (cs?.gold || 0) + (rs?.gold || 0)
  const silver = (cs?.silver || 0) + (rs?.silver || 0)
  const bronze = (cs?.bronze || 0) + (rs?.bronze || 0)
  const totalMedals = gold + silver + bronze

  let careerSummary = ''
  if (totalStarts > 0) {
    let startsText = ''
    if (coursingStarts > 0 && racingStarts > 0) {
      startsText = `${pluralizeRu(totalStarts, 'забег', 'забега', 'забегов')} (${coursingStarts} в курсинге, ${racingStarts} на треке)`
    } else if (coursingStarts > 0) {
      startsText = `${pluralizeRu(coursingStarts, 'забег', 'забега', 'забегов')} в курсинге`
    } else {
      startsText = `${pluralizeRu(racingStarts, 'забег', 'забега', 'забегов')} на треке`
    }

    let medalsText = ''
    if (totalMedals > 0) {
      if (gold > 0 && silver === 0 && bronze === 0) {
        medalsText = `${pluralizeRu(gold, 'победа (золото)', 'победы (золото)', 'побед (золото)')}`
      } else {
        const medalDetails = [
          gold ? pluralizeRu(gold, 'золотая', 'золотые', 'золотых') : null,
          silver ? pluralizeRu(silver, 'серебряная', 'серебряные', 'серебряных') : null,
          bronze ? pluralizeRu(bronze, 'бронзовая', 'бронзовые', 'бронзовых') : null,
        ]
          .filter(Boolean)
          .join(', ')
        medalsText = `${pluralizeRu(totalMedals, 'медаль', 'медали', 'медалей')} (${medalDetails})`
      }
    }

    careerSummary = medalsText ? `${startsText}, ${medalsText}` : startsText
    facts.push(careerSummary)
  }

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

  const title = breed
    ? `${displayName} (${breed}) — родословная, титулы и результаты забегов | Курсинг Статс`
    : `${displayName} — родословная, титулы и результаты забегов | Курсинг Статс`
  const description =
    careerSummary
      ? `${displayName}${breed ? ` (${breed})` : ''}: родословная, титулы и спортивная карьера — ${careerSummary}. Результаты забегов курсинга и оценки судей.`
      : `Карточка собаки ${displayName}${breed ? ` (${breed})` : ''}: родословная, титулы, результаты забегов курсинга и бегов борзых.`

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Рейтинг', url: '/competitions/ranking/2026/' },
    { name, url: `/dog/${id}/` },
  ]

  const translitName = transliterateRuToLat(name)
  const translitSecondary = secondary ? transliterateRuToLat(secondary) : null

  const alternateNames = Array.from(
    new Set(
      [
        secondary,
        dog.name_ru,
        dog.name_lat,
        translitName,
        toDogTitleCase(translitName),
        translitSecondary,
        translitSecondary ? toDogTitleCase(translitSecondary) : null,
      ].filter((n): n is string => Boolean(n && n !== name && n !== displayName)),
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
  const displayName = secondary && secondary !== name ? `${name} / ${secondary}` : name
  const breed = entry.breed ? toDogTitleCase(entry.breed) : ''
  const facts: string[] = []
  const showsCount = entry.total_shows || 0
  const showsText = showsCount > 0 ? pluralizeRu(showsCount, 'выставка РКФ', 'выставки РКФ', 'выставок РКФ') : ''
  const awardText = entry.best_award ? `высший титул: ${entry.best_award}` : ''
  const careerSummary = [showsText, awardText].filter(Boolean).join(', ')
  if (careerSummary) facts.push(careerSummary)

  const title = breed
    ? `${displayName} (${breed}) — родословная, выставки РКФ и титулы | Курсинг Статс`
    : `${displayName} — родословная, выставки РКФ и титулы | Курсинг Статс`
  const description =
    careerSummary
      ? `${displayName}${breed ? ` (${breed})` : ''}: родословная, титулы и выставочные результаты — ${careerSummary}. Оценки экспертов, ринги и награды РКФ.`
      : `Выставочная карьера собаки ${displayName}${breed ? ` (${breed})` : ''}: родословная, участие в рингах, титулы и награды РКФ.`

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Рейтинг', url: '/competitions/ranking/2026/' },
    { name, url: `/dog/${id}/` },
  ]

  const translitName = transliterateRuToLat(name)
  const translitSecondary = secondary ? transliterateRuToLat(secondary) : null

  const alternateNames = Array.from(
    new Set(
      [
        secondary,
        entry.name_ru,
        entry.name_lat,
        translitName,
        toDogTitleCase(translitName),
        translitSecondary,
        translitSecondary ? toDogTitleCase(translitSecondary) : null,
      ].filter((n): n is string => Boolean(n && n !== name && n !== displayName)),
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
