import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Judges() {
  const [judges, setJudges] = useState([])
  const [availableBreeds, setAvailableBreeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [sortField, setSortField] = useState('total_evaluations')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    async function fetchJudges() {
      setLoading(true)
      setError(null)
      
      try {
        const result = await api.getJudges(filterBreed, filterDiscipline)
        if (result.success) {
          setJudges(result.data?.judges || result.data || [])
          setAvailableBreeds(result.data?.available_breeds || [])
        } else {
          setError('Не удалось загрузить данные о судьях')
        }
      } catch (err) {
        console.error('Error fetching judges:', err)
        setError(`Ошибка при загрузке: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJudges()
  }, [filterBreed, filterDiscipline])

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
    return (
      <div className="text-center py-12 text-old-money-600">
        <div className="text-lg font-medium">Загрузка статистики судей...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <p className="font-medium">⚠️ {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-charcoal-800 mb-2">Статистика судей</h1>
        <p className="text-old-money-600">Анализ оценок по породам, дисциплинам и категориям</p>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg p-6 border border-old-money-200">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-old-money-700 mb-2">Порода</label>
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
            >
              <option value="">Все породы</option>
              {availableBreeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-old-money-700 mb-2">Дисциплина</label>
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
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
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-old-money-200">
        <table className="w-full divide-y divide-old-money-200 table-auto">
          <thead className="bg-gradient-to-r from-gold-200 to-old-money-200 border-b-2 border-old-money-300">
            <tr>
              <th 
                className="px-4 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('name')}
              >
                Судья {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('total_evaluations_count')}
              >
                Оцениваний {sortField === 'total_evaluations_count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('total_evaluations')}
              >
                Всего оценок {sortField === 'total_evaluations' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('avg_score')}
              >
                Средняя оценка {sortField === 'avg_score' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('unique_breeds')}
              >
                Пород {sortField === 'unique_breeds' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-4 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('unique_disciplines')}
              >
                Дисциплин {sortField === 'unique_disciplines' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-old-money-200">
            {judges.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-old-money-600">
                  Нет данных о судьях
                </td>
              </tr>
            ) : (
              sortedJudges.map((judge) => (
                <tr 
                  key={judge.id} 
                  className="hover:bg-old-money-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4 text-sm text-old-money-800 font-medium">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block w-full h-full text-gold-600 hover:text-gold-500 hover:underline">
                      {judge.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block w-full h-full text-old-money-800 hover:text-gold-600">
                      {judge.total_evaluations_count || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block w-full h-full text-old-money-800 hover:text-gold-600">
                      {judge.total_evaluations || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block w-full h-full text-old-money-800 hover:text-gold-600">
                      {judge.avg_score ? judge.avg_score.toFixed(2) : '-'}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block w-full h-full text-old-money-800 hover:text-gold-600">
                      {judge.unique_breeds || 0}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-old-money-800">
                    <Link to={`/judges/${encodeURIComponent(judge.id)}`} className="block w-full h-full text-old-money-800 hover:text-gold-600">
                      {judge.unique_disciplines || 0}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
