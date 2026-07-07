import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminCalendarForm, { type AdminCalendarFields } from './AdminCalendarForm'
import { adminFetch, invalidatePublicEventCaches, parseAdminResponse } from './adminApi'
import { sortAdminEventsByDateAsc } from './adminEventUtils'

interface AdminEvent extends AdminCalendarFields {
  year: number
  title: string
  event_type: string
  competition_kind: string
  results_url: string
}

export default function Admin() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('2025')
  const [savingEventId, setSavingEventId] = useState<number | null>(null)
  const [savedEventId, setSavedEventId] = useState<number | null>(null)
  const [adminToken, setAdminToken] = useState<string>(() => {
    return localStorage.getItem('admin_token') || ''
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  const yearOptions = Array.from({ length: 11 }, (_, i) => 2025 - i)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      setAdminToken(token)
      verifyToken(token)
    } else {
      setIsAuthenticated(false)
      setIsCheckingToken(false)
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    const trimmed = token.trim()
    if (!trimmed) {
      setIsAuthenticated(false)
      setError('Введите токен')
      setIsCheckingToken(false)
      setLoading(false)
      return
    }

    try {
      const response = await adminFetch('/api/admin/events', {
        headers: { 'X-Admin-Token': trimmed },
      })

      const parsed = await parseAdminResponse(response)
      if (parsed.ok) {
        localStorage.setItem('admin_token', trimmed)
        setAdminToken(trimmed)
        setIsAuthenticated(true)
        setEvents(sortAdminEventsByDateAsc((parsed.data?.data as AdminEvent[]) || []))
        setError(null)
      } else {
        setIsAuthenticated(false)
        localStorage.removeItem('admin_token')
        setAdminToken('')
        setError(
          response.status === 401
            ? 'Неверный токен авторизации'
            : parsed.error || `Ошибка сервера (${response.status})`
        )
      }
    } catch (err) {
      setIsAuthenticated(false)
      setError('Ошибка соединения с API. Запущен ли backend на :8787?')
      console.error(err)
    } finally {
      setIsCheckingToken(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && !isCheckingToken) {
      loadEvents()
    }
  }, [selectedYear, isAuthenticated, isCheckingToken])

  const loadEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      const path = selectedYear
        ? `/api/admin/events?year=${selectedYear}`
        : '/api/admin/events'

      const response = await adminFetch(path)
      const parsed = await parseAdminResponse(response)

      if (!parsed.ok) {
        if (response.status === 401) {
          setError('Неверный токен авторизации')
          setIsAuthenticated(false)
          localStorage.removeItem('admin_token')
          setAdminToken('')
        } else {
          setError(parsed.error || 'Ошибка загрузки данных')
        }
        setEvents([])
        return
      }

      const list = (parsed.data?.data as AdminEvent[]) || []
      setEvents(sortAdminEventsByDateAsc(list))
      setError(null)
    } catch (err) {
      setError('Ошибка соединения с API. Запущен ли backend (npm run dev)?')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateEventFields = (eventId: number, patch: Partial<AdminCalendarFields>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e))
    )
  }

  const handleCalendarSave = async (event: AdminEvent, e: React.FormEvent) => {
    e.preventDefault()
    setSavingEventId(event.id)
    setSavedEventId(null)

    try {
      const response = await adminFetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          date_start: event.date_start,
          date_end: event.date_end || null,
          rank_label: event.rank_label ?? '',
          location: event.location ?? '',
          host_club: event.host_club ?? '',
        }),
      })

      const parsed = await parseAdminResponse(response)
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Ошибка сохранения')
      }

      await invalidatePublicEventCaches(event.id)
      setSavedEventId(event.id)
      setTimeout(() => setSavedEventId((id) => (id === event.id ? null : id)), 2000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сохранения')
      console.error(err)
    } finally {
      setSavingEventId(null)
    }
  }

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsCheckingToken(true)
    verifyToken(adminToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setAdminToken('')
    setIsAuthenticated(false)
    setEvents([])
    setError(null)
  }

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-8">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-camel-300 border-t-camel-600"></div>
            <p className="mt-4 text-charcoal-600 dark:text-charcoal-400">Проверка токена...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-6">
            Авторизация
          </h1>
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                ADMIN_API_TOKEN
              </label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full px-4 py-2 border border-old-money-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                placeholder="Введите токен"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 dark:text-charcoal-100">
            Админ-панель
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-charcoal-100"
          >
            Выйти
          </button>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
            Фильтр по году:
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-old-money-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
          >
            <option value="">Все годы (&lt; 2026)</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-camel-300 border-t-camel-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-charcoal-500 dark:text-charcoal-400">
            Нет событий для отображения
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white dark:bg-charcoal-800 rounded-xl shadow-sm border border-old-money-200 dark:border-charcoal-700 overflow-hidden"
              >
                <AdminCalendarForm
                  event={event}
                  onChange={(patch) => updateEventFields(event.id, patch)}
                  onSave={(e) => void handleCalendarSave(event, e)}
                  saving={savingEventId === event.id}
                  headerExtra={
                    <>
                      {savedEventId === event.id && (
                        <span className="text-xs text-forest-600 dark:text-forest-400">сохранено</span>
                      )}
                      <Link
                        to={`/admin/events/${event.id}`}
                        className="text-sm text-camel-600 hover:text-camel-700 font-medium"
                      >
                        Результаты →
                      </Link>
                    </>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
