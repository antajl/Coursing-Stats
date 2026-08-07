/** Check Turso database status */
import { createClient } from '@libsql/client'
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

async function checkTurso() {
  try {
    console.log('Checking Turso tables...')
    const tables = await tursoClient.execute("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('Turso tables:', tables.rows.map((r: any) => r.name))

    for (const table of tables.rows) {
      const tableName = (table as any).name
      if (tableName === 'sqlite_sequence') continue
      const count = await tursoClient.execute(`SELECT COUNT(*) as count FROM ${tableName}`)
      console.log(`${tableName}: ${(count.rows[0] as any).count} rows`)
    }

    console.log('\n✅ Turso database ready')
  } catch (error) {
    console.error('Check failed:', error)
    throw error
  }
}

checkTurso()
