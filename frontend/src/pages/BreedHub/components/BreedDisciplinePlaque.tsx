import { Link } from 'react-router-dom'
import { Trophy, Zap, Gauge, ArrowUpRight } from 'lucide-react'
import DoninoColumnPlaque from '../../SpeedRecords/DoninoColumnPlaque'
import { breedToSlug } from '../../../lib/breedMapping'
import { formatSeasonsCount } from '../utils'
import type { ColumnTabId } from '../types'

interface BreedDisciplinePlaqueProps {
  discipline: ColumnTabId
  count: number
  canonicalKey: string
  breedNameRu: string
}

export function BreedDisciplinePlaque({
  discipline,
  count,
  canonicalKey,
  breedNameRu,
}: BreedDisciplinePlaqueProps) {
  const slug = breedToSlug(canonicalKey)

  if (discipline === 'coursing') {
    return (
      <DoninoColumnPlaque
        asHeader
        title={
          <span className="inline-flex items-center gap-1.5 truncate">
            <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
            <span className="truncate">Курсинг по годам</span>
            {count > 0 && (
              <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                · {formatSeasonsCount(count)}
              </span>
            )}
          </span>
        }
        actionPlacement="right"
        action={
          <Link
            to={`/competitions/ranking/2026/?breed=${encodeURIComponent(slug)}&tab=coursing`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
            title={`Рейтинг курсинга породы ${breedNameRu}`}
          >
            <span>Рейтинг</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
          </Link>
        }
      />
    )
  }

  if (discipline === 'racing') {
    return (
      <DoninoColumnPlaque
        asHeader
        title={
          <span className="inline-flex items-center gap-1.5 truncate">
            <Zap className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
            <span className="truncate">Рейсинг по годам</span>
            {count > 0 && (
              <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                · {formatSeasonsCount(count)}
              </span>
            )}
          </span>
        }
        actionPlacement="right"
        action={
          <Link
            to={`/competitions/ranking/2026/?breed=${encodeURIComponent(slug)}&tab=racing`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
            title={`Рейтинг рейсинга породы ${breedNameRu}`}
          >
            <span>Рейтинг</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
          </Link>
        }
      />
    )
  }

  return (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 truncate">
          <Gauge className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="truncate">Донино по годам</span>
          {count > 0 && (
            <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
              · {formatSeasonsCount(count)}
            </span>
          )}
        </span>
      }
      actionPlacement="right"
      action={
        <Link
          to={`/speed-records/?breed=${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
          title={`Рекорды Донино породы ${breedNameRu}`}
        >
          <span>Все рекорды</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
        </Link>
      }
    />
  )
}
