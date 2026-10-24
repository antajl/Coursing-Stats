import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const PHOTO_SOURCE = path.join(__dirname, 'assets/og-photo-pair.jpg')
const OUT_FILE = path.join(ROOT, 'frontend/public/og-image.png')

async function generateOgImage(): Promise<void> {
  const width = 1200
  const height = 630

  if (!fs.existsSync(PHOTO_SOURCE)) {
    throw new Error(`Source photo not found at ${PHOTO_SOURCE}`)
  }

  // 1. Prepare photo base resized to 1200x630
  // Position slightly to the right to keep running dogs centered in the right portion
  const photoBase = await sharp(PHOTO_SOURCE)
    .resize(width, height, { fit: 'cover', position: sharp.position.right })
    .toBuffer()

  // 2. SVG overlay with Old Money typography and scrim gradient
  const svgOverlay = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Deep dark scrim fading smoothly across width so dogs stay visible on the right -->
      <linearGradient id="scrim" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0c120e" stop-opacity="0.97" />
        <stop offset="35%" stop-color="#0c120e" stop-opacity="0.92" />
        <stop offset="55%" stop-color="#0c120e" stop-opacity="0.75" />
        <stop offset="72%" stop-color="#0c120e" stop-opacity="0.32" />
        <stop offset="90%" stop-color="#0c120e" stop-opacity="0.08" />
        <stop offset="100%" stop-color="#0c120e" stop-opacity="0.0" />
      </linearGradient>

      <!-- Bottom subtle gradient to ground the stats chips -->
      <linearGradient id="bottom-scrim" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0c120e" stop-opacity="0.0" />
        <stop offset="100%" stop-color="#0c120e" stop-opacity="0.5" />
      </linearGradient>

      <linearGradient id="accent-line" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c5a059" stop-opacity="0.95" />
        <stop offset="70%" stop-color="#c5a059" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#c5a059" stop-opacity="0" />
      </linearGradient>

      <!-- Golden gradient for subtle accents -->
      <linearGradient id="gold-border" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c5a059" stop-opacity="0.55" />
        <stop offset="100%" stop-color="#8a6c31" stop-opacity="0.25" />
      </linearGradient>
    </defs>

    <!-- Scrim layers -->
    <rect width="${width}" height="${height}" fill="url(#scrim)" />
    <rect width="${width}" height="${height}" fill="url(#bottom-scrim)" />

    <!-- Framing borders (Old Money hairline) -->
    <rect x="24" y="24" width="${width - 48}" height="${height - 48}" fill="none" stroke="url(#gold-border)" stroke-width="1" />
    <rect x="30" y="30" width="${width - 60}" height="${height - 60}" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.12" />

    <!-- Corner Accents -->
    <path d="M 24 46 L 24 24 L 46 24" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M ${width - 46} 24 L ${width - 24} 24 L ${width - 24} 46" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M 24 ${height - 46} L 24 ${height - 24} L 46 ${height - 24}" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M ${width - 46} ${height - 24} L ${width - 24} ${height - 24} L ${width - 24} ${height - 46}" fill="none" stroke="#c5a059" stroke-width="2" />

    <!-- Top Badge -->
    <g transform="translate(64, 68)">
      <rect x="0" y="0" width="290" height="30" rx="4" fill="#18231c" fill-opacity="0.9" stroke="#c5a059" stroke-width="0.9" stroke-opacity="0.6" />
      <text x="14" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#c5a059" letter-spacing="1.4">
        ЕДИНАЯ БАЗА РКФ И ДОНИНО
      </text>
    </g>

    <!-- Main Title: Coursing Stats -->
    <text x="64" y="165" font-family="Georgia, 'Times New Roman', serif" font-size="62" font-weight="700" fill="#ffffff" letter-spacing="0.5">
      Coursing Stats
    </text>

    <!-- Gold Accent Rule -->
    <rect x="64" y="188" width="460" height="3" fill="url(#accent-line)" />

    <!-- Subtitle -->
    <text x="64" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="#f0ebe1">
      Курсинг, бега борзых и выставки собак
    </text>

    <!-- Description Paragraph -->
    <text x="64" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="16.5" fill="#c4beaf">
      Официальные протоколы соревнований с 2015 года,
    </text>
    <text x="64" y="312" font-family="system-ui, -apple-system, sans-serif" font-size="16.5" fill="#c4beaf">
      турнирные таблицы, замеры скорости Донино и статистика судей.
    </text>

    <!-- Feature Pillars (Chips at bottom) -->
    <g transform="translate(64, 385)">
      <!-- Pillar 1 -->
      <g transform="translate(0, 0)">
        <rect width="180" height="58" rx="6" fill="#131c16" fill-opacity="0.92" stroke="#2c3c30" stroke-width="1" />
        <text x="16" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#c5a059" letter-spacing="1">ПРОТОКОЛЫ</text>
        <text x="16" y="45" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">С 2015 года</text>
      </g>

      <!-- Pillar 2 -->
      <g transform="translate(195, 0)">
        <rect width="200" height="58" rx="6" fill="#131c16" fill-opacity="0.92" stroke="#2c3c30" stroke-width="1" />
        <text x="16" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#c5a059" letter-spacing="1">ЗАМЕРЫ СКОРОСТИ</text>
        <text x="16" y="45" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">Полигон Донино</text>
      </g>

      <!-- Pillar 3 -->
      <g transform="translate(410, 0)">
        <rect width="190" height="58" rx="6" fill="#131c16" fill-opacity="0.92" stroke="#2c3c30" stroke-width="1" />
        <text x="16" y="24" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#c5a059" letter-spacing="1">РЕЙТИНГИ</text>
        <text x="16" y="45" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">Собаки и эксперты</text>
      </g>
    </g>

    <!-- Footer URL -->
    <text x="64" y="525" font-family="system-ui, sans-serif" font-size="17" font-weight="700" fill="#c5a059" letter-spacing="1.2">
      coursing-stats.ru
    </text>
  </svg>
  `

  await sharp(photoBase)
    .composite([
      {
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(OUT_FILE)

  // Also sync to frontend/dist/og-image.png if dist exists
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
