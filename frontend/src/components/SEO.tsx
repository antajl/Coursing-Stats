import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
  canonicalUrl?: string
}

/** Короткий дефолт под RU-нишу; на страницах — точечные keywords. */
const DEFAULT_KEYWORDS = [
  'курсинг',
  'бега борзых',
  'статистика курсинга',
  'рейтинг собак',
  'рекорды Донино',
  'выставки собак',
  'РКФ',
  'борзые',
  'Coursing Stats',
].join(', ')

export function SEO({ title, description, keywords, ogImage, noIndex, canonicalUrl }: SEOProps) {
  const fullTitle = `${title} | Coursing Stats`
  const defaultImage = 'https://coursing-stats.ru/og-image.svg'
  const siteUrl = 'https://coursing-stats.ru'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="Coursing Stats" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl || siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
    </Helmet>
  )
}
