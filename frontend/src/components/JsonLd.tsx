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

// Organization schema для Coursing Stats
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Coursing Stats',
  url: 'https://coursing-stats.ru',
  logo: 'https://coursing-stats.ru/favicon.svg',
  description: 'Статистика соревнований по курсингу и бегам борзых в России. Календарь событий, результаты, рейтинги собак, рекорды скорости.',
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
  description: 'Статистика соревнований по курсингу и бегам борзых в России',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://coursing-stats.ru/competitions?tab=ranking&search={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
}
