import React, { useState, useEffect, useMemo, forwardRef } from 'react'
import QRCode from 'qrcode'
import type { DogPassportData, PassportFormat } from './passportTypes'
import {
  CoursingPillar,
  RacingPillar,
  DoninoPillar,
  ShowPillar,
  HighlightsPillar,
} from './PassportPillars'
import { DogBreedSilhouette, resolveSilhouetteBreed } from '../../../../components/DogSilhouettes'
import { formatNameWithNonBreakingSpaces } from '../../../../lib/dogName'

export interface DogPassportCardProps {
  data: DogPassportData
  format: PassportFormat
}

export const DogPassportCard = forwardRef<HTMLDivElement, DogPassportCardProps>(
  ({ data, format }, ref) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>('')
    const [imgError, setImgError] = useState(false)
    const silhouetteKey = resolveSilhouetteBreed(data.breedPrimary)
    const isMale = data.sex === 'M' || data.sex?.toLowerCase() === 'кобель'
    const formattedName = formatNameWithNonBreakingSpaces(data.namePrimary)

    const resolvedPhotoUrl = useMemo(() => {
      if (!data.photoUrl) return null
      // Для картинок с breedarchive используем wsrv.nl с поддержкой CORS для чистого рендеринга и экспорта в PNG
      if (data.photoUrl.includes('breedarchive.com')) {
        return `https://wsrv.nl/?url=${encodeURIComponent(data.photoUrl)}&w=320&h=320&fit=cover`
      }
      return data.photoUrl
    }, [data.photoUrl])

    useEffect(() => {
      QRCode.toDataURL(data.dogUrl, {
        width: 160,
        margin: 1,
        color: {
          dark: '#1C1917',
          light: '#FFFFFF',
        },
      })
        .then(setQrDataUrl)
        .catch(() => {})
    }, [data.dogUrl])

    const renderHero = () => (
      <div className="flex items-start gap-4">
        {/* Аватар собаки */}
        <div className="relative shrink-0 overflow-hidden rounded-xl border-2 border-[#C5B7A1] bg-[#F7F4EE] shadow-xs h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center">
          {resolvedPhotoUrl && !imgError ? (
            <img
              src={resolvedPhotoUrl}
              alt={data.namePrimary}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover object-[center_20%]"
            />
          ) : silhouetteKey ? (
            <DogBreedSilhouette breedKey={silhouetteKey} size={84} />
          ) : (
            <div className="text-center font-serif text-2xl font-bold text-[#8C7E6A]">
              {data.namePrimary.slice(0, 1)}
            </div>
          )}
        </div>

        {/* Инфо собаки */}
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight leading-snug break-words">
            {formattedName}
          </h2>
          {data.nameSecondary && (
            <div className="text-xs sm:text-sm font-medium text-[#78716C] italic mt-0.5 break-words">
              {data.nameSecondary}
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-[#57534E] font-medium">
            <span className="font-semibold text-[#1C1917]">{data.breedPrimary}</span>
            {data.breedVariety && <span className="text-[#78716C]">({data.breedVariety})</span>}
            <span className="text-[#C5B7A1]">·</span>
            <span>{isMale ? 'Кобель' : 'Сука'}</span>
            <span className="text-[#C5B7A1]">·</span>
            <span className="text-[#8C7E6A]">ID: #{data.id}</span>
          </div>
          {data.pedigreeUrl && (
            <div className="mt-1 text-[11px] text-[#8C6D37] font-medium">
              Реестр родословных: The Breed Archive
            </div>
          )}
        </div>
      </div>
    )

    const renderTitles = () => {
      if (!data.titles || data.titles.length === 0) return null
      return (
        <div className="mt-3 pt-2.5 border-t border-[#EAE3D6]">
          <div className="text-[10px] font-serif font-bold text-[#8C6D37] tracking-wider uppercase mb-1.5">
            Официальные звания
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.titles.map((title, i) => (
              <span
                key={i}
                className="rounded border border-[#D5C9B8] bg-[#F7F3EB] px-2 py-0.5 font-serif text-[10px] font-semibold text-[#634E27]"
                title={title.label}
              >
                {title.label || title.badge}
              </span>
            ))}
          </div>
        </div>
      )
    }

    const renderFooter = () => (
      <div className="mt-3 pt-2.5 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-[10px] text-[#78716C] leading-relaxed">
          <div className="font-serif font-semibold text-[#1C1917]">
            CoursingStats · Цифровой реестр
          </div>
          <div>Официальная верифицированная запись базы данных</div>
          <div className="text-[#8C7E6A] mt-0.5">Дата фиксации: {data.issueDate}</div>
        </div>

        {qrDataUrl && (
          <div className="shrink-0 text-center">
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="h-12 w-12 sm:h-14 sm:w-14 rounded border border-[#D5C9B8] bg-white p-0.5 shadow-2xs"
            />
            <div className="text-[8px] text-[#8C7E6A] font-medium mt-0.5">coursing-stats.ru</div>
          </div>
        )}
      </div>
    )

    // STORIES 9:16 (Вертикальный формат)
    if (format === 'story') {
      return (
        <div
          ref={ref}
          className="w-[480px] min-h-[960px] bg-[#FAF7F2] p-3 text-[#1C1917] select-none font-sans"
        >
          <div className="rounded-2xl border-2 border-[#C3B5A1] p-1.5 bg-[#FAF7F2]">
            <div className="rounded-xl border border-[#DFD7CB] bg-[#FDFCFA] p-4 sm:p-5 shadow-xs flex flex-col justify-between min-h-[930px]">
              <div>
                {/* Шапка */}
                <div className="text-center pb-2.5 border-b border-[#EAE3D6]">
                  <div className="font-serif text-[11px] font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
                    CoursingStats
                  </div>
                  <h1 className="font-serif text-lg font-bold text-[#1C1917] mt-0.5">
                    Паспорт собаки
                  </h1>
                  <div className="text-[9px] text-[#8C7E6A] tracking-wider uppercase mt-0.5">
                    Курсинг · Рейсинг · Скорость · Выставки
                  </div>
                </div>

                {/* Профиль */}
                <div className="mt-3.5">{renderHero()}</div>

                {/* Титулы */}
                {renderTitles()}

                {/* Дисциплины */}
                <div className="mt-3.5 space-y-2">
                  <HighlightsPillar highlights={data.highlights} />
                  <div className="grid grid-cols-2 gap-2">
                    <CoursingPillar coursing={data.coursing} />
                    <RacingPillar racing={data.racing} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <DoninoPillar donino={data.donino} />
                    <ShowPillar shows={data.shows} />
                  </div>
                </div>
              </div>

              {/* Подвал с QR-кодом */}
              {renderFooter()}
            </div>
          </div>
        </div>
      )
    }

    // СЕРТИФИКАТ A4 (Альбомный формат)
    return (
      <div
        ref={ref}
        className="w-[880px] min-h-[560px] bg-[#FAF7F2] p-3 text-[#1C1917] select-none font-sans"
      >
        <div className="rounded-2xl border-2 border-[#C3B5A1] p-1.5 bg-[#FAF7F2]">
          <div className="rounded-xl border border-[#DFD7CB] bg-[#FDFCFA] p-5 shadow-xs flex flex-col justify-between min-h-[532px]">
            <div>
              {/* Шапка */}
              <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="font-serif text-xs font-bold tracking-[0.2em] text-[#8C6D37] uppercase">
                    CoursingStats
                  </div>
                  <span className="text-[#C5B7A1]">·</span>
                  <span className="text-[11px] text-[#78716C] font-serif">
                    Единый реестр спортивных, скоростных и выставочных достижений
                  </span>
                </div>
                <div className="text-[10px] text-[#8C7E6A] font-serif font-semibold">
                  Паспорт № CS-{data.id}
                </div>
              </div>

              {/* Сетка: 2 колонки */}
              <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-4 items-start">
                <div>
                  {renderHero()}
                  {renderTitles()}
                </div>

                <div className="space-y-2">
                  <HighlightsPillar highlights={data.highlights} />
                  <div className="grid grid-cols-2 gap-2">
                    <CoursingPillar coursing={data.coursing} />
                    <RacingPillar racing={data.racing} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <DoninoPillar donino={data.donino} />
                    <ShowPillar shows={data.shows} />
                  </div>
                </div>
              </div>
            </div>

            {/* Подвал */}
            {renderFooter()}
          </div>
        </div>
      </div>
    )
  },
)

DogPassportCard.displayName = 'DogPassportCard'
