import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const OUT_FILE = path.join(ROOT, 'frontend/public/og-image.png')
const BIMI_PATH = path.join(ROOT, 'public/bimi/logo.svg')

/**
 * Generate standard Open Graph preview image (1200x630, 1.91:1) in Old Money aesthetic.
 *
 * Core principles:
 * - Independent project tone: no "official registry", no "since 2015" liability, no single club bias.
 * - Understated luxury: deep pine-charcoal background, warm gold/camel (#c5a059) accents, serif title.
 * - Genuine brand crest: vector sighthound silhouette from BIMI/favicon.
 * - Lightweight, ultra-crisp typography optimized for Telegram, WhatsApp, VK, and X cards.
 */
async function generateOgImage(): Promise<void> {
  const width = 1200
  const height = 630

  // Read authentic vector crest
  const bimiSvg = fs.readFileSync(BIMI_PATH, 'utf-8')
  const pathsMatch = bimiSvg.match(/<path[^>]+>/g) || []
  const goldPaths = pathsMatch.map((p) => p.replace(/fill="[^"]+"/, 'fill="url(#gold-grad)"')).join('\n')

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Deep luxury pine/charcoal radial vignette -->
      <radialGradient id="bg-radial" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#162019" />
        <stop offset="60%" stop-color="#101712" />
        <stop offset="100%" stop-color="#0a0f0c" />
      </radialGradient>

      <!-- Warm Camel Gold (#c5a059) gradient for Old Money styling -->
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e8d3a2" />
        <stop offset="45%" stop-color="#c5a059" />
        <stop offset="100%" stop-color="#9a742c" />
      </linearGradient>

      <!-- Border hairline gradient -->
      <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c5a059" stop-opacity="0.5" />
        <stop offset="50%" stop-color="#e8d3a2" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#c5a059" stop-opacity="0.5" />
      </linearGradient>

      <!-- Accent line gradient -->
      <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c5a059" stop-opacity="0.9" />
        <stop offset="70%" stop-color="#c5a059" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#c5a059" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Deep Luxury Emerald-Charcoal Background -->
    <rect width="${width}" height="${height}" fill="url(#bg-radial)" />

    <!-- Framing borders (Old Money double hairline) -->
    <rect x="30" y="30" width="${width - 60}" height="${height - 60}" fill="none" stroke="url(#border-grad)" stroke-width="1.2" />
    <rect x="38" y="38" width="${width - 76}" height="${height - 76}" fill="none" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.1" />

    <!-- Corner Accents -->
    <path d="M 30 54 L 30 30 L 54 30" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M ${width - 54} 30 L ${width - 30} 30 L ${width - 30} 54" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M 30 ${height - 54} L 30 ${height - 30} L 54 ${height - 30}" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M ${width - 54} ${height - 30} L ${width - 30} ${height - 30} L ${width - 30} ${height - 54}" fill="none" stroke="#c5a059" stroke-width="2" />

    <!-- Subtle large brand crest watermark on the right -->
    <g transform="translate(680, 75) scale(0.62)" opacity="0.12">
      ${goldPaths}
    </g>

    <!-- Top: Small brand crest + Category header -->
    <g transform="translate(80, 85)">
      <g transform="translate(0, 0) scale(0.08)">
        ${goldPaths}
      </g>
      <text x="75" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#c5a059" letter-spacing="2">
        СПОРТ И ВЫСТАВКИ СОБАК
      </text>
    </g>

    <!-- Main Title: Coursing Stats -->
    <text x="80" y="235" font-family="Georgia, 'Times New Roman', serif" font-size="68" font-weight="700" fill="#ffffff" letter-spacing="0.5">
      Coursing Stats
    </text>

    <!-- Gold Accent Line -->
    <rect x="80" y="262" width="480" height="2.5" fill="url(#line-grad)" />

    <!-- Subtitle -->
    <text x="80" y="320" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#f0eae1">
      Статистика курсинга, бегов борзых и выставок
    </text>

    <!-- Description line -->
    <text x="80" y="375" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#b0a99c">
      База результатов состязаний, сезонные рейтинги и профили собак
    </text>

    <!-- 3 Core Feature Tags -->
    <g transform="translate(80, 445)">
      <!-- Tag 1: Состязания -->
      <g transform="translate(0, 0)">
        <rect width="210" height="50" rx="6" fill="#141e17" stroke="#2b3b2f" stroke-width="1" />
        <text x="22" y="31" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#c5a059" letter-spacing="1">
          СОСТЯЗАНИЯ
        </text>
      </g>

      <!-- Tag 2: Рейтинги -->
      <g transform="translate(225, 0)">
        <rect width="180" height="50" rx="6" fill="#141e17" stroke="#2b3b2f" stroke-width="1" />
        <text x="22" y="31" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#c5a059" letter-spacing="1">
          РЕЙТИНГИ
        </text>
      </g>

      <!-- Tag 3: Карточки собак -->
      <g transform="translate(420, 0)">
        <rect width="220" height="50" rx="6" fill="#141e17" stroke="#2b3b2f" stroke-width="1" />
        <text x="22" y="31" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#c5a059" letter-spacing="1">
          КАРТОЧКИ СОБАК
        </text>
      </g>
    </g>

    <!-- Footer URL -->
    <text x="80" y="555" font-family="system-ui, sans-serif" font-size="18" font-weight="700" fill="#c5a059" letter-spacing="1.5">
      coursing-stats.ru
    </text>
  </svg>
  `

  await sharp(Buffer.from(svg))
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(OUT_FILE)

  // Sync to frontend/dist/og-image.png if dist exists
  const distOut = path.join(ROOT, 'frontend/dist/og-image.png')
  if (fs.existsSync(path.dirname(distOut))) {
    fs.copyFileSync(OUT_FILE, distOut)
  }

  const stat = fs.statSync(OUT_FILE)
  console.log(`Generated ${OUT_FILE} (${stat.size} bytes)`)
}

generateOgImage().catch((err) => {
  console.error(err)
  process.exit(1)
})
