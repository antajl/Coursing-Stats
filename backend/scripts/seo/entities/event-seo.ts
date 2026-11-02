/**
 * Event, Exhibition, and Donino dog SEO meta generators.
 */

import {
  SITE_ORIGIN,
  escapeHtml,
  breadcrumbJsonLd,
  type SimpleEntityMeta,
} from '../html-shell.js'
import { toDogTitleCase } from './dog-seo.js'

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
