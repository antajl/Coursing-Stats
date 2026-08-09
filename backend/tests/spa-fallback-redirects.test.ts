import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const redirects = path.resolve(__dirname, '../../frontend/public/_redirects')

describe('SPA fallback redirects', () => {
  it('falls back to spa-shell.html, not index.html', () => {
    const text = fs.readFileSync(redirects, 'utf8')
    expect(text).toMatch(/\/\* \/spa-shell\.html 200/)
    expect(text).not.toMatch(/\/\* \/index\.html 200/)
  })
})
