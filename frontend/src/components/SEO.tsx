import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  noIndex?: boolean
  canonicalUrl?: string
}

function cleanOgTitle(title: string): string {
  const cleaned = title
    .replace(/^Курсинг Статс\s*[—–-]\s*/i, '')
    .replace(/\s*\|\s*Курсинг Статс.*$/i, '')
    .replace(/\s*\|\s*Coursing Stats.*$/i, '')
    .trim()
  return cleaned || title
}

function cleanOgDescription(desc: string, title?: string): string {
  let cleaned = desc
    .replace(/\s*на\s+(портале\s+)?(платформе\s+)?(сайте\s+)?(Курсинг Статс|Coursing Stats)\.?/gi, '.')
    .replace(/\.{2,}/g, '.')
    .trim()

  if (title) {
    const rawEntity = cleanOgTitle(title).split(/\s*[—–-]\s*/)[0].trim()
    if (rawEntity && rawEntity.length > 3) {
      if (cleaned.toLowerCase().startsWith(rawEntity.toLowerCase())) {
        cleaned = cleaned.substring(rawEntity.length).replace(/^[:\s–—-]+/, '').trim()
        if (cleaned) {
          cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
        }
      }
      const prefixMatch = cleaned.match(/^(Судья РКФ[^:]*|Эксперт РКФ[^:]*|Выставка РКФ[^:]*|Результаты состязания[^:]*|Порода [^:]*|Рейтинг породы [^:]*|Справочник[^:]*):\s*/i)
      if (prefixMatch) {
        cleaned = cleaned.substring(prefixMatch[0].length).trim()
        if (cleaned) {
          cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
        }
      }
    }
  }

  return cleaned
}

/** Короткий дефолт под RU-нишу; на страницах — точечные keywords. */
const DEFAULT_KEYWORDS = [
  'курсинг статс',
  'coursing stats',
  'курсинг',
  'бега борзых',
  'статистика курсинга',
  'рейтинг собак',
  'рекорды Донино',
  'выставки собак',
  'РКФ',
  'борзые',
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

export function SEO({
  title,
  description,
  keywords,
  ogImage,
  ogTitle,
  ogDescription,
  noIndex,
  canonicalUrl,
}: SEOProps) {
  const fullTitle = title.includes('Курсинг Статс') || title.includes('Coursing Stats') ? title : `${title} | Курсинг Статс`
  const defaultImage = 'https://coursing-stats.ru/og-image.png'
  const siteUrl = 'https://coursing-stats.ru/'
  const normalizedCanonical = normalizeCanonicalUrl(canonicalUrl)
  const ogTitleText = ogTitle || cleanOgTitle(fullTitle)
  const ogDescText = ogDescription || cleanOgDescription(description, ogTitleText)

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
      <meta property="og:title" content={ogTitleText} />
      <meta property="og:description" content={ogDescText} />
      <meta property="og:image" content={ogImage || defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:locale" content="ru_RU" />
      <meta property="og:site_name" content="Курсинг Статс" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={normalizedCanonical || siteUrl} />
      <meta name="twitter:title" content={ogTitleText} />
      <meta name="twitter:description" content={ogDescText} />
      <meta name="twitter:image" content={ogImage || defaultImage} />
    </Helmet>
  )
}
