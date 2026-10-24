import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../../..')
const OUT_FILE = path.join(ROOT, 'frontend/public/og-image.png')

async function generateOgImage(): Promise<void> {
  const width = 1200
  const height = 630

  // Whippet / sighthound silhouette path
  const dogSilhouettePath = `
    M 10 42 C 8 43 8 45 11 45.5 L 17 43.5 C 22 42 26 38.5 28 33.5
    C 32 25.5 38.5 21 46.5 20.5 C 50.5 18.5 54.5 19.5 58.5 21.5
    C 62.5 19.5 66.5 20.5 70.5 23.5 L 75.5 21.5 C 80.5 19.5 84.5 21 84 25
    C 85.5 27 83.5 28.5 80.5 26.5 L 71.5 24.5 C 66 26.5 62 30 59.5 34
    L 57.5 36 C 55 33.5 51.5 33.5 49 36.5 L 47 58 L 45 83.5 L 41 84.5
    L 42 58 L 44 38.5 C 42 36 39 36.5 37 40 L 35 58 L 33 83.5 L 29 84.5
    L 30 56 L 33 38.5 C 30.5 34.5 25.5 35 22 37.5 C 18 39 14 40.5 10 42 Z
    M 57 36 L 55 58 L 53 83.5 L 49 84.5 L 50 58 L 52 36 C 53.5 34.5 55.5 34.5 57 36 Z
  `

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141a16" />
        <stop offset="50%" stop-color="#18221c" />
        <stop offset="100%" stop-color="#0f1411" />
      </linearGradient>

      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c5a059" />
        <stop offset="50%" stop-color="#e2c887" />
        <stop offset="100%" stop-color="#a8843c" />
      </linearGradient>

      <linearGradient id="accent-line" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#c5a059" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#c5a059" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

    <!-- Framing borders (Old Money double hairline) -->
    <rect x="28" y="28" width="${width - 56}" height="${height - 56}" fill="none" stroke="#2b362e" stroke-width="1.5" />
    <rect x="36" y="36" width="${width - 72}" height="${height - 72}" fill="none" stroke="#3d4c41" stroke-width="0.8" stroke-dasharray="6,4" />

    <!-- Corner Accents -->
    <path d="M 28 50 L 28 28 L 50 28" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M ${width - 50} 28 L ${width - 28} 28 L ${width - 28} 50" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M 28 ${height - 50} L 28 ${height - 28} L 50 ${height - 28}" fill="none" stroke="#c5a059" stroke-width="2" />
    <path d="M ${width - 50} ${height - 28} L ${width - 28} ${height - 28} L ${width - 28} ${height - 50}" fill="none" stroke="#c5a059" stroke-width="2" />

    <!-- Sighthound Silhouette in Golden Amber -->
    <g transform="translate(830, 160) scale(3.4)" fill="#c5a059" opacity="0.92">
      <path d="${dogSilhouettePath}" />
    </g>

    <!-- Top Badge -->
    <g transform="translate(80, 100)">
      <rect x="0" y="0" width="310" height="34" rx="4" fill="#1e2921" stroke="#36493c" stroke-width="1" />
      <text x="16" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#c5a059" letter-spacing="1.5">
        ЕДИНАЯ БАЗА РКФ И ДОНИНО
      </text>
    </g>

    <!-- Main Title: Coursing Stats -->
    <text x="80" y="210" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="700" fill="#f5f2eb" letter-spacing="0.5">
      Coursing Stats
    </text>

    <!-- Gold Accent Rule -->
    <rect x="80" y="235" width="480" height="3" fill="url(#accent-line)" />

    <!-- Subtitle: Описание -->
    <text x="80" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="500" fill="#e3ded3">
      Курсинг, бега борзых и выставки собак
    </text>

    <!-- Description Paragraph -->
    <text x="80" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#a39d8f">
      Официальные протоколы соревнований с 2015 года, турнирные
    </text>
    <text x="80" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#a39d8f">
      таблицы, радарные замеры скорости Донино и статистика судей РКФ.
    </text>

    <!-- Feature Pillars (Chips at bottom) -->
    <g transform="translate(80, 445)">
      <!-- Pillar 1 -->
      <g transform="translate(0, 0)">
        <rect width="210" height="60" rx="6" fill="#18231c" stroke="#2c3a2f" stroke-width="1" />
        <text x="18" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#c5a059" letter-spacing="1">ПРОТОКОЛЫ</text>
        <text x="18" y="46" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">С 2015 года</text>
      </g>

      <!-- Pillar 2 -->
      <g transform="translate(225, 0)">
        <rect width="230" height="60" rx="6" fill="#18231c" stroke="#2c3a2f" stroke-width="1" />
        <text x="18" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#c5a059" letter-spacing="1">ЗАМЕРЫ СКОРОСТИ</text>
        <text x="18" y="46" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">Полигон Донино (км/ч)</text>
      </g>

      <!-- Pillar 3 -->
      <g transform="translate(470, 0)">
        <rect width="230" height="60" rx="6" fill="#18231c" stroke="#2c3a2f" stroke-width="1" />
        <text x="18" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#c5a059" letter-spacing="1">РЕЙТИНГ СОБАК</text>
        <text x="18" y="46" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">Медали и очки CS</text>
      </g>

      <!-- Pillar 4 -->
      <g transform="translate(715, 0)">
        <rect width="210" height="60" rx="6" fill="#18231c" stroke="#2c3a2f" stroke-width="1" />
        <text x="18" y="26" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#c5a059" letter-spacing="1">ЭКСПЕРТЫ</text>
        <text x="18" y="46" font-family="Georgia, serif" font-size="15" font-weight="600" fill="#f5f2eb">Судьи РКФ и FCI</text>
      </g>
    </g>

    <!-- Footer URL -->
    <text x="80" y="565" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#c5a059" letter-spacing="1">
      coursing-stats.ru
    </text>
  </svg>
  `

  await sharp(Buffer.from(svg))
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(OUT_FILE)

  console.log(`Generated ${OUT_FILE} (${fs.statSync(OUT_FILE).size} bytes)`)
}

generateOgImage().catch((err) => {
  console.error(err)
  process.exit(1)
})
