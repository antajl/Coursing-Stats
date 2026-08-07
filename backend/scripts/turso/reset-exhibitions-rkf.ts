/** Reset exhibitions_rkf table in Turso */
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

async function resetExhibitionsRkf() {
  try {
    console.log('Dropping exhibitions_rkf table...')
    await tursoClient.execute('DROP TABLE IF EXISTS exhibitions_rkf')
    console.log('✅ Table dropped')
  } catch (error) {
    console.error('Reset failed:', error)
    throw error
  }
}

resetExhibitionsRkf()
