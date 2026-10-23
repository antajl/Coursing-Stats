import { Helmet } from 'react-helmet-async'

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

export function breadcrumbListSchema(items: { name: string; url: string }[]): Record<string, unknown> {
  const origin = 'https://coursing-stats.ru'
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${origin}${item.url}`,
    })),
  }
}

export function faqPageSchema(faqs: { question: string; answer: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function personSchema({
  name,
  jobTitle,
  url,
  description,
  worksFor = 'Российская Кинологическая Федерация (РКФ)',
}: {
  name: string
  jobTitle: string
  url: string
  description?: string
  worksFor?: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle,
    url,
    ...(description ? { description } : {}),
    ...(worksFor
      ? {
          worksFor: {
            '@type': 'Organization',
            name: worksFor,
          },
        }
      : {}),
  }
}

export function profilePageSchema(options: {
  url: string
  name: string
  alternateName?: string | string[] | null
  description?: string
  breed?: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': options.url,
    url: options.url,
    name: options.name,
    ...(options.description ? { description: options.description } : {}),
    mainEntity: {
      '@type': 'Thing',
      name: options.name,
      ...(options.alternateName ? { alternateName: options.alternateName } : {}),
      ...(options.breed ? { description: `Порода: ${options.breed}` } : {}),
      url: options.url,
    },
  }
}

export function sportsEventSchema(options: {
  url: string
  name: string
  startDate?: string | null
  location?: string | null
  description?: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': options.url,
    url: options.url,
    name: options.name,
    ...(options.startDate ? { startDate: options.startDate } : {}),
    ...(options.location
      ? {
          location: {
            '@type': 'Place',
            name: options.location,
          },
        }
      : {}),
    ...(options.description ? { description: options.description } : {}),
  }
}

// Organization schema для Coursing Stats
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coursing Stats',
  url: 'https://coursing-stats.ru',
  logo: 'https://coursing-stats.ru/favicons/favicon.svg',
  description:
    'Рейтинги и статистика собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ, профили и судьи.',
  sameAs: [
    'https://github.com/antajl/Coursing-Stats'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    url: 'https://coursing-stats.ru'
  }
}

// WebSite schema
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Coursing Stats',
  url: 'https://coursing-stats.ru',
  description:
    'Рейтинги собак по курсингу и бегам борзых, рекорды Донино, выставки РКФ, профили и статистика судей.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://coursing-stats.ru/competitions?tab=ranking&search={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}
