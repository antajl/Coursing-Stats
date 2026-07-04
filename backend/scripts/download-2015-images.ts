import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const EVENTS_2015 = [
  { id: 2500, url: 'http://procoursing.ru/results/2015-08-08_F/', image: '2015-08-08_F.jpg' },
  { id: 2499, url: 'http://procoursing.ru/results/2015-08-08/', image: '2015-08-08.jpg' },
  { id: 2498, url: 'http://procoursing.ru/results/2015-03-14/', image: '2015-03-14.jpg' },
]

const OUTPUT_DIR = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015')

async function downloadImage(url: string, filename: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function main() {
  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true })
  }

  console.log('Downloading 2015 event images...')

  for (const event of EVENTS_2015) {
    try {
      const imageUrl = `${event.url}${event.image}`
      console.log(`Downloading ${imageUrl}...`)
      
      const buffer = await downloadImage(imageUrl, event.image)
      const outputPath = join(OUTPUT_DIR, event.image)
      
      await writeFile(outputPath, buffer)
      console.log(`✓ Saved to ${outputPath}`)
    } catch (error) {
      console.error(`✗ Failed to download ${event.url}:`, error)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
