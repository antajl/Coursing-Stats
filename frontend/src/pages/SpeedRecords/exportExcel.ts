import { formatRecordDate } from '../../lib/recordDates'

/** Coursing Stats palette — cream/camel header, charcoal text */
const STYLE = {
  headerBg: 'E8DCC8',
  headerText: '252320',
  dataText: '38342F',
  borderColor: 'D9CCB8',
} as const

type XlsxModule = typeof import('xlsx-js-style')

interface CellStyle {
  font?: { bold?: boolean; color?: { rgb: string }; sz?: number }
  fill?: { fgColor?: { rgb: string }; patternType?: string }
  border?: {
    top?: { style: string; color: { rgb: string } }
    bottom?: { style: string; color: { rgb: string } }
    left?: { style: string; color: { rgb: string } }
    right?: { style: string; color: { rgb: string } }
  }
  alignment?: { horizontal?: string; vertical?: string; wrapText?: boolean }
}

type WorkSheet = import('xlsx-js-style').WorkSheet

const SPEED_HEADERS = ['Кличка', 'Пол', 'Порода', 'Скорость (км/ч)', 'Дата', 'Скриншот'] as const
const SPEED_COL_WIDTHS = [{ wch: 28 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 40 }]

const COURSING_HEADERS = ['Кличка', 'Порода', 'Время (сек)', 'Дата'] as const
const COURSING_COL_WIDTHS = [{ wch: 28 }, { wch: 18 }, { wch: 12 }, { wch: 12 }]

async function loadXlsx(): Promise<XlsxModule> {
  const mod = await import('xlsx-js-style')
  return (mod.default ?? mod) as XlsxModule
}

function headerCellStyle(): CellStyle {
  const border = { style: 'thin', color: { rgb: STYLE.borderColor } }
  return {
    font: { bold: true, color: { rgb: STYLE.headerText }, sz: 11 },
    fill: { fgColor: { rgb: STYLE.headerBg }, patternType: 'solid' },
    border: { top: border, bottom: border, left: border, right: border },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  }
}

function dataCellStyle(): CellStyle {
  return {
    font: { color: { rgb: STYLE.dataText }, sz: 11 },
    alignment: { vertical: 'center' },
  }
}

function applySheetStyles(XLSX: XlsxModule, worksheet: WorkSheet) {
  const ref = worksheet['!ref']
  if (!ref) return

  const range = XLSX.utils.decode_range(ref)

  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
    const cell = worksheet[cellRef]
    if (cell) cell.s = headerCellStyle()
  }

  for (let row = 1; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellRef]
      if (cell) cell.s = dataCellStyle()
    }
  }
}

function createStyledSheet(
  XLSX: XlsxModule,
  data: Record<string, string | number>[],
  headers: readonly string[],
  colWidths: { wch: number }[],
): WorkSheet {
  const worksheet =
    data.length > 0
      ? XLSX.utils.json_to_sheet(data)
      : XLSX.utils.aoa_to_sheet([headers as unknown as string[]])

  applySheetStyles(XLSX, worksheet)
  worksheet['!cols'] = colWidths
  worksheet['!freeze'] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: 'A2',
    activePane: 'bottomLeft',
    state: 'frozen',
  }

  return worksheet
}

function formatSex(sex: string) {
  return sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex
}

interface SpeedRecordExport {
  name: string
  sex: string
  breed: string
  speed_km_h: number
  date: string
  screenshot_url?: string
}

interface CoursingRecordExport {
  name: string
  breed: string
  time_seconds: number
  date: string
}

function mapSpeedRows(records: SpeedRecordExport[]) {
  return records.map((record) => ({
    Кличка: record.name,
    Пол: formatSex(record.sex),
    Порода: record.breed,
    'Скорость (км/ч)': record.speed_km_h,
    Дата: formatRecordDate(record.date),
    Скриншот: record.screenshot_url || '',
  }))
}

function mapCoursingRows(records: CoursingRecordExport[]) {
  return records.map((record) => ({
    Кличка: record.name,
    Порода: record.breed,
    'Время (сек)': record.time_seconds,
    Дата: formatRecordDate(record.date),
  }))
}

function doninoFilename() {
  return `рекорды-донино-${new Date().toISOString().split('T')[0]}.xlsx`
}

export async function exportToExcel(records: SpeedRecordExport[]) {
  const XLSX = await loadXlsx()
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    createStyledSheet(XLSX, mapSpeedRows(records), SPEED_HEADERS, SPEED_COL_WIDTHS),
    'Рекорды',
  )
  XLSX.writeFile(workbook, doninoFilename())
}

export async function exportCoursingToExcel(records: CoursingRecordExport[]) {
  const XLSX = await loadXlsx()
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    createStyledSheet(XLSX, mapCoursingRows(records), COURSING_HEADERS, COURSING_COL_WIDTHS),
    'Беги борзых',
  )
  XLSX.writeFile(workbook, `беги-борзых-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export async function exportDoninoToExcel(
  speedRecords: SpeedRecordExport[],
  coursingRecords: CoursingRecordExport[],
) {
  const XLSX = await loadXlsx()
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    createStyledSheet(XLSX, mapSpeedRows(speedRecords), SPEED_HEADERS, SPEED_COL_WIDTHS),
    'Замер',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    createStyledSheet(XLSX, mapCoursingRows(coursingRecords), COURSING_HEADERS, COURSING_COL_WIDTHS),
    'Бега 350 м',
  )

  XLSX.writeFile(workbook, doninoFilename())
}
