import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminFetch, getAdminApiBase, invalidatePublicEventCaches, parseAdminResponse } from './adminApi'
import DogSearchSelect from './DogSearchSelect'
import AdminResultsSection from './AdminResultsSection'

interface Result {
  id: number
  dog_id: number
  name_lat: string
  name_ru: string
  breed: string
  breed_class: string
  placement: number
  total_score: number
  qualification: string
  vc: string
  status: string
  raw_scores_json?: string | null
}

interface Event {
  id: number
  year: number
  date_start: string
  date_end?: string | null
  rank_label?: string | null
  competition_kind?: string | null
  event_type?: string
  title?: string | null
  full_title?: string | null
  location?: string | null
  host_club?: string | null
  protocol_location?: string | null
  event_date?: string | null
  judges?: string | null
  results_url?: string | null
}

const adminLabel = 'block text-xs font-medium text-charcoal-600 dark:text-charcoal-400 mb-1'
const adminInput =
  'w-full px-3 py-1.5 text-sm border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100'
const adminCard =
  'bg-white dark:bg-charcoal-800 rounded-xl shadow-sm border border-om-200 dark:border-charcoal-700 p-4 mb-5'
const adminSaveBtn =
  'px-4 py-1.5 text-sm bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors disabled:opacity-50 shrink-0'

export default function EventEdit() {
  const { id } = useParams<{ id: string }>()

  const [event, setEvent] = useState<Event | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingProtocol, setSavingProtocol] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [savingResultId, setSavingResultId] = useState<number | null>(null)
  const [showAddResult, setShowAddResult] = useState(false)
  const [newResult, setNewResult] = useState({
    dog_id: 0,
    breed_class: '',
    placement: 0,
    total_score: 0,
    qualification: '',
    vc: '',
    status: 'finished'
  })

  useEffect(() => {
    loadEventData()
  }, [id])

  const reloadEvent = async () => {
    const eventResponse = await fetch(`${getAdminApiBase()}/api/competitions/${id}`)
    if (!eventResponse.ok) return null
    const eventData = await eventResponse.json()
    if (eventData.data) setEvent(eventData.data)
    return eventData.data
  }

  const loadEventData = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setError('Требуется авторизация')
        setLoading(false)
        return
      }

      // Load event details
      const eventResponse = await fetch(`${getAdminApiBase()}/api/competitions/${id}`)
      if (!eventResponse.ok) {
        throw new Error('Ошибка загрузки события')
      }
      const eventData = await eventResponse.json()
      setEvent(eventData.data)

      const resultsResponse = await adminFetch(`/api/admin/events/${id}/results`)
      const resultsParsed = await parseAdminResponse(resultsResponse)
      if (!resultsParsed.ok) {
        throw new Error(resultsParsed.error || 'Ошибка загрузки результатов')
      }
      setResults((resultsParsed.data?.data as Result[]) || [])
    } catch (err) {
      setError('Ошибка загрузки данных')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const patchEvent = async (
    fields: Partial<Event>,
    setSaving: (v: boolean) => void,
    label: string
  ) => {
    if (!event) return

    setSaving(true)
    setSaveMessage(null)
    try {
      const response = await adminFetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify(fields),
      })

      const parsed = await parseAdminResponse(response)
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Ошибка сохранения')
      }

      await reloadEvent()
      await invalidatePublicEventCaches(event.id)
      setSaveMessage(`${label} сохранён`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения'
      alert(msg)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleProtocolSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!event) return
    patchEvent(
      {
        full_title: event.full_title ?? '',
        title: event.title ?? '',
        protocol_location: event.protocol_location ?? '',
        judges: event.judges ?? '',
        results_url: event.results_url ?? '',
      },
      setSavingProtocol,
      'Протокол'
    )
  }

  const handleResultUpdate = async (resultId: number, field: string, value: unknown) => {
    setSavingResultId(resultId)
    try {
      const response = await adminFetch(`/api/admin/results/${resultId}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: value }),
      })
      const parsed = await parseAdminResponse(response)
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Ошибка сохранения')
      }

      setResults(results.map(r => r.id === resultId ? { ...r, [field]: value } : r))
      if (event) await invalidatePublicEventCaches(event.id)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения'
      alert(msg)
      console.error(err)
      throw err
    } finally {
      setSavingResultId(null)
    }
  }

  const handleUpdateRawScores = async (resultId: number, rawScoresJson: string) => {
    await handleResultUpdate(resultId, 'raw_scores_json', rawScoresJson)
  }

  const handleGroupRename = async (oldGroupKey: string, newGroupKey: string) => {
    const affected = results.filter((r) => (r.breed_class || 'Другие') === oldGroupKey)
    for (const r of affected) {
      const response = await adminFetch(`/api/admin/results/${r.id}`, {
        method: 'PUT',
        body: JSON.stringify({ breed_class: newGroupKey }),
      })
      const parsed = await parseAdminResponse(response)
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Ошибка переименования группы')
      }
    }
    setResults((prev) =>
      prev.map((r) =>
        (r.breed_class || 'Другие') === oldGroupKey ? { ...r, breed_class: newGroupKey } : r
      )
    )
    if (event) await invalidatePublicEventCaches(event.id)
  }

  const handleResultDelete = async (resultId: number) => {
    if (!confirm('Удалить этот результат?')) return

    try {
      const response = await adminFetch(`/api/admin/results/${resultId}`, {
        method: 'DELETE',
      })
      const parsed = await parseAdminResponse(response)
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Ошибка удаления')
      }

      setResults(results.filter(r => r.id !== resultId))
      if (event) await invalidatePublicEventCaches(event.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка удаления')
      console.error(err)
    }
  }

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !newResult.dog_id) {
      alert('Выберите собаку')
      return
    }

    try {
      const response = await adminFetch('/api/admin/results', {
        method: 'POST',
        body: JSON.stringify({
          event_id: parseInt(id!, 10),
          ...newResult,
        }),
      })
      const parsed = await parseAdminResponse(response)
      if (!parsed.ok) {
        throw new Error(parsed.error || 'Ошибка создания')
      }

      await loadEventData()
      if (event) await invalidatePublicEventCaches(event.id)
      setShowAddResult(false)
      setNewResult({
        dog_id: 0,
        breed_class: '',
        placement: 0,
        total_score: 0,
        qualification: '',
        vc: '',
        status: 'finished'
      })
    } catch (err) {
      alert('Ошибка создания результата')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-camel-300 border-t-camel-600"></div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/admin" className="text-camel-600 hover:text-camel-700">
            ← Назад к списку
          </Link>
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error || 'Событие не найдено'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/admin" className="text-camel-600 hover:text-camel-700">
            ← Назад к списку
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-2">
          Результаты события #{event.id}
        </h1>
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-6">
          Проверка на сайте:{' '}
          <Link to={`/procoursing?year=${event.year}`} className="text-camel-600 hover:underline">
            календарь {event.year}
          </Link>
          {' · '}
          <Link to={`/event/${event.id}`} className="text-camel-600 hover:underline">
            страница результатов
          </Link>
        </p>

        {saveMessage && (
          <p className="mb-6 text-sm text-forest-700 dark:text-forest-300 bg-forest-50 dark:bg-forest-900/30 border border-forest-200 dark:border-forest-800 rounded-lg px-4 py-2">
            {saveMessage}
          </p>
        )}

        {/* Страница результатов */}
        <div className={adminCard}>
          <form onSubmit={handleProtocolSave}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-lg font-semibold text-charcoal-900 dark:text-charcoal-100">
                Страница результатов
              </h2>
              <button type="submit" disabled={savingProtocol} className={adminSaveBtn}>
                {savingProtocol ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className={adminLabel}>Полное название (H1)</label>
                <textarea
                  rows={2}
                  value={event.full_title ?? ''}
                  onChange={(e) => setEvent({ ...event, full_title: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Краткое название / клуб</label>
                <input
                  type="text"
                  value={event.title ?? ''}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>Локация в протоколе</label>
                <input
                  type="text"
                  value={event.protocol_location ?? ''}
                  onChange={(e) => setEvent({ ...event, protocol_location: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div>
                <label className={adminLabel}>URL результатов</label>
                <input
                  type="url"
                  value={event.results_url ?? ''}
                  onChange={(e) => setEvent({ ...event, results_url: e.target.value })}
                  className={adminInput}
                />
              </div>
              <div className="md:col-span-2">
                <label className={adminLabel}>Судьи</label>
                <textarea
                  rows={2}
                  value={event.judges ?? ''}
                  onChange={(e) => setEvent({ ...event, judges: e.target.value })}
                  className={adminInput}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Results Table */}
        <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-sm border border-om-200 dark:border-charcoal-700 overflow-hidden">
          <div className="p-6 border-b border-om-200 dark:border-charcoal-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-charcoal-100">
              Результаты ({results.length})
            </h2>
            <button
              onClick={() => setShowAddResult(true)}
              className="px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors text-sm"
            >
              + Добавить результат
            </button>
          </div>
          <div className="overflow-x-auto">
            <AdminResultsSection
              results={results}
              savingResultId={savingResultId}
              onUpdate={handleResultUpdate}
              onUpdateRawScores={handleUpdateRawScores}
              onDelete={handleResultDelete}
              onGroupRename={handleGroupRename}
            />
          </div>
        </div>

        {/* Add Result Modal */}
        {showAddResult && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-om-200 dark:border-charcoal-700 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-charcoal-900 dark:text-charcoal-100">
                  Добавить результат
                </h3>
                <button
                  onClick={() => setShowAddResult(false)}
                  className="text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-charcoal-100"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleAddResult} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Собака
                  </label>
                  <DogSearchSelect
                    value={newResult.dog_id}
                    onChange={(dogId) => setNewResult({ ...newResult, dog_id: dogId })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Класс
                  </label>
                  <input
                    type="text"
                    value={newResult.breed_class}
                    onChange={(e) => setNewResult({ ...newResult, breed_class: e.target.value })}
                    className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                    placeholder="Стандартная - Сука"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                      Место
                    </label>
                    <input
                      type="number"
                      value={newResult.placement}
                      onChange={(e) => setNewResult({ ...newResult, placement: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                      Очки
                    </label>
                    <input
                      type="number"
                      value={newResult.total_score}
                      onChange={(e) => setNewResult({ ...newResult, total_score: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Квалификация
                  </label>
                  <input
                    type="text"
                    value={newResult.qualification}
                    onChange={(e) => setNewResult({ ...newResult, qualification: e.target.value })}
                    className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                    placeholder="CACL, RegCACL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    VC
                  </label>
                  <input
                    type="text"
                    value={newResult.vc}
                    onChange={(e) => setNewResult({ ...newResult, vc: e.target.value })}
                    className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Статус
                  </label>
                  <select
                    value={newResult.status}
                    onChange={(e) => setNewResult({ ...newResult, status: e.target.value })}
                    className="w-full px-4 py-2 border border-om-200 rounded-lg focus:ring-2 focus:ring-camel-500 focus:border-transparent dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100"
                  >
                    <option value="finished">Завершено</option>
                    <option value="dns">Не явился</option>
                    <option value="dq">Дисквалифицирован</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddResult(false)}
                    className="px-4 py-2 border border-om-200 rounded-lg hover:bg-om-50 dark:border-charcoal-600 dark:hover:bg-charcoal-700 dark:text-charcoal-100"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
                  >
                    Добавить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
