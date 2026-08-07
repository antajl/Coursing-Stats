/** Export exhibitions-rkf from Turso to local SQLite */
import { createClient } from '@libsql/client'
import Database from 'better-sqlite3'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env.ai') })

const tursoUrl = process.env.TURSO_URL
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

if (!tursoUrl || !tursoAuthToken) {
  throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')
}

const tursoClient = createClient({ url: tursoUrl, authToken: tursoAuthToken })

const LOCAL_DB_PATH = path.resolve(__dirname, '../../../data/local/exhibitions-rkf-archive.sqlite')

async function exportFromTurso() {
  console.log('Exporting exhibitions-rkf from Turso to local SQLite...')

  try {
    // Check Turso table count
    const countResult = await tursoClient.execute('SELECT COUNT(*) as count FROM exhibitions_rkf')
    const rowCount = (countResult.rows[0] as any).count
    console.log(`Found ${rowCount} rows in Turso exhibitions_rkf table`)

    // Create local SQLite database
    const localDb = new Database(LOCAL_DB_PATH)
    console.log(`Created local database at ${LOCAL_DB_PATH}`)

    // Create table structure
    localDb.exec(`
      CREATE TABLE IF NOT EXISTS exhibitions_rkf (
        id TEXT NOT NULL,
        year INTEGER NOT NULL,
        data BLOB NOT NULL,
        PRIMARY KEY (year, id)
      )
    `)

    // Fetch all data from Turso in batches
    const BATCH_SIZE = 1000
    let offset = 0
    let totalExported = 0

    while (true) {
      const result = await tursoClient.execute({
        sql: 'SELECT id, year, data FROM exhibitions_rkf ORDER BY year, id LIMIT ? OFFSET ?',
        args: [BATCH_SIZE, offset]
      })

      if (result.rows.length === 0) break

      // Log first row type for debugging
      if (offset === 0 && result.rows.length > 0) {
        const firstRow = result.rows[0] as any
        console.log(`First row data type: ${typeof firstRow.data}, constructor: ${firstRow.data?.constructor?.name}`)
      }

      // Insert into local SQLite (convert ArrayBuffer to Buffer)
      const insert = localDb.prepare('INSERT OR REPLACE INTO exhibitions_rkf (id, year, data) VALUES (?, ?, ?)')
      const insertMany = localDb.transaction((rows: any[]) => {
        for (const row of rows) {
          let dataBuffer: Buffer
          if (row.data instanceof ArrayBuffer) {
            dataBuffer = Buffer.from(row.data)
          } else if (row.data instanceof Uint8Array) {
            dataBuffer = Buffer.from(row.data)
          } else {
            dataBuffer = row.data
          }
          insert.run(row.id, row.year, dataBuffer)
        }
      })

      insertMany(result.rows)
      totalExported += result.rows.length
      offset += BATCH_SIZE

      console.log(`Exported ${totalExported}/${rowCount} rows...`)
    }

    localDb.close()
    console.log(`\n✅ Export complete: ${totalExported} rows to ${LOCAL_DB_PATH}`)
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

exportFromTurso()
