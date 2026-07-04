import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface OCRResult {
  breed: string
  class: string
  sex: string
  dogName: string
  scores: number[]
  totalScore: number
  placement: number
  title?: string
}

function parseOCRText(text: string): OCRResult[] {
  const results: OCRResult[] = []
  const lines = text.split('\n').filter(line => line.trim())
  
  let currentResult: Partial<OCRResult> = {}
  
  for (const line of lines) {
    // Skip header lines
    if (line.includes('Судьи') || line.includes('главный судья') || line.includes('Забег') || 
        line.includes('Национальные') || line.includes('Попные результаты')) {
      continue
    }
    
    // Detect breed/class line (more flexible pattern)
    const breedMatch = line.match(/([А-Яа-яA-Za-z]+)\s+(Стандарт|Юниоры|Ветераны)\s+(Кобели|Суки)/i)
    if (breedMatch) {
      // Save previous result if exists
      if (currentResult.dogName) {
        results.push(currentResult as OCRResult)
      }
      
      currentResult = {
        breed: breedMatch[1],
        class: breedMatch[2],
        sex: breedMatch[3],
        scores: [],
        totalScore: 0,
        placement: 0
      }
      continue
    }
    
    // Detect dog name line (uppercase/mixed case, usually longer than 5 chars)
    if (currentResult.breed && !currentResult.dogName) {
      // Look for sequences of uppercase letters and spaces
      const dogNameMatch = line.match(/([A-ZА-Я][A-ZА-Я\s]{5,})/)
      if (dogNameMatch) {
        currentResult.dogName = dogNameMatch[1].trim()
        continue
      }
    }
    
    // Detect scores (numbers 2-3 digits, at least 3 numbers)
    if (currentResult.dogName) {
      const scoreMatches = line.match(/\b\d{2,3}\b/g)
      if (scoreMatches && scoreMatches.length >= 3) {
        const scores = scoreMatches.map(Number)
        currentResult.scores = scores
        // Total is usually the largest number or last number
        currentResult.totalScore = Math.max(...scores)
        
        // Detect placement (single digit at end)
        const placementMatch = line.match(/(\d+)\s*$/)
        if (placementMatch) {
          const placement = parseInt(placementMatch[1])
          if (placement < 100) { // Reasonable placement
            currentResult.placement = placement
          }
        }
        
        // Save result
        results.push(currentResult as OCRResult)
        currentResult = {}
      }
    }
  }
  
  // Save last result if exists
  if (currentResult.dogName) {
    results.push(currentResult as OCRResult)
  }
  
  return results
}

async function main() {
  const ocrFilePath = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08_segmented_ocr.txt')
  const text = await readFile(ocrFilePath, 'utf-8')
  
  console.log('Parsing OCR results...')
  const results = parseOCRText(text)
  
  console.log(`\nFound ${results.length} results`)
  console.log('\nSample results:')
  results.slice(0, 5).forEach((result, i) => {
    console.log(`${i + 1}. ${result.breed} ${result.class} ${result.sex}`)
    console.log(`   Dog: ${result.dogName}`)
    console.log(`   Scores: ${result.scores.join(', ')}`)
    console.log(`   Total: ${result.totalScore}, Placement: ${result.placement}`)
    console.log('')
  })
  
  // Save parsed results
  const outputPath = join(process.cwd(), 'backend', 'tests', 'fixtures', '2015', '2015-08-08_parsed.json')
  await writeFile(outputPath, JSON.stringify(results, null, 2))
  console.log(`Parsed results saved to ${outputPath}`)
}

main().catch(console.error)
