/** Import exhibitions-rkf SQLite archive to Turso */
import Database from 'better-sqlite3'
import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: path.resolve(__dirname, '../../../.env.ai') })

const tursoUrl = process.env.TURSO_URL
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN
const localDbPath = path.resolve(__dirname, '../../../data/local/exhibitions-rkf-archive.sqlite')

if (!tursoUrl || !tursoAuthToken) {
  throw new Error('TURSO_URL and TURSO_AUTH_TOKEN are required')
}

console.log('Local DB:', localDbPath)
console.log('Turso URL:', tursoUrl)

const localDb = new Database(localDbPath)
const tursoClient = createClient({ url: tursoUrl, authToken: tursoAuthToken })

async function importExhibitionsRkf() {
  try {
    console.log('Connecting to local SQLite...')
    const tables = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    console.log('Local tables:', tables.map((t: any) => t.name))

    console.log('\nCreating schema in Turso...')
    // Drop existing table if exists
    await tursoClient.execute('DROP TABLE IF EXISTS exhibitions_rkf')
    
    const schema = localDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND sql IS NOT NULL").all()
    for (const table of schema) {
      const sql = (table as any).sql
      console.log('Creating table:', sql.substring(0, 50) + '...')
      await tursoClient.execute(sql)
    }

    console.log('\nImporting data...')
    for (const table of tables) {
      const tableName = (table as any).name
      if (tableName === 'sqlite_sequence') continue

      console.log(`Importing ${tableName}...`)
      const rows = localDb.prepare(`SELECT * FROM ${tableName}`).all()
      console.log(`  ${rows.length} rows`)

      if (rows.length === 0) continue

      const columns = Object.keys(rows[0])
      const placeholders = columns.map(() => '?').join(', ')
      const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`

      // Batch insert (100 rows at a time for stability)
      const batchSize = 100
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize)
        const statements = batch.map(row => {
          const values = columns.map(col => (row as any)[col])
          return { sql: insertSql, args: values }
        })
        await tursoClient.batch(statements)
        console.log(`  Progress: ${Math.min(i + batchSize, rows.length)}/${rows.length}`)
        
        // Small delay to avoid rate limits
        if (i % 1000 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    }

    console.log('\n✅ Import completed successfully')

    // Verify import
    console.log('\nVerifying Turso tables...')
    const tursoTables = await tursoClient.execute("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('Turso tables:', tursoTables.rows.map((r: any) => r.name))

    for (const table of tursoTables.rows) {
      const tableName = (table as any).name
      if (tableName === 'sqlite_sequence') continue
      const count = await tursoClient.execute(`SELECT COUNT(*) as count FROM ${tableName}`)
      console.log(`${tableName}: ${(count.rows[0] as any).count} rows`)
    }

  } catch (error) {
    console.error('Import failed:', error)
    throw error
  } finally {
    localDb.close()
  }
}

importExhibitionsRkf()
