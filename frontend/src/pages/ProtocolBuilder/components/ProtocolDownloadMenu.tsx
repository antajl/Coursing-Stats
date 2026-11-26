import React from 'react'
import {
  ChevronDown,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Printer,
} from 'lucide-react'
import type { CategoryGroup, CompetitionHeader, CompetitionKind } from '../types'
import { exportToCSV, exportToJSON } from '../exportHelpers'

interface ProtocolDownloadMenuProps {
  header: CompetitionHeader
  kind: CompetitionKind
  categories: CategoryGroup[]
  isDownloadOpen: boolean
  setIsDownloadOpen: React.Dispatch<React.SetStateAction<boolean>>
  isExportingPDF: boolean
  downloadMenuRef: React.RefObject<HTMLDivElement | null>
  handleDownloadPDF: () => void
  handlePrint: () => void
}

export const ProtocolDownloadMenu: React.FC<ProtocolDownloadMenuProps> = ({
  header,
  kind,
  categories,
  isDownloadOpen,
  setIsDownloadOpen,
  isExportingPDF,
  downloadMenuRef,
  handleDownloadPDF,
  handlePrint,
}) => {
  return (
    <div className="relative inline-block text-left" ref={downloadMenuRef}>
      <button
        type="button"
        onClick={() => setIsDownloadOpen((prev) => !prev)}
        disabled={isExportingPDF}
        className="min-h-[44px] sm:min-h-[38px] flex items-center gap-1.5 px-4 bg-camel-600 hover:bg-camel-700 active:bg-camel-800 disabled:opacity-75 text-white text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
      >
        <Download className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-bounce' : ''}`} />
        <span>{isExportingPDF ? 'Формирование PDF...' : 'Скачать'}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isDownloadOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isDownloadOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-cream-50 rounded-2xl border border-om-300 shadow-xl z-50 py-1 divide-y divide-om-100 ring-1 ring-charcoal-900/10">
          <div className="px-3.5 py-2 text-[11px] font-bold text-camel-800 bg-om-100/70 rounded-t-2xl">
            Формат для скачивания
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="w-full min-h-[44px] text-left px-3.5 py-2 hover:bg-camel-100/60 text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-charcoal-900">PDF документ (.pdf)</div>
                <div className="text-[11px] text-charcoal-600">Многостраничный без резки строк</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDownloadOpen(false)
                exportToCSV(header, kind, categories)
              }}
              className="w-full min-h-[44px] text-left px-3.5 py-2 hover:bg-camel-100/60 text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-charcoal-900">Таблица Excel (.csv)</div>
                <div className="text-[11px] text-charcoal-600">Для Excel и Google Таблиц</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDownloadOpen(false)
                exportToJSON(header, kind, categories)
              }}
              className="w-full min-h-[44px] text-left px-3.5 py-2 hover:bg-camel-100/60 text-xs flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-camel-100 text-camel-800 flex items-center justify-center shrink-0">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-charcoal-900">Файл черновика (.json)</div>
                <div className="text-[11px] text-charcoal-600">Для повторного открытия и архива</div>
              </div>
            </button>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setIsDownloadOpen(false)
                handlePrint()
              }}
              className="w-full min-h-[44px] text-left px-3.5 py-2 hover:bg-cream-100 text-xs flex items-center gap-2.5 text-charcoal-800 font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-charcoal-600 ml-1" />
              <span>Печать на принтер (Ctrl+P)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
