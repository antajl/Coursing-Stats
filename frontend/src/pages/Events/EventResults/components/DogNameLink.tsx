import { Link } from 'react-router-dom'
import type { Result } from '../types'

interface DogNameLinkProps {
  result: Result
}

export default function DogNameLink({ result }: DogNameLinkProps) {
  const name = result.name_ru || result.name_lat || ''
  const parts = name.split('/')

  if (parts.length > 1) {
    return (
      <>
        <div className="flex items-center gap-1">
          <span className="min-w-0 break-words text-sm font-medium text-old-money-800 dark:text-old-money-300 md:text-base">
            {parts[0].trim()}
          </span>
          <Link
            to={`/dog/${result.dog_id}`}
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-3 h-3 text-old-money-400 dark:text-old-money-500 hover:text-camel-600 dark:hover:text-camel-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>
        <span className="break-words text-xs text-old-money-600 dark:text-old-money-400">
          {parts[1].trim()}
        </span>
      </>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="min-w-0 break-words text-sm font-medium text-old-money-800 dark:text-old-money-300 md:text-base">
        {name}
      </span>
      <Link
        to={`/dog/${result.dog_id}`}
        className="flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3 h-3 text-old-money-400 dark:text-old-money-500 hover:text-camel-600 dark:hover:text-camel-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
    </div>
  )
}
