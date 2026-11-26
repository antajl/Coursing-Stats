import { useState, useEffect, useMemo, forwardRef } from 'react'
import QRCode from 'qrcode'
import type { DogPassportData, PassportFormat, PassportSectionsConfig } from './passportTypes'
import {
  CoursingPillar,
  RacingPillar,
  ShowPillar,
} from './PassportPillars'
import {
  StoryCoursingCard,
  StoryRacingCard,
  StoryShowsCard,
} from './StoryDisciplinePillars'
import { DogBreedSilhouette, resolveSilhouetteBreed } from '../../../../components/DogSilhouettes'
import { formatNameWithNonBreakingSpaces } from '../../../../lib/dogName'
import { PassportTitlesSection } from './PassportTitlesSection'

export interface DogPassportCardProps {
  data: DogPassportData
  format: PassportFormat
  sections?: PassportSectionsConfig
}

export const DogPassportCard = forwardRef<HTMLDivElement, DogPassportCardProps>(
  ({ data, format, sections }, ref) => {
    const showCoursing = sections ? sections.coursing : true
    const showRacing = sections ? sections.racing : true
    const showShows = sections ? sections.shows : true
    const showTitles = sections ? sections.titles : true

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
      <div className="flex items-start gap-3.5">
        {/* Аватар собаки */}
        <div className="relative shrink-0 overflow-hidden rounded-xl border-2 border-[#C5B7A1] bg-[#F7F4EE] shadow-xs h-20 w-20 flex items-center justify-center">
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
            <DogBreedSilhouette breed={data.breedPrimary} className="h-[70px] w-[70px] text-camel-700/60" />
          ) : (
            <div className="text-center font-serif text-2xl font-bold text-[#8C7E6A]">
              {data.namePrimary.slice(0, 1)}
            </div>
          )}
        </div>

        {/* Инфо собаки */}
        <div className="min-w-0 flex-1">
          {/* Русская кличка в приоритете */}
          <h2 className="font-serif text-lg font-bold text-[#1C1917] tracking-tight leading-snug break-words">
            {formattedName}
          </h2>
          {data.nameSecondary && (
            <div className="text-xs font-medium text-[#78716C] italic mt-0.5 break-words">
              {data.nameSecondary}
            </div>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-[#57534E] font-medium leading-none">
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

    const renderTitles = (compact = false) => {
      if (!showTitles || !data.titles || data.titles.length === 0) return null
      return <PassportTitlesSection titles={data.titles} compact={compact} />
    }

    const renderFooter = () => (
      <div className="mt-3 pt-2.5 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 text-[10px] text-[#78716C] leading-relaxed">
          <div className="font-serif font-semibold text-[#1C1917]">
            Курсинг Статс · Цифровая база данных
          </div>
          <div>Электронная карточка спортивных и выставочных результатов</div>
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
          className="w-[480px] bg-[#FAF7F2] p-3 text-[#1C1917] select-none font-sans"
        >
          <div className="rounded-2xl border-2 border-[#C3B5A1] p-1.5 bg-[#FAF7F2]">
            <div className="rounded-xl border border-[#DFD7CB] bg-[#FDFCFA] p-4 sm:p-5 shadow-xs flex flex-col">
              <div>
                {/* Шапка */}
                <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="font-serif text-[11px] font-bold tracking-[0.2em] text-[#8C6D37] uppercase shrink-0">
                      Курсинг Статс
                    </div>
                    <span className="text-[#C5B7A1]">·</span>
                    <span className="text-[10px] text-[#78716C] font-serif truncate">
                      Цифровая база данных
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8C7E6A] font-serif font-semibold shrink-0">
                    Карточка № CS-{data.id}
                  </div>
                </div>

                {/* Профиль собаки */}
                <div className="mt-1">{renderHero()}</div>

                {/* Титулы: компактный однострочный вид */}
                {renderTitles(true)}

                {/* Дисциплины (Курсинг, Рейсинг и Выставки в едином мобильном дизайне) */}
                <div className="mt-3 space-y-2">
                  {showCoursing && <StoryCoursingCard coursing={data.coursing} />}
                  {showRacing && <StoryRacingCard racing={data.racing} />}
                  {showShows && <StoryShowsCard shows={data.shows} />}
                </div>
              </div>

              {/* Подвал с QR-кодом */}
              {renderFooter()}
            </div>
          </div>
        </div>
      )
    }

    // СЕРТИФИКАТ A4 (Альбомный формат, ширина 880px)
    return (
      <div
        ref={ref}
        className="w-[880px] bg-[#FAF7F2] p-3.5 text-[#1C1917] select-none font-sans"
      >
        <div className="rounded-2xl border-2 border-[#C3B5A1] p-1.5 bg-[#FAF7F2]">
          <div className="rounded-xl border border-[#DFD7CB] bg-[#FDFCFA] p-5 shadow-xs flex flex-col justify-between min-h-[530px]">
            <div>
              {/* Шапка */}
              <div className="flex items-center justify-between border-b border-[#EAE3D6] pb-2 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="font-serif text-xs font-bold tracking-[0.2em] text-[#8C6D37] uppercase">
                    Курсинг Статс
                  </div>
                  <span className="text-[#C5B7A1]">·</span>
                  <span className="text-[11px] text-[#78716C] font-serif">
                    Цифровая база спортивных и выставочных достижений
                  </span>
                </div>
                <div className="text-[10px] text-[#8C7E6A] font-serif font-semibold">
                  Карточка № CS-{data.id}
                </div>
              </div>

              {/* Широкий Hero во всю ширину */}
              <div className="flex items-start gap-4 pb-3 border-b border-[#EAE3D6]">
                <div className="relative shrink-0 overflow-hidden rounded-xl border-2 border-[#C5B7A1] bg-[#F7F4EE] shadow-xs h-24 w-24 flex items-center justify-center">
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
                    <DogBreedSilhouette breed={data.breedPrimary} className="h-20 w-20 text-camel-700/60" />
                  ) : (
                    <div className="text-center font-serif text-2xl font-bold text-[#8C7E6A]">
                      {data.namePrimary.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="font-serif text-2xl font-bold text-[#1C1917] tracking-tight leading-snug">
                    {formattedName}
                  </h1>
                  {data.nameSecondary && (
                    <div className="text-sm font-medium text-[#78716C] italic mt-0.5">
                      {data.nameSecondary}
                    </div>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-[#57534E] font-medium">
                    <span className="font-semibold text-[#1C1917]">{data.breedPrimary}</span>
                    {data.breedVariety && <span className="text-[#78716C]">({data.breedVariety})</span>}
                    <span className="text-[#C5B7A1]">·</span>
                    <span>{isMale ? 'Кобель' : 'Сука'}</span>
                    <span className="text-[#C5B7A1]">·</span>
                    <span className="text-[#8C7E6A]">ID: #{data.id}</span>
                  </div>

                  {renderTitles()}
                </div>
              </div>

              {/* Сетка дисциплин (адаптивная ширина под активные колонки) */}
              {(() => {
                const activeCount =
                  (showCoursing ? 1 : 0) + (showRacing ? 1 : 0) + (showShows ? 1 : 0)
                const gridClass =
                  activeCount === 1
                    ? 'grid-cols-1 max-w-sm mx-auto'
                    : activeCount === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                if (activeCount === 0) return null
                return (
                  <div className={`grid ${gridClass} gap-3 mt-3 items-stretch`}>
                    {showCoursing && <CoursingPillar coursing={data.coursing} />}
                    {showRacing && <RacingPillar racing={data.racing} />}
                    {showShows && <ShowPillar shows={data.shows} />}
                  </div>
                )
              })()}
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
