import { ChevronLeft, Download, ExternalLink } from 'lucide-react'
import OwnerCrownName from '../../components/OwnerCrownName'
import { type DogTitle } from '../../lib/qualificationTitles'
import { renderGroupedDogTitles } from '../../lib/awardChipRender'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'

type DogProfileHeaderProps = {
  // Dog profile payload from static indexes (loosely typed)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dog: any
  titles: DogTitle[]
  showRuName: boolean
  exporting: boolean
  onBack: () => void
  onExport: () => void
}

export function DogProfileHeader({
  dog,
  titles,
  showRuName,
  exporting,
  onBack,
  onExport,
}: DogProfileHeaderProps) {
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)

  return (
    <div className="relative mb-6">
      <button
        type="button"
        onClick={onBack}
        className="absolute right-full top-5 z-10 mr-0.5 flex h-11 w-11 items-center justify-center rounded-lg text-old-money-500 transition-colors hover:bg-old-money-50 hover:text-camel-700 md:top-8 dark:text-old-money-400 dark:hover:bg-charcoal-700 dark:hover:text-camel-400"
        aria-label="Назад"
        data-export-ignore
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <div className="min-w-0 rounded-xl border border-old-money-200/80 bg-white p-5 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-8">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <OwnerCrownName name={primary} dogId={dog.id} kind="competition">
                <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
                  {primary}
                </h1>
              </OwnerCrownName>
              {dog.sex && (
                <span className="text-lg font-medium text-charcoal-400 dark:text-charcoal-500">
                  {dog.sex === 'M' ? '♂' : '♀'}
                </span>
              )}
            </div>
            {secondary ? (
              <div className="mt-1 text-base font-medium text-charcoal-400 dark:text-charcoal-500">
                {secondary}
              </div>
            ) : showRuName ? (
              <div className="mt-1 text-base font-medium text-old-money-500 dark:text-old-money-400">
                {dog.name_ru}
              </div>
            ) : null}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="min-w-0">
                <span
                  className="inline-block rounded-full border border-old-money-200 bg-cream-100 px-4 py-1.5 text-sm font-semibold text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300"
                  title={
                    breedDisplay.secondary
                      ? `${breedDisplay.primary} — ${breedDisplay.secondary}`
                      : breedDisplay.primary
                  }
                >
                  {breedDisplay.primary}
                </span>
              </div>
              {dog.pedigree_url && (
                <a
                  href={dog.pedigree_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-camel-700 transition-colors hover:border-camel-400 hover:bg-camel-50 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:border-camel-600 dark:hover:bg-charcoal-700"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Breed Archive
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="mt-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-camel-300 bg-white text-camel-700 shadow-sm transition-colors hover:border-camel-400 hover:bg-camel-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-300 dark:hover:bg-charcoal-700"
            aria-label={exporting ? 'Экспорт…' : 'Скачать карточку'}
            title={exporting ? 'Экспорт…' : 'Скачать карточку'}
            data-export-ignore
          >
            <Download className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {titles.length > 0 && (
          <div className="mt-4 border-t border-old-money-100 pt-4 dark:border-charcoal-600">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
              Титулы
            </div>
            <div className="flex flex-wrap items-center gap-1.5">{renderGroupedDogTitles(titles)}</div>
          </div>
        )}

        {dog.owner && (
          <div className="mt-4 border-t border-old-money-100 pt-4 text-sm text-old-money-700 dark:border-charcoal-600 dark:text-old-money-300">
            <span className="font-semibold text-old-money-800 dark:text-old-money-200">Владелец:</span> {dog.owner}
          </div>
        )}
      </div>
    </div>
  )
}
