import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import ErrorState from '../../../components/ErrorState'
import SkeletonLoader from '../../../components/SkeletonLoader'
import EventHeader from './EventHeader'
import ResultsSection from './ResultsSection'
import type { Event, Result } from './types'

export default function EventResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [eventResult, resultsResult] = await Promise.all([
          api.getEvent(id),
          api.getEventResults(id)
        ])

        if (eventResult.source === 'mock' || resultsResult.source === 'mock') {
          setError('Не удалось загрузить данные с сервера. Используются демо-данные.')
        }

        if (eventResult.data) {
          setEvent(eventResult.data)
        }
        if (resultsResult.data) {
          setResults(Array.isArray(resultsResult.data) ? resultsResult.data : [])
        }
      } catch (err) {
        console.error('Error fetching event data:', err)
        setError(`Ошибка при загрузке: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6 border-t-2 border-x-2 border-b-2 border-old-money-200 dark:border-charcoal-600">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6 border-t-2 border-x-2 border-b-2 border-old-money-200 dark:border-charcoal-600">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Событие не найдено"
            message={`ID: ${id}`}
            action={
              <Link to="/" className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400">
                На главную
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-4 md:p-6 border-t-2 border-x-2 border-b-2 border-old-money-200 dark:border-charcoal-600">
      <div className="max-w-4xl mx-auto">
        {error && (
          <ErrorState
            title="Ошибка загрузки"
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        <EventHeader event={event} results={results} onBack={() => navigate(-1)} />
        <ResultsSection results={results} />
      </div>
    </div>
  )
}
