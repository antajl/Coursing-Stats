import DetailPanel from './details/DetailPanel'
import ResultSummary from './ResultSummary'
import { parseRawScores } from './utils'
import type { Result } from './types'

interface ResultCardProps {
  result: Result
  index: number
}

export default function ResultCard({ result, index }: ResultCardProps) {
  const rawScores = parseRawScores(result.raw_scores_json)

  return (
    <details className="group">
      <summary className="list-none cursor-pointer">
        <div className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-old-money-100 dark:hover:bg-charcoal-700 transition-colors">
          <ResultSummary result={result} />

          <div className="flex-shrink-0 text-old-money-400 dark:text-old-money-500 group-open:rotate-180 transition-transform">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </summary>

      <div className="mt-2 ml-10 md:ml-14 mr-4 md:mr-20">
        <DetailPanel rawScores={rawScores} result={result} />
      </div>
    </details>
  )
}
