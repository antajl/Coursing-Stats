import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SkeletonLoader from '../components/SkeletonLoader'
import ErrorState from '../components/ErrorState'

const API_URL = 'http://localhost:8787'

export default function DoninoDogProfile() {
  const { name, breed } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDogData() {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`)
        const result = await response.json()
        
        if (result.success) {
          setData(result.data)
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch dog data')
        }
      } catch (err) {
        setError('Failed to fetch dog data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (name && breed) {
      fetchDogData()
    }
  }, [name, breed])

  if (loading) {
    return <SkeletonLoader message="Загрузка данных о собаке..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
        <ErrorState title="Ошибка" message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
        <ErrorState title="Данные не найдены" message="Собака не найдена в базе данных" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/speed-records')}
            className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400"
          >
            ← Назад к рекордам
          </button>
        </div>

        {/* Dog Info */}
        <div className="mb-6 rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-2">
            {data.name}
          </h1>
          <p className="text-lg text-old-money-600 dark:text-old-money-400">{data.breed}</p>
        </div>

        {/* Speed Records Stats */}
        {data.speedStats.total > 0 && (
          <div className="mb-6 rounded-2xl border-2 border-camel-200 dark:border-camel-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Замер скорости (350 метров)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшая скорость</div>
                <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{data.speedStats.bestSpeed.toFixed(1)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
              </div>
              <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Средняя скорость</div>
                <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{data.speedStats.avgSpeed.toFixed(1)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
              </div>
              <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Всего замеров</div>
                <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{data.speedStats.total}</div>
              </div>
            </div>

            {/* Speed Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px] md:min-w-[600px]">
                <thead>
                  <tr className="text-left text-old-money-600 dark:text-old-money-400">
                    <th className="pb-1 pr-2">Дата</th>
                    <th className="pb-1 pr-2">Скорость</th>
                    <th className="pb-1 pr-2">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
                  {data.speedRecords.map((record, idx) => (
                    <tr key={idx} className="hover:bg-cream-50 dark:hover:bg-charcoal-700 transition-colors">
                      <td className="px-2 py-2 text-old-money-800 dark:text-old-money-300">{record.date}</td>
                      <td className="px-2 py-2 text-old-money-800 dark:text-old-money-300 font-semibold">{record.speed_km_h.toFixed(1)} км/ч</td>
                      <td className="px-2 py-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'new' ? 'bg-green-100 text-green-800' :
                          record.status === 'improved' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status === 'new' ? 'Новый' :
                           record.status === 'improved' ? 'Улучшение' :
                           'Обычный'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coursing Records Stats */}
        {data.coursingStats.total > 0 && (
          <div className="mb-6 rounded-2xl border-2 border-camel-200 dark:border-camel-600 bg-white dark:bg-charcoal-800 p-5 shadow-md md:p-6">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100 mb-4">Бега борзых (350 метров)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
                <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшее время</div>
                <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{data.coursingStats.bestTime.toFixed(2)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">сек</span></div>
              </div>
              <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Среднее время</div>
                <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{data.coursingStats.avgTime.toFixed(2)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">сек</span></div>
              </div>
              <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
                <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Всего забегов</div>
                <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{data.coursingStats.total}</div>
              </div>
            </div>

            {/* Coursing Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px] md:min-w-[600px]">
                <thead>
                  <tr className="text-left text-old-money-600 dark:text-old-money-400">
                    <th className="pb-1 pr-2">Дата</th>
                    <th className="pb-1 pr-2">Время</th>
                    <th className="pb-1 pr-2">Скорость</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
                  {data.coursingRecords.map((record, idx) => (
                    <tr key={idx} className="hover:bg-cream-50 dark:hover:bg-charcoal-700 transition-colors">
                      <td className="px-2 py-2 text-old-money-800 dark:text-old-money-300">{record.date}</td>
                      <td className="px-2 py-2 text-old-money-800 dark:text-old-money-300 font-semibold">{record.time_seconds.toFixed(2)} сек</td>
                      <td className="px-2 py-2 text-old-money-800 dark:text-old-money-300">{record.speed_km_h.toFixed(1)} км/ч</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data.speedStats.total === 0 && data.coursingStats.total === 0 && (
          <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-6 text-center">
            <p className="text-old-money-600 dark:text-old-money-400">Нет записей для этой собаки</p>
          </div>
        )}
      </div>
    </div>
  )
}
