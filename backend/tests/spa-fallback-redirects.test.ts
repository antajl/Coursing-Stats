import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const redirects = path.resolve(__dirname, '../../frontend/public/_redirects')

describe('SPA fallback redirects', () => {
  it('301s spa-shell/404 traps; has no /* …html 200 catch-all (CF pretty-URL break)', () => {
    const text = fs.readFileSync(redirects, 'utf8')
    expect(text).toMatch(/\/spa-shell \/ 301/)
    expect(text).toMatch(/\/404 \/ 301/)
    expect(text).toMatch(/\/top-dogs \/competitions\?tab=ranking 301/)
    expect(text).toMatch(/\/data\/\* \/data\/:splat 200/)
    // Catch-all rewrite to a .html file is unsafe on CF Pages (308 to extensionless path).
    expect(text).not.toMatch(/^\/\* \/\S+\.html 200\s*$/m)
    expect(text).not.toMatch(/^\/\* \/index\.html 200\s*$/m)
  })
})
