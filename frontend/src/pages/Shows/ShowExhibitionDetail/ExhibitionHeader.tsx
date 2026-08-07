import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import LazyImage from '../../../components/LazyImage'
import BreedGroupDivider from '../../Events/EventResults/components/BreedGroupDivider'
import { resolveRkfOnlineExhibitionUrl, rkfExhibitionResultsUrl } from '../../../lib/rkfLinks'
import type { ShowExhibition } from './types'

function StatPill({
  value,
  label,
  className = '',
  valueClassName = '',
}: {
  value: ReactNode
  label: string
  className?: string
  valueClassName?: string
}) {
  return (
    <div
      className={`rounded-lg border border-old-money-200 bg-white/80 px-3 py-2 dark:border-charcoal-600 dark:bg-charcoal-800/60 ${className}`}
    >
      <div
        className={`font-serif font-bold tabular-nums leading-tight text-charcoal-900 dark:text-charcoal-100 ${valueClassName || 'text-lg md:text-xl'}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
        {label}
      </div>
    </div>
  )
}

export function ExhibitionHeader({ exhibition, onBack }: { exhibition: ShowExhibition; onBack: () => void }) {
  const resultsCount = exhibition.results.length
  const breedsCount =
    exhibition.breed_catalog?.length ?? new Set(exhibition.results.map((r) => r.breed)).size
  const rkfUrl =
    resolveRkfOnlineExhibitionUrl(exhibition.url, exhibition.id) ??
    (exhibition.source === 'rkf-pdf' || exhibition.id >= 10_000
      ? resolveRkfOnlineExhibitionUrl(null, exhibition.id)
      : rkfExhibitionResultsUrl(exhibition.id))
  const externalLabel =
    exhibition.source === 'rkf-pdf' || exhibition.id >= 10_000
      ? 'Открыть на rkf.online'
      : 'Открыть на lc.rkfshow.ru'
  const metaLine = [exhibition.club, exhibition.rank, exhibition.type]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="relative mb-6">
      <button
        type="button"
        onClick={onBack}
        className="relative z-10 mb-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:absolute md:right-full md:top-8 md:mb-0 md:mr-0.5 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
        aria-label="Назад"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <div className="min-w-0 rounded-xl border border-old-money-200 bg-cream-50 p-3 dark:border-charcoal-600 dark:bg-charcoal-800/40 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <h1 className="min-w-0 font-serif text-xl font-bold leading-tight tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-2xl">
            {rkfUrl ? (
              <a
                href={rkfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-camel-700 dark:hover:text-camel-400"
              >
                {exhibition.title}
              </a>
            ) : (
              exhibition.title
            )}
          </h1>
          {rkfUrl ? (
            <a
              href={rkfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-old-money-200 bg-white/90 py-1 pl-1 pr-2.5 text-xs font-semibold text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-50 hover:text-camel-800 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700 dark:hover:text-camel-300"
              aria-label={externalLabel}
              title={externalLabel}
            >
              <LazyImage
                src="/assets/icons/rkf-online.svg"
                alt="РКФ Online"
                className="h-5 w-5 rounded-full"
                width={20}
                height={20}
              />
              <span>РКФ</span>
            </a>
          ) : null}
        </div>

        <BreedGroupDivider />

        <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mb-3">
          <StatPill value={exhibition.date || '—'} label="дата" />
          <StatPill value={resultsCount} label="результатов" />
          <StatPill value={breedsCount} label="пород" />
          <StatPill
            value={
              exhibition.location ? (
                <span className="line-clamp-2 text-sm leading-snug md:text-base">{exhibition.location}</span>
              ) : (
                '—'
              )
            }
            label="место"
            valueClassName="text-sm md:text-base"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {metaLine ? (
          <p className="text-sm leading-snug text-charcoal-600 dark:text-charcoal-300">{metaLine}</p>
        ) : null}
      </div>
    </div>
  )
}
