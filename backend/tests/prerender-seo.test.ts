import { describe, expect, it } from 'vitest'
import {
  applyMetaToSpaShell,
  breadcrumbJsonLd,
  breedHubMeta,
  build404Html,
  buildAssetLoaderScript,
  buildCompetitionsHubHtml,
  buildDogBodyHtml,
  buildEntitySpaShell,
  buildGuideHubHtml,
  buildHubBodyHtml,
  buildNeutralSpaShell,
  competitionsJsonLd,
  DEFAULT_COMPETITION_FAQS,
  DEFAULT_GUIDE_SPEED_FAQS,
  doninoDatasetJsonLd,
  escapeHtml,
  eventMetaFromEntry,
  exhibitionMeta,
  extractBundleAssets,
  guideJsonLd,
  homepageJsonLd,
  HUB_PAGES,
  showJudgeMeta,
  sportJudgeMeta,
  toIsoDate,
} from '../scripts/seo/prerender-html'

const SPA_SHELL = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <title>Old Title</title>
    <meta name="description" content="Old description" />
    <script type="module" crossorigin src="/assets/index-abc123.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-abc123.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

describe('prerender-seo helpers', () => {
  it('build404Html generates standalone 404 with noindex, no canonical, and 404 artwork', () => {
    const html = build404Html(SPA_SHELL)
    expect(html).toContain('<title data-rh="true">Страница не найдена | Курсинг Статс</title>')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(html).not.toMatch(/rel=["']canonical["']/)
    // Client script must be preserved so dynamic SPA routes (show dogs, etc.) hydrate on S3 fallback
    expect(html).toContain('src="/assets/index-abc123.js"')
    expect(html).toContain('href="/assets/index-abc123.css"')
    expect(html).toContain('404-dogs.png')
    expect(html).toContain('404-dogs-mobile.png')
    expect(html).toContain('Coursing Stats')
    expect(html).toContain('href="/competitions/ranking/2026/"')
  })

  it('escapeHtml escapes markup characters', () => {
    expect(escapeHtml(`A & B <"c">`)).toBe('A &amp; B &lt;&quot;c&quot;&gt;')
  })

  it('applyMetaToSpaShell injects title, description, canonical and keeps assets', () => {
    const html = applyMetaToSpaShell(SPA_SHELL, {
      title: 'Рейтинг собак | Coursing Stats',
      description: 'Описание рейтинга',
      canonicalUrl: 'https://coursing-stats.ru/competitions',
      bodyHtml: '<main><h1>Рейтинг</h1></main>',
    })

    expect(html).toContain('<title data-rh="true">Рейтинг собак | Coursing Stats</title>')
    expect(html).toContain('<meta name="description" content="Описание рейтинга" data-rh="true" />')
    expect(html).toContain('<link rel="canonical" href="https://coursing-stats.ru/competitions" data-rh="true" />')
    expect(html).toContain('src="/assets/index-abc123.js"')
    expect(html).toContain('href="/assets/index-abc123.css"')
    expect(html).toMatch(/<div id="root">[\s\S]*<h1>Рейтинг<\/h1>/)
  })

  it('buildHubBodyHtml includes h1 and hub links', () => {
    const body = buildHubBodyHtml({
      path: '/competitions',
      h1: 'Рейтинг собак',
      paragraph: 'Краткий текст',
    })
    expect(body).toContain('<h1>Рейтинг собак</h1>')
    expect(body).toContain('href="/shows/ranking/2026/"')
    expect(body).toContain('href="/guide/"')
    expect(body).toContain('aria-current="page"')
  })

  it('buildDogBodyHtml contains name, facts and section links', () => {
    const body = buildDogBodyHtml({
      id: 263,
      name: 'TEST DOG',
      breed: 'УИППЕТ',
      facts: ['Курсинг: 3 участий'],
      recentCompetitions: ['ЧРКФ — тест'],
    })
    expect(body).toContain('TEST DOG')
    expect(body).toContain('Курсинг: 3 участий')
    expect(body).toContain('ЧРКФ — тест')
    expect(body).toContain('href="/competitions/"')
    expect(body).toContain('href="/speed-records/"')
    expect(body).toContain('href="/guide/"')
  })

  it('breadcrumbJsonLd builds BreadcrumbList', () => {
    const ld = breadcrumbJsonLd([
      { name: 'Главная', url: '/' },
      { name: 'Рейтинг', url: '/competitions' },
      { name: 'DOG', url: '/dog/1' },
    ])
    expect(ld['@type']).toBe('BreadcrumbList')
    const items = ld.itemListElement as Array<{ position: number; name: string; item: string }>
    expect(items).toHaveLength(3)
    expect(items[2].item).toBe('https://coursing-stats.ru/dog/1')
  })

  it('applyMetaToSpaShell injects JSON-LD for dog pages', () => {
    const html = applyMetaToSpaShell(SPA_SHELL, {
      title: 'DOG | Coursing Stats',
      description: 'desc',
      canonicalUrl: 'https://coursing-stats.ru/dog/1',
      bodyHtml: '<main><h1>DOG</h1></main>',
      jsonLd: breadcrumbJsonLd([{ name: 'DOG', url: '/dog/1' }]),
    })
    expect(html).toContain('application/ld+json')
    expect(html).toContain('BreadcrumbList')
  })

  it('applyMetaToSpaShell updates og:title and og:description', () => {
    const shell = SPA_SHELL.replace(
      '</head>',
      '<meta property="og:title" content="Old OG" />\n<meta property="og:description" content="Old OD" />\n</head>',
    )
    const html = applyMetaToSpaShell(shell, {
      title: 'Новый title | Coursing Stats',
      description: 'Новое описание',
      canonicalUrl: 'https://coursing-stats.ru/dog/1',
      bodyHtml: '<main></main>',
    })
    expect(html).toContain('property="og:title" content="Новый title"')
    expect(html).toContain('property="og:description" content="Новое описание"')
    expect(html).toContain('property="og:url" content="https://coursing-stats.ru/dog/1"')
  })

  it('neutral spa shell has no canonical; home hub gets canonical to /', () => {
    expect(SPA_SHELL).not.toMatch(/rel=["']canonical["']/)
    const home = applyMetaToSpaShell(SPA_SHELL, {
      title: 'Статистика курсинга, бегов и выставок собак | Coursing Stats',
      description: 'Вся карьера собаки',
      canonicalUrl: 'https://coursing-stats.ru/',
      bodyHtml: '<main><h1>Статистика курсинга, бегов и выставок собак</h1></main>',
    })
    expect(home).toContain('<link rel="canonical" href="https://coursing-stats.ru/" data-rh="true" />')
    const neutral = buildNeutralSpaShell(home)
    expect(neutral).not.toMatch(/rel=["']canonical["']/)
    expect(neutral).not.toContain('property="og:url"')
    expect(neutral).not.toContain('<h1>Статистика курсинга, бегов и выставок собак</h1>')
  })

  it('eventMetaFromEntry builds RU title and description', () => {
    const meta = eventMetaFromEntry({
      id: '1250',
      title: 'ЧРКФ Курсинг - ',
      date_start: '2025-03-08',
      location: 'Екатеринбург',
      result_count: 40,
      competition_kind: 'ЧРКФ',
    })
    expect(meta.title).toContain('ЧРКФ Курсинг')
    expect(meta.title).not.toContain(' - ')
    expect(meta.title).not.toContain('()')
    expect(meta.description).toContain('участников')
    expect(meta.h1).toBe('ЧРКФ Курсинг')
  })

  it('dogMetaFromProfile supports bilingual names (RU and EN) for search relevance', async () => {
    const { dogMetaFromProfile } = await import('../scripts/seo/prerender-html')
    const meta = dogMetaFromProfile({
      dog: {
        id: 5782,
        name_ru: 'ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА',
        name_lat: 'EMUL DE GEPARD GELILA AL RAWDA',
        breed: 'САЛЮКИ',
        coursing_stats: { total_starts: 9, gold: 8, silver: 1, bronze: 0 },
        racing_stats: { total_starts: 4, gold: 0, silver: 2, bronze: 1 },
      },
      competitions: [{ title: 'Чемпионат России по курсингу', date_start: '2026-05-15' }],
    })

    // Both RU and EN must be present in Title
    expect(meta.title).toContain('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(meta.title).toContain('Emul de Gepard Gelila Al Rawda')
    expect(meta.title).toContain('Салюки')
    expect(meta.title).toContain('Курсинг Статс')

    // Both RU and EN must be present in Description
    expect(meta.description).toContain('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(meta.description).toContain('Emul de Gepard Gelila Al Rawda')
    expect(meta.description).toContain('Салюки')

    // Body data contains raw aliases and secondary name
    expect(meta.body.name).toBe('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(meta.body.secondaryName).toBe('Emul de Gepard Gelila Al Rawda')
    expect(meta.body.rawRuName).toBe('ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА')
    expect(meta.body.rawLatName).toBe('EMUL DE GEPARD GELILA AL RAWDA')

    // JSON-LD contains ItemPage with name and alternateName
    expect(meta.jsonLd).toBeDefined()
    const graph = (meta.jsonLd as any)['@graph'] as any[]
    expect(Array.isArray(graph)).toBe(true)
    const itemPage = graph.find((item) => item['@type'] === 'ItemPage')
    expect(itemPage).toBeDefined()
    expect(itemPage.mainEntity.name).toBe('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(itemPage.mainEntity.alternateName).toContain('Emul de Gepard Gelila Al Rawda')
  })

  it('HUB_PAGES: clean brand descriptions without procoursing or technical jargon', () => {
    const home = HUB_PAGES.find((h) => h.path === '/')!
    const competitions = HUB_PAGES.find((h) => h.path === '/competitions')!
    const donino = HUB_PAGES.find((h) => h.path === '/speed-records')!
    expect(home.description.toLowerCase()).not.toContain('procoursing')
    expect(home.description.toLowerCase()).not.toContain('агрегатор')
    expect(competitions.description.toLowerCase()).not.toContain('procoursing')
    expect(home.description).toMatch(/карьера собаки|награды|медали|рейтинг/i)
    expect(competitions.description).toMatch(/медал/i)
    expect(competitions.description).toMatch(/CS|очк/i)
    expect(donino.title.toLowerCase()).toContain('донино')
    expect(donino.title.toLowerCase()).toMatch(/курсинг/)
    expect(donino.description.toLowerCase()).toMatch(/в донино|курсинг донино/)

    expect(HUB_PAGES.some((h) => h.path === '/shows/judges/2026')).toBe(true)
    expect(HUB_PAGES.some((h) => h.path === '/shows/judges/all')).toBe(true)
    expect(HUB_PAGES.some((h) => h.path === '/competitions/judges/2026')).toBe(true)
    expect(HUB_PAGES.some((h) => h.path === '/competitions/judges/all')).toBe(true)
  })

  it('buildCompetitionsHubHtml renders semantic H1, AI Overview FAQ, and dog leader links', () => {
    const compHub = HUB_PAGES.find((h) => h.path === '/competitions')!
    const html = buildCompetitionsHubHtml(compHub, [
      {
        dog_id: 5645,
        name_lat: 'STANGERS LAND KATALINA',
        name_ru: 'СТАНГЕРС ЛАНД КАТАЛИНА',
        breed: 'УИППЕТ',
        gold: 4,
        silver: 1,
        bronze: 0,
        total_starts: 9,
      },
    ])

    expect(html).toContain('<h1>')
    expect(html).toContain('Частые вопросы о рейтинге курсинга в России')
    expect(html).toContain('Существует ли единый всероссийский рейтинг собак по курсингу?')
    expect(html).toContain('Курсинг Статс на основе открытых протоколов соревнований и отчётов РКФ с 2015 года')
    expect(html).toContain('забегов: 9')
    expect(html).not.toContain('стартов:')
    expect(html).toContain('<a href="/dog/5645/">Стангерс Ланд Каталина</a>')
  })

  it('competitionsJsonLd outputs FAQPage schema with questions and answers', () => {
    const jsonLd = competitionsJsonLd(DEFAULT_COMPETITION_FAQS)
    const graph = (jsonLd as any)['@graph'] as any[]
    const faqPage = graph.find((item) => item['@type'] === 'FAQPage')
    expect(faqPage).toBeDefined()
    expect(faqPage.mainEntity.length).toBeGreaterThanOrEqual(4)
    expect(faqPage.mainEntity[0].name).toContain('актуальное расписание и календарь соревнований по курсингу')
    expect(faqPage.mainEntity.some((q: any) => q.name.includes('Существует ли единый всероссийский рейтинг'))).toBe(true)
    expect(faqPage.mainEntity[0].acceptedAnswer.text).toContain('Курсинг Статс')
  })

  it('eventMetaFromEntry formats top winners in description and SportsEvent award', () => {
    const meta = eventMetaFromEntry({
      id: '1545',
      title: 'ПЧРКФ Курсинг борзых',
      date_start: '2026-06-20',
      location: 'Москва, Раменское',
      result_count: 57,
      competition_kind: 'ПЧРКФ',
      winners: [
        {
          name: 'ЮНИОН СВЕТЛЫЙ',
          breed: 'УИППЕТ',
          score: 369,
          title: 'ПЧРКФ РК',
        },
      ],
    })

    expect(meta.description).toContain('Победители: Юнион Светлый (Уиппет, 369 б., ПЧРКФ РК)')
    const sportsEvent = (meta.jsonLd as any)['@graph'].find((item: any) => item['@type'] === 'SportsEvent')
    expect(sportsEvent).toBeDefined()
    expect(sportsEvent.startDate).toBe('2026-06-20')
    expect(sportsEvent.endDate).toBe('2026-06-20')
    expect(sportsEvent.eventStatus).toBe('https://schema.org/EventScheduled')
    expect(sportsEvent.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode')
    expect(sportsEvent.organizer['@type']).toBe('Organization')
    expect(sportsEvent.organizer.name).toBe('Российская кинологическая федерация (РКФ)')
    expect(sportsEvent.organizer.url).toBe('https://rkf.org.ru')
    expect(sportsEvent.award).toContain('Юнион Светлый (Уиппет, 369 б., ПЧРКФ РК)')
    expect(sportsEvent.competitor[0].name).toBe('Юнион Светлый')
  })

  it('sportJudgeMeta maps known judge initials to full name for exact search match', () => {
    const meta = sportJudgeMeta({
      id: 'Орлова М.О.',
      name: 'Орлова М.О.',
      unique_events: 4,
      unique_breeds: 15,
      unique_dogs: 300,
    })

    expect(meta.title).toContain('Орлова Марина Олеговна (Орлова М.О.)')
    expect(meta.description).toContain('Орлова Марина Олеговна (Орлова М.О.)')
    expect(meta.h1).toBe('Орлова Марина Олеговна (Орлова М.О.)')
    const person = (meta.jsonLd as any)['@graph'].find((item: any) => item['@type'] === 'Person')
    expect(person.name).toBe('Орлова Марина Олеговна')
    expect(person.alternateName).toContain('Орлова М.О.')
    expect(person.jobTitle).toContain('Судья по курсингу и бегам борзых')
  })

  it('sportJudgeMeta renders rich SEO meta and event links for calendar-only brigade judges without heat scores', () => {
    const meta = sportJudgeMeta({
      id: 'Молев С.Ю.',
      numeric_id: 33,
      name: 'Молев С.Ю.',
      unique_events: 1,
      calendarEvents: [
        {
          id: 1556,
          title: 'Состязания CACL (Михайловское) по бегам борзых',
          date: '2017-08-13',
          location: 'Московская область, Пушкинский р-н, д. Михайловское',
          competitionType: 'Бега борзых (рейсинг)',
          participantsCount: 58,
        },
      ],
    })

    expect(meta.title).toContain('Молев С.Ю.')
    expect(meta.description).toContain('1 соревнование')
    expect(meta.description).toContain('58 участников')
    expect(meta.description).toContain('Состязания CACL (Михайловское)')
    expect(meta.description).not.toContain('0 пород')
    expect(meta.contentHtml).toContain('<a href="/event/1556/">')
    expect(meta.contentHtml).toContain('Бега борзых (рейсинг)')
    const breadcrumb = (meta.jsonLd as any)['@graph'].find((i: any) => i['@type'] === 'BreadcrumbList')
    expect(breadcrumb.itemListElement.at(-1).item).toBe('https://coursing-stats.ru/judges/33/')
  })

  it('showJudgeMeta formats judge name in TitleCase without all-caps and sets RKF expert title', () => {
    const meta = showJudgeMeta({
      id: 'орлова|м|о',
      display_name: 'ОРЛОВА МАРИНА ОЛЕГОВНА',
      total_judged: 300,
      unique_breeds: 4,
      excellent_rate: 0.7466,
    })

    expect(meta.title).toContain('Орлова Марина Олеговна — эксперт РКФ, судья выставок собак')
    expect(meta.title).not.toContain('ОРЛОВА')
    expect(meta.description).toContain('75% отлично')
    expect(meta.description).toContain('Эксперт РКФ Орлова Марина Олеговна')
    const person = (meta.jsonLd as any)['@graph'].find((item: any) => item['@type'] === 'Person')
    expect(person.name).toBe('Орлова Марина Олеговна')
    expect(person.jobTitle).toContain('Эксперт РКФ')
  })

  it('showJudgeMeta prioritizes surname at index 0, includes initials, and generates rich content for Polivanov', () => {
    const meta = showJudgeMeta({
      id: 'поливанов|м|а',
      numeric_id: 1070,
      name: 'поливанов мстислав александрович',
      display_name: 'Поливанов Мстислав Александрович',
      total_judged: 279,
      unique_breeds: 1047,
      excellent_rate: 0.8265,
      city: 'Казань',
      cert_number: 5,
      ranks: 'CACIB FCI',
      total_dogs: 10338,
      breeds: ['ВЕЛЬШ КОРГИ ПЕМБРОК', 'ЛАБРАДОР РЕТРИВЕР', 'НЕМЕЦКАЯ ОВЧАРКА'],
      by_year: { '2026': 36, '2025': 29 },
      konura_url: 'http://www.konura.info/experts/polivanov-mstislav-aleksandrovich-65.html',
    })

    // 1. Surname is the very first token in Title (highest SEO priority)
    expect(meta.title.startsWith('Поливанов')).toBe(true)
    expect(meta.title).toBe(
      'Поливанов Мстислав Александрович — эксперт РКФ, судья выставок собак: статистика и отзывы | Курсинг Статс'
    )

    // 2. H1 has exact semantic keyword match
    expect(meta.h1).toBe('Поливанов Мстислав Александрович — эксперт РКФ, судья выставок собак')

    // 3. Description contains full name, initials, city, ranks, cert number, and reviews
    expect(meta.description).toContain('Поливанов Мстислав Александрович (Поливанов М. А.)')
    expect(meta.description).toContain('г. Казань')
    expect(meta.description).toContain('ранг CACIB FCI')
    expect(meta.description).toContain('удостоверение РКФ № 5')
    expect(meta.description).toContain('отзывы экспонентов')

    // 4. Content HTML contains rich body text for search engines (preventing Thin Content)
    expect(meta.contentHtml).toBeDefined()
    expect(meta.contentHtml).toContain('CACIB FCI')
    expect(meta.contentHtml).toContain('№ <strong>5</strong>')
    expect(meta.contentHtml).toContain('Казань')
    expect(meta.contentHtml).toContain('279 выставок')
    expect(meta.contentHtml).toContain('10 338 собак')
    expect(meta.contentHtml).toContain('Вельш Корги Пемброк')
    expect(meta.contentHtml).toContain('Сезон 2026')
    expect(meta.contentHtml).toContain('Конура')

    // 5. Schema.org Person JSON-LD entity graph contains all aliases for Knowledge Graph
    const person = (meta.jsonLd as any)['@graph'].find((item: any) => item['@type'] === 'Person')
    expect(person).toBeDefined()
    expect(person.name).toBe('Поливанов Мстислав Александрович')
    expect(person.alternateName).toContain('Поливанов')
    expect(person.alternateName).toContain('Поливанов М. А.')
    expect(person.alternateName).toContain('Эксперт Поливанов')
    expect(person.alternateName).toContain('Судья Поливанов')
    expect(person.alternateName).toContain('Polivanov Mstislav Aleksandrovich')
    expect(person.alternateName).toContain('Polivanov M. A.')
    expect(person.address.addressLocality).toBe('Казань')
  })

  it('buildGuideHubHtml renders semantic table with breed speeds and Google AI Overview FAQ', () => {
    const guideHub = HUB_PAGES.find((h) => h.path === '/guide')!
    const html = buildGuideHubHtml(guideHub)

    expect(html).toContain('<h1>')
    expect(html).toContain('Скорость и рекорды пород борзых (км/ч)')
    expect(html).toContain('Салюки (персидская борзая)')
    expect(html).toContain('до 68,8 км/ч')
    expect(html).toContain('Уиппет')
    expect(html).toContain('до 64–70 км/ч')
    expect(html).toContain('Русская псовая борзая (РПБ)')
    expect(html).toContain('Малая итальянская борзая (левретка)')
    expect(html).toContain('Какова максимальная скорость салюки и рекорд породы?')
    expect(html).toContain('Какая максимальная скорость бега уиппета?')
    expect(html).toContain('Какова скорость бега русской псовой борзой (РПБ)?')
    expect(html).toContain('Какую скорость развивает левретка (малая итальянская борзая)?')
    expect(html).toContain('<a href="/competitions/">')
    expect(html).toContain('<a href="/speed-records/">')
  })

  it('guideJsonLd outputs FAQPage schema with breed speed questions', () => {
    const jsonLd = guideJsonLd(DEFAULT_GUIDE_SPEED_FAQS)
    const graph = (jsonLd as any)['@graph'] as any[]
    const faqPage = graph.find((item) => item['@type'] === 'FAQPage')
    expect(faqPage).toBeDefined()
    expect(faqPage.mainEntity.length).toBeGreaterThanOrEqual(5)
    expect(faqPage.mainEntity[0].name).toContain('Какова максимальная скорость салюки')
    expect(faqPage.mainEntity[0].acceptedAnswer.text).toContain('68,8 км/ч')
    expect(faqPage.mainEntity[1].name).toContain('скорость бега уиппета')
    expect(faqPage.mainEntity[2].name).toContain('скорость бега русской псовой борзой')
  })

  it('homepageJsonLd outputs valid WebSite and Organization schemas with Knowledge Graph entities', () => {
    const jsonLd = homepageJsonLd()
    const graph = (jsonLd as any)['@graph'] as any[]
    expect(Array.isArray(graph)).toBe(true)
    const website = graph.find((item) => item['@type'] === 'WebSite')
    expect(website).toBeDefined()
    expect(website.name).toBe('Курсинг Статс')
    expect(website.alternateName).toContain('Coursing Stats')
    expect(website.alternateName).toContain('ProCoursing')
    expect(website.alternateName).toContain('КурсингСтатс')

    const org = graph.find((item) => item['@type'] === 'Organization')
    expect(org).toBeDefined()
    expect(org.logo).toContain('og-image.png')
    expect(org.knowsAbout).toContain('Курсинг')
  })

  it('doninoDatasetJsonLd outputs valid Dataset schema with license, free access, and distributions', () => {
    const jsonLd = doninoDatasetJsonLd()
    const graph = (jsonLd as any)['@graph'] as any[]
    expect(Array.isArray(graph)).toBe(true)
    const dataset = graph.find((item) => item['@type'] === 'Dataset')
    expect(dataset).toBeDefined()
    expect(dataset.name).toContain('База инструментальных замеров скорости')
    expect(dataset.license).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(dataset.isAccessibleForFree).toBe(true)
    expect(dataset.creator['@type']).toBe('Organization')
    expect(Array.isArray(dataset.distribution)).toBe(true)
    expect(dataset.distribution.length).toBeGreaterThanOrEqual(2)
    expect(dataset.distribution[0].encodingFormat).toBe('application/json')
    expect(dataset.distribution[0].contentUrl).toContain('speed_records.json')
  })

  it('breedHubMeta generates rich semantic content and FAQPage schema for breed hubs', () => {
    const meta = breedHubMeta({
      slug: 'whippet',
      canonicalKey: 'УИППЕТ',
      nameRu: 'Уиппет',
      nameLat: 'Whippet',
      fci: 'FCI 162',
      lead: 'Малая английская борзая',
      description: 'Самая скоростная порода',
      faqs: [
        { question: 'Скорость уиппета?', answer: 'До 64 км/ч' },
      ],
      topDogs: [
        { id: 5645, name: 'Стангерс Ланд Каталина', starts: 9, gold: 4, silver: 1, bronze: 0 },
      ],
      speedRecords: [
        { name: 'Драм', speed_kmh: 64, date: '2026-05-11' },
      ],
    })

    expect(meta.title).toContain('Уиппет (Whippet)')
    expect(meta.h1).toContain('Уиппет (Whippet) в курсинге и бегах')
    expect(meta.contentHtml).toContain('<a href="/dog/5645/"><strong>Стангерс Ланд Каталина</strong></a>')
    expect(meta.contentHtml).toContain('Драм</strong>: 64 км/ч')
    expect(meta.contentHtml).toContain('href="/competitions/ranking/2026/?breed=whippet"')

    const graph = (meta.jsonLd as any)['@graph'] as any[]
    const faq = graph.find((i) => i['@type'] === 'FAQPage')
    expect(faq).toBeDefined()
    expect(faq.mainEntity[0].name).toBe('Скорость уиппета?')
  })

  it('eventMetaFromEntry generates clickable links to dogs in contentHtml and Place location', () => {
    const meta = eventMetaFromEntry({
      id: '2026001',
      title: 'Чемпионат РКФ',
      date_start: '2026-06-15',
      location: 'Московская область, Донино',
      winners: [
        { dogId: 5645, name: 'Стангерс Ланд Каталина', breed: 'Уиппет', score: 350 },
      ],
    })

    expect(meta.contentHtml).toContain('<a href="/dog/5645/"><strong>Стангерс Ланд Каталина</strong></a>')
    const sportsEvent = (meta.jsonLd as any)['@graph'].find((i: any) => i['@type'] === 'SportsEvent')
    expect(sportsEvent.location['@type']).toBe('Place')
    expect(sportsEvent.location.address.addressLocality).toBe('Московская область, Донино')
  })
  it('exhibitionMeta converts DD.MM.YYYY to ISO 8601 and includes eventStatus and organizer', () => {
    const meta = exhibitionMeta({
      id: '66457',
      title: 'Рейтинговая выставка клуба "МОО КЛЖ СИБИРЯК"',
      date: '31.08.2024',
      city: 'Горно-Алтайск',
      dogCount: 356,
      club: 'МОО КЛЖ СИБИРЯК',
    })

    const event = (meta.jsonLd as any)['@graph'].find((i: any) => i['@type'] === 'Event')
    expect(event).toBeDefined()
    expect(event.startDate).toBe('2024-08-31')
    expect(event.endDate).toBe('2024-08-31')
    expect(event.eventStatus).toBe('https://schema.org/EventScheduled')
    expect(event.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode')
    expect(event.organizer['@type']).toBe('Organization')
    expect(event.organizer.name).toBe('МОО КЛЖ СИБИРЯК')
    expect(event.location['@type']).toBe('Place')
    expect(event.location.name).toBe('Горно-Алтайск')
    expect(event.location.address.addressLocality).toBe('Горно-Алтайск')
  })

  it('exhibitionMeta with missing date falls back to ItemPage without invalid Event node', () => {
    const meta = exhibitionMeta({
      id: '12',
      title: 'Выставка Всемирной федерации клубов бульдогов',
      date: '',
      city: 'Москва',
      club: 'РКФ',
    })

    const graph = (meta.jsonLd as any)['@graph'] as any[]
    const event = graph.find((i: any) => i['@type'] === 'Event')
    expect(event).toBeUndefined()

    const itemPage = graph.find((i: any) => i['@type'] === 'ItemPage')
    expect(itemPage).toBeDefined()
    expect(itemPage.name).toBe('Выставка Всемирной федерации клубов бульдогов')
  })

  it('toIsoDate handles DD.MM.YYYY, DD.MM.YY, embedded dates, ISO dates and empty values correctly', () => {
    expect(toIsoDate('31.08.2024')).toBe('2024-08-31')
    expect(toIsoDate('2026-06-15')).toBe('2026-06-15')
    expect(toIsoDate('02.11.19')).toBe('2019-11-02')
    expect(toIsoDate('20.10.19 СЕЗОН В НИЖНЕМ')).toBe('2019-10-20')
    expect(toIsoDate('')).toBeUndefined()
    expect(toIsoDate(null)).toBeUndefined()
  })

  it('extractBundleAssets, buildAssetLoaderScript, and buildEntitySpaShell decouple entity HTML from bundle hashes', () => {
    const shellWithPreload = SPA_SHELL.replace(
      '</head>',
      '    <link rel="modulepreload" crossorigin href="/assets/vendor-abc123.js">\n  </head>',
    )
    const extracted = extractBundleAssets(shellWithPreload)
    expect(extracted.scripts).toEqual(['/assets/index-abc123.js'])
    expect(extracted.preloads).toEqual(['/assets/vendor-abc123.js'])
    expect(extracted.css).toEqual(['/assets/index-abc123.css'])

    const loader = buildAssetLoaderScript(extracted)
    expect(loader).toContain('/assets/index-abc123.js')
    expect(loader).toContain('/assets/vendor-abc123.js')
    expect(loader).toContain('/assets/index-abc123.css')

    const entityShell = buildEntitySpaShell(shellWithPreload)
    expect(entityShell).toContain('<script src="/assets/loader.js"></script>')
    expect(entityShell).not.toContain('index-abc123.js')
    expect(entityShell).not.toContain('vendor-abc123.js')
    expect(entityShell).not.toContain('index-abc123.css')
    expect(entityShell).toContain('id="root"')
  })

  it('buildEntitySpaShell keeps entity HTML identical when bundle hashes change', async () => {
    const os = await import('node:os')
    const fs = await import('node:fs')
    const path = await import('node:path')
    const { EntityWriteTracker } = await import('../scripts/seo/incremental-state')

    const buildA = SPA_SHELL
    const buildB = SPA_SHELL.replace(/abc123/g, 'xyz999')

    const pageA = applyMetaToSpaShell(buildEntitySpaShell(buildA), {
      title: 'Тестовая собака | Курсинг Статс',
      description: 'Описание собаки',
      canonicalUrl: 'https://coursing-stats.ru/dog/42/',
      bodyHtml: '<main><h1>Тест</h1></main>',
    })
    const pageB = applyMetaToSpaShell(buildEntitySpaShell(buildB), {
      title: 'Тестовая собака | Курсинг Статс',
      description: 'Описание собаки',
      canonicalUrl: 'https://coursing-stats.ru/dog/42/',
      bodyHtml: '<main><h1>Тест</h1></main>',
    })
    expect(pageA).toBe(pageB)

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-inc-'))
    try {
      const tracker1 = new EntityWriteTracker()
      const file42 = path.join(tmpDir, 'dog/42/index.html')
      tracker1.recordAndMaybeWrite('dog/42/index.html', pageA, file42, true)
      tracker1.recordAndMaybeWrite('dog/99/index.html', pageA, path.join(tmpDir, 'dog/99/index.html'), true)
      expect(tracker1.deltaPaths).toEqual(['dog/42/index.html', 'dog/99/index.html'])

      // Second run with new frontend hash and dog/99 removed: dog/42 skipped, dog/99 marked deleted
      fs.unlinkSync(file42)
      const tracker2 = new EntityWriteTracker({
        prevState: tracker1.nextState,
        skipUnchangedDiskWrites: true,
      })
      tracker2.recordAndMaybeWrite('dog/42/index.html', pageB, file42, true)
      expect(tracker2.deltaPaths).toEqual([])
      expect(tracker2.unchangedCount).toBe(1)
      expect(fs.existsSync(file42)).toBe(false)
      expect(tracker2.getDeletedPaths()).toEqual(['dog/99/index.html'])
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    }
  })
});
