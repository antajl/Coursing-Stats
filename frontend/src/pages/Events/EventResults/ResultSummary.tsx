import PlacementBadge from './components/PlacementBadge'
import DogNameLink from './components/DogNameLink'
import QualificationBadges from './components/QualificationBadges'
import { displayStatusReason } from '../../../lib/statusReason'
import type { Result } from './types'

interface ResultSummaryProps {
  result: Result
}

export default function ResultSummary({ result }: ResultSummaryProps) {
  const isDisqualified = result.status === 'disqualified' || result.status === 'dns'
  const statusLabel = displayStatusReason(result.status_reason)

  return (
    <div className="flex flex-1 items-center gap-2 md:gap-4 min-w-0">
      <div className="flex-shrink-0">
        <PlacementBadge result={result} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <DogNameLink result={result} />
        </div>
        {!isDisqualified && result.qualification && (
          <QualificationBadges qualification={result.qualification} />
        )}
        {result.status === 'disqualified' && statusLabel && (
          <div className="md:hidden text-xs text-red-600 dark:text-red-400 italic mt-1">{statusLabel}</div>
        )}
        {result.status === 'dns' && (
          <div className="md:hidden text-xs text-gray-600 dark:text-gray-400 italic mt-1">Неявка</div>
        )}
      </div>

      <div className="flex-shrink-0 text-right md:text-right">
        {result.total_score ? (
          <div className="flex items-center justify-end gap-1 md:gap-2">
            {result.vc === '+' && (
              <span className="inline-block px-1 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">ВС</span>
            )}
            <div>
              <div className="text-base font-bold text-camel-700 dark:text-camel-400 md:text-lg">{result.total_score}</div>
              <div className="text-xs text-old-money-600 dark:text-old-money-400">баллов</div>
            </div>
          </div>
        ) : result.status === 'disqualified' && statusLabel ? (
          <div className="text-xs md:text-sm text-red-600 dark:text-red-400 italic md:text-right text-left md:block hidden">{statusLabel}</div>
        ) : result.status === 'dns' ? (
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 italic md:text-right text-left md:block hidden">Неявка</div>
        ) : null}
      </div>
    </div>
  )
}
