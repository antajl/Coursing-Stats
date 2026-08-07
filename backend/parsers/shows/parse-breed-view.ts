/** Парсинг результатов BreedView (титулы + классы). */

export interface BreedTitleRow {
  title_code: string
  ring_number: number
  dog_name: string
  owner: string
}

export interface BreedViewRow {
  class: string
  placement: number
  grade: string
  title: string
  dog_name: string
  owner: string
  sex: string
  ring_number: number
}

export interface BreedViewParseResult {
  titles: BreedTitleRow[]
  rows: BreedViewRow[]
}

export function parseBreedTitleFromCols(
  titleCode: string,
  dogText: string,
  ownerText: string
): BreedTitleRow | null {
  const code = titleCode.trim()
  if (!code) return null
  const ringMatch = dogText.trim().match(/^\((\d+)\)\s*(.+)$/)
  return {
    title_code: code,
    ring_number: ringMatch ? parseInt(ringMatch[1], 10) : 0,
    dog_name: ringMatch ? ringMatch[2].trim() : dogText.trim(),
    owner: ownerText.trim(),
  }
}

/** Формат как на lc.rkfshow.ru: «ЛБ(2) ИМЯ.Владелец» или «ЛПП (BOB)(23) ИМЯA.Owner». */
export function formatBreedTitleLine(row: BreedTitleRow): string {
  const ring = row.ring_number > 0 ? `(${row.ring_number})` : ''
  const owner = row.owner.trim()
  if (!owner) return `${row.title_code}${ring} ${row.dog_name}`.trim()
  if (/^[A-ZА-Я]\./.test(owner) || owner.includes('&')) {
    return `${row.title_code}${ring} ${row.dog_name}${owner}`
  }
  return `${row.title_code}${ring} ${row.dog_name}.${owner}`
}

/** Код, исполняемый внутри page.evaluate на BreedView. */
export function scrapeBreedViewDom(): BreedViewParseResult {
  const titles: BreedTitleRow[] = []
  const results: BreedViewRow[] = []

  const headers = document.querySelectorAll('h2.titlelight')

  for (let hi = 0; hi < headers.length; hi++) {
    const header = headers[hi]
    const label = (header.textContent || '').trim().toLowerCase()

    if (/титул|title/.test(label)) {
      let el = header.nextElementSibling
      while (el && !(el.tagName === 'H2' && el.classList.contains('titlelight'))) {
        const codeDiv = el.querySelector('.col-2')
        const nameDiv = el.querySelector('.col-5')
        const ownerDiv = el.querySelector('.col-4')
        if (codeDiv && nameDiv) {
          const code = (codeDiv.textContent || '').trim()
          const dogText = (nameDiv.textContent || '').trim()
          const ownerText = (ownerDiv?.textContent || '').trim()
          if (code) {
            const ringMatch = dogText.match(/^\((\d+)\)\s*(.+)$/)
            titles.push({
              title_code: code,
              ring_number: ringMatch ? parseInt(ringMatch[1], 10) : 0,
              dog_name: ringMatch ? ringMatch[2].trim() : dogText,
              owner: ownerText,
            })
          }
        }
        el = el.nextElementSibling
      }
      continue
    }

    const isMale = /кобел|^dogs$/i.test(label)
    const isFemale = /сук|bitch/i.test(label)
    if (!isMale && !isFemale) continue

    const currentSex = isMale ? 'M' : 'F'
    let currentClass = ''

    let el = header.nextElementSibling
    while (el && !(el.tagName === 'H2' && el.classList.contains('titlelight'))) {
      const classDiv = el.querySelector(':scope > .col-2')
      const dogContainer = el.querySelector(':scope > .col-10')

      if (dogContainer) {
        const classText = (classDiv?.textContent || '').trim()
        if (
          classText &&
          !/^(dogs|кобели|суки|bitches)$/i.test(classText) &&
          !/^(лб|лщ|лю|лв|лпп)/i.test(classText)
        ) {
          currentClass = classText
        }

        const dogNameDiv = dogContainer.querySelector('.col-5')
        if (dogNameDiv) {
          const placementDiv = dogContainer.querySelector('.col-1')
          const col3Divs = dogContainer.querySelectorAll('.col-3')
          const ownerDiv = dogContainer.querySelector('.col-4')

          const dogText = (dogNameDiv.textContent || '').trim()
          const ringMatch = dogText.match(/^\((\d+)\)\s*(.+)$/)
          const ring_number = ringMatch ? parseInt(ringMatch[1], 10) : 0
          let dog_name = ringMatch ? ringMatch[2].trim() : dogText

          let owner = (ownerDiv?.textContent || '').trim()
          if (!owner) {
            const ownerInName = dog_name.match(
              /^(.+?)([A-ZА-Я]\.[A-Za-zА-Яа-я.]+(?:\s*&\s*[A-ZА-Я]\.[A-Za-zА-Яа-я.]+)*)$/
            )
            if (ownerInName) {
              dog_name = ownerInName[1].trim()
              owner = ownerInName[2].trim()
            }
          }

          const grade = (col3Divs[0]?.textContent || '').replace(/\s+/g, ' ').trim()
          const awards = (col3Divs[1]?.textContent || '').replace(/\s+/g, ' ').trim()
          const displayName = ring_number > 0 ? `(${ring_number}) ${dog_name}` : dogText

          results.push({
            class: currentClass,
            placement: parseInt((placementDiv?.textContent || '').trim(), 10) || 0,
            grade,
            title: awards,
            dog_name: displayName,
            owner,
            sex: currentSex,
            ring_number,
          })
        }
      }

      el = el.nextElementSibling
    }
  }

  return { titles, rows: results }
}

/** @deprecated используйте scrapeBreedViewDom().rows */
export function scrapeBreedViewRowsOnly(): BreedViewRow[] {
  return scrapeBreedViewDom().rows
}
