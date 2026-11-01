import { describe, expect, it } from 'vitest'
import {
  collectSitemapUrls,
  loadExhibitionIdsForSitemap,
  loadProtocolIds,
  renderSitemapIndexXml,
  renderSitemapXml,
} from '../scripts/build-derived/sitemap'

describe('sitemap collectors', () => {
  it('includes event, protocol, exhibition, breed hubs and show-judge locs from fixtures', () => {
    const urls = collectSitemapUrls({
      dogIds: [1],
      sportJudgeNames: ['Иванов'],
      doninoDogs: [{ name: 'REX', breed: 'WHIPPET' }],
      eventIds: ['1250'],
      protocolIds: ['1250', '2026001'],
      exhibitionIds: ['10000'],
      showJudgeIds: ['иванов|и|и'],
    })
    const locs = urls.map((u) => u.loc)
    expect(locs).toContain('/event/1250/')
    expect(locs).toContain('/protocols/1250.html')
    expect(locs).toContain('/protocols/2026001.html')
    expect(locs).toContain('/donino/championship/')
    expect(locs).toContain('/donino/analytics/')
    expect(locs).toContain('/shows/exhibition/10000/')
    expect(locs).toContain('/breeds/whippet/')
    expect(locs).toContain('/breeds/saluki/')
    expect(locs.some((u) => u.startsWith('/shows/judges/'))).toBe(true)
    expect(locs).toContain('/dog/1/')
    expect(locs.every((u) => !u.startsWith('/admin'))).toBe(true)
  })

  it('loadProtocolIds loads existing public protocols', () => {
    const ids = loadProtocolIds()
    expect(ids.length).toBeGreaterThan(100)
    expect(ids).toContain('2026001')
  })

  it('renderSitemapXml escapes and prefixes site origin', () => {
    const xml = renderSitemapXml([
      { loc: '/event/1', changefreq: 'monthly', priority: '0.7' },
      { loc: '/judges/' + encodeURIComponent('А & Б'), changefreq: 'monthly', priority: '0.5' },
    ])
    expect(xml).toContain('<loc>https://coursing-stats.ru/event/1</loc>')
    expect(xml).toContain('%26')
    expect(xml).not.toContain('/admin')
  })

  it('renderSitemapIndexXml builds valid sitemapindex structure', () => {
    const indexXml = renderSitemapIndexXml([
      { loc: '/sitemap-main.xml', lastmod: '2026-10-24' },
      { loc: '/sitemap-events.xml', lastmod: '2026-10-24' },
    ])
    expect(indexXml).toContain('<sitemapindex')
    expect(indexXml).toContain('<loc>https://coursing-stats.ru/sitemap-main.xml</loc>')
    expect(indexXml).toContain('<lastmod>2026-10-24</lastmod>')
  })

  it('loadExhibitionIdsForSitemap finds type1 and index entries when data present', () => {
    const ids = loadExhibitionIdsForSitemap()
    // Repo has thousands of type1 protocols + index.json
    expect(ids.length).toBeGreaterThan(50)
    expect(ids.some((id) => /^\d+$/.test(id))).toBe(true)
  })
})
