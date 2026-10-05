/** Turso client for reading exhibitions-rkf data with observability */
import { createClient } from '@libsql/client'
import { ungzip } from 'pako'

// Lazy initialization to prevent module loading errors if env vars are missing
let tursoClient: ReturnType<typeof createClient> | null = null

const DEFAULT_TURSO_URL = 'https://coursing-stats-antajl.aws-eu-west-1.turso.io'
const DEFAULT_TURSO_TOKEN =
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODU3NzQzNjgsImlkIjoiMDE5ZmM4NzEtZGIwMS03NTRlLTg5MDctN2NmNjdiMWRmOGY4Iiwia2lkIjoicl9wbkxHb09CWlVaNHRCZ2VzTWFhM1FuVkhZWlV3MVVyUmczZWx3VTh0byIsInJpZCI6ImJjZDEzNmEwLTU4MDUtNDkwOS1iNmI1LWFlZTgwMjlmZmYyMyJ9.02HaAuMBTWmgA4DKQoqxg6TLU4SGV1dLfLW63WRZ6NKc5WhWBnUp1J_83FH7lLaw-ilGpbozOxTxyd8obS-ODw'

function normalizeTursoUrl(raw: string): string {
  let url = raw.trim()
  if (url.startsWith('libsql:/') && !url.startsWith('libsql://')) {
    url = url.replace('libsql:/', 'https://')
  } else if (url.startsWith('libsql://')) {
    url = url.replace('libsql://', 'https://')
  } else if (!url.startsWith('https://') && !url.startsWith('http://')) {
    url = `https://${url.replace(/^\/+/, '')}`
  }
  return url
}

function getTursoClient() {
  if (tursoClient) return tursoClient

  const rawUrl = import.meta.env.VITE_TURSO_URL || DEFAULT_TURSO_URL
  const tursoAuthToken = (import.meta.env.VITE_TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN).trim()

  const tursoUrl = normalizeTursoUrl(rawUrl)

  if (!tursoUrl || !tursoAuthToken) {
    throw new Error('VITE_TURSO_URL and VITE_TURSO_AUTH_TOKEN are required')
  }

  tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  })

  return tursoClient
}

// Observability metrics
let readCount = 0
let errorCount = 0

function logTursoQuery(operation: string, duration: number, success: boolean) {
  const logData = {
    event: 'turso_query',
    operation,
    duration,
    success,
    readCount: success ? readCount : errorCount,
  }

  if (import.meta.env.DEV) {
    console.debug('[Turso]', logData)
  }
}

export async function getExhibitionById(id: string, year?: number) {
  const startTime = performance.now()
  try {
    const client = getTursoClient()
    const result = year
      ? await client.execute({
          sql: 'SELECT data FROM exhibitions_rkf WHERE id = ? AND year = ?',
          args: [id, year],
        })
      : await client.execute({
          sql: 'SELECT data FROM exhibitions_rkf WHERE id = ? ORDER BY year DESC LIMIT 1',
          args: [id],
        })
    readCount++
    const duration = performance.now() - startTime
    logTursoQuery('getExhibitionById', duration, true)

    if (!result.rows[0]) return null

    // Decompress gzip data using pako (handles ArrayBuffer or Uint8Array)
    const row = result.rows[0] as { data: Uint8Array | ArrayBuffer }
    const rawBytes = row.data instanceof Uint8Array ? row.data : new Uint8Array(row.data)
    const decompressed = ungzip(rawBytes)
    // Convert Uint8Array to string
    const decompressedString = new TextDecoder().decode(decompressed)
    return JSON.parse(decompressedString)
  } catch (error) {
    errorCount++
    const duration = performance.now() - startTime
    logTursoQuery('getExhibitionById', duration, false)
    console.error('[Turso] getExhibitionById failed:', error)
    throw error
  }
}

export async function getExhibitionsByYear(year: number) {
  const startTime = performance.now()
  try {
    const client = getTursoClient()
    const result = await client.execute({
      sql: 'SELECT * FROM exhibitions_rkf WHERE year = ? ORDER BY id',
      args: [year]
    })
    readCount++
    const duration = performance.now() - startTime
    logTursoQuery('getExhibitionsByYear', duration, true)
    return result.rows
  } catch (error) {
    errorCount++
    const duration = performance.now() - startTime
    logTursoQuery('getExhibitionsByYear', duration, false)
    console.error('[Turso] getExhibitionsByYear failed:', error)
    throw error
  }
}

export async function getAllExhibitionIds() {
  const startTime = performance.now()
  try {
    const client = getTursoClient()
    const result = await client.execute('SELECT DISTINCT id, year FROM exhibitions_rkf ORDER BY year, id')
    readCount++
    const duration = performance.now() - startTime
    logTursoQuery('getAllExhibitionIds', duration, true)
    return result.rows
  } catch (error) {
    errorCount++
    const duration = performance.now() - startTime
    logTursoQuery('getAllExhibitionIds', duration, false)
    console.error('[Turso] getAllExhibitionIds failed:', error)
    throw error
  }
}

export function getTursoMetrics() {
  return {
    readCount,
    errorCount,
    readErrorRate: readCount > 0 ? errorCount / readCount : 0,
  }
}
