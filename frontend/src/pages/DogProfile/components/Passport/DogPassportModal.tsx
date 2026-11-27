import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Smartphone, FileText } from 'lucide-react'
import type { DogPassportData, PassportFormat, PassportSectionsConfig } from './passportTypes'
import { DogPassportCard } from './DogPassportCard'
import { PassportSectionsBar } from './PassportSectionsBar'
import { PassportFooterActions } from './PassportFooterActions'
import {
  cleanPassportFileBase,
  renderPassportPng,
  triggerPngDownload,
} from './passportExportUtils'
import { useTopSpeed } from '../../../../hooks/useStaticData'
import {
  computeDogSpeedBreedComparison,
  extractDogRacingSpeed,
} from '../../CoursingCriteria/coursingSpeedBenchmark'

export interface DogPassportModalProps {
  isOpen: boolean
  onClose: () => void
  data: DogPassportData
}

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
  const [previewScale, setPreviewScale] = useState(1)
  const [cardHeight, setCardHeight] = useState<number | null>(null)
  const [sections, setSections] = useState<PassportSectionsConfig>({
    coursing: data.coursing.hasData,
    racing: data.racing.hasData,
    shows: data.shows.hasData,
    titles: data.titles.length > 0,
    criteria: Boolean(data.coursingCriteria),
  })
  const cardRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const baseWidth = format === 'story' ? 480 : 880

  const hasCriteria = Boolean(data.coursingCriteria)
  const hasRacingSpeed = useMemo(
    () => extractDogRacingSpeed(data.racingStatsRaw) !== null,
    [data.racingStatsRaw],
  )
  const { data: topSpeedRes } = useTopSpeed('all', {
    enabled: isOpen && hasCriteria && hasRacingSpeed,
  })
  const speedComparison = useMemo(
    () =>
      computeDogSpeedBreedComparison({
        racingStats: data.racingStatsRaw,
        breed: data.breedPrimary,
        dogId: data.id,
        items: topSpeedRes?.data?.items,
      }),
    [data.racingStatsRaw, data.breedPrimary, data.id, topSpeedRes?.data?.items],
  )

  useEffect(() => {
    if (!isOpen) return
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

  useEffect(() => {
    if (!isOpen) return
    const container = scrollContainerRef.current
    const cardEl = cardRef.current
    if (!container || !cardEl) return

    const updateScale = () => {
      const cs = window.getComputedStyle(container)
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0)
      const available = Math.max(200, container.clientWidth - padX - 4)
      setPreviewScale(Math.min(1, available / baseWidth))
      setCardHeight(cardEl.offsetHeight || cardEl.scrollHeight || null)
    }

    updateScale()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScale) : null
    ro?.observe(container)
    ro?.observe(cardEl)
    window.addEventListener('resize', updateScale)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [isOpen, baseWidth, sections, speedComparison])

  if (!isOpen) return null

  const handleDownload = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await renderPassportPng(cardRef.current, baseWidth, 0.98)
      triggerPngDownload(dataUrl, data.namePrimary, format)
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
      const dataUrl = await renderPassportPng(cardRef.current, baseWidth, 0.95)
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `${cleanPassportFileBase(data.namePrimary)}_passport.png`, {
        type: 'image/png',
      })

      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `${data.namePrimary} — Карточка собаки`,
          text: `Карточка спортивных и выставочных достижений ${data.namePrimary} на CoursingStats`,
          files: [file],
        })
        return
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return
    } finally {
      setExporting(false)
    }
    handleDownload()
  }

  const handleCopy = async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      const dataUrl = await renderPassportPng(cardRef.current, baseWidth, 0.98)
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
      <div className="relative w-full max-w-5xl max-h-[94dvh] flex flex-col rounded-2xl border border-old-money-300 bg-cream-50 shadow-2xl overflow-hidden">
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between border-b border-old-money-200 px-4 sm:px-6 py-3 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h3 id="passport-modal-title" className="font-serif text-base sm:text-lg font-bold text-charcoal-900">
              Карточка собаки
            </h3>
            <span className="hidden sm:inline text-xs text-old-money-500">·</span>
            <span className="hidden sm:inline text-xs text-charcoal-500 font-medium">
              Карточка для соцсетей и печати
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-old-money-300 bg-cream-50 p-1">
            <button
              type="button"
              onClick={() => setFormat('story')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                format === 'story'
                  ? 'bg-white text-charcoal-900 shadow-xs border border-old-money-200'
                  : 'text-charcoal-500 hover:text-charcoal-900'
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
                  ? 'bg-white text-charcoal-900 shadow-xs border border-old-money-200'
                  : 'text-charcoal-500 hover:text-charcoal-900'
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-900 transition-colors cursor-pointer touch-manipulation"
            aria-label="Закрыть окно"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <PassportSectionsBar
          sections={sections}
          setSections={setSections}
          hasTitles={data.titles.length > 0}
          hasCriteria={hasCriteria}
        />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-cream-100/60 flex justify-center items-start"
        >
          <div
            className="mx-auto shrink-0 overflow-hidden transition-[width,height] duration-150"
            style={{
              width: Math.round(baseWidth * previewScale),
              height: cardHeight ? Math.round(cardHeight * previewScale) : undefined,
            }}
          >
            <div
              style={{
                width: baseWidth,
                transform: previewScale < 1 ? `scale(${previewScale})` : undefined,
                transformOrigin: 'top left',
              }}
            >
              <DogPassportCard
                ref={cardRef}
                data={data}
                format={format}
                sections={sections}
                speedComparison={speedComparison}
              />
            </div>
          </div>
        </div>

        <PassportFooterActions
          exporting={exporting}
          copied={copied}
          downloaded={downloaded}
          onCopy={handleCopy}
          onShare={handleShare}
          onDownload={handleDownload}
        />
      </div>
    </div>,
    document.body,
  )
}
