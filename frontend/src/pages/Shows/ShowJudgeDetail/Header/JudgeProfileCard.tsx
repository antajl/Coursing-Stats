import { Award, MapPin, Maximize2 } from 'lucide-react'
import JudgeYearDropdown from '../../../../components/ui/JudgeYearDropdown'
import type { StrictnessBadge } from '../../../../lib/judgeUiUtils'

interface JudgeProfileCardProps {
  displayName: string
  photoUrl?: string | null
  city?: string
  certNumber?: number
  ranks?: string
  strictnessBadge: StrictnessBadge
  puppyStrictnessBadge: StrictnessBadge
  puppyGraded: number
  yearParam: string
  availableYears: string[]
  onYearChange: (year: string) => void
  onOpenPhoto: () => void
}

export function JudgeProfileCard({
  displayName,
  photoUrl,
  city,
  certNumber,
  ranks,
  strictnessBadge,
  puppyStrictnessBadge,
  puppyGraded,
  yearParam,
  availableYears,
  onYearChange,
  onOpenPhoto,
}: JudgeProfileCardProps) {
  return (
    <div className="min-w-0 rounded-2xl border border-old-money-200/90 bg-white p-4 sm:p-5 md:p-6 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 sm:gap-6 items-start">
        {/* Left: Avatar + Details */}
        <div className="flex items-start gap-4 sm:gap-5 md:gap-6 min-w-0">
          {photoUrl && (
            <button
              type="button"
              onClick={onOpenPhoto}
              className="group relative h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-2xl border border-cream-200/90 bg-cream-50/60 shadow-xs transition-all hover:border-camel-400 hover:shadow-sm focus-visible:outline-hidden cursor-pointer"
              aria-label={`Увеличить фото ${displayName}`}
              title="Нажмите, чтобы открыть фото в полном размере"
            >
              <img
                src={photoUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget
                  if (target.parentElement) target.parentElement.style.display = 'none'
                }}
              />
              <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-md bg-charcoal-900/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs">
                <Maximize2 className="h-3 w-3" aria-hidden />
              </span>
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl line-clamp-2 leading-tight">
              {displayName}
              <span className="sr-only"> — эксперт РКФ, судья выставок собак</span>
            </h1>

            {/* Ряд 1: Паспортные реестровые данные судьи (РКФ / FCI) */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-charcoal-600 font-medium">
              <span className="inline-flex items-center gap-1 font-semibold text-camel-800">
                <Award className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
                <span>Судья РКФ / FCI</span>
              </span>

              {city && (
                <>
                  <span className="text-old-money-300 select-none">·</span>
                  <span className="inline-flex items-center gap-1 text-charcoal-700">
                    <MapPin className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                    <span>{city}</span>
                  </span>
                </>
              )}

              {certNumber && (
                <>
                  <span className="text-old-money-300 select-none">·</span>
                  <span className="font-semibold text-charcoal-800">
                    РКФ № {certNumber}
                  </span>
                </>
              )}

              {ranks && (
                <>
                  <span className="text-old-money-300 select-none">·</span>
                  <span className="text-charcoal-700">
                    {ranks}
                  </span>
                </>
              )}
            </div>

            {/* Ряд 2: Аналитические характеристики стиля судейства (строгость) */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${strictnessBadge.badgeClass}`}
                title={`Взрослые классы (CAC): ${strictnessBadge.detail}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${strictnessBadge.dotClass}`} />
                <span>
                  {strictnessBadge.tone !== 'unknown'
                    ? `${strictnessBadge.label} к взрослым`
                    : strictnessBadge.label}
                </span>
              </span>
              {puppyGraded >= 15 && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight ${puppyStrictnessBadge.badgeClass}`}
                  title={`Щенки и бэби: ${puppyStrictnessBadge.detail}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${puppyStrictnessBadge.dotClass}`} />
                  <span>{puppyStrictnessBadge.label}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pt-2 border-t border-old-money-100/70 sm:border-0 sm:pt-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 sm:hidden">
            Период:
          </span>
          <JudgeYearDropdown
            value={yearParam}
            onChange={onYearChange}
            availableYears={availableYears}
          />
        </div>
      </div>
    </div>
  )
}
