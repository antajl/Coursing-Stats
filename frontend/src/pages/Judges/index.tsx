import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJudges } from '../../hooks/useApi'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'

export default function Judges() {
  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [sortField, setSortField] = useState('total_evaluations')
  const [sortDirection, setSortDirection] = useState('desc')

  // React Query hook
  const { data: judgesData, isLoading: loading } = useJudges(filterBreed, filterDiscipline)

  const judges = judgesData?.success ? (Array.isArray(judgesData.data?.judges) ? judgesData.data.judges : (Array.isArray(judgesData.data) ? judgesData.data : [])) : []
  const availableBreeds = judgesData?.success ? (Array.isArray(judgesData.data?.available_breeds) ? judgesData.data.available_breeds : []) : []

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedJudges = [...judges].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    
    if (aVal === null || aVal === undefined) aVal = 0
    if (bVal === null || bVal === undefined) bVal = 0
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  if (loading) {
    return <SkeletonLoader variant="card" count={4} />
  }

  return (
    <div className="p-4">
      {/* Фильтры */}
      <div className="mb-6 rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-4 shadow-md md:p-6">
        <div className="flex gap-2 md:gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-2 block text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">Порода</label>
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
            >
              <option value="">Все породы</option>
              {availableBreeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="mb-2 block text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">Дисциплина</label>
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
            >
              <option value="">Все дисциплины</option>
              <option value="coursing">Курсинг</option>
              <option value="bzmp">БЗМП</option>
              <option value="racing">Бега</option>
            </select>
          </div>
        </div>
      </div>

      {/* Список судей */}
      <div className="overflow-hidden rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-md">
        {sortedJudges.length === 0 ? (
          <EmptyState
            title="Судьи не найдены"
            description="Попробуйте изменить фильтры"
          />
        ) : (
          <>
        <div className="md:hidden space-y-3 p-3 min-w-[320px]">
          {sortedJudges.map((judge) => (
              <div 
                key={judge.id} 
                className="bg-old-money-50 dark:bg-charcoal-700 rounded-xl p-4 hover:bg-old-money-100 dark:hover:bg-charcoal-600 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <Link 
                    to={`/judges/${encodeURIComponent(judge.id)}`} 
                    className="text-base font-bold text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300 hover:underline"
                  >
                    {judge.name}
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2">
                    <div className="text-gray-500 dark:text-gray-400">Оцениваний</div>
                    <div className="font-bold text-old-money-800 dark:text-old-money-300">{judge.total_evaluations_count || 0}</div>
                  </div>
                  <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2">
                    <div className="text-gray-500 dark:text-gray-400">Всего оценок</div>
                    <div className="font-bold text-old-money-800 dark:text-old-money-300">{judge.total_evaluations || 0}</div>
                  </div>
                  <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2">
                    <div className="text-gray-500 dark:text-gray-400">Средняя</div>
                    <div className="font-bold text-old-money-800 dark:text-old-money-300">{judge.avg_score ? judge.avg_score.toFixed(2) : '-'}</div>
                  </div>
                  <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2">
                    <div className="text-gray-500 dark:text-gray-400">Пород</div>
                    <div className="font-bold text-old-money-800 dark:text-old-money-300">{judge.unique_breeds || 0}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full divide-y divide-old-money-200 table-auto min-w-[800px]">
          <thead className="border-b border-old-money-300 dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-700">
            <tr>
              <th 
                className="cursor-pointer px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('name')}
              >
                Судья {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('total_evaluations_count')}
              >
                Оцениваний {sortField === 'total_evaluations_count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('total_evaluations')}
              >
                Всего оценок {sortField === 'total_evaluations' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('avg_score')}
              >
                Средняя оценка {sortField === 'avg_score' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('unique_breeds')}
              >
                Пород {sortField === 'unique_breeds' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('unique_disciplines')}
              >
                Дисциплин {sortField === 'unique_disciplines' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
            {judges.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-old-money-600 dark:text-old-money-400">
                  Нет данных о судьях
                </td>
              </tr>
            ) : (
              sortedJudges.map((judge) => (
                <tr 
                  key={judge.id} 
                  className="hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4 text-sm text-old-money-800 dark:text-old-money-300 font-medium">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block h-full w-full text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300 hover:underline">
                      {judge.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block h-full w-full text-old-money-800 dark:text-old-money-300 transition-colors hover:text-camel-700 dark:hover:text-camel-400">
                      {judge.total_evaluations_count || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block h-full w-full text-old-money-800 dark:text-old-money-300 transition-colors hover:text-camel-700 dark:hover:text-camel-400">
                      {judge.total_evaluations || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block h-full w-full text-old-money-800 dark:text-old-money-300 transition-colors hover:text-camel-700 dark:hover:text-camel-400">
                      {judge.avg_score ? judge.avg_score.toFixed(2) : '-'}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block h-full w-full text-old-money-800 dark:text-old-money-300 transition-colors hover:text-camel-700 dark:hover:text-camel-400">
                      {judge.unique_breeds || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800 dark:text-old-money-300">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block h-full w-full text-old-money-800 dark:text-old-money-300 transition-colors hover:text-camel-700 dark:hover:text-camel-400">
                      {judge.unique_disciplines || 0}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
