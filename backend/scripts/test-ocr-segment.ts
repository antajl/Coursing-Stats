import Tesseract from 'tesseract.js'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { existsSync } from 'fs'

const IMAGE_PATH = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08.jpg')

async function segmentImage(inputPath: string, outputPath: string): Promise<void> {
  console.log('Segmenting image into rows...')
  
  // Create output directory if it doesn't exist
  if (!existsSync(outputPath)) {
    await mkdir(outputPath, { recursive: true })
  }
  
  // Get image dimensions
  const metadata = await sharp(inputPath).metadata()
  const height = metadata.height || 2473
  const width = metadata.width || 1440
  
  // Estimate row height (typical table row is ~40-60px)
  const rowHeight = 50
  const rows = Math.floor(height / rowHeight)
  
  console.log(`Image: ${width}x${height}, rows: ${rows}`)
  
  // Crop each row and save separately
  for (let i = 0; i < Math.min(rows, 50); i++) { // Limit to first 50 rows for testing
    const y = i * rowHeight
    const rowPath = join(outputPath, `row_${i.toString().padStart(3, '0')}.png`)
    
    await sharp(inputPath)
      .extract({ left: 0, top: y, width: width, height: rowHeight })
      .grayscale()
      .normalize()
      .sharpen()
      .threshold(128)
      .toFile(rowPath)
  }
  
  console.log(`Segmented ${Math.min(rows, 50)} rows to ${outputPath}`)
}

async function performOCR(imagePath: string) {
  console.log(`Starting OCR for ${imagePath}...`)
  
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'rus+eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Progress: ${(m.progress * 100).toFixed(0)}%`)
          }
        },
      }
    )
    
    return result.data.text
  } catch (error) {
    console.error('OCR failed:', error)
    return ''
  }
}

async function main() {
  const segmentDir = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', 'segments')
  
  // Segment image
  await segmentImage(IMAGE_PATH, segmentDir)
  
  // OCR each segment
  const results: string[] = []
  for (let i = 0; i < 50; i++) {
    const rowPath = join(segmentDir, `row_${i.toString().padStart(3, '0')}.png`)
    try {
      const text = await performOCR(rowPath)
      if (text.trim()) {
        results.push(text.trim())
      }
    } catch (e) {
      // Skip if file doesn't exist or OCR fails
    }
  }
  
  // Save combined results
  const outputPath = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08_segmented_ocr.txt')
  await writeFile(outputPath, results.join('\n'))
  console.log(`\nSegmented OCR result saved to ${outputPath}`)
  console.log(`Found ${results.length} non-empty rows`)
}

main().catch(console.error)
