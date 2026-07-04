import Tesseract from 'tesseract.js'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

const IMAGE_PATH = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08.jpg')

async function preprocessImage(inputPath: string, outputPath: string): Promise<void> {
  console.log('Preprocessing image...')
  
  await sharp(inputPath)
    .greyscale() // Convert to grayscale
    .normalize() // Normalize contrast
    .sharpen() // Sharpen edges
    .threshold(128) // Convert to black and white
    .toFile(outputPath)
  
  console.log(`Preprocessed image saved to ${outputPath}`)
}

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
        },
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
  const preprocessedPath = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08_preprocessed.jpg')
  
  // Preprocess image
  await preprocessImage(IMAGE_PATH, preprocessedPath)
  
  // Perform OCR on preprocessed image
  const text = await performOCR(preprocessedPath)
  
  // Save result to file
  const outputPath = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08_preprocessed_ocr.txt')
  await writeFile(outputPath, text)
  console.log(`\nOCR result saved to ${outputPath}`)
}

main().catch(console.error)
