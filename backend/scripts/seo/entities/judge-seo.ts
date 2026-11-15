/**
 * Sport and Show Judge SEO meta and structured data.
 */

import {
  SITE_ORIGIN,
  breadcrumbJsonLd,
  type SimpleEntityMeta,
} from '../html-shell.js'
import { toDogTitleCase } from './dog-seo.js'

import { getSportJudgeInfo, getSportJudgesRegistry } from '../../../lib/sport-judges-registry.js'

export const SPORT_JUDGE_FULL_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(getSportJudgesRegistry()).map(([k, v]) => [k, v.fullName])
)

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
    { name: 'Судьи', url: '/competitions/judges/2026/' },
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
      { href: '/competitions/judges/2026/', label: 'Судьи' },
      { href: '/competitions/', label: 'Соревнования' },
      { href: '/guide/', label: 'Справочник' },
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
    { name: 'Судьи выставок', url: '/shows/judges/2026/' },
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
      { href: '/shows/judges/2026/', label: 'Судьи выставок' },
      { href: '/shows/', label: 'Выставки' },
      { href: '/guide/', label: 'Справочник' },
    ],
  }
}
