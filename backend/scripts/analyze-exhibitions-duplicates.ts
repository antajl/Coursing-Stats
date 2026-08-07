import fs from 'fs'

const mergedDir = 'data/v1/shows/exhibitions-merged'
const exhibitionsDir = 'data/v1/shows/exhibitions'

const mergedFiles = fs.readdirSync(mergedDir)
const exhibitionsFiles = fs.readdirSync(exhibitionsDir)

console.log('exhibitions-merged:', mergedFiles.length, 'files')
console.log('exhibitions:', exhibitionsFiles.length, 'files')

// Sample files
console.log('\nSample exhibitions-merged files:', mergedFiles.slice(0, 5))
console.log('Sample exhibitions files:', exhibitionsFiles.slice(0, 5))

// Extract IDs from exhibitions-merged (format: DD-MM-YYYY-ID-title.json)
const mergedIds = new Set<number>()
mergedFiles.forEach(f => {
  const match = f.match(/-(\d+)-/)
  if (match) mergedIds.add(parseInt(match[1]))
})

// Extract IDs from exhibitions (multiple formats)
const exhibitionsIds = new Set<number>()
exhibitionsFiles.forEach(f => {
  // Format: ID-typeX.json (new format from SQLite migration)
  const match1 = f.match(/^(\d+)-type/)
  if (match1) {
    exhibitionsIds.add(parseInt(match1[1]))
    return
  }

  // Format: DD-MM-YYYY-ID-title.json (old merged format)
  const match2 = f.match(/^\d{2}-\d{2}-\d{4}-(\d+)-/)
  if (match2) {
    exhibitionsIds.add(parseInt(match2[1]))
    return
  }

  // Format: unknown-date-ID-title.json (legacy format)
  const match3 = f.match(/^unknown-date-(\d+)-/)
  if (match3) {
    exhibitionsIds.add(parseInt(match3[1]))
    return
  }
})

console.log('Unique IDs in exhibitions-merged:', mergedIds.size)
console.log('Unique IDs in exhibitions:', exhibitionsIds.size)

const onlyInMerged = [...mergedIds].filter(id => !exhibitionsIds.has(id))
const onlyInExhibitions = [...exhibitionsIds].filter(id => !mergedIds.has(id))
const common = [...mergedIds].filter(id => exhibitionsIds.has(id))

console.log('\nOnly in exhibitions-merged:', onlyInMerged.length)
console.log('Only in exhibitions:', onlyInExhibitions.length)
console.log('Common IDs:', common.length)

console.log('\nSample only in exhibitions-merged:', onlyInMerged.slice(0, 10))
console.log('Sample only in exhibitions:', onlyInExhibitions.slice(0, 10))
console.log('Sample common IDs:', common.slice(0, 10))

// Find actual files for common IDs
console.log('\n=== Sample common IDs with files ===')
common.slice(0, 5).forEach(id => {
  const mergedFile = mergedFiles.find(f => f.includes(`-${id}-`))
  const exhibitionsFile = exhibitionsFiles.find(f => f.startsWith(`${id}-`))
  console.log(`ID ${id}:`)
  console.log(`  exhibitions-merged: ${mergedFile}`)
  console.log(`  exhibitions: ${exhibitionsFile}`)
})
