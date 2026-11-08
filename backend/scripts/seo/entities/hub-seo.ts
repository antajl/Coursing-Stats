/**
 * Hub and Guide SEO meta and structured data.
 */

import {
  SITE_ORIGIN,
  escapeHtml,
  breadcrumbJsonLd,
  type SimpleEntityMeta,
} from '../html-shell.js'
import { toDogTitleCase, resolveDogNames } from './dog-seo.js'

export type HubMeta = {
  path: string
  title: string
  description: string
  h1: string
  paragraph: string
}

export const HUB_PAGES: HubMeta[] = [
  {
    path: '/',
    title: 'Курсинг Статс (Coursing Stats) — Рейтинг и статистика собак: курсинг, бега, выставки РКФ',
    description:
      'Курсинг Статс (Coursing Stats) — статистика и рейтинги собак в России: курсинг и бега борзых, рекорды Донино, выставки РКФ. Карьера собаки, награды, медали и рейтинг с 2015 года.',
    h1: 'Курсинг Статс: рейтинг и статистика собак в курсинге, бегах и выставках',
    paragraph:
      'Курсинг Статс (Coursing Stats) — статистика выступлений, награды, медали и рейтинги собак: курсинг и бега борзых, выставки РКФ и замеры скорости в Донино с 2015 года.',
  },
  {
    path: '/competitions',
    title: 'Календарь и результаты соревнований по курсингу 2026 — Расписание и рейтинг РКФ | Курсинг Статс (Coursing Stats)',
    description:
      'Расписание и календарь соревнований по курсингу и бегам борзых 2026 года: даты состязаний РКФ, регламенты, официальные протоколы и результаты забегов. Медальный зачёт, единый рейтинг, очки CS и рекорды пород на Курсинг Статс (Coursing Stats).',
    h1: 'Расписание соревнований, результаты и рейтинг собак в курсинге',
    paragraph:
      'Календарь состязаний по курсингу и бегам борзых на 2026 год, официальные протоколы РКФ с 2015 года, турнирная таблица, медальный зачёт, очки CS и результаты забегов.',
  },
  {
    path: '/shows',
    title: 'Рейтинг выставочных собак РКФ 2026 — Топ чемпионов и судьи | Курсинг Статс (Coursing Stats)',
    description:
      'Рейтинг собак по выставкам РКФ 2026 года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей. Ссылки на оригиналы rkf.online.',
    h1: 'Рейтинг выставочных собак РКФ 2026',
    paragraph:
      'Рейтинг собак по выставкам РКФ 2026 года: награды дня (CAC, BOB, ЧРКФ и др.), профили чемпионов и статистика судей. Оригиналы отчетов — на rkf.online.',
  },
  {
    path: '/speed-records',
    title: 'Курсинг Донино — результаты забегов, замеры скорости (км/ч) и рекорды борзых | Курсинг Статс (Coursing Stats)',
    description:
      'База бегового клуба «Курсинг в Донино»: результаты забегов, радарные замеры скорости (км/ч) и таблица рекордов борзых на 350 м (сек). Салюки, уиппеты, РПБ, басенджи на полигоне в Раменском районе.',
    h1: 'Курсинг Донино: замеры скорости радаром и рекорды забегов на 350 м',
    paragraph:
      'Официальная база бегового клуба «Курсинг в Донино»: замеры пиковой скорости радаром (км/ч) и результаты бегов борзых на круговой дистанции 350 м (секунды).',
  },
  {
    path: '/donino/championship',
    title: 'Клубный чемпионат Донино по бегам борзых — результаты этапов, лиги и переходы | Курсинг Статс',
    description:
      'Серия клубных чемпионатов по рейсингу в Донино (350 м): результаты этапов, протоколы забегов, система лиг («Прогресс», «Чемпионов», «Абсолют») и официальные переходы между лигами.',
    h1: 'Клубный чемпионат Донино по бегам борзых: результаты, лиги и протоколы',
    paragraph:
      'Официальные результаты серии клубных чемпионатов по рейсингу бегового клуба «Курсинг в Донино»: дистанция 350 м, старт из боксов, фотофиниш, турнирная таблица лиг («Прогресс», «Чемпионов», «Абсолют») и правила ротации.',
  },
  {
    path: '/donino/analytics',
    title: 'Аналитика полигона Донино — Скорость пород, лиги и статистика заездов | Курсинг Статс',
    description:
      'Спортивная аналитика и статистика бегового полигона Донино: скоростной спектр пород (км/ч), распределение по лигам, рекорды клубного чемпионата и сводная статистика участников.',
    h1: 'Аналитика и статистика полигона Донино',
    paragraph:
      'Сводная аналитика бегового полигона Донино: скоростной спектр пород, статистика участников клубного чемпионата, средние и пиковые показатели скорости борзых.',
  },
  {
    path: '/guide',
    title: 'Справочник — Скорость пород борзых, рекорды, титулы и протоколы | Курсинг Статс (Coursing Stats)',
    description:
      'Справочник Coursing Stats: скорость бега и рекорды пород борзых (салюки, уиппет, РПБ, левретка в км/ч), титулы курсинга и выставок РКФ, чтение протоколов забегов.',
    h1: 'Справочник: рекорды скорости пород, титулы и правила курсинга',
    paragraph:
      'Официальные стандарты и полевая метрология: максимальная скорость и рекорды пород борзых, титулы РКФ и FCI, чтение протоколов забегов и регламент соревнований.',
  },
  {
    path: '/about',
    title: 'О проекте Курсинг Статс | Coursing Stats',
    description:
      'Информация о проекте Coursing Stats: стек технологий, архитектура, реализованные улучшения, исходный код.',
    h1: '',
    paragraph:
      'Электронный архив спортивной статистики: результаты соревнований, выставки РКФ и рекорды полигона Донино.',
  },
]

export const HUB_NAV: { href: string; label: string }[] = [
  { href: '/', label: 'Главная' },
  { href: '/competitions/', label: 'Соревнования' },
  { href: '/shows/', label: 'Выставки' },
  { href: '/speed-records/', label: 'Донино' },
  { href: '/donino/championship/', label: 'Клубный чемпионат' },
  { href: '/donino/analytics/', label: 'Аналитика Донино' },
  { href: '/guide/', label: 'Справочник' },
  { href: '/about/', label: 'О проекте' },
]

export function hubNavHtml(currentPath: string): string {
  const normCurrent = currentPath.endsWith('/') ? currentPath : `${currentPath}/`
  const links = HUB_NAV.map(({ href, label }) => {
    const normHref = href.endsWith('/') ? href : `${href}/`
    const current = (normHref === '/' && normCurrent === '/') || (normHref !== '/' && normCurrent === normHref)
    const attrs = current ? ' aria-current="page"' : ''
    return `<a href="${href}"${attrs}>${escapeHtml(label)}</a>`
  }).join(' · ')
  return `<nav aria-label="Разделы сайта">${links}</nav>`
}

export function buildHubBodyHtml(hub: Pick<HubMeta, 'path' | 'h1' | 'paragraph'>): string {
  return [
    `<main>`,
    `<h1>${escapeHtml(hub.h1)}</h1>`,
    `<p>${escapeHtml(hub.paragraph)}</p>`,
    hubNavHtml(hub.path),
    `</main>`,
  ].join('\n')
}

export const DEFAULT_COMPETITION_FAQS = [
  {
    question: 'Где найти актуальное расписание и календарь соревнований по курсингу борзых на 2026 год?',
    answer:
      'Актуальное расписание соревнований, квалификационных забегов и тренировок по курсингу и бегам борзых на 2026 год представлено в календаре состязаний на портале Coursing Stats. В расписании публикуются официальные даты турниров РКФ, регламенты, площадки проведения (беговой клуб в Донино, Санкт-Петербург, Минск и др.) и ссылки на регистрацию.',
  },
  {
    question: 'Существует ли единый всероссийский рейтинг собак по курсингу?',
    answer:
      'Да. Единый всероссийский рейтинг и постоянная турнирная таблица собак по курсингу и бегам борзых формируются и поддерживаются на портале Coursing Stats на основе официальных протоколов соревнований РКФ с 2015 года. В рейтинге учитываются результаты забегов, медали (золото, серебро, бронза), очки стабильности CS и замеры максимальной скорости по всем породам борзых (уиппеты, РПБ, салюки, басенджи и др.).',
  },
  {
    question: 'Как рассчитывается рейтинг собак в курсинге?',
    answer:
      'В едином рейтинге курсинга порядок определяет зачёт сезона: 1) Медали и эффективность (золото весомее серебра и бронзы; при равных медалях выше тот, кто собрал их за меньшее число забегов). 2) Индекс стабильности CS служит тай-брейком при равном медальном зачёте. В бегах борзых (рейсинге) порядок определяется по максимальной зафиксированной скорости в км/ч.',
  },
  {
    question: 'Какие породы борзых участвуют в рейтинге курсинга?',
    answer:
      'В рейтинге соревнуются основные породы борзых: уиппеты, русские псовые борзые (РПБ), салюки, басенджи, малая итальянская борзая (левретка), афганские борзые, грейхаунды, фараоновы собаки и другие породы 10-й и 5-й групп FCI.',
  },
  {
    question: 'Где посмотреть рекорды скорости и результаты салюки и других борзых в бегах?',
    answer:
      'В единой турнирной таблице Coursing Stats по каждой породе борзых (салюки, уиппеты, РПБ и др.) доступны официальные результаты соревнований РКФ, медальный зачёт, скорость и очки стабильности CS. Для радарных полевых замеров полигона Донино на сайте предусмотрен специальный раздел «Донино».',
  },
]

export function homepageJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_ORIGIN}/#website`,
        url: `${SITE_ORIGIN}/`,
        name: 'Курсинг Статс (Coursing Stats)',
        alternateName: ['Курсинг Статс', 'Coursing Stats', 'КурсингСтатс', 'CoursingStats', 'coursing-stats.ru', 'ProCoursing'],
        description:
          'Единая всероссийская база и статистика курсинга, бегов борзых и выставок собак РКФ с 2015 года.',
        inLanguage: 'ru-RU',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_ORIGIN}/competitions/?tab=ranking&search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_ORIGIN}/#organization`,
        name: 'Курсинг Статс (Coursing Stats)',
        alternateName: ['Курсинг Статс', 'Coursing Stats', 'CoursingStats', 'coursing-stats.ru'],
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/og-image.png`,
        sameAs: ['https://t.me/coursing_stats_bot'],
        knowsAbout: [
          'Курсинг',
          'Бега борзых',
          'Российская кинологическая федерация',
          'Борзые породы собак',
          'Замеры скорости собак Донино',
        ],
      },
    ],
  }
}

export function doninoDatasetJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd([
        { name: 'Главная', url: '/' },
        { name: 'Донино', url: '/speed-records/' },
      ]),
      {
        '@type': 'Dataset',
        '@id': `${SITE_ORIGIN}/speed-records/#dataset`,
        name: 'База инструментальных замеров скорости собак пород борзых (Полигон Донино)',
        description:
          'Официальная база радарных замеров пиковой скорости (км/ч) и времени спринта на 350 м радаром Stalker Pro II бегового клуба «Курсинг в Донино» с 2017 по 2026 год.',
        url: `${SITE_ORIGIN}/speed-records/`,
        keywords: [
          'курсинг',
          'бега борзых',
          'скорость собак',
          'радар Донино',
          'салюки',
          'уиппет',
          'русская псовая борзая',
          'басенджи',
          'левретка',
        ],
        creator: {
          '@type': 'Organization',
          name: 'Беговой клуб «Курсинг в Донино»',
          url: `${SITE_ORIGIN}/speed-records/`,
        },
        temporalCoverage: '2017/2026',
        spatialCoverage: 'Донино, Раменский район, Московская область, Россия',
      },
    ],
  }
}

export function competitionsJsonLd(
  faqs: Array<{ question: string; answer: string }> = DEFAULT_COMPETITION_FAQS,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd([
        { name: 'Главная', url: '/' },
        { name: 'Соревнования', url: '/competitions/' },
      ]),
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  }
}

export function buildCompetitionsHubHtml(
  hub: Pick<HubMeta, 'path' | 'h1' | 'paragraph'>,
  topItems?: Array<{
    dog_id: number
    name_ru?: string | null
    name_lat?: string | null
    breed: string
    gold: number
    silver: number
    bronze: number
    total_starts: number
  }>,
): string {
  const faqBlocks = DEFAULT_COMPETITION_FAQS.map(
    (f) =>
      `<section><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></section>`,
  ).join('\n')

  let topDogsSection = ''
  if (topItems && topItems.length > 0) {
    const listItems = topItems
      .slice(0, 10)
      .map((d) => {
        const { primary } = resolveDogNames(d.name_lat, d.name_ru)
        const name = primary || 'Собака'
        const breed = d.breed ? toDogTitleCase(d.breed) : ''
        const medals = []
        if (d.gold) medals.push(`золото: ${d.gold}`)
        if (d.silver) medals.push(`серебро: ${d.silver}`)
        if (d.bronze) medals.push(`бронза: ${d.bronze}`)
        const medalStr = medals.length > 0 ? ` (${medals.join(', ')})` : ''
        return `<li><a href="/dog/${d.dog_id}/">${escapeHtml(name)}</a> — ${escapeHtml(breed)}${escapeHtml(medalStr)}, забегов: ${d.total_starts}</li>`
      })
      .join('\n')

    topDogsSection = [
      `<h2>Лидеры текущего сезона по курсингу</h2>`,
      `<ul>`,
      listItems,
      `</ul>`,
    ].join('\n')
  }

  return [
    `<main>`,
    `<h1>${escapeHtml(hub.h1)}</h1>`,
    `<p>${escapeHtml(hub.paragraph)}</p>`,
    topDogsSection,
    `<h2>Частые вопросы о рейтинге курсинга в России</h2>`,
    faqBlocks,
    hubNavHtml(hub.path),
    `</main>`,
  ].join('\n')
}

export const DEFAULT_GUIDE_SPEED_FAQS = [
  {
    question: 'Какова максимальная скорость салюки и рекорд породы?',
    answer:
      'Официальный рекорд скорости салюки в Книге рекордов Гиннесса составляет 68,8 км/ч (зафиксирован в 1996 году на дистанциях свыше 800 м). В отличие от спринтеров, салюки — марафонец и удерживает темп выше 50 км/ч на протяжении нескольких километров. В реальных радарных замерах на полигоне Донино рекорд салюки по прямой составляет 55 км/ч (сука Тайга), а на официальных бегах РКФ средняя скорость по 360-метровому треку — около 47,2 км/ч.',
  },
  {
    question: 'Какая максимальная скорость бега уиппета?',
    answer:
      'Максимальная скорость уиппета при стартовом ускорении за приманкой или механическим зайцем достигает 64–70 км/ч. Средняя скорость на официальных бегах РКФ по 360-метровому овалу составляет 54–56 км/ч (например, 360 м за 23,67 с). По данным радарного хронометража в Донино рекорд породы по прямой составляет 64 км/ч (кобель Драм). Уиппет считается одной из самых быстро разгоняющихся собак в мире: на первых метрах ускорение выше, чем у скаковой лошади.',
  },
  {
    question: 'Какова скорость бега русской псовой борзой (РПБ)?',
    answer:
      'Рабочая скорость русской псовой борзой на дистанции составляет 55–58 км/ч, а на коротком отрезке охотничьего рывка («броска») за зверем или приманкой может достигать 60–65 км/ч. На официальных круговых состязаниях РКФ по бегам средняя скорость лучших борзых составляет около 49 км/ч (360 м за 26,4 с, кобель Драгун), а по радарным замерам в Донино зафиксирована скорость 56 км/ч (сука Флёна).',
  },
  {
    question: 'Какую скорость развивает левретка (малая итальянская борзая)?',
    answer:
      'Средняя скорость бега левретки составляет 40–42 км/ч, а при максимальном азартном ускорении по прямой на коротких дистанциях достигает 45–50 км/ч. По данным радарных измерений полигона Донино рекорд породы зафиксирован на отметке 49 км/ч (кобель Айвенго), а 350-метровый спринт левретки преодолевают за 29,84 секунды.',
  },
  {
    question: 'Какая порода собак самая быстрая в мире?',
    answer:
      'Абсолютным рекордсменом среди собак на коротких дистанциях (спринт до 500 м) является грейхаунд, развивающий скорость до 67–72 км/ч (мировой рекорд Гиннесса — 67,32 км/ч). На средних дистанциях сильнейший спринтер — уиппет (до 64–70 км/ч в пике). На длинных дистанциях (свыше 800 м) лидерство принадлежит салюки (до 68,8 км/ч), обладающей феноменальной аэробной выносливостью.',
  },
  {
    question: 'В чём разница между пиковой скоростью по радару и средней скоростью на бегах?',
    answer:
      'Пиковая скорость (км/ч) фиксируется радаром или оптическими створами на прямом участке трассы в момент максимального броска собаки. Средняя скорость на бегах вычисляется по фотофинишу делением длины трека (например, 360 м) на чистое время прохождения круга. Из-за преодоления двух крутых виражей средняя скорость всегда на 5–10 км/ч ниже пиковой.',
  },
]

export function guideJsonLd(
  faqs: Array<{ question: string; answer: string }> = DEFAULT_GUIDE_SPEED_FAQS,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd([
        { name: 'Главная', url: '/' },
        { name: 'Справочник', url: '/guide/' },
      ]),
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  }
}

export function buildGuideHubHtml(
  hub: Pick<HubMeta, 'path' | 'h1' | 'paragraph'>,
): string {
  const speedRows = [
    {
      breed: 'Грейхаунд',
      peak: 'до 67–72 км/ч',
      donino: '—',
      track: '59,4 км/ч (360 м за 21,83 с)',
      note: 'Абсолютный мировой рекордсмен спринта (рекорд Гиннесса — 67,32 км/ч)',
    },
    {
      breed: 'Уиппет',
      peak: 'до 64–70 км/ч',
      donino: '64 км/ч',
      track: '54,7 км/ч (360 м за 23,67 с)',
      note: 'Стартовое ускорение быстрее скаковой лошади; радар Донино — 64 км/ч',
    },
    {
      breed: 'Русская псовая борзая (РПБ)',
      peak: 'до 60–65 км/ч',
      donino: '56 км/ч',
      track: '49,1 км/ч (360 м за 26,41 с)',
      note: 'Охотничий взрывной бросок за зверем на 100–200 м',
    },
    {
      breed: 'Салюки (персидская борзая)',
      peak: 'до 68,8 км/ч',
      donino: '55 км/ч',
      track: '47,2 км/ч (360 м за 27,45 с)',
      note: 'Мировой рекордсмен Гиннесса на дистанциях свыше 800 м; марафонец пустыни',
    },
    {
      breed: 'Малая итальянская борзая (левретка)',
      peak: 'до 45–50 км/ч',
      donino: '49 км/ч',
      track: '40–42 км/ч (350 м за 29,84 с)',
      note: 'Маневренный мини-спринтер весом до 5 кг; радар Донино — 49 км/ч',
    },
    {
      breed: 'Басенджи',
      peak: 'до 41–42 км/ч',
      donino: '41 км/ч',
      track: '40,3 км/ч (360 м за 32,12 с)',
      note: 'Стабильный ровный темп на дистанции 350–500 м',
    },
  ]

  const tableRows = speedRows
    .map(
      (r) =>
        `<tr><td><strong>${escapeHtml(r.breed)}</strong></td><td>${escapeHtml(r.peak)}</td><td>${escapeHtml(r.donino)}</td><td>${escapeHtml(r.track)}</td><td>${escapeHtml(r.note)}</td></tr>`,
    )
    .join('\n')

  const faqBlocks = DEFAULT_GUIDE_SPEED_FAQS.map(
    (f) =>
      `<section><h3>${escapeHtml(f.question)}</h3><p>${escapeHtml(f.answer)}</p></section>`,
  ).join('\n')

  return [
    `<main>`,
    `<h1>${escapeHtml(hub.h1)}</h1>`,
    `<p>${escapeHtml(hub.paragraph)}</p>`,
    `<h2>Скорость и рекорды пород борзых (км/ч)</h2>`,
    `<table>`,
    `<thead><tr><th>Порода</th><th>Пиковый спринт</th><th>Радар Донино</th><th>Бега РКФ (360 м)</th><th>Специфика</th></tr></thead>`,
    `<tbody>`,
    tableRows,
    `</tbody>`,
    `</table>`,
    `<p><a href="/competitions/">Перейти в турнирную таблицу забегов РКФ</a> · <a href="/speed-records/">Смотреть радарные замеры Донино</a></p>`,
    `<h2>Частые вопросы о скорости и рекордах борзых (Google AI Overview)</h2>`,
    faqBlocks,
    hubNavHtml(hub.path),
    `</main>`,
  ].join('\n')
}

export interface BreedHubMetaInput {
  slug: string
  canonicalKey: string
  nameRu: string
  nameLat: string
  fci: string
  lead: string
  description: string
  faqs: Array<{ question: string; answer: string }>
  topDogs?: Array<{
    id: number | string
    name: string
    starts: number
    gold: number
    silver: number
    bronze: number
  }>
  speedRecords?: Array<{ name: string; speed_kmh: number; date?: string }>
}

export function breedHubMeta(input: BreedHubMetaInput): SimpleEntityMeta {
  const title = `${input.nameRu} (${input.nameLat}) — рейтинг в курсинге, результаты забегов и рекорды скорости | Курсинг Статс (Coursing Stats)`
  const description = `Всероссийский рейтинг породы ${input.nameRu} (${input.nameLat}, ${input.fci}) в курсинге и бегах борзых: топ сезона, рекорды скорости в Донино (км/ч), протоколы соревнований РКФ и результаты забегов на Курсинг Статс (Coursing Stats).`
  const url = `${SITE_ORIGIN}/breeds/${input.slug}/`

  const breadcrumbs = [
    { name: 'Главная', url: '/' },
    { name: 'Соревнования', url: '/competitions/' },
    { name: input.nameRu, url },
  ]

  let contentHtml = `<p class="lead">${escapeHtml(input.lead)}</p>`
  contentHtml += `<p>${escapeHtml(input.description)}</p>`

  if (input.speedRecords && input.speedRecords.length > 0) {
    contentHtml += `<h2>Рекорды скорости породы (Донино, км/ч)</h2><ul>`
    for (const r of input.speedRecords) {
      contentHtml += `<li><strong>${escapeHtml(r.name)}</strong>: ${r.speed_kmh} км/ч${r.date ? ` (${r.date})` : ''}</li>`
    }
    contentHtml += `</ul>`
  }

  if (input.topDogs && input.topDogs.length > 0) {
    contentHtml += `<h2>Лидеры сезона в курсинге и бегах</h2><ol>`
    for (const d of input.topDogs) {
      const medals: string[] = []
      if (d.gold) medals.push(`золото ${d.gold}`)
      if (d.silver) medals.push(`серебро ${d.silver}`)
      if (d.bronze) medals.push(`бронза ${d.bronze}`)
      const medalStr = medals.length > 0 ? ` (${medals.join(', ')})` : ''
      contentHtml += `<li><a href="/dog/${d.id}/"><strong>${escapeHtml(d.name)}</strong></a> — ${d.starts} забегов${medalStr}</li>`
    }
    contentHtml += `</ol>`
  }

  contentHtml += `<p><a href="/competitions/?tab=ranking&breed=${encodeURIComponent(input.canonicalKey)}"><strong>Смотреть полную турнирную таблицу породы ${escapeHtml(input.nameRu)} →</strong></a></p>`

  const faqItems = input.faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.answer,
    },
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbJsonLd(breadcrumbs),
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: faqItems,
      },
      {
        '@type': 'ItemPage',
        '@id': url,
        url,
        name: title,
        description,
      },
    ],
  }

  return {
    title,
    description,
    h1: `${input.nameRu} (${input.nameLat}) в курсинге и бегах`,
    paragraph: input.lead,
    contentHtml,
    breadcrumbs,
    jsonLd,
    sectionLinks: [
      { href: `/competitions/?tab=ranking&breed=${encodeURIComponent(input.canonicalKey)}`, label: `Рейтинг: ${input.nameRu}` },
      { href: '/speed-records/', label: 'Рекорды Донино' },
      { href: '/competitions/?tab=calendar', label: 'Календарь' },
      { href: '/guide/', label: 'Справочник' },
    ],
  }
}
