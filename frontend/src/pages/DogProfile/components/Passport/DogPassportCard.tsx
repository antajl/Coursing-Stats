import React, { useState, useEffect, forwardRef } from 'react'
import QRCode from 'qrcode'
import type { DogPassportData, PassportFormat } from './passportTypes'
import { SportPillar, DoninoPillar, ShowPillar } from './PassportPillars'
import { DogBreedSilhouette, resolveSilhouetteBreed } from '../../../../components/DogSilhouettes'
import { formatNameWithNonBreakingSpaces } from '../../../../lib/dogName'

export interface DogPassportCardProps {
  data: DogPassportData
  format: PassportFormat
}

export const DogPassportCard = forwardRef<HTMLDivElement, DogPassportCardProps>(
  ({ data, format }, ref) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>('')
    const silhouetteKey = resolveSilhouetteBreed(data.breedPrimary)
    const isMale = data.sex === 'M' || data.sex?.toLowerCase() === 'кобель'
    const formattedName = formatNameWithNonBreakingSpaces(data.namePrimary)

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
          {data.photoUrl ? (
            <img
              src={data.photoUrl}
              alt={data.namePrimary}
              crossOrigin="anonymous"
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
        </div>
      </div>
    )

    const renderTitles = () => {
      if (!data.titles || data.titles.length === 0) return null
      return (
        <div className="mt-3 pt-3 border-t border-[#EAE3D6]">
          <div className="text-[10px] font-serif font-bold text-[#8C6D37] tracking-wider uppercase mb-1.5">
            Официальные звания
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.titles.map((title, i) => (
              <span
                key={i}
                className="rounded border border-[#D5C9B8] bg-[#F7F3EB] px-2 py-0.5 font-serif text-[10px] font-semibold text-[#634E27]"
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )
    }

    const renderFooter = () => (
      <div className="mt-4 pt-3 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-[10px] text-[#78716C] leading-relaxed">
          <div className="font-serif font-semibold text-[#1C1917]">
            CoursingStats · Цифровой реестр
          </div>
          <div>Официальная верифицированная запись базы данных</div>
          <div className="text-[#8C7E6A] mt-0.5">Дата: {data.issueDate}</div>
        </div>

        {qrDataUrl && (
          <div className="shrink-0 text-center">
            <img
              src={qrDataUrl}
              alt="QR Code"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded border border-[#D5C9B8] bg-white p-0.5 shadow-2xs"
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
          className="w-[460px] min-h-[818px] bg-[#FAF7F2] p-3 text-[#1C1917] select-none font-sans"
        >
          {/* Внешняя геральдическая двойная рамка */}
          <div className="rounded-2xl border-2 border-[#C3B5A1] p-1.5 bg-[#FAF7F2]">
            <div className="rounded-xl border border-[#DFD7CB] bg-[#FDFCFA] p-5 shadow-xs flex flex-col justify-between min-h-[790px]">
              <div>
                {/* Шапка */}
                <div className="text-center pb-3 border-b border-[#EAE3D6]">
                  <div className="font-serif text-[11px] font-bold tracking-[0.25em] text-[#8C6D37] uppercase">
                    CoursingStats
                  </div>
                  <h1 className="font-serif text-lg font-bold text-[#1C1917] mt-0.5">
                    Паспорт собаки
                  </h1>
                  <div className="text-[9px] text-[#8C7E6A] tracking-wider uppercase mt-0.5">
                    Спорт · Скорость · Выставки
                  </div>
                </div>

                {/* Профиль */}
                <div className="mt-4">{renderHero()}</div>

                {/* Титулы */}
                {renderTitles()}

                {/* Три дисциплины */}
                <div className="mt-4 space-y-2.5">
                  <SportPillar sport={data.sport} />
                  <DoninoPillar donino={data.donino} />
                  <ShowPillar shows={data.shows} />
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
        className="w-[840px] min-h-[520px] bg-[#FAF7F2] p-3 text-[#1C1917] select-none font-sans"
      >
        <div className="rounded-2xl border-2 border-[#C3B5A1] p-1.5 bg-[#FAF7F2]">
          <div className="rounded-xl border border-[#DFD7CB] bg-[#FDFCFA] p-5 shadow-xs flex flex-col justify-between min-h-[492px]">
            <div>
              {/* Шапка */}
              <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <div className="font-serif text-xs font-bold tracking-[0.2em] text-[#8C6D37] uppercase">
                    CoursingStats
                  </div>
                  <span className="text-[#C5B7A1]">·</span>
                  <span className="text-[11px] text-[#78716C] font-serif">
                    Единый реестр спортивных и выставочных достижений
                  </span>
                </div>
                <div className="text-[10px] text-[#8C7E6A] font-serif font-semibold">
                  Паспорт № CS-{data.id}
                </div>
              </div>

              {/* Сетка: 2 колонки (Слева Hero + Титулы, Справа 3 Pillars) */}
              <div className="grid grid-cols-[330px_minmax(0,1fr)] gap-5 items-start">
                <div>
                  {renderHero()}
                  {renderTitles()}
                </div>

                <div className="space-y-2.5">
                  <SportPillar sport={data.sport} />
                  <div className="grid grid-cols-2 gap-2.5">
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
