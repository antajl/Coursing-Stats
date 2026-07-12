import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
  canonicalUrl?: string
}

// Расширенные ключевые слова для SEO (в 10+ раз больше)
const EXTENDED_KEYWORDS = [
  // Основные
  'курсинг', 'coursing', 'курсинг собак', 'соревнования по курсингу',
  'бега борзых', 'рейсинг', 'racing', 'грейхаунд', 'greyhound racing',
  'борзые', 'sighthounds', 'салюки', 'saluki', 'афганская борзая',
  
  // Статистика и рейтинги
  'статистика', 'результаты', 'рейтинги', 'таблицы', 'сводки',
  'рейтинг собак', 'топ собак', 'лучшие собаки', 'чемпионы',
  'медали', 'золото', 'серебро', 'бронза', 'призовые места',
  
  // Рекорды
  'рекорды', 'рекорды скорости', 'достижения', 'рекорды Донино',
  'замер скорости', 'скорость бега', 'бега 350 метров', '350 м',
  
  // Организации
  'РКФ', 'российская кинологическая федерация', 'FCI',
  'чркф', 'клубы', 'секции', 'кинологические организации',
  
  // Судьи
  'судьи', 'судейство', 'экспертная оценка', 'эксперты',
  'судьи по курсингу', 'судьи по бегам', 'экспертная комиссия',
  
  // Календарь и события
  'календарь', 'расписание', 'события', 'мероприятия',
  'календарь соревнований', 'график соревнований', 'турниры',
  
  // Породы
  'породы', 'породы собак', 'разновидности', 'классы',
  'стандарт', 'юниоры', 'ветераны', 'чемпионы породы',
  
  // Локации
  'россия', 'москва', 'санкт-петербург', 'регионы',
  'места проведения', 'площадки', 'стадионы',
  
  // Дополнительные
  'протоколы', 'результаты соревнований', 'история',
  'архив', 'статистика по годам', 'данные', 'база данных',
  'соревнования борзых', 'охота с борзыми', 'working dogs'
].join(', ')

export function SEO({ title, description, keywords, ogImage, noIndex, canonicalUrl }: SEOProps) {
  const fullTitle = `${title} | Coursing Stats`
  const defaultImage = 'https://coursing-stats.ru/og-image.svg'
  const siteUrl = 'https://coursing-stats.ru'
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || EXTENDED_KEYWORDS} />
      
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
