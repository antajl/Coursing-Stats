/** Automatic RKF calendar monitoring for 2026 */
import { fetchJson } from './lib/staticData/core'
import { type ShowRkfCalendarEntry } from './lib/staticData/shows'

interface ExhibitionInDb {
  id: number
  date: string
  has_report_link: boolean
  reports_link: string | null
}

export async function scanRkfCalendar(year: number = 2026) {
  console.log(`Scanning RKF calendar for ${year}...`)
  
  // Fetch RKF calendar
  const rkfCalendarUrl = `/data/v1/shows/calendar-rkf/${year}.json`
  const rkfData = await fetchJson<ShowRkfCalendarEntry[]>(rkfCalendarUrl)
  
  if (!rkfData) {
    console.error('Failed to fetch RKF calendar')
    return
  }
  
  console.log(`Found ${rkfData.length} exhibitions in RKF calendar`)
  
  // Fetch current exhibitions from Turso (or JSON for now)
  const currentExhibitions = await fetchCurrentExhibitions(year)
  const currentIds = new Set(currentExhibitions.map(e => e.id))
  
  // Find new exhibitions
  const newExhibitions = rkfData.filter(entry => 
    entry.lc_exhibition_id && !currentIds.has(entry.lc_exhibition_id)
  )
  
  console.log(`Found ${newExhibitions.length} new exhibitions`)
  
  // Find exhibitions with new reports
  const exhibitionsWithNewReports = rkfCalendarUrl.filter(entry => {
    if (!entry.lc_exhibition_id) return false
    const current = currentExhibitions.find(e => e.id === entry.lc_exhibition_id)
    if (!current) return false
    return !current.has_report_link && entry.has_report_link
  })
  
  console.log(`Found ${exhibitionsWithNewReports.length} exhibitions with new reports`)
  
  return {
    newExhibitions,
    exhibitionsWithNewReports,
    total: rkfData.length
  }
}

async function fetchCurrentExhibitions(year: number): Promise<ExhibitionInDb[]> {
  // For now, fetch from JSON (will switch to Turso later)
  const dataUrl = `/data/v1/shows/indexes/year-data/dogs-${year}.json`
  const data = await fetchJson<any>(dataUrl)
  
  if (!data?.exhibitions) return []
  
  return data.exhibitions.map((ex: any) => ({
    id: ex.id,
    date: ex.date,
    has_report_link: !!ex.reports_link,
    reports_link: ex.reports_link || null
  }))
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scanRkfCalendar(2026).then(result => {
    if (result) {
      console.log('\n=== Scan Results ===')
      console.log(`Total exhibitions: ${result.total}`)
      console.log(`New exhibitions: ${result.newExhibitions.length}`)
      console.log(`Exhibitions with new reports: ${result.exhibitionsWithNewReports.length}`)
      
      if (result.newExhibitions.length > 0) {
        console.log('\nNew exhibitions:')
        result.newExhibitions.forEach(ex => {
          console.log(`  - ${ex.id}: ${ex.title} (${ex.date})`)
        })
      }
      
      if (result.exhibitionsWithNewReports.length > 0) {
        console.log('\nExhibitions with new reports:')
        result.exhibitionsWithNewReports.forEach(ex => {
          console.log(`  - ${ex.id}: ${ex.title} (${ex.date}) - ${ex.reports_link}`)
        })
      }
    }
  })
}
