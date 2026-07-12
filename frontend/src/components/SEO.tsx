import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string
  noIndex?: boolean
  canonicalUrl?: string
}

// Расширенные ключевые слова для SEO (на основе реальных поисковых запросов)
const EXTENDED_KEYWORDS = [
  // Основные термины
  'курсинг', 'coursing', 'курсинг собак', 'соревнования по курсингу', 'соревнование', 'соревнований',
  'бега борзых', 'собачьи бега', 'рейсинг', 'racing', 'грейхаунд', 'greyhound racing',
  'борзые', 'борзая', 'борзой', 'борзых', 'sighthounds', 'салюки', 'saluki', 'афганская борзая',
  
  // Английские термины (lure coursing, racing)
  'lure coursing', 'lure coursing trials', 'sighthound racing', 'dog racing', 'greyhound racing',
  'whippet racing', 'oval track racing', 'field trials', 'coursing events', 'racing events',
  'sighthound field association', 'ASFA', 'NOTRA', 'FCI coursing', 'AKC lure coursing',
  
  // Породы борзых (популярные)
  'грейхаунд', 'английская борзая', 'уиппет', 'левретка', 'русская псовая борзая', 'ирландский волкодав',
  'азавак', 'слюги', 'тазы', 'мадьяр агар', 'польский харт', 'испанский гальго',
  'поденко канарио', 'австралийская борзая', 'венгерская борзая', 'дирхаунд',
  
  // Английские названия пород
  'greyhound', 'whippet', 'saluki', 'afghan hound', 'borzoi', 'irish wolfhound', 'azawakh',
  'sloughi', 'magyar agar', 'polish greyhound', 'spanish galgo', 'podenco canario',
  'australian greyhound', 'magyar agár', 'deerhound', 'scottish deerhound', 'silken windhound',
  
  // Статистика и рейтинги
  'статистика', 'статистики', 'результаты', 'результат', 'рейтинги', 'рейтинг', 'рейтинга',
  'таблицы', 'таблица', 'сводки', 'сводка', 'рейтинг собак', 'топ собак', 'лучшие собаки',
  'чемпионы', 'чемпион', 'чемпиона', 'медали', 'медаль', 'золото', 'серебро', 'бронза',
  'призовые места', 'призовое место', 'победители', 'победитель',
  
  // Английские термины статистики
  'statistics', 'stats', 'results', 'leaderboard', 'ranking', 'rankings', 'top dogs',
  'champions', 'medals', 'gold', 'silver', 'bronze', 'winners', 'best dogs',
  'performance data', 'race results', 'coursing results', 'competition results',
  
  // Рекорды и скорость
  'рекорды', 'рекорд', 'рекорды скорости', 'достижения', 'достижение', 'рекорды Донино',
  'замер скорости', 'скорость бега', 'бега 350 метров', '350 м', 'скорость собаки',
  'самая быстрая собака', 'быстрые собаки', 'гонки', 'забеги',
  
  // Английские термины рекордов
  'records', 'speed records', 'fastest time', 'best time', 'personal best', 'achievements',
  'speed measurement', 'top speed', 'fastest dogs', 'racing records', 'coursing records',
  
  // Организации и правила
  'РКФ', 'российская кинологическая федерация', 'FCI', 'чркф', 'клубы', 'секции',
  'кинологические организации', 'правила соревнований', 'положение о курсинге',
  'правила проведения', 'полевые испытания', 'испытания собак',
  
  // Английские организации
  'FCI regulations', 'AKC', 'ASFA', 'NOTRA', 'American Kennel Club', 'Field Championship',
  'Lure Courser of Merit', 'LCM', 'Field Champion', 'FCH', 'Best in Field', 'BIF',
  'championship points', 'title', 'titles', 'qualifying certificate',
  
  // Судьи и эксперты
  'судьи', 'судья', 'судейство', 'экспертная оценка', 'эксперты', 'эксперт',
  'судьи по курсингу', 'судьи по бегам', 'экспертная комиссия', 'оценка собак',
  
  // Английские термины судейства
  'judges', 'judging', 'scoring', 'evaluation', 'assessment', 'lure coursing director',
  'racing director', 'huntmaster', 'certification', 'qualifying',
  
  // Календарь и события
  'календарь', 'расписание', 'события', 'мероприятия', 'календарь соревнований',
  'график соревнований', 'турниры', 'турнир', 'состязания', 'состязание',
  'беговой сезон', 'сезон соревнований',
  
  // Английские термины событий
  'calendar', 'schedule', 'events', 'meet', 'field trial', 'competition', 'tournament',
  'championship', 'race meet', 'coursing meet', 'season', 'racing season',
  
  // Породы и классы
  'породы', 'порода', 'породы собак', 'разновидности', 'классы', 'класс',
  'стандарт', 'стандарты', 'юниоры', 'ветераны', 'чемпионы породы',
  'группа пород', 'секция пород', 'рабочие качества',
  
  // Английские классы и категории
  'breeds', 'dog breeds', 'sighthound breeds', 'group 10', 'FCI-CACIL class', 'FCI-Open class',
  'junior courser', 'qualified courser', 'senior courser', 'master courser', 'veteran',
  'stake', 'open stake', 'field champion stake', 'veteran stake',
  
  // Локации
  'россия', 'москва', 'санкт-петербург', 'регионы', 'места проведения',
  'площадки', 'стадионы', 'поле для бега', 'трасса',
  
  // Спорт и охота
  'спорт борзых', 'спорт с собаками', 'кинологический спорт', 'рабочие собаки',
  'working dogs', 'охота с борзыми', 'травля дичи', 'преследование приманки',
  'механический заяц', 'приманка', 'полевые испытания борзых',
  
  // Английские термины спорта
  'sighthound sport', 'working dogs', 'hunting with sighthounds', 'chasing game',
  'mechanical lure', 'plastic bag', 'field trials', 'open field coursing',
  'instinct', 'agility', 'enthusiasm', 'endurance', 'speed', 'follow',
  
  // Дополнительные термины
  'протоколы', 'протокол', 'результаты соревнований', 'история', 'архив',
  'статистика по годам', 'данные', 'база данных', 'база данных собак',
  'выставки собак', 'монопородные выставки', 'кинологические выставки',
  'племенная работа', 'племенной учёт', 'родословная', 'порода',
  
  // Поисковые фразы (что люди ищут)
  'курсинг для собак', 'что такое курсинг', 'как проходит курсинг',
  'соревнования борзых в России', 'календарь соревнований борзых',
  'рейтинг собак по курсингу', 'лучшие собаки по курсингу',
  'рекорды скорости собак', 'самая быстрая порода собак',
  'борзые собаки породы', 'породы борзых собак с фото',
  'где посмотреть соревнования борзых', 'как участвовать в курсинге',
  'подготовка к курсингу', 'тренировка борзых', 'бег с собаками',
  
  // Английские поисковые фразы
  'what is lure coursing', 'how to start lure coursing', 'sighthound racing near me',
  'dog racing results', 'greyhound racing statistics', 'coursing competition schedule',
  'best sighthound breeds', 'fastest dog breeds', 'dog racing database',
  'sighthound field trials', 'ASFA field trials', 'NOTRA racing schedule',
  
  // Технические термины
  'маневренность', 'резвость', 'выносливость', 'преследование', 'энтузиазм',
  'оценка качеств', 'баллы', 'очки', 'система оценивания',
  'квалификационные титулы', 'титулы', 'звания', 'награды',
  
  // Английские технические термины
  'agility', 'speed', 'endurance', 'enthusiasm', 'follow', 'overall impression',
  'scoring system', 'points', 'qualification', 'certification', 'muzzle', 'trap',
  'split time', 'finish time', 'grade', 'class', 'stake', 'prize money'
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
