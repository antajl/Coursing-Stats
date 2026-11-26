import { fileURLToPath } from 'node:url'

export const DEFAULT_BASE_URL = 'https://coursing-stats.ru'

export type HttpResponseSnapshot = {
  url: string
  status: number
  body: string
  headers: Record<string, string>
}

export type FetchSnapshotFn = (url: string) => Promise<HttpResponseSnapshot>

export type VerificationResult = {
  checked: Array<{ kind: string; url: string; detail: string }>
  childSitemapsCount: number
}

export function parseXmlLocs(xml: string): string[] {
  const locs: string[] = []
  for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
    if (m[1]) locs.push(m[1].trim())
  }
  return locs
}

export function normalizeUrlToBase(rawUrl: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/+$/, '')
  try {
    const u = new URL(rawUrl)
    return `${base}${u.pathname}${u.search}`
  } catch {
    return `${base}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
  }
}

export function assertSeoEntityHtml(url: string, html: string): string {
  if (!html || html.trim().length < 80) {
    throw new Error(`${url}: empty or truncated HTML response`)
  }
  if (/<div\s+id=["']root["'][^>]*>\s*<\/div>/i.test(html)) {
    throw new Error(`${url}: received empty SPA fallback (<div id="root"></div>) instead of prerendered SEO HTML`)
  }
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)
  if (!mainMatch) {
    throw new Error(`${url}: missing <main> content block`)
  }
  const visibleText = mainMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (visibleText.length < 15) {
    throw new Error(`${url}: <main> has insufficient text (${visibleText.length} chars)`)
  }
  if (!/<link\b[^>]*rel=["']canonical["'][^>]*href=["']https?:\/\/[^"']+["']/i.test(html)) {
    throw new Error(`${url}: missing canonical link`)
  }
  if (!html.includes('/assets/loader.js')) {
    throw new Error(`${url}: missing /assets/loader.js script reference`)
  }
  return `SEO OK (<main> ${visibleText.length} chars, canonical, loader.js)`
}

export function assertHubHtml(url: string, html: string): string {
  if (!/<main\b[^>]*>[\s\S]{15,}<\/main>/i.test(html)) {
    throw new Error(`${url}: hub missing prerendered <main> body`)
  }
  if (!/<link\b[^>]*rel=["']canonical["'][^>]*href=["']https?:\/\/[^"']+["']/i.test(html)) {
    throw new Error(`${url}: hub missing canonical link`)
  }
  if (!html.includes('/assets/index-') && !html.includes('/assets/loader.js')) {
    throw new Error(`${url}: hub missing JS bundle entrypoint`)
  }
  return 'Hub OK (<main>, canonical, assets)'
}

export function assert404Html(url: string, html: string): string {
  if (!html.includes('404-dogs.png')) {
    throw new Error(`${url}: missing 404 artwork (404-dogs.png)`)
  }
  if (!/name=["']robots["'][^>]*content=["']noindex/i.test(html)) {
    throw new Error(`${url}: missing noindex robots meta`)
  }
  if (/<link\b[^>]*rel=["']canonical["']/i.test(html)) {
    throw new Error(`${url}: 404.html must not contain canonical link`)
  }
  return '404 OK (noindex, artwork, no canonical)'
}

export function assertRedirectBehavior(
  url: string,
  resp: HttpResponseSnapshot,
  expectedTargetFragment: string,
): string {
  if (resp.status >= 300 && resp.status < 400) {
    const loc = resp.headers.location || ''
    if (!loc.includes(expectedTargetFragment)) {
      throw new Error(`${url}: HTTP ${resp.status} Location "${loc}" does not point to "${expectedTargetFragment}"`)
    }
    return `Redirect OK (HTTP ${resp.status} -> ${loc})`
  }
  if (resp.status !== 200) {
    throw new Error(`${url}: unexpected HTTP ${resp.status} for redirect route`)
  }
  const hasMetaRefresh = new RegExp(`http-equiv=["']refresh["'][^>]*${expectedTargetFragment}`, 'i').test(resp.body)
  const hasJsReplace = resp.body.includes(expectedTargetFragment) && resp.body.includes('location.replace')
  if (!hasMetaRefresh || !hasJsReplace) {
    throw new Error(`${url}: missing meta refresh or JS redirect targeting "${expectedTargetFragment}"`)
  }
  return `Static redirect OK (meta+JS -> ${expectedTargetFragment})`
}

export function assertProtocolHtml(url: string, html: string): string {
  if (!/<title>[\s\S]*?<\/title>/i.test(html) || !html.includes('protocol-table')) {
    throw new Error(`${url}: protocol HTML missing <title> or protocol-table`)
  }
  return 'Protocol OK'
}

export function assertLoaderJs(url: string, body: string): { detail: string; sampleChunk: string | null } {
  if (/<!doctype|<html/i.test(body)) {
    throw new Error(`${url}: returned HTML fallback instead of JavaScript`)
  }
  if (!body.includes('/assets/') || !body.includes('.js') || !body.includes('.css')) {
    throw new Error(`${url}: loader.js missing expected /assets/*.js or *.css references`)
  }
  const chunkMatch = body.match(/\/assets\/[^"'\s]+\.js/)
  return { detail: `Loader JS OK (${body.length} bytes)`, sampleChunk: chunkMatch ? chunkMatch[0] : null }
}

export async function defaultFetchSnapshot(url: string): Promise<HttpResponseSnapshot> {
  const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  const headers: Record<string, string> = {}
  res.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v
  })
  const body = await res.text()
  return { url, status: res.status, body, headers }
}

function classifySitemapUrl(url: string): 'hub' | 'entity' | 'protocol' {
  const pathname = new URL(url).pathname
  if (pathname.startsWith('/protocols/')) return 'protocol'
  // Seasonal/aggregate judge hubs (/shows/judges/2026/, /shows/judges/all/) use direct hub bundle.
  if (/^\/(?:shows\/)?judges\/(?:20\d{2}|all)?\/?$/.test(pathname)) return 'hub'
  if (
    pathname.startsWith('/dog/') ||
    pathname.startsWith('/donino-dog/') ||
    pathname.startsWith('/event/') ||
    pathname.startsWith('/judges/') ||
    pathname.startsWith('/shows/judges/') ||
    pathname.startsWith('/shows/exhibition/')
  ) {
    return 'entity'
  }
  return 'hub'
}

export async function verifyLiveDeploy(
  baseUrl = DEFAULT_BASE_URL,
  fetchFn: FetchSnapshotFn = defaultFetchSnapshot,
): Promise<VerificationResult> {
  const base = baseUrl.replace(/\/+$/, '')
  const checked: VerificationResult['checked'] = []
  const visitedUrls = new Map<string, HttpResponseSnapshot>()

  const getOk = async (rawUrl: string): Promise<HttpResponseSnapshot> => {
    const url = normalizeUrlToBase(rawUrl, base)
    const cached = visitedUrls.get(url)
    if (cached) return cached
    const resp = await fetchFn(url)
    if (resp.status !== 200) {
      throw new Error(`${url}: expected HTTP 200, got HTTP ${resp.status}`)
    }
    visitedUrls.set(url, resp)
    return resp
  }

  // 1. Core entrypoints, loader.js + referenced chunk, 404, static redirect
  const homeResp = await getOk(`${base}/`)
  checked.push({ kind: 'home', url: homeResp.url, detail: assertHubHtml(homeResp.url, homeResp.body) })

  const loaderResp = await getOk(`${base}/assets/loader.js`)
  const loaderInfo = assertLoaderJs(loaderResp.url, loaderResp.body)
  checked.push({ kind: 'loaderJs', url: loaderResp.url, detail: loaderInfo.detail })
  if (!loaderInfo.sampleChunk) {
    throw new Error(`${loaderResp.url}: failed to extract any hashed JS chunk`)
  }
  const chunkResp = await getOk(`${base}${loaderInfo.sampleChunk}`)
  if (/<!doctype|<html/i.test(chunkResp.body)) {
    throw new Error(`${chunkResp.url}: hashed bundle chunk returned HTML instead of JS`)
  }
  checked.push({ kind: 'bundleChunk', url: chunkResp.url, detail: `Chunk OK (${chunkResp.body.length} bytes)` })

  const page404Resp = await getOk(`${base}/404.html`)
  checked.push({ kind: 'page404', url: page404Resp.url, detail: assert404Html(page404Resp.url, page404Resp.body) })

  const redirectUrl = `${base}/procoursing/`
  const redirectResp = await fetchFn(redirectUrl)
  checked.push({
    kind: 'redirect',
    url: redirectUrl,
    detail: assertRedirectBehavior(redirectUrl, redirectResp, '/competitions/ranking/2026/'),
  })

  // 2. Sitemap index -> every child sitemap -> sample URL validation + required categories
  const indexResp = await getOk(`${base}/sitemap-index.xml`)
  if (!indexResp.body.includes('<sitemapindex')) {
    throw new Error(`${indexResp.url}: invalid sitemap-index.xml (missing <sitemapindex>)`)
  }
  const childSitemaps = parseXmlLocs(indexResp.body)
  if (childSitemaps.length === 0) {
    throw new Error(`${indexResp.url}: contains 0 child sitemaps`)
  }
  checked.push({ kind: 'sitemapIndex', url: indexResp.url, detail: `${childSitemaps.length} child sitemaps` })

  const requiredSamples = new Map<string, string | null>([
    ['dog', null],
    ['doninoDog', null],
    ['event', null],
    ['sportJudge', null],
    ['showJudge', null],
    ['exhibition', null],
    ['protocol', null],
  ])

  for (const rawChildUrl of childSitemaps) {
    const childResp = await getOk(rawChildUrl)
    if (!childResp.body.includes('<urlset')) {
      throw new Error(`${childResp.url}: invalid child sitemap (missing <urlset>)`)
    }
    const locs = parseXmlLocs(childResp.body)
    if (locs.length === 0) {
      throw new Error(`${childResp.url}: child sitemap is empty (0 <loc> entries)`)
    }

    // Verify at least the first URL of every child sitemap
    const sampleUrl = normalizeUrlToBase(locs[0], base)
    const sampleResp = await getOk(sampleUrl)
    const kind = classifySitemapUrl(sampleUrl)
    const detail =
      kind === 'protocol'
        ? assertProtocolHtml(sampleUrl, sampleResp.body)
        : kind === 'entity'
          ? assertSeoEntityHtml(sampleUrl, sampleResp.body)
          : assertHubHtml(sampleUrl, sampleResp.body)
    checked.push({ kind: `sitemapSample:${new URL(childResp.url).pathname}`, url: sampleUrl, detail })

    for (const loc of locs) {
      const normalized = normalizeUrlToBase(loc, base)
      const locKind = classifySitemapUrl(normalized)
      const p = new URL(normalized).pathname
      if (locKind === 'protocol') {
        if (!requiredSamples.get('protocol') && p.startsWith('/protocols/')) requiredSamples.set('protocol', loc)
        continue
      }
      if (locKind !== 'entity') continue
      if (!requiredSamples.get('dog') && /^\/dog\/\d+\/$/.test(p)) requiredSamples.set('dog', loc)
      if (!requiredSamples.get('doninoDog') && p.startsWith('/donino-dog/')) requiredSamples.set('doninoDog', loc)
      if (!requiredSamples.get('event') && /^\/event\/[^/]+\/$/.test(p)) requiredSamples.set('event', loc)
      if (!requiredSamples.get('sportJudge') && /^\/judges\/[^/]+\/$/.test(p)) requiredSamples.set('sportJudge', loc)
      if (!requiredSamples.get('showJudge') && /^\/shows\/judges\/[^/]+\/$/.test(p)) requiredSamples.set('showJudge', loc)
      if (!requiredSamples.get('exhibition') && /^\/shows\/exhibition\/[^/]+\/$/.test(p)) requiredSamples.set('exhibition', loc)
    }
  }

  for (const [category, rawLoc] of requiredSamples.entries()) {
    if (!rawLoc) {
      throw new Error(`Required entity category "${category}" was not found in any published child sitemap`)
    }
    const targetUrl = normalizeUrlToBase(rawLoc, base)
    if (visitedUrls.has(targetUrl)) continue
    const resp = await getOk(targetUrl)
    const detail =
      category === 'protocol'
        ? assertProtocolHtml(targetUrl, resp.body)
        : assertSeoEntityHtml(targetUrl, resp.body)
    checked.push({ kind: category, url: targetUrl, detail })
  }

  return { checked, childSitemapsCount: childSitemaps.length }
}

async function main(): Promise<void> {
  const argBase = process.argv.find((a) => a.startsWith('--base-url='))?.slice('--base-url='.length)
  const baseUrl = argBase || process.env.VERIFY_BASE_URL || DEFAULT_BASE_URL
  console.log(`[verify-live] Verifying deployment at ${baseUrl} ...`)
  const result = await verifyLiveDeploy(baseUrl)
  for (const item of result.checked) {
    console.log(`  [PASS] ${item.kind}: ${item.url} -> ${item.detail}`)
  }
  console.log(
    `[verify-live] All ${result.checked.length} checks passed across ${result.childSitemapsCount} child sitemaps.`,
  )
}

if (process.argv[1] && pathEquals(process.argv[1], fileURLToPath(import.meta.url))) {
  main().catch((err) => {
    console.error(`[verify-live] FAILED: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  })
}

function pathEquals(a: string, b: string): boolean {
  return a.replace(/\\/g, '/').toLowerCase() === b.replace(/\\/g, '/').toLowerCase()
}
