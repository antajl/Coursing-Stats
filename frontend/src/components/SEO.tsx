import { useEffect } from 'react'
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

function normalizeCanonicalUrl(url?: string): string | undefined {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    // Гарантируем завершающий слэш для директорий/страниц (кроме файлов с расширением)
    const lastPart = parsed.pathname.split('/').pop() || ''
    if (!parsed.pathname.endsWith('/') && !lastPart.includes('.')) {
      parsed.pathname = `${parsed.pathname}/`
    }
    // Очищаем поисковые параметры (e.g. ?tab=...) для предотвращения дублей в canonical
    parsed.search = ''
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return url.endsWith('/') ? url : `${url}/`
  }
}

export function SEO({ title, description, keywords, ogImage, noIndex, canonicalUrl }: SEOProps) {
  const fullTitle = title.includes('Coursing Stats') ? title : `${title} | Coursing Stats`
  const defaultImage = 'https://coursing-stats.ru/og-image.png'
  const siteUrl = 'https://coursing-stats.ru/'
  const normalizedCanonical = normalizeCanonicalUrl(canonicalUrl)

  useEffect(() => {
    document.title = fullTitle
    // Гарантируем отсутствие дубликатов тега <title> в <head> при гидратации
    const titles = document.head.querySelectorAll('title')
    if (titles.length > 1) {
      for (let i = 1; i < titles.length; i++) {
        titles[i].remove()
      }
    }
  }, [fullTitle])

  return (
    <Helmet>
      {/* Управление <title> ведётся через useEffect, чтобы избежать дублирования тега в React 19 */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || DEFAULT_KEYWORDS} />

      {normalizedCanonical && <link rel="canonical" href={normalizedCanonical} />}

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={normalizedCanonical || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="Coursing Stats" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={normalizedCanonical || siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
    </Helmet>
  )
}
