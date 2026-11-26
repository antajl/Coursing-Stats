import React, { useRef, useState } from 'react'
import { RotateCcw, Sparkles, Upload, X } from 'lucide-react'
import type { CategoryGroup, CompetitionHeader, CompetitionKind } from './types'
import { ProtocolDownloadMenu } from './components/ProtocolDownloadMenu'

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
  importError: string | null
  setImportError: (err: string | null) => void
  handleDownloadPDF: () => void
  handlePrint: () => void
  onLoadSample: () => void
  onImportJson: (jsonText: string) => boolean
  onResetConfirmed: () => void
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
  importError,
  setImportError,
  handleDownloadPDF,
  handlePrint,
  onLoadSample,
  onImportJson,
  onResetConfirmed,
}) => {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImportJson(reader.result)
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  return (
    <div className="bg-cream-50/95 rounded-2xl p-4 border border-om-200 shadow-sm space-y-3.5 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-om-200/80 pb-3">
        <div>
          <h1 className="text-base sm:text-lg font-serif font-bold text-charcoal-900 leading-tight">
            Конструктор протокола соревнований
          </h1>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Черновик автоматически сохраняется в браузере
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] sm:min-h-[38px] flex items-center gap-1.5 px-3 bg-white hover:bg-cream-100 text-charcoal-800 text-xs font-semibold rounded-full border border-om-300 shadow-2xs transition-colors cursor-pointer"
            title="Загрузить ранее сохранённый JSON-файл протокола"
          >
            <Upload className="w-3.5 h-3.5 text-camel-700" />
            <span>Открыть JSON</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className="min-h-[44px] sm:min-h-[38px] flex items-center gap-1.5 px-3 bg-white hover:bg-cream-100 text-charcoal-800 text-xs font-semibold rounded-full border border-om-300 shadow-2xs transition-colors cursor-pointer"
            title="Заполнить пример с готовыми баллами для знакомства"
          >
            <Sparkles className="w-3.5 h-3.5 text-camel-700" />
            <span>Загрузить пример</span>
          </button>

          <ProtocolDownloadMenu
            header={header}
            kind={kind}
            categories={categories}
            isDownloadOpen={isDownloadOpen}
            setIsDownloadOpen={setIsDownloadOpen}
            isExportingPDF={isExportingPDF}
            downloadMenuRef={downloadMenuRef}
            handleDownloadPDF={handleDownloadPDF}
            handlePrint={handlePrint}
          />

          <button
            type="button"
            onClick={() => setConfirmResetOpen((prev) => !prev)}
            className="min-h-[44px] sm:min-h-[38px] flex items-center gap-1.5 px-3 bg-white hover:bg-terracotta-50 text-charcoal-700 hover:text-terracotta-700 text-xs font-semibold rounded-full border border-om-300 hover:border-terracotta-300 shadow-2xs transition-all cursor-pointer"
            title="Очистить протокол"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Очистить</span>
          </button>
        </div>
      </div>

      {confirmResetOpen && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-terracotta-50 border border-terracotta-200 text-xs">
          <span className="font-semibold text-terracotta-900">
            Удалить все введённые данные и очистить текущий протокол?
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setConfirmResetOpen(false)}
              className="min-h-[40px] px-3 rounded-lg border border-om-300 bg-white text-charcoal-800 font-semibold hover:bg-cream-100 cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmResetOpen(false)
                onResetConfirmed()
              }}
              className="min-h-[40px] px-3 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 cursor-pointer"
            >
              Да, очистить
            </button>
          </div>
        </div>
      )}

      {importError && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-terracotta-50 border border-terracotta-200 text-xs text-terracotta-900">
          <span>{importError}</span>
          <button
            type="button"
            onClick={() => setImportError(null)}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-terracotta-100 cursor-pointer"
            aria-label="Скрыть ошибку"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-charcoal-700">Дисциплина и реквизиты</span>

        <div className="flex items-center bg-om-100 p-1 rounded-full border border-om-200 text-xs">
          <button
            type="button"
            onClick={() => {
              setKind('coursing')
              if (header.title === 'Соревнования по рейсингу') {
                setHeader((prev) => ({ ...prev, title: 'Соревнования по курсингу' }))
              }
            }}
            className={`min-h-[38px] sm:min-h-[32px] px-3.5 rounded-full transition-all font-semibold cursor-pointer ${
              kind === 'coursing'
                ? 'bg-white text-charcoal-900 shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Курсинг (баллы)
          </button>
          <button
            type="button"
            onClick={() => {
              setKind('racing')
              if (header.title === 'Соревнования по курсингу') {
                setHeader((prev) => ({ ...prev, title: 'Соревнования по рейсингу' }))
              }
            }}
            className={`min-h-[38px] sm:min-h-[32px] px-3.5 rounded-full transition-all font-semibold cursor-pointer ${
              kind === 'racing'
                ? 'bg-white text-charcoal-900 shadow-xs'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Рейсинг (время)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
        <label className="block">
          <span className="block text-charcoal-700 font-semibold mb-1">Название соревнований</span>
          <input
            type="text"
            value={header.title}
            onChange={(e) => setHeader({ ...header, title: e.target.value })}
            placeholder="Например: Чемпионат РКФ по курсингу"
            className="w-full min-h-[44px] sm:min-h-[38px] px-3 bg-white rounded-lg border border-om-300/90 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          />
        </label>

        <label className="block">
          <span className="block text-charcoal-700 font-semibold mb-1">Ранг соревнований</span>
          <input
            type="text"
            value={header.rank}
            onChange={(e) => setHeader({ ...header, rank: e.target.value })}
            placeholder="Сертификатные, ЧРКФ, CACIT..."
            className="w-full min-h-[44px] sm:min-h-[38px] px-3 bg-white rounded-lg border border-om-300/90 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          />
        </label>

        <label className="block">
          <span className="block text-charcoal-700 font-semibold mb-1">Дата проведения</span>
          <input
            type="date"
            value={header.date}
            onChange={(e) => setHeader({ ...header, date: e.target.value })}
            className="w-full min-h-[44px] sm:min-h-[38px] px-3 bg-white rounded-lg border border-om-300/90 text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          />
        </label>

        <label className="block">
          <span className="block text-charcoal-700 font-semibold mb-1">Место / Регион</span>
          <input
            type="text"
            value={header.location}
            onChange={(e) => setHeader({ ...header, location: e.target.value })}
            placeholder="Город, регион или поле"
            className="w-full min-h-[44px] sm:min-h-[38px] px-3 bg-white rounded-lg border border-om-300/90 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          />
        </label>

        <label className="block">
          <span className="block text-charcoal-700 font-semibold mb-1">Организатор (Клуб)</span>
          <input
            type="text"
            value={header.club}
            onChange={(e) => setHeader({ ...header, club: e.target.value })}
            placeholder="Название кинологического клуба"
            className="w-full min-h-[44px] sm:min-h-[38px] px-3 bg-white rounded-lg border border-om-300/90 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          />
        </label>

        <label className="block">
          <span className="block text-charcoal-700 font-semibold mb-1">Судьи</span>
          <input
            type="text"
            value={header.judges}
            onChange={(e) => setHeader({ ...header, judges: e.target.value })}
            placeholder="ФИО судей через запятую"
            className="w-full min-h-[44px] sm:min-h-[38px] px-3 bg-white rounded-lg border border-om-300/90 text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          />
        </label>
      </div>
    </div>
  )
}
