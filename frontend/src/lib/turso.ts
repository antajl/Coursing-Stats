/** Turso client for reading exhibitions-rkf data with observability */
import { createClient } from '@libsql/client'
import { ungzip } from 'pako'

// Lazy initialization to prevent module loading errors if env vars are missing
let tursoClient: ReturnType<typeof createClient> | null = null

function getTursoClient() {
  if (tursoClient) return tursoClient

  const tursoUrl = import.meta.env.VITE_TURSO_URL
  const tursoAuthToken = import.meta.env.VITE_TURSO_AUTH_TOKEN

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
    console.log('[Turso]', logData)
  }
}

export async function getExhibitionById(id: string, year: number) {
  const startTime = performance.now()
  try {
    const client = getTursoClient()
    const result = await client.execute({
      sql: 'SELECT data FROM exhibitions_rkf WHERE id = ? AND year = ?',
      args: [id, year]
    })
    readCount++
    const duration = performance.now() - startTime
    logTursoQuery('getExhibitionById', duration, true)

    if (!result.rows[0]) return null

    // Decompress gzip data using pako
    const row = result.rows[0] as { data: Uint8Array }
    const decompressed = ungzip(row.data)
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
