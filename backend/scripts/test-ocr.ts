import Tesseract from 'tesseract.js'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const IMAGE_PATH = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08.jpg')

async function performOCR(imagePath: string) {
  console.log(`Starting OCR for ${imagePath}...`)
  
  try {
    const result = await Tesseract.recognize(
      imagePath,
      'rus+eng', // Russian and English
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Progress: ${(m.progress * 100).toFixed(0)}%`)
          }
        }
      }
    )
    
    console.log('\n=== OCR Result ===')
    console.log(result.data.text)
    console.log('\n=== Confidence ===')
    console.log(`Overall: ${result.data.confidence.toFixed(2)}%`)
    
    return result.data.text
  } catch (error) {
    console.error('OCR failed:', error)
    throw error
  }
}

async function main() {
  const text = await performOCR(IMAGE_PATH)
  
  // Save result to file
  const outputPath = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08_ocr.txt')
  await writeFile(outputPath, text)
  console.log(`\nOCR result saved to ${outputPath}`)
}

main().catch(console.error)
