import { formatRecordDate } from '../../lib/recordDates'

async function loadXlsx() {
  const mod = await import('xlsx')
  return mod.default ?? mod
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

export async function exportToExcel(records: SpeedRecordExport[]) {
  const XLSX = await loadXlsx()
  const excelData = records.map(record => ({
    'Кличка': record.name,
    'Пол': record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex,
    'Порода': record.breed,
    'Скорость (км/ч)': record.speed_km_h,
    'Дата': formatRecordDate(record.date),
    'Скриншот': record.screenshot_url || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Рекорды')
  XLSX.writeFile(workbook, `рекорды-донино-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export async function exportCoursingToExcel(records: CoursingRecordExport[]) {
  const XLSX = await loadXlsx()
  const excelData = records.map(record => ({
    'Кличка': record.name,
    'Порода': record.breed,
    'Время (сек)': record.time_seconds,
    'Дата': formatRecordDate(record.date),
  }))

  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Беги борзых')
  XLSX.writeFile(workbook, `беги-борзых-${new Date().toISOString().split('T')[0]}.xlsx`)
}

export async function exportDoninoToExcel(
  speedRecords: SpeedRecordExport[],
  coursingRecords: CoursingRecordExport[]
) {
  const XLSX = await loadXlsx()

  const speedData = speedRecords.map((record) => ({
    Кличка: record.name,
    Пол: record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex,
    Порода: record.breed,
    'Скорость (км/ч)': record.speed_km_h,
    Дата: formatRecordDate(record.date),
    Скриншот: record.screenshot_url || '',
  }))

  const coursingData = coursingRecords.map((record) => ({
    Кличка: record.name,
    Порода: record.breed,
    'Время (сек)': record.time_seconds,
    Дата: formatRecordDate(record.date),
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(speedData), 'Замер')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(coursingData), 'Бега 350 м')
  XLSX.writeFile(workbook, `рекорды-донино-${new Date().toISOString().split('T')[0]}.xlsx`)
}
