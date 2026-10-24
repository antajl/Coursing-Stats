import { describe, expect, it } from 'vitest'
import {
  applyMetaToSpaShell,
  breadcrumbJsonLd,
  breedHubMeta,
  build404Html,
  buildCompetitionsHubHtml,
  buildDogBodyHtml,
  buildGuideHubHtml,
  buildHubBodyHtml,
  buildNeutralSpaShell,
  competitionsJsonLd,
  DEFAULT_COMPETITION_FAQS,
  DEFAULT_GUIDE_SPEED_FAQS,
  escapeHtml,
  eventMetaFromEntry,
  guideJsonLd,
  homepageJsonLd,
  HUB_PAGES,
  showJudgeMeta,
  sportJudgeMeta,
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
    expect(html).toContain('<title>Страница не найдена | Coursing Stats</title>')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(html).not.toMatch(/rel=["']canonical["']/)
    // Client script must be preserved so dynamic SPA routes (show dogs, etc.) hydrate on S3 fallback
    expect(html).toContain('src="/assets/index-abc123.js"')
    expect(html).toContain('href="/assets/index-abc123.css"')
    expect(html).toContain('404-dogs.png')
    expect(html).toContain('404-dogs-mobile.png')
    expect(html).toContain('Coursing Stats')
    expect(html).toContain('href="/competitions"')
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

    expect(html).toContain('<title>Рейтинг собак | Coursing Stats</title>')
    expect(html).toContain('<meta name="description" content="Описание рейтинга" />')
    expect(html).toContain('<link rel="canonical" href="https://coursing-stats.ru/competitions" />')
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
    expect(body).toContain('href="/shows"')
    expect(body).toContain('href="/guide"')
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
    expect(body).toContain('href="/competitions"')
    expect(body).toContain('href="/speed-records"')
    expect(body).toContain('href="/guide"')
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
    expect(html).toContain('property="og:title" content="Новый title | Coursing Stats"')
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
    expect(home).toContain('<link rel="canonical" href="https://coursing-stats.ru/" />')
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
    expect(meta.title).toContain('Coursing Stats')

    // Both RU and EN must be present in Description
    expect(meta.description).toContain('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(meta.description).toContain('Emul de Gepard Gelila Al Rawda')
    expect(meta.description).toContain('Салюки')

    // Body data contains raw aliases and secondary name
    expect(meta.body.name).toBe('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(meta.body.secondaryName).toBe('Emul de Gepard Gelila Al Rawda')
    expect(meta.body.rawRuName).toBe('ЭМУЛЬ ДЭ ГЕПАРД ГЕЛИЛА АЛЬ РАВДА')
    expect(meta.body.rawLatName).toBe('EMUL DE GEPARD GELILA AL RAWDA')

    // JSON-LD contains ProfilePage with name and alternateName
    expect(meta.jsonLd).toBeDefined()
    const graph = (meta.jsonLd as any)['@graph'] as any[]
    expect(Array.isArray(graph)).toBe(true)
    const profilePage = graph.find((item) => item['@type'] === 'ProfilePage')
    expect(profilePage).toBeDefined()
    expect(profilePage.mainEntity.name).toBe('Эмуль Дэ Гепард Гелила Аль Равда')
    expect(profilePage.mainEntity.alternateName).toContain('Emul de Gepard Gelila Al Rawda')
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
    expect(html).toContain('Coursing Stats на основе официальных протоколов соревнований РКФ с 2015 года')
    expect(html).toContain('забегов: 9')
    expect(html).not.toContain('стартов:')
    expect(html).toContain('<a href="/dog/5645">Стангерс Ланд Каталина</a>')
  })

  it('competitionsJsonLd outputs FAQPage schema with questions and answers', () => {
    const jsonLd = competitionsJsonLd(DEFAULT_COMPETITION_FAQS)
    const graph = (jsonLd as any)['@graph'] as any[]
    const faqPage = graph.find((item) => item['@type'] === 'FAQPage')
    expect(faqPage).toBeDefined()
    expect(faqPage.mainEntity.length).toBeGreaterThanOrEqual(4)
    expect(faqPage.mainEntity[0].name).toContain('актуальное расписание и календарь соревнований по курсингу')
    expect(faqPage.mainEntity.some((q: any) => q.name.includes('Существует ли единый всероссийский рейтинг'))).toBe(true)
    expect(faqPage.mainEntity[0].acceptedAnswer.text).toContain('Coursing Stats')
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

  it('showJudgeMeta formats judge name in TitleCase without all-caps and sets RKF expert title', () => {
    const meta = showJudgeMeta({
      id: 'орлова|м|о',
      display_name: 'ОРЛОВА МАРИНА ОЛЕГОВНА',
      total_judged: 300,
      unique_breeds: 4,
      excellent_rate: 0.7466,
    })

    expect(meta.title).toContain('Эксперт РКФ Орлова Марина Олеговна')
    expect(meta.title).not.toContain('ОРЛОВА')
    expect(meta.description).toContain('75% отлично')
    expect(meta.description).toContain('Эксперт РКФ / FCI Орлова Марина Олеговна')
    const person = (meta.jsonLd as any)['@graph'].find((item: any) => item['@type'] === 'Person')
    expect(person.name).toBe('Орлова Марина Олеговна')
    expect(person.jobTitle).toContain('Эксперт РКФ')
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
    expect(html).toContain('<a href="/competitions">')
    expect(html).toContain('<a href="/speed-records">')
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
    expect(website.name).toBe('Coursing Stats')
    expect(website.alternateName).toContain('ProCoursing')

    const org = graph.find((item) => item['@type'] === 'Organization')
    expect(org).toBeDefined()
    expect(org.logo).toContain('og-image.png')
    expect(org.knowsAbout).toContain('Курсинг')
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
    expect(meta.contentHtml).toContain('href="/competitions?tab=ranking&breed=%D0%A3%D0%98%D0%9F%D0%9F%D0%95%D0%A2"')

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
})
