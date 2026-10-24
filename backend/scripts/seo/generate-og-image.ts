import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const MASTER_IMAGE = path.join(__dirname, 'assets/og-chatgpt-master.jpg')
const OUT_FILE = path.join(ROOT, 'frontend/public/og-image.png')

/**
 * Generates the production Open Graph preview image (1200x630, 1.91:1)
 * from the master Old Money canine heritage artwork.
 */
async function generateOgImage(): Promise<void> {
  const width = 1200
  const height = 630

  if (!fs.existsSync(MASTER_IMAGE)) {
    throw new Error(`Master artwork not found at ${MASTER_IMAGE}`)
  }

  await sharp(MASTER_IMAGE)
    .resize(width, height, {
      fit: 'fill', // smooth uniform fit preserving frame margins on all four sides
    })
    .png({
      quality: 95,
      compressionLevel: 9,
    })
    .toFile(OUT_FILE)

  // Sync to frontend/dist/og-image.png if dist exists
  const distOut = path.join(ROOT, 'frontend/dist/og-image.png')
  if (fs.existsSync(path.dirname(distOut))) {
    fs.copyFileSync(OUT_FILE, distOut)
  }

  const stat = fs.statSync(OUT_FILE)
  console.log(`Successfully generated ${OUT_FILE} (${stat.size} bytes)`)
}

generateOgImage().catch((err) => {
  console.error(err)
  process.exit(1)
})
