/** Automatic PDF processing for new RKF reports */
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

interface NewReport {
  id: number
  title: string
  date: string
  reports_link: string
}

export async function processNewReports(reports: NewReport[]) {
  console.log(`Processing ${reports.length} new reports...`)
  
  const results = []
  
  for (const report of reports) {
    try {
      console.log(`\nProcessing report ${report.id}: ${report.title}`)
      
      // Download PDF
      const pdfPath = await downloadPdf(report.reports_link, report.id)
      
      // Parse PDF using existing parser
      const parsedData = await parsePdf(pdfPath, report.id)
      
      // Upload to Turso
      await uploadToTurso(report.id, parsedData)
      
      // Clean up
      await fs.unlink(pdfPath)
      
      results.push({
        id: report.id,
        status: 'success',
        records: parsedData.length
      })
      
      console.log(`✅ Processed ${report.id}: ${parsedData.length} records`)
      
    } catch (error) {
      console.error(`❌ Failed to process ${report.id}:`, error)
      results.push({
        id: report.id,
        status: 'failed',
        error: String(error)
      })
    }
  }
  
  return results
}

async function downloadPdf(url: string, id: number): Promise<string> {
  const outputDir = path.join(process.cwd(), 'data/local/shows/exhibitions-rkf')
  await fs.mkdir(outputDir, { recursive: true })
  
  const outputPath = path.join(outputDir, `${id}-report.pdf`)
  
  // Use curl or wget to download
  const { stdout } = await execAsync(`curl -o "${outputPath}" "${url}"`)
  console.log(`Downloaded PDF to ${outputPath}`)
  
  return outputPath
}

async function parsePdf(pdfPath: string, id: number): Promise<any[]> {
  // Use existing PDF parser
  const { stdout } = await execAsync(
    `npx tsx backend/parsers/shows/parse-rkf-report.ts "${pdfPath}" ${id}`
  )
  
  // Parse the output
  const parsedData = JSON.parse(stdout)
  return parsedData
}

async function uploadToTurso(id: number, data: any[]): Promise<void> {
  // Import and use Turso import script
  // This would need to be refactored to support single record updates
  console.log(`Uploading ${data.length} records to Turso for exhibition ${id}`)
  
  // For now, this is a placeholder
  // TODO: Implement direct Turso insert for single exhibition
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const testReports = [
    {
      id: 99999,
      title: 'Test Exhibition',
      date: '2026-08-04',
      reports_link: 'https://example.com/report.pdf'
    }
  ]
  
  processNewReports(testReports).then(results => {
    console.log('\n=== Processing Results ===')
    results.forEach(r => {
      console.log(`${r.id}: ${r.status} ${r.status === 'success' ? `(${r.records} records)` : r.error}`)
    })
  })
}
