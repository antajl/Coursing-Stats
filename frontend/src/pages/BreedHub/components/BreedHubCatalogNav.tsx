import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import DoninoColumnPlaque, { DoninoColumnShell } from '../../SpeedRecords/DoninoColumnPlaque'
import { CORE_BREED_HUBS } from '../../../lib/breed-hubs-data'

interface BreedHubCatalogNavProps {
  currentSlug: string
}

const BREED_CATEGORIES = [
  { id: 'sighthound', title: 'Борзые (10 группа FCI)' },
  { id: 'primitive', title: 'Примитивные (5 группа FCI)' },
  { id: 'sport', title: 'Спорт БЗМП' },
  { id: 'open', title: 'Любительский класс' },
] as const

export function BreedHubCatalogNav({ currentSlug }: BreedHubCatalogNavProps) {
  return (
    <div className="pt-2">
      <DoninoColumnShell
        plaque={
          <DoninoColumnPlaque
            asHeader
            title={
              <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
                <span>Каталог пород в курсинге и бегах</span>
                <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                  · 83 породы
                </span>
              </span>
            }
            actionPlacement="right"
            action={
              <Link
                to="/breeds/"
                className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer shrink-0"
              >
                <span>Все породы</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
              </Link>
            }
          />
        }
        bodyClassName="p-3.5 sm:p-4 bg-white"
      >
        <div className="space-y-3">
          {BREED_CATEGORIES.map((cat) => {
            const list = CORE_BREED_HUBS.filter(
              (b) => b.category === cat.id && b.slug !== currentSlug,
            )
            if (list.length === 0) return null
            return (
              <div key={cat.id} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 sm:w-44 shrink-0">
                  {cat.title}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {list.map((b) => (
                    <Link
                      key={b.slug}
                      to={`/breeds/${b.slug}/`}
                      className="cs-glass-pill inline-flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap text-charcoal-700 hover:text-camel-800"
                    >
                      {b.nameRu}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </DoninoColumnShell>
    </div>
  )
}
