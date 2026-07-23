import { describe, expect, it } from 'vitest'
import {
  applyMetaToSpaShell,
  breadcrumbJsonLd,
  buildDogBodyHtml,
  buildHubBodyHtml,
  escapeHtml,
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
      facts: ['Курсинг: 3 стартов'],
      recentCompetitions: ['ЧРКФ — тест'],
    })
    expect(body).toContain('TEST DOG')
    expect(body).toContain('Курсинг: 3 стартов')
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
})
