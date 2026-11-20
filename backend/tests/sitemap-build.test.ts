import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  collectSitemapUrls,
  loadExhibitionIdsForSitemap,
  loadExhibitionsByYear,
  loadProtocolIds,
  renderSitemapIndexXml,
  renderSitemapXml,
} from '../scripts/build-derived/sitemap'

const ROOT = path.resolve(__dirname, '../..')

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
    expect(locs).toContain('/competitions/archive/2026/')
    expect(locs).toContain('/competitions/archive/2027/')
    expect(locs).toContain('/competitions/ranking/2026/')
    expect(locs).toContain('/shows/archive/2026/')
    expect(locs).toContain('/shows/ranking/2026/')
    expect(locs).toContain('/shows/judges/2026/')
    expect(locs).toContain('/competitions/judges/2026/')
    expect(locs).toContain('/speed-records/2026/')
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

  it('loadExhibitionsByYear groups exhibitions by year with none exceeding 10k cap', () => {
    const byYear = loadExhibitionsByYear()
    const expectedKeys = ['2026', '2025', '2024', '2023', '2022', '2021', 'archive']
    for (const key of expectedKeys) {
      expect(byYear).toHaveProperty(key)
      expect(Array.isArray(byYear[key])).toBe(true)
      expect(byYear[key].length).toBeLessThanOrEqual(10000)
    }
    expect(byYear['2026'].length).toBeGreaterThan(100)
  })

  it('verifies generated modular sitemaps adhere to 12 files and <= 10k URL capacity', () => {
    const publicDir = path.join(ROOT, 'frontend/public')
    const indexXml = fs.readFileSync(path.join(publicDir, 'sitemap-index.xml'), 'utf8')
    expect(indexXml).toContain('<sitemapindex')
    expect(indexXml).toContain('sitemap-main.xml')
    expect(indexXml).toContain('sitemap-events.xml')
    expect(indexXml).toContain('sitemap-protocols.xml')
    expect(indexXml).toContain('sitemap-dogs.xml')
    expect(indexXml).toContain('sitemap-judges.xml')
    expect(indexXml).toContain('sitemap-shows-2026.xml')
    expect(indexXml).toContain('sitemap-shows-archive.xml')

    // Legacy chunks must be absent
    expect(fs.existsSync(path.join(publicDir, 'sitemap-shows-1.xml'))).toBe(false)
    expect(fs.existsSync(path.join(publicDir, 'sitemap-shows-2.xml'))).toBe(false)

    // Check URL cap <= 10000 for each child sitemap
    const childSitemaps = [
      'sitemap-main.xml',
      'sitemap-events.xml',
      'sitemap-protocols.xml',
      'sitemap-dogs.xml',
      'sitemap-judges.xml',
      'sitemap-shows-2026.xml',
      'sitemap-shows-2025.xml',
      'sitemap-shows-2024.xml',
      'sitemap-shows-2023.xml',
      'sitemap-shows-2022.xml',
      'sitemap-shows-2021.xml',
      'sitemap-shows-archive.xml',
    ]
    for (const file of childSitemaps) {
      const filePath = path.join(publicDir, file)
      expect(fs.existsSync(filePath), `${file} should exist`).toBe(true)
      const xml = fs.readFileSync(filePath, 'utf8')
      const count = (xml.match(/<loc>/g) || []).length
      expect(count, `${file} count ${count} should be <= 10000`).toBeLessThanOrEqual(10000)
      expect(xml).not.toContain('<priority>')
      expect(xml).not.toContain('<changefreq>')
    }
  })
})
