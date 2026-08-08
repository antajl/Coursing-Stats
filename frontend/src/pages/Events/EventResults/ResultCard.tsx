import { Link } from 'react-router-dom'
import DetailPanel from './details/DetailPanel'
import ResultSummary, { ResultScorePanel } from './ResultSummary'
import { parseRawScores } from './utils'
import { placementAccentClass } from './utils/scoreStyles'
import type { Result } from './types'

interface ResultCardProps {
  result: Result
  index: number
}

export default function ResultCard({ result, index }: ResultCardProps) {
  const rawScores = parseRawScores(result.raw_scores_json)
  const accent = placementAccentClass(result.placement)
  const isPodium = result.placement != null && result.placement <= 3
  const alternate = !isPodium && index % 2 === 1

  const cardContent = (
    <div
      className={[
        'group/card overflow-visible rounded-lg border border-old-money-200 bg-cream-50 transition-all duration-200 ease-in-out hover:scale-[1.01] hover:shadow-md hover:bg-old-money-100/80 dark:border-charcoal-500 dark:bg-charcoal-800/40 dark:hover:bg-charcoal-700/80 dark:hover:shadow-lg',
        result.dog_id ? 'cursor-pointer' : '',
        accent,
        alternate ? 'bg-white/60 dark:bg-charcoal-800/25' : '',
      ].filter(Boolean).join(' ')}
    >
      <div className="flex items-center gap-2 p-1.5 md:gap-3 md:p-2">
        <ResultSummary result={result} />

        <div className="ml-auto flex-shrink-0 pl-1">
          <ResultScorePanel result={result} />
        </div>
      </div>

      <div className="border-t border-old-money-100 px-1.5 pb-1.5 dark:border-charcoal-600 md:px-2 md:pb-2">
        <div className="mx-2 mr-2 md:mx-0 md:mr-4">
          <DetailPanel rawScores={rawScores} result={result} />
        </div>
      </div>
    </div>
  )

  if (result.dog_id) {
    return (
      <Link
        to={`/dog/${result.dog_id}`}
        className="block no-underline cursor-pointer"
        aria-label={`Открыть профиль собаки ${result.name_ru || result.name_lat}`}
      >
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
