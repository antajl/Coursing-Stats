import React from 'react'
import {
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  FileCode,
  RotateCcw,
  ChevronDown
} from 'lucide-react'
import type { CompetitionHeader, CategoryGroup, CompetitionKind } from './types'
import { exportToCSV, exportToJSON } from './exportHelpers'

export interface ProtocolHeaderPanelProps {
  header: CompetitionHeader
  setHeader: React.Dispatch<React.SetStateAction<CompetitionHeader>>
  kind: CompetitionKind
  setKind: React.Dispatch<React.SetStateAction<CompetitionKind>>
  categories: CategoryGroup[]
  isDownloadOpen: boolean
  setIsDownloadOpen: React.Dispatch<React.SetStateAction<boolean>>
  isExportingPDF: boolean
  downloadMenuRef: React.RefObject<HTMLDivElement | null>
  handleDownloadPDF: () => void
  handlePrint: () => void
  handleResetToDefault: () => void
}

export const ProtocolHeaderPanel: React.FC<ProtocolHeaderPanelProps> = ({
  header,
  setHeader,
  kind,
  setKind,
  categories,
  isDownloadOpen,
  setIsDownloadOpen,
  isExportingPDF,
  downloadMenuRef,
  handleDownloadPDF,
  handlePrint,
  handleResetToDefault
}) => {
  return (
    <div className="bg-cream-50/90 backdrop-blur-sm rounded-xl p-3.5 md:p-4 border border-om-200 shadow-sm space-y-3 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-om-200/70 pb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-camel-800">
          Параметры турнира
        </span>

        {/* Единая кнопка скачивания и меню форматов */}
        <div className="flex items-center gap-2">
          <div className="relative inline-block text-left" ref={downloadMenuRef}>
            <button
              type="button"
              onClick={() => setIsDownloadOpen((prev) => !prev)}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-camel-600 hover:bg-camel-700 active:bg-camel-800 disabled:opacity-75 text-white text-xs font-semibold rounded-lg shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-camel-500/40 cursor-pointer"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPDF ? 'animate-bounce' : ''}`} />
              <span>{isExportingPDF ? 'Формирование PDF...' : 'Скачать'}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  isDownloadOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isDownloadOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-cream-50 rounded-xl border border-om-300 shadow-xl z-50 py-1 divide-y divide-om-100 ring-1 ring-char-900/10 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold text-camel-800 uppercase tracking-wider bg-om-100/60">
                  Формат для скачивания
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="w-full text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex items-center gap-2.5 transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-terracotta-100 text-terracotta-700 flex items-center justify-center shrink-0 group-hover:bg-terracotta-200">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-char-900">PDF документ (.pdf)</div>
                      <div className="text-[10px] text-char-500">Скачать файл протокола</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadOpen(false)
                      exportToCSV(header, kind, categories)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex items-center gap-2.5 transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-forest-100 text-forest-700 flex items-center justify-center shrink-0 group-hover:bg-forest-200">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-char-900">Таблица Excel (.csv)</div>
                      <div className="text-[10px] text-char-500">Для Excel и Google Таблиц</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadOpen(false)
                      exportToJSON(header, kind, categories)
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-camel-100/70 text-xs flex items-center gap-2.5 transition-colors group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded bg-camel-100 text-camel-800 flex items-center justify-center shrink-0 group-hover:bg-camel-200">
                      <FileCode className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-char-900">Данные JSON (.json)</div>
                      <div className="text-[10px] text-char-500">Структурированный экспорт</div>
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
                    className="w-full text-left px-3 py-1.5 hover:bg-cream-100 text-xs flex items-center gap-2.5 text-char-700 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-char-400 ml-1.5 mr-0.5" />
                    <span>Печать на принтер (Ctrl+P)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cream-50 hover:bg-terracotta-50 text-char-600 hover:text-terracotta-700 text-xs font-medium rounded-lg border border-om-200 hover:border-terracotta-300 shadow-xs transition-all ml-auto sm:ml-2"
            title="Стереть все введённые данные и вернуть шаблон по умолчанию"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить всё</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-char-600">Метаданные</span>

        <div className="flex items-center bg-om-100 p-0.5 rounded-lg border border-om-200 text-xs">
          <button
            onClick={() => {
              setKind('coursing')
              if (header.title === 'Соревнования по рейсингу') {
                setHeader((prev) => ({ ...prev, title: 'Соревнования по курсингу' }))
              }
            }}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              kind === 'coursing'
                ? 'bg-cream-50 text-char-900 shadow-xs font-semibold'
                : 'text-char-500 hover:text-char-800'
            }`}
          >
            Курсинг (баллы)
          </button>
          <button
            onClick={() => {
              setKind('racing')
              if (header.title === 'Соревнования по курсингу') {
                setHeader((prev) => ({ ...prev, title: 'Соревнования по рейсингу' }))
              }
            }}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              kind === 'racing'
                ? 'bg-cream-50 text-char-900 shadow-xs font-semibold'
                : 'text-char-500 hover:text-char-800'
            }`}
          >
            Рейсинг (время)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        <div>
          <label className="block text-char-600 font-medium mb-0.5">Название соревнований</label>
          <input
            type="text"
            value={header.title}
            onChange={(e) => setHeader({ ...header, title: e.target.value })}
            placeholder="Название соревнований"
            className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
          />
        </div>

        <div>
          <label className="block text-char-600 font-medium mb-0.5">Ранг соревнований</label>
          <input
            type="text"
            value={header.rank}
            onChange={(e) => setHeader({ ...header, rank: e.target.value })}
            placeholder="Ранг соревнований (Сертификатные, ЧРКФ и т.д.)"
            className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
          />
        </div>

        <div>
          <label className="block text-char-600 font-medium mb-0.5">Дата проведения</label>
          <input
            type="date"
            value={header.date}
            onChange={(e) => setHeader({ ...header, date: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
          />
        </div>

        <div>
          <label className="block text-char-600 font-medium mb-0.5">Место / Регион</label>
          <input
            type="text"
            value={header.location}
            onChange={(e) => setHeader({ ...header, location: e.target.value })}
            placeholder="Город, место проведения"
            className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
          />
        </div>

        <div>
          <label className="block text-char-600 font-medium mb-0.5">Организатор (Клуб)</label>
          <input
            type="text"
            value={header.club}
            onChange={(e) => setHeader({ ...header, club: e.target.value })}
            placeholder="Кинологический клуб / Организатор"
            className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
          />
        </div>

        <div>
          <label className="block text-char-600 font-medium mb-0.5">Судьи</label>
          <input
            type="text"
            value={header.judges}
            onChange={(e) => setHeader({ ...header, judges: e.target.value })}
            placeholder="Судейская коллегия / ФИО судей"
            className="w-full px-2.5 py-1.5 bg-om-50 rounded-lg border border-om-200 text-char-900 placeholder:text-char-400 focus:outline-none focus:ring-1 focus:ring-camel-500"
          />
        </div>
      </div>
    </div>
  )
}
