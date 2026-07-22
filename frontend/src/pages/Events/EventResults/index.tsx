import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import ErrorState from '../../../components/ErrorState'
import SkeletonLoader from '../../../components/SkeletonLoader'
import EventHeader from './EventHeader'
import ResultsSection from './ResultsSection'
import { SEO } from '../../../components/SEO'
import { getEventHeadline } from '../eventListUtils'
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
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Событие не найдено"
            message={`ID: ${id}`}
            action={
              <Link to="/competitions?tab=calendar" className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400">
                К календарю
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  // SEO данные
  const eventType = event.competition_kind === 'coursing' ? 'курсинг' : event.competition_kind === 'racing' ? 'бега борзых' : event.competition_kind === 'bzmp' ? 'БЗМП' : 'соревнования'
  const eventDate = event.event_date ? (() => {
    const [year, month, day] = event.event_date.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  })() : ''
  const eventName = getEventHeadline({
    id: Number(id) || 0,
    date_start: event.date_start || '',
    rank_label: event.rank_label,
    title: event.title,
    full_title: event.full_title,
    competition_kind: event.competition_kind,
    competition_type: event.competition_type,
  })
  const description = `Результаты соревнований по ${eventType} ${eventDate} в ${event.location || ''}. ${results.length} участников. Статистика и результаты.`

  return (
    <>
      <SEO
        title={`${eventName} - ${eventDate}`}
        description={description}
        keywords={`${eventName}, ${eventType}, ${event.location}, результаты, статистика, РКФ, ${eventDate}`}
      />
      <div className="p-4 md:p-6">
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
    </>
  )
}
