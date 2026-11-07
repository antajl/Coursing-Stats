import { Fragment } from 'react'
import { Calendar, Dog, PawPrint, MapPin } from 'lucide-react'
import LazyImage from '../../../components/LazyImage'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { resolveRkfOnlineExhibitionUrl, rkfExhibitionResultsUrl } from '../../../lib/rkfLinks'
import { getClubTooltip, getFederationTooltip, getRankTooltip } from '../showMetaTooltips'
import type { ShowExhibition } from './types'

export function ExhibitionHeader({ exhibition }: { exhibition: ShowExhibition }) {
  const uniqueDogsCount = new Set(exhibition.results.map((r) => (r.dog_name || '').trim().toLowerCase()).filter(Boolean)).size
  const dogsCount = uniqueDogsCount || exhibition.results.length
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
  const metaItems = [
    exhibition.club ? { text: exhibition.club.trim(), tooltip: getClubTooltip(exhibition.club) } : null,
    exhibition.rank ? { text: exhibition.rank.trim(), tooltip: getRankTooltip(exhibition.rank) } : null,
    exhibition.type ? { text: exhibition.type.trim(), tooltip: getFederationTooltip(exhibition.type) } : null,
  ].filter((item): item is { text: string; tooltip: ReturnType<typeof getClubTooltip> } => Boolean(item && item.text))
  const locationText = exhibition.location || '—'

  return (
    <div className="relative mb-4">
      <div className="min-w-0 rounded-xl border border-old-money-200 bg-gradient-to-br from-cream-50 to-white px-4 py-4 md:px-5 md:py-4.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="min-w-0 font-serif text-lg font-bold leading-tight tracking-tight text-charcoal-900 md:text-xl">
              {rkfUrl ? (
                <a
                  href={rkfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-camel-700"
                >
                  {exhibition.title}
                </a>
              ) : (
                exhibition.title
              )}
            </h1>

            <div className="mt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 shrink-0">
                <Calendar className="h-4 w-4 text-camel-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Дата</div>
                  <div className="text-sm font-semibold text-charcoal-900">{exhibition.date || '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 shrink-0">
                <Dog className="h-4 w-4 text-camel-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Собак</div>
                  <div className="text-sm font-semibold text-charcoal-900">{dogsCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 shrink-0">
                <PawPrint className="h-4 w-4 text-camel-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Пород</div>
                  <div className="text-sm font-semibold text-charcoal-900">{breedsCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 min-w-0 flex-1">
                <MapPin className="h-4 w-4 text-camel-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wide text-old-money-500">Место</div>
                  <div className="text-sm font-semibold text-charcoal-900">
                    {locationText.length > 30 ? (
                      <HoverTooltip label={locationText} placement="bottom" variant="site" delayMs={0} portal>
                        <span className="cursor-help line-clamp-2">{locationText}</span>
                      </HoverTooltip>
                    ) : (
                      locationText
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {rkfUrl ? (
            <a
              href={rkfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-old-money-200 bg-white/90 py-1 pl-1 pr-2.5 text-xs font-semibold text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-50 hover:text-camel-800"
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

        {metaItems.length > 0 ? (
          <div className="mt-3 pt-3 border-t border-old-money-200/60 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug text-charcoal-600">
            {metaItems.map((item, index) => (
              <Fragment key={index}>
                {index > 0 && <span className="text-old-money-400 select-none">·</span>}
                {item.tooltip ? (
                  <HoverTooltip
                    placement="bottom"
                    variant="site"
                    delayMs={0}
                    portal
                    label={
                      <div className="max-w-xs sm:max-w-sm text-left py-0.5">
                        <div className="font-semibold text-charcoal-900 text-xs">{item.tooltip.title}</div>
                        <div className="mt-1 text-[11.5px] leading-relaxed text-charcoal-600">{item.tooltip.description}</div>
                      </div>
                    }
                  >
                    <span className="cursor-help decoration-dotted underline decoration-old-money-400/80 underline-offset-4 transition-colors hover:text-charcoal-900 hover:decoration-camel-600">
                      {item.text}
                    </span>
                  </HoverTooltip>
                ) : (
                  <span>{item.text}</span>
                )}
              </Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
