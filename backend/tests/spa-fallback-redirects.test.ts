import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const redirects = path.resolve(__dirname, '../../frontend/public/_redirects')

describe('SPA fallback redirects', () => {
  it('falls back to /404.html, not root index.html or spa-shell.html; 301s spa-shell', () => {
    const text = fs.readFileSync(redirects, 'utf8')
    expect(text).toMatch(/\/\* \/404\.html 200/)
    expect(text).not.toMatch(/\/\* \/index\.html 200/)
    expect(text).not.toMatch(/\/\* \/spa-shell\.html 200/)
    expect(text).not.toMatch(/\/\* \/spa-shell\/index\.html 200/)
    expect(text).toMatch(/\/spa-shell \/ 301/)
    expect(text).toMatch(/\/data\/\* \/data\/:splat 200/)
    expect(text).toMatch(/\/top-dogs \/competitions\?tab=ranking 301/)
  })
})
