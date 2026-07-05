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

  return (
    <details
      className={[
        'group overflow-visible rounded-lg border border-old-money-200 bg-cream-50 transition-colors dark:border-charcoal-500 dark:bg-charcoal-800/40',
        'open:border-t-old-money-300 open:border-r-old-money-300 open:border-b-old-money-300 open:bg-white dark:open:border-t-charcoal-400 dark:open:border-r-charcoal-400 dark:open:border-b-charcoal-400 dark:open:bg-charcoal-800',
        accent,
        alternate ? 'bg-white/60 dark:bg-charcoal-800/25' : '',
      ].filter(Boolean).join(' ')}
    >
      <summary className="list-none cursor-pointer">
        <div className="flex items-center gap-2 p-2 transition-colors hover:bg-old-money-100/80 dark:hover:bg-charcoal-700/80 md:gap-3 md:p-3">
          <ResultSummary result={result} />

          <div className="ml-auto flex-shrink-0 pl-1">
            <ResultScorePanel result={result} />
          </div>
        </div>
      </summary>

      <div className="border-t border-old-money-100 px-2 pb-2 dark:border-charcoal-600 md:px-3 md:pb-3">
        <div className="mx-2 mr-2 md:mx-0 md:mr-4">
          <DetailPanel rawScores={rawScores} result={result} />
        </div>
      </div>
    </details>
  )
}
