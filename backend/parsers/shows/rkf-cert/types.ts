export interface ParsedCertDog {
  breed: string
  judge: string
  catalog_number: number
  dog_name: string
  birth_date: string
  pedigree: string
  class: string
  grade: string
  title: string
  bob: boolean
  show_date: string
}

export interface ParseCertificatePdfResult {
  dogs: ParsedCertDog[]
  page_count: number
  raw_token_count: number
  has_main_ring_sheet: boolean
}

export type PdfItem = { str: string; x: number; y: number; page: number }
