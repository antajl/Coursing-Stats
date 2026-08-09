import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = path.resolve(__dirname, '../..')
const robotsPath = path.join(ROOT, 'frontend/public/robots.txt')

describe('robots.txt', () => {
  it('exists in frontend/public', () => {
    expect(fs.existsSync(robotsPath)).toBe(true)
  })

  it('allows crawl, points to sitemap, blocks admin/auth', () => {
    const text = fs.readFileSync(robotsPath, 'utf8')
    expect(text).toMatch(/User-agent:\s*\*/i)
    expect(text).toMatch(/Allow:\s*\//i)
    expect(text).toContain('Sitemap: https://coursing-stats.ru/sitemap.xml')
    expect(text).toMatch(/Disallow:\s*\/admin/i)
    expect(text).toMatch(/Disallow:\s*\/login/i)
    expect(text).toMatch(/Disallow:\s*\/account/i)
  })
})
