/** Check import progress in Turso */
import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, '../../.env') })

const url = process.env.TURSO_URL
const authToken = process.env.TURSO_AUTH_TOKEN
if (!url || !authToken) throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')

async function main() {
  const client = createClient({ url, authToken })
  
  // Check import runs
  const runs = await client.execute(`SELECT * FROM import_runs ORDER BY started_at DESC LIMIT 5`)
  console.log('Import runs:')
  console.table(runs.rows)
  
  // Check source documents count
  const docs = await client.execute(`SELECT status, COUNT(*) as count FROM source_documents GROUP BY status`)
  console.log('\nSource documents by status:')
  console.table(docs.rows)
  
  // Check total counts
  const counts = await client.execute(`
    SELECT 
      (SELECT COUNT(*) FROM exhibitions) as exhibitions,
      (SELECT COUNT(*) FROM show_dogs) as show_dogs,
      (SELECT COUNT(*) FROM show_judges) as show_judges,
      (SELECT COUNT(*) FROM ring_entries) as ring_entries
  `)
  console.log('\nTotal counts:')
  console.table(counts.rows)
}

main().catch(console.error)
