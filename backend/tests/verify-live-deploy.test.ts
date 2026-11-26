import http from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  assertSeoEntityHtml,
  verifyLiveDeploy,
  type FetchSnapshotFn,
  type HttpResponseSnapshot,
} from '../scripts/ops/verify-live-deploy.js'

const VALID_LOADER = `(function(){var h=document.head;var c=["/assets/index-abc.css"];var s=["/assets/index-abc.js"];})();`

function seoHtml(url: string, title: string, extraMain = 'Статистика и результаты'): string {
  return `<!doctype html><html lang="ru"><head><title>${title}</title><link rel="canonical" href="${url}" data-rh="true" /><script src="/assets/loader.js"></script></head><body><div id="root"><main><h1>${title}</h1><p>${extraMain}</p></main></div></body></html>`
}

function buildMockRoutes(): Record<string, { status?: number; body: string; headers?: Record<string, string> }> {
  return {
    '/': {
      body: `<!doctype html><html><head><link rel="canonical" href="https://coursing-stats.ru/" /><script type="module" src="/assets/index-abc.js"></script></head><body><div id="root"><main><h1>Курсинг Статс</h1><p>Платформа статистики</p></main></div></body></html>`,
    },
    '/assets/loader.js': { body: VALID_LOADER },
    '/assets/index-abc.js': { body: 'console.log("app");' },
    '/404.html': {
      body: `<!doctype html><html><head><meta name="robots" content="noindex, nofollow" /></head><body><img src="/assets/errors/404-dogs.png" /></body></html>`,
    },
    '/procoursing/': {
      body: `<!doctype html><html><head><meta http-equiv="refresh" content="0; url=https://coursing-stats.ru/competitions/ranking/2026/" /><script>window.location.replace('https://coursing-stats.ru/competitions/ranking/2026/');</script></head><body></body></html>`,
    },
    '/sitemap-index.xml': {
      body: `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://coursing-stats.ru/sitemap-main.xml</loc></sitemap>
        <sitemap><loc>https://coursing-stats.ru/sitemap-events.xml</loc></sitemap>
        <sitemap><loc>https://coursing-stats.ru/sitemap-protocols.xml</loc></sitemap>
        <sitemap><loc>https://coursing-stats.ru/sitemap-dogs.xml</loc></sitemap>
        <sitemap><loc>https://coursing-stats.ru/sitemap-judges.xml</loc></sitemap>
        <sitemap><loc>https://coursing-stats.ru/sitemap-shows-2026.xml</loc></sitemap>
      </sitemapindex>`,
    },
    '/sitemap-main.xml': {
      body: `<urlset>
        <url><loc>https://coursing-stats.ru/</loc></url>
        <url><loc>https://coursing-stats.ru/shows/judges/2026/</loc></url>
      </urlset>`,
    },
    '/shows/judges/2026/': {
      body: `<!doctype html><html><head><link rel="canonical" href="https://coursing-stats.ru/shows/judges/2026/" /><script type="module" src="/assets/index-abc.js"></script></head><body><div id="root"><main><h1>Судьи выставок РКФ 2026</h1></main></div></body></html>`,
    },
    '/sitemap-events.xml': {
      body: `<urlset><url><loc>https://coursing-stats.ru/event/1202/</loc></url></urlset>`,
    },
    '/sitemap-protocols.xml': {
      body: `<urlset><url><loc>https://coursing-stats.ru/protocols/1202.html</loc></url></urlset>`,
    },
    '/sitemap-dogs.xml': {
      body: `<urlset>
        <url><loc>https://coursing-stats.ru/dog/263/</loc></url>
        <url><loc>https://coursing-stats.ru/donino-dog/Monica%20Bellucci/%D0%90%D0%A1%D0%A2/</loc></url>
      </urlset>`,
    },
    '/sitemap-judges.xml': {
      body: `<urlset>
        <url><loc>https://coursing-stats.ru/judges/23/</loc></url>
        <url><loc>https://coursing-stats.ru/shows/judges/2565/</loc></url>
      </urlset>`,
    },
    '/sitemap-shows-2026.xml': {
      body: `<urlset><url><loc>https://coursing-stats.ru/shows/exhibition/108/</loc></url></urlset>`,
    },
    '/event/1202/': { body: seoHtml('https://coursing-stats.ru/event/1202/', 'Состязание 1202') },
    '/protocols/1202.html': { body: '<html><head><title>Протокол 1202</title></head><body><table class="protocol-table"></table></body></html>' },
    '/dog/263/': { body: seoHtml('https://coursing-stats.ru/dog/263/', 'Собака 263') },
    '/donino-dog/Monica%20Bellucci/%D0%90%D0%A1%D0%A2/': {
      body: seoHtml('https://coursing-stats.ru/donino-dog/Monica%20Bellucci/%D0%90%D0%A1%D0%A2/', 'Донино собака'),
    },
    '/judges/23/': { body: seoHtml('https://coursing-stats.ru/judges/23/', 'Судья 23') },
    '/shows/judges/2565/': { body: seoHtml('https://coursing-stats.ru/shows/judges/2565/', 'Эксперт 2565') },
    '/shows/exhibition/108/': { body: seoHtml('https://coursing-stats.ru/shows/exhibition/108/', 'Выставка 108') },
  }
}

function makeMockFetcher(
  overrides: Record<string, { status?: number; body: string; headers?: Record<string, string> }> = {},
): FetchSnapshotFn {
  const routes = { ...buildMockRoutes(), ...overrides }
  return async (url: string): Promise<HttpResponseSnapshot> => {
    const pathname = new URL(url).pathname
    const hit = routes[pathname]
    if (!hit) {
      return { url, status: 404, body: 'Not Found', headers: {} }
    }
    return {
      url,
      status: hit.status ?? 200,
      body: hit.body,
      headers: hit.headers ?? {},
    }
  }
}

describe('verify-live-deploy', () => {
  let server: http.Server
  let baseUrl = ''

  beforeAll(async () => {
    const routes = buildMockRoutes()
    server = http.createServer((req, res) => {
      const pathOnly = (req.url || '/').split('?')[0]
      const hit = routes[pathOnly]
      if (!hit) {
        res.statusCode = 404
        res.end('Not found')
        return
      }
      res.statusCode = hit.status ?? 200
      res.setHeader('Content-Type', pathOnly.endsWith('.xml') ? 'application/xml' : 'text/html; charset=utf-8')
      res.end(hit.body)
    })
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as { port: number }
        baseUrl = `http://127.0.0.1:${addr.port}`
        resolve()
      })
    })
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()))
  })

  it('passes end-to-end against real HTTP server serving all sitemaps and entity page types', async () => {
    const result = await verifyLiveDeploy(baseUrl)
    expect(result.childSitemapsCount).toBe(6)
    const kinds = result.checked.map((c) => c.kind)
    expect(kinds).toContain('home')
    expect(kinds).toContain('loaderJs')
    expect(kinds).toContain('bundleChunk')
    expect(kinds).toContain('page404')
    expect(kinds).toContain('redirect')
    expect(kinds).toContain('doninoDog')
    expect(kinds).toContain('showJudge')
  })

  it('detects empty SPA fallback instead of prerendered SEO page', async () => {
    const spaFallback = `<!doctype html><html><head><title>Курсинг Статс</title></head><body><div id="root"></div></body></html>`
    await expect(
      verifyLiveDeploy('https://coursing-stats.ru', makeMockFetcher({ '/dog/263/': { body: spaFallback } })),
    ).rejects.toThrow(/empty SPA fallback/i)
  })

  it('detects missing /assets/loader.js or missing canonical link', () => {
    expect(() =>
      assertSeoEntityHtml(
        'https://coursing-stats.ru/dog/1/',
        '<html><head><link rel="canonical" href="https://coursing-stats.ru/dog/1/" /></head><body><main><h1>Собака для теста</h1></main></body></html>',
      ),
    ).toThrow(/loader\.js/i)

    expect(() =>
      assertSeoEntityHtml(
        'https://coursing-stats.ru/dog/1/',
        '<html><head><script src="/assets/loader.js"></script></head><body><main><h1>Собака для теста</h1></main></body></html>',
      ),
    ).toThrow(/canonical/i)
  })

  it('fails loudly if required entity category is missing from sitemaps rather than skipping silently', async () => {
    const noDoninoDogsSitemap = {
      '/sitemap-dogs.xml': {
        body: `<urlset><url><loc>https://coursing-stats.ru/dog/263/</loc></url></urlset>`,
      },
    }
    await expect(
      verifyLiveDeploy('https://coursing-stats.ru', makeMockFetcher(noDoninoDogsSitemap)),
    ).rejects.toThrow(/doninoDog/i)
  })

  it('fails if /procoursing/ redirect returns regular SPA HTML instead of redirect', async () => {
    await expect(
      verifyLiveDeploy(
        'https://coursing-stats.ru',
        makeMockFetcher({ '/procoursing/': { body: '<html><body><div id="root"></div></body></html>' } }),
      ),
    ).rejects.toThrow(/meta refresh|JS redirect/i)
  })

  it('fails if loader.js returns HTML fallback or child sitemap returns 404', async () => {
    await expect(
      verifyLiveDeploy(
        'https://coursing-stats.ru',
        makeMockFetcher({ '/assets/loader.js': { body: '<!doctype html><html></html>' } }),
      ),
    ).rejects.toThrow(/HTML fallback/i)

    await expect(
      verifyLiveDeploy(
        'https://coursing-stats.ru',
        makeMockFetcher({ '/sitemap-shows-2026.xml': { status: 404, body: 'Not found' } }),
      ),
    ).rejects.toThrow(/HTTP 404/i)
  })
})
