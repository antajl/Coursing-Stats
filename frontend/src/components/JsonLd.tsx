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

// Organization schema для Coursing Stats
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coursing Stats',
  url: 'https://coursing-stats.ru',
  logo: 'https://coursing-stats.ru/favicon.svg',
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
