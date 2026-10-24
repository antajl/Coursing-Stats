import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEvent, getEventResults } from '../../../lib/staticData'
import ErrorState from '../../../components/ErrorState'
import SkeletonLoader from '../../../components/SkeletonLoader'
import EventHeader from './EventHeader'
import ResultsSection from './ResultsSection'
import { SEO } from '../../../components/SEO'
import { JsonLd, breadcrumbListSchema, sportsEventSchema } from '../../../components/JsonLd'
import { getEventHeadline } from '../eventListUtils'
import { isLocalDev } from '../../../lib/env'
import type { Event, Result } from './types'

export default function EventResults() {
  const { id } = useParams()
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
          getEvent(id || ''),
          getEventResults(id || ''),
        ])

        if (!eventResult.success) {
          setError('Не удалось загрузить данные о событии')
        }

        if (eventResult.success && eventResult.data) {
          setEvent(eventResult.data as Event)
        }
        if (resultsResult.success && resultsResult.data) {
          setResults(
            Array.isArray(resultsResult.data)
              ? (resultsResult.data as unknown as Result[])
              : [],
          )
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

  // Same content width as ranking / dog profile: only main#main-content padding (no extra p-*).
  if (loading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <SkeletonLoader variant="card" count={3} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <ErrorState
          title="Событие не найдено"
          message={`ID: ${id}`}
          action={
            <Link
              to="/competitions?tab=archive"
              className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:border-camel-400 hover:bg-camel-50"
            >
              К архиву соревнований
            </Link>
          }
        />
      </div>
    )
  }

  const eventType =
    event.competition_kind === 'coursing'
      ? 'курсинг'
      : event.competition_kind === 'racing'
        ? 'бега борзых'
        : event.competition_kind === 'bzmp'
          ? 'БЗМП'
          : 'соревнования'
  const rawDate = event.event_date || event.date_start
  const eventDate = rawDate
    ? (() => {
        const [year, month, day] = rawDate.split('-')
        if (!year || !month || !day) return rawDate
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      })()
    : ''
  const rawHeadline = getEventHeadline({
    id: Number(id) || 0,
    date_start: event.date_start || '',
    rank_label: event.rank_label,
    title: event.title,
    full_title: event.full_title,
    competition_kind: event.competition_kind,
    competition_type: event.competition_type,
  })
  const eventName = rawHeadline.replace(/[\s\-·—]+$/, '')
  const dateSuffix = eventDate ? ` (${eventDate})` : ''
  const description = `Результаты забегов: ${eventType}${eventDate ? ` ${eventDate}` : ''}${event.location ? ` в ${event.location}` : ''}. ${results.length} участников. Баллы за забеги, победители и сертификаты на Coursing Stats.`

  return (
    <>
      <SEO
        title={`${eventName}${dateSuffix} — результаты соревнований`}
        description={description}
        keywords={`${eventName}, ${eventType}, ${event.location || ''}, результаты соревнований, результаты забегов, статистика, РКФ, ${eventDate}`}
        canonicalUrl={`https://coursing-stats.ru/event/${id}`}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Соревнования', url: '/competitions' },
              { name: eventName, url: `/event/${id}` },
            ]),
            sportsEventSchema({
              url: `https://coursing-stats.ru/event/${id}`,
              name: eventName,
              startDate: event.date_start || event.event_date || null,
              location: event.location || null,
              description,
            }),
          ],
        }}
      />
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        {error && (
          <ErrorState
            title="Ошибка загрузки"
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        <EventHeader event={event} results={results} />
        <ResultsSection results={results} />

        <div className="mt-8 border-t border-old-money-200/60 pt-4 pb-4 text-center">
          <p className="text-xs leading-relaxed text-charcoal-500">
            Сведения протокола систематизированы на основе официальных публикаций организаторов состязаний,
            полевых секретариатов и материалов ProCoursing.ru.
          </p>
        </div>
      </div>
    </>
  )
}
