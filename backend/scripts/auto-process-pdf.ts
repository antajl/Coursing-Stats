/**
 * Automatic PDF processing script for 2026 only
 * Processes PDF files from data/local/rkf-reports/2026/ using existing parser
 * Deletes processed PDF files to free up space (already processed data is safe)
 */

import fs from 'node:fs'
import path from 'node:path'
import { parseCertificatePdf } from '../parsers/shows/parse-rkf-certificate-pdf'

const LOCAL_PDF_DIR = 'data/local/rkf-reports/2026'
const OUTPUT_DIR = 'data/v1/shows/exhibitions'

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

// Recursive function to get all PDF files
function getPdfFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      getPdfFiles(filePath, fileList)
    } else if (file.endsWith('.pdf')) {
      fileList.push(filePath)
    }
  }
  return fileList
}

async function main() {
  console.log('🚀 Starting automatic PDF processing for 2026...')

  // Get all PDF files recursively
  const pdfFiles = getPdfFiles(LOCAL_PDF_DIR)

  console.log(`📄 Found ${pdfFiles.length} PDF files in 2026 to process`)

  let processed = 0
  let failed = 0
  let skipped = 0

  for (const pdfPath of pdfFiles) {
    const pdfFile = path.basename(pdfPath)
    const pdfId = pdfFile.replace('.pdf', '')
    const relativePath = path.relative(LOCAL_PDF_DIR, pdfPath)

    console.log(`\n📖 Processing: ${relativePath}`)

    try {
      // Check if already processed
      const outputPath = path.join(OUTPUT_DIR, `${pdfId}.json`)
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  Already processed, skipping`)
        skipped++
        continue
      }

      // Parse using existing parser (expects file path)
      const result = await parseCertificatePdf(pdfPath)

      // Save result
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

      console.log(`✅ Processed successfully: ${result.dogs.length} dogs, ${result.page_count} pages`)

      // Delete original PDF after successful processing (data is now in JSON)
      fs.unlinkSync(pdfPath)

      processed++

    } catch (error) {
      console.error(`❌ Failed to process ${pdfFile}:`, error)
      failed++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`✅ Processed: ${processed}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`� Results saved to: ${OUTPUT_DIR}`)
  console.log(`�️  Original PDF files deleted (data is now in JSON)`)
  console.log(`💾 Disk space freed: ~${processed * 0.5} MB estimated`)

  if (failed > 0) {
    console.log(`⚠️  Some files failed to process. Run again to retry.`)
  }
}

main().catch(console.error)
