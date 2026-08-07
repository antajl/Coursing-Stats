/** Clear Turso database by dropping all tables */
import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env.ai') })

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')
}

const client = createClient({ url, authToken })

async function clearTurso() {
  console.log('Getting current tables...')
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
  console.log('Current tables:', tables.rows.map((r: any) => r.name))

  console.log('\nDropping all tables...')
  for (const table of tables.rows) {
    const tableName = (table as any).name
    // Skip system tables
    if (tableName === 'sqlite_sequence') {
      console.log(`Skipping system table: ${tableName}`)
      continue
    }
    console.log(`Dropping table: ${tableName}`)
    await client.execute(`DROP TABLE IF EXISTS ${tableName}`)
  }

  console.log('\nVerifying cleared database...')
  const remainingTables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'")
  console.log('Remaining tables:', remainingTables.rows.length)

  if (remainingTables.rows.length === 0) {
    console.log('✅ Database cleared successfully')
  } else {
    console.log('⚠️ Some tables remain:', remainingTables.rows)
  }
}

clearTurso().catch(console.error)
