import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { toPng } from 'html-to-image'
import { Download, Share2, X, Smartphone, FileText, Check, Copy } from 'lucide-react'
import type { DogPassportData, PassportFormat, PassportSectionsConfig } from './passportTypes'
import { DogPassportCard } from './DogPassportCard'
import { PassportSectionsBar } from './PassportSectionsBar'

export interface DogPassportModalProps {
  isOpen: boolean
  onClose: () => void
  data: DogPassportData
}

/** Автоматический выбор формата: на десктопах по умолчанию А4, на смартфонах — Stories 9:16 */
function getPreferredPassportFormat(): PassportFormat {
  if (typeof window !== 'undefined' && window.innerWidth >= 768) {
    return 'certificate'
  }
  return 'story'
}

export const DogPassportModal: React.FC<DogPassportModalProps> = ({ isOpen, onClose, data }) => {
  const [format, setFormat] = useState<PassportFormat>(getPreferredPassportFormat)
  const [exporting, setExporting] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sections, setSections] = useState<PassportSectionsConfig>({
    coursing: data.coursing.hasData,
    racing: data.racing.hasData,
    shows: data.shows.hasData,
    titles: data.titles.length > 0,
  })
  const cardRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    // При открытии автоматически выставляем рекомендованный формат под текущее устройство
    setFormat(getPreferredPassportFormat())
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [format])

  if (!isOpen) return null

  const handleDownload = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      })
      const link = document.createElement('a')
      const cleanName = (data.namePrimary || 'dog').toLowerCase().replace(/[^a-zа-я0-9]/gi, '_')
      link.download = `${cleanName}_passport_${format}.png`
      link.href = dataUrl
      link.click()
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2500)
    } catch (err) {
      console.error('Failed to export passport', err)
    } finally {
      setExporting(false)
    }
  }

  const handleShare = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      })
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const cleanName = (data.namePrimary || 'dog').toLowerCase().replace(/[^a-zа-я0-9]/gi, '_')
      const file = new File([blob], `${cleanName}_passport.png`, { type: 'image/png' })

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `${data.namePrimary} — Паспорт собаки`,
          text: `Паспорт спортивных и выставочных достижений ${data.namePrimary} на CoursingStats`,
          files: [file],
        })
        return
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return
    } finally {
      setExporting(false)
    }
    // Fallback к обычному скачиванию
    handleDownload()
  }

  const handleCopy = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 2,
        cacheBust: true,
      })
      const res = await fetch(dataUrl)
      const blob = await res.blob()

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof ClipboardItem !== 'undefined'
      ) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
        return
      }
    } catch (err) {
      console.error('Failed to copy passport to clipboard', err)
    } finally {
      setExporting(false)
    }
    // Fallback к скачиванию, если буфер недоступен
    handleDownload()
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-charcoal-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-2xl border border-[#D5C9B8] bg-[#FAF8F5] shadow-2xl overflow-hidden">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between border-b border-[#EAE3D6] px-4 sm:px-6 py-3 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h3 id="passport-modal-title" className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
              Паспорт собаки
            </h3>
            <span className="hidden sm:inline text-xs text-[#8C7E6A]">·</span>
            <span className="hidden sm:inline text-xs text-[#78716C] font-medium">
              Карточка для соцсетей и печати
            </span>
          </div>

          {/* Переключатель формата */}
          <div className="flex items-center gap-1 rounded-xl border border-[#D5C9B8] bg-[#FAF7F2] p-1">
            <button
              type="button"
              onClick={() => setFormat('story')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                format === 'story'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#DFD7CB]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
              title="Вертикальный формат для Stories и постов в Telegram"
            >
              <Smartphone className="h-3.5 w-3.5" aria-hidden />
              <span>Stories 9:16</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('certificate')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                format === 'certificate'
                  ? 'bg-white text-[#1C1917] shadow-xs border border-[#DFD7CB]'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
              title="Альбомный формат сертификата"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              <span>Сертификат A4</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#F2ECE1] hover:text-[#1C1917] transition-colors cursor-pointer"
            aria-label="Закрыть окно"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Панель настройки разделов диплома */}
        <PassportSectionsBar
          sections={sections}
          setSections={setSections}
          hasTitles={data.titles.length > 0}
        />

        {/* Область интерактивного предпросмотра карточки */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-auto p-3 sm:p-6 bg-[#F3EFEA]/60 flex justify-center items-start"
        >
          <div className="inline-block transition-transform">
            <DogPassportCard ref={cardRef} data={data} format={format} sections={sections} />
          </div>
        </div>

        {/* Подвал с кнопками экспорта */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EAE3D6] px-4 sm:px-6 py-3 bg-white shrink-0">
          <div className="text-xs text-[#78716C]">
            Изображение формируется локально в высоком разрешении (2x Retina)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5C9B8] bg-[#FAF8F5] px-3 sm:px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#F2ECE1] transition-all disabled:opacity-50 cursor-pointer min-h-[38px]"
              title="Скопировать изображение в буфер обмена для быстрой отправки в Telegram или чаты"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#1F432E]" aria-hidden />
                  <span className="text-[#1F432E]">Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#8C6D37]" aria-hidden />
                  <span>Скопировать</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShare}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#D5C9B8] bg-[#FAF8F5] px-3 sm:px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#F2ECE1] transition-all disabled:opacity-50 cursor-pointer min-h-[38px]"
              title="Поделиться в Telegram или сохранить файл"
            >
              <Share2 className="h-3.5 w-3.5 text-[#8C6D37]" aria-hidden />
              <span>Поделиться</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#8C6D37] bg-[#8C6D37] px-4 sm:px-5 py-2 text-xs font-semibold text-white hover:bg-[#73582A] transition-all disabled:opacity-50 shadow-xs cursor-pointer min-h-[38px]"
              title="Скачать PNG на устройство"
            >
              {downloaded ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" aria-hidden />
                  <span>Сохранено</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5 text-white" aria-hidden />
                  <span>{exporting ? 'Сохранение...' : 'Скачать PNG'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
