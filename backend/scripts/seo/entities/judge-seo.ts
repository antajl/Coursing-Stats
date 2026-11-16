/**
 * Sport and Show Judge SEO meta and structured data.
 */

import {
  SITE_ORIGIN,
  breadcrumbJsonLd,
  escapeHtml,
  pluralizeRu,
  type SimpleEntityMeta,
} from '../html-shell.js'
import { toDogTitleCase } from './dog-seo.js'
import { transliterateRuToLat } from '../../../lib/text-normalization.js'

import { getSportJudgeInfo, getSportJudgesRegistry } from '../../../lib/sport-judges-registry.js'

export const SPORT_JUDGE_FULL_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(getSportJudgesRegistry()).map(([k, v]) => [k, v.fullName])
)

export function parseJudgeNameTokens(fullName: string): {
  surname: string
  initials: string | null
  withInitials: string | null
  parts: string[]
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { surname: '', initials: null, withInitials: null, parts: [] }
  }
  const surname = parts[0]
  if (parts.length >= 3) {
    const initials = `${parts[1][0].toUpperCase()}. ${parts[2][0].toUpperCase()}.`
    return { surname, initials, withInitials: `${surname} ${initials}`, parts }
  }
  if (parts.length === 2) {
    const initials = `${parts[1][0].toUpperCase()}.`
    return { surname, initials, withInitials: `${surname} ${initials}`, parts }
  }
  return { surname, initials: null, withInitials: surname, parts }
}

export function sportJudgeMeta(judge: {
  id: string
  numeric_id?: number | null
  name?: string | null
  unique_events?: number | null
  unique_breeds?: number | null
  unique_dogs?: number | null
}): SimpleEntityMeta {
  const shortName = judge.name?.trim() || judge.id
  const fullName = SPORT_JUDGE_FULL_NAMES[shortName] || null
  const displayName = fullName ? `${fullName} (${shortName})` : shortName
  const primaryName = fullName || shortName
  const { surname, withInitials } = parseJudgeNameTokens(primaryName)
  const facts = [
    judge.unique_events != null ? pluralizeRu(judge.unique_events, 'соревнование', 'соревнования', 'соревнований') : null,
    judge.unique_breeds != null ? pluralizeRu(judge.unique_breeds, 'порода', 'породы', 'пород') : null,
    judge.unique_dogs != null ? pluralizeRu(judge.unique_dogs, 'собака', 'собаки', 'собак') : null,
  ].filter(Boolean)
  const title = `${primaryName} — судья РКФ по курсингу и бегам борзых: статистика соревнований | Курсинг Статс`
  const description =
    facts.length > 0
      ? `Судья РКФ ${primaryName}: ${facts.join(', ')}. Обслуженные турниры, средние баллы по критериям и судейские бригады.`
      : `Судья РКФ ${primaryName}: обслуженные состязания, оценки собак и судимые породы.`
  const judgeSlug = judge.numeric_id != null ? String(judge.numeric_id) : encodeURIComponent(judge.id)
  const url = `${SITE_ORIGIN}/judges/${judgeSlug}/`
  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Судьи', url: '/competitions/judges/2026/' },
    { name: primaryName, url: `/judges/${judgeSlug}/` },
  ]
  const alternateNames = [
    surname,
    withInitials,
    `Судья ${surname}`,
    `Судья ${primaryName}`,
    shortName,
    fullName,
  ].filter((n): n is string => Boolean(n) && n !== primaryName)

  const contentHtml = [
    `<section aria-label="Судейская квалификация">`,
    `<h2>Судейство соревнований по курсингу и бегам борзых</h2>`,
    `<p><strong>${escapeHtml(primaryName)}</strong> — официальный судья Российской кинологической федерации (РКФ) по беговым дисциплинам борзых (курсинг, рейсинг). ${facts.length > 0 ? `Опыт судейства: ${escapeHtml(facts.join(', '))}.` : ''}</p>`,
    `</section>`,
  ].join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'Person',
        '@id': url,
        url,
        name: primaryName,
        alternateName: Array.from(new Set(alternateNames)),
        jobTitle: 'Судья по курсингу и бегам борзых РКФ',
        description,
        worksFor: {
          '@type': 'Organization',
          name: 'Российская Кинологическая Федерация (РКФ)',
          url: 'https://rkf.online',
        },
      },
    ],
  }

  return {
    title,
    description,
    h1: `${primaryName} — судья РКФ по курсингу и бегам`,
    paragraph: description,
    contentHtml,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: '/competitions/judges/2026/', label: 'Судьи' },
      { href: '/competitions/ranking/2026/', label: 'Соревнования' },
      { href: '/guide/', label: 'Справочник' },
    ],
  }
}

export function showJudgeMeta(judge: {
  id: string
  numeric_id?: number | null
  name?: string | null
  display_name?: string | null
  total_judged?: number | null
  unique_breeds?: number | null
  excellent_rate?: number | null
  city?: string | null
  cert_number?: number | string | null
  ranks?: string | null
  total_dogs?: number | null
  breeds?: string[] | null
  by_year?: Record<string, number> | null
  konura_url?: string | null
  photo_url?: string | null
}): SimpleEntityMeta {
  const rawName = judge.display_name?.trim() || judge.name?.trim() || judge.id
  const name = toDogTitleCase(rawName)
  const { surname, withInitials, parts } = parseJudgeNameTokens(name)

  const facts = [
    judge.total_judged != null ? pluralizeRu(judge.total_judged, 'оценка', 'оценки', 'оценок') : null,
    judge.unique_breeds != null ? pluralizeRu(judge.unique_breeds, 'порода', 'породы', 'пород') : null,
    judge.excellent_rate != null ? `${Math.round(judge.excellent_rate * 100)}% отлично` : null,
  ].filter(Boolean)

  const title = `${name} — эксперт РКФ, судья выставок собак: статистика и отзывы | Курсинг Статс`

  const descInitials = withInitials && withInitials !== name ? ` (${withInitials})` : ''
  const metaFacts: string[] = []
  if (judge.city) metaFacts.push(`г. ${judge.city}`)
  if (judge.ranks) metaFacts.push(`ранг ${judge.ranks}`)
  if (judge.cert_number) metaFacts.push(`удостоверение РКФ № ${judge.cert_number}`)
  if (facts.length > 0) metaFacts.push(facts.join(', '))

  const descSuffix = metaFacts.length > 0 ? `: ${metaFacts.join(', ')}` : ''
  const description = `Эксперт РКФ ${name}${descInitials}${descSuffix}. Распределение оценок (отлично, оч. хор), породы ринга, история судейства и отзывы экспонентов.`

  const judgeSlug = judge.numeric_id != null ? String(judge.numeric_id) : encodeURIComponent(judge.id)
  const url = `${SITE_ORIGIN}/shows/judges/${judgeSlug}/`
  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Судьи выставок', url: '/shows/judges/2026/' },
    { name: name, url: `/shows/judges/${judgeSlug}/` },
  ]

  const translitName = transliterateRuToLat(name)
  const translitSurname = surname ? transliterateRuToLat(surname) : ''
  const alternateNameSet = new Set<string>()

  if (surname && surname !== name) {
    alternateNameSet.add(surname)
    alternateNameSet.add(`Эксперт ${surname}`)
    alternateNameSet.add(`Судья ${surname}`)
    alternateNameSet.add(`Эксперт РКФ ${surname}`)
    alternateNameSet.add(`Судья РКФ ${surname}`)
  }
  if (withInitials && withInitials !== name) {
    alternateNameSet.add(withInitials)
    alternateNameSet.add(`Эксперт ${withInitials}`)
    alternateNameSet.add(`Судья ${withInitials}`)
    alternateNameSet.add(`Эксперт РКФ ${withInitials}`)
    alternateNameSet.add(`Судья РКФ ${withInitials}`)
  }
  alternateNameSet.add(`Эксперт ${name}`)
  alternateNameSet.add(`Судья ${name}`)
  alternateNameSet.add(`Эксперт РКФ ${name}`)
  alternateNameSet.add(`Судья РКФ ${name}`)

  if (translitName) {
    alternateNameSet.add(translitName)
    alternateNameSet.add(toDogTitleCase(translitName))
  }
  if (translitSurname) {
    alternateNameSet.add(toDogTitleCase(translitSurname))
    if (parts.length >= 2) {
      const latInitials = parts.length >= 3
        ? `${transliterateRuToLat(parts[1])[0] || ''}. ${transliterateRuToLat(parts[2])[0] || ''}.`
        : `${transliterateRuToLat(parts[1])[0] || ''}.`
      alternateNameSet.add(`${toDogTitleCase(translitSurname)} ${latInitials}`)
    }
  }

  if (rawName && rawName !== name) alternateNameSet.add(rawName)
  if (judge.name && judge.name !== name) alternateNameSet.add(judge.name)
  if (judge.display_name && judge.display_name !== name) alternateNameSet.add(judge.display_name)

  const alternateName = Array.from(alternateNameSet).filter((n) => Boolean(n) && n !== name)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'Person',
        '@id': url,
        url,
        name,
        alternateName,
        jobTitle: 'Эксперт РКФ / Судья по экстерьеру собак FCI международного уровня',
        description,
        ...(judge.city ? { address: { '@type': 'PostalAddress', addressLocality: judge.city } } : {}),
        worksFor: {
          '@type': 'Organization',
          name: 'Российская Кинологическая Федерация (РКФ)',
          url: 'https://rkf.online',
        },
      },
    ],
  }

  // Сборка развёрнутого контента для поисковых роботов (Googlebot, Яндекс)
  const sections: string[] = []

  // 1. Паспортные данные и статус эксперта в РКФ
  const passportItems = [
    judge.ranks ? `квалификация: <strong>${escapeHtml(judge.ranks)}</strong>` : null,
    judge.cert_number ? `удостоверение судьи РКФ № <strong>${escapeHtml(String(judge.cert_number))}</strong>` : null,
    judge.city ? `город / регион: <strong>${escapeHtml(judge.city)}</strong>` : null,
  ].filter(Boolean)

  sections.push(
    `<section aria-label="Паспортные данные эксперта">` +
      `<h2>Квалификация и статус эксперта в РКФ / FCI</h2>` +
      `<p><strong>${escapeHtml(name)}</strong>${withInitials && withInitials !== name ? ` (${escapeHtml(withInitials)})` : ''} — аттестованный судья Российской кинологической федерации (РКФ) и Международной кинологической федерации (FCI)${passportItems.length > 0 ? `, ${passportItems.join(', ')}` : ''}.</p>` +
    `</section>`
  )

  // 2. Сводная статистика судейства
  if (judge.total_judged != null || judge.total_dogs != null || judge.unique_breeds != null) {
    const statsLines: string[] = []
    if (judge.total_judged != null) statsLines.push(`обслужено <strong>${pluralizeRu(judge.total_judged, 'выставка', 'выставки', 'выставок')}</strong>`)
    if (judge.total_dogs != null) statsLines.push(`оценено <strong>${pluralizeRu(judge.total_dogs, 'собака', 'собаки', 'собак')}</strong>`)
    if (judge.unique_breeds != null) statsLines.push(`экспертиза проведена для <strong>${pluralizeRu(judge.unique_breeds, 'породы', 'пород', 'пород')}</strong>`)
    if (judge.excellent_rate != null) statsLines.push(`средний процент оценки «отлично»: <strong>${Math.round(judge.excellent_rate * 100)}%</strong>`)

    sections.push(
      `<section aria-label="Сводная статистика судейства">` +
        `<h2>Статистика судейства на выставках собак</h2>` +
        `<p>По данным протоколов выставок собак РКФ: ${statsLines.join(', ')}.</p>` +
      `</section>`
    )
  }

  // 3. Топ пород, которые судит судья
  if (judge.breeds && judge.breeds.length > 0) {
    const topBreeds = judge.breeds.slice(0, 25).map((b) => toDogTitleCase(b.trim()))
    const restCount = judge.breeds.length - topBreeds.length
    sections.push(
      `<section aria-label="Судимые породы">` +
        `<h2>Породы собак под судейством эксперта ${escapeHtml(surname || name)}</h2>` +
        `<p>Эксперт ${escapeHtml(name)} проводит судейскую экспертизу следующих пород: ${escapeHtml(topBreeds.join(', '))}${restCount > 0 ? ` и ещё ${restCount} пород` : ''}.</p>` +
      `</section>`
    )
  }

  // 4. Активность по годам
  if (judge.by_year && Object.keys(judge.by_year).length > 0) {
    const years = Object.keys(judge.by_year).sort((a, b) => b.localeCompare(a))
    const listItems = years.slice(0, 8).map((y) => {
      const count = judge.by_year![y]
      return `<li>Сезон ${escapeHtml(y)}: ${pluralizeRu(count, 'выставка', 'выставки', 'выставок')}</li>`
    })
    sections.push(
      `<section aria-label="Судейская активность по сезонам">` +
        `<h2>История судейства по годам</h2>` +
        `<ul>${listItems.join('')}</ul>` +
      `</section>`
    )
  }

  // 5. Отзывы и аналитика строгости
  sections.push(
    `<section aria-label="Отзывы и строгость судейства">` +
      `<h2>Манера судейства и отзывы экспонентов</h2>` +
      `<p>В профиле эксперта доступна детальная аналитика строгости оценок судьи ${escapeHtml(surname || name)} в сравнении со среднестатистическими показателями выставок РКФ: процент оценок «отлично» для взрослых классов и щенков, распределение титулов (CAC, CACIB, BOB, КЧК) и дисквалификаций. ${judge.konura_url ? `<a href="${escapeHtml(judge.konura_url)}" target="_blank" rel="noopener noreferrer">Отзывы экспонентов об эксперте ${escapeHtml(name)} на кинологическом портале Конура</a>.` : `История экспертиз и отзывы участников выставок собак РКФ.`}</p>` +
    `</section>`
  )

  const contentHtml = sections.join('\n')

  return {
    title,
    description,
    h1: `${name} — эксперт РКФ, судья выставок собак`,
    paragraph: description,
    contentHtml,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: '/shows/judges/2026/', label: 'Судьи выставок' },
      { href: '/shows/ranking/2026/', label: 'Выставки' },
      { href: '/guide/', label: 'Справочник' },
    ],
  }
}
