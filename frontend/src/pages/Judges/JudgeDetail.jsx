import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import React from 'react'

export default function JudgeDetail() {
  const { judgeId } = useParams()
  const [judgeData, setJudgeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterBreed, setFilterBreed] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [expandedBreed, setExpandedBreed] = useState(null)
  const [expandedDog, setExpandedDog] = useState(null)
  const [breedSortField, setBreedSortField] = useState('count')
  const [breedSortDirection, setBreedSortDirection] = useState('desc')
  const [criteriaSortField, setCriteriaSortField] = useState('count')
  const [criteriaSortDirection, setCriteriaSortDirection] = useState('desc')

  useEffect(() => {
    async function fetchJudgeDetails() {
      setLoading(true)
      setError(null)
      
      try {
        const result = await api.getJudgeDetails(judgeId, filterBreed, filterDiscipline)
        if (result.success) {
          setJudgeData(result.data)
        } else {
          setError('Не удалось загрузить данные о судье')
        }
      } catch (err) {
        console.error('Error fetching judge details:', err)
        setError(`Ошибка при загрузке: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchJudgeDetails()
  }, [judgeId, filterBreed, filterDiscipline])

  const handleBreedSort = (field) => {
    if (breedSortField === field) {
      setBreedSortDirection(breedSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setBreedSortField(field)
      setBreedSortDirection('desc')
    }
  }

  const handleCriteriaSort = (field) => {
    if (criteriaSortField === field) {
      setCriteriaSortDirection(criteriaSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setCriteriaSortField(field)
      setCriteriaSortDirection('desc')
    }
  }

  const sortedBreeds = judgeData?.breed_stats ? [...judgeData.breed_stats].sort((a, b) => {
    let aVal = a[breedSortField]
    let bVal = b[breedSortField]
    
    if (aVal === null || aVal === undefined) aVal = 0
    if (bVal === null || bVal === undefined) bVal = 0
    
    if (breedSortField === 'breed') {
      if (breedSortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    } else {
      if (breedSortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    }
  }) : []

  const sortedCriteria = judgeData?.criteria_stats ? [...judgeData.criteria_stats].sort((a, b) => {
    let aVal = a[criteriaSortField]
    let bVal = b[criteriaSortField]
    
    if (aVal === null || aVal === undefined) aVal = 0
    if (bVal === null || bVal === undefined) bVal = 0
    
    if (criteriaSortField === 'name') {
      if (criteriaSortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    } else {
      if (criteriaSortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    }
  }) : []

  if (loading) {
    return (
      <div className="text-center py-12 text-old-money-600">
        <div className="text-lg font-medium">Загрузка информации о судье...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <p className="font-medium">⚠️ {error}</p>
        </div>
        <Link to="/judges" className="text-gold-600 hover:text-gold-500 hover:underline">
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Вернуться к списку судей</span>
        </Link>
      </div>
    )
  }

  if (!judgeData) {
    return (
      <div className="text-center py-12">
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <p className="font-medium">⚠️ Судья не найден</p>
        </div>
        <Link to="/judges" className="text-gold-600 hover:text-gold-500 hover:underline">
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Вернуться к списку судей</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Link to="/judges" className="text-gold-600 hover:text-gold-500 hover:underline mb-4 inline-block">
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Вернуться к списку судей</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-charcoal-800 mt-2">{judgeData.judge_name}</h1>
      </div>

      {/* Фильтры */}
      <div className="mb-6 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-old-money-200">
        <div className="flex gap-2 md:gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-semibold text-old-money-700 mb-2">Порода</label>
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
            >
              <option value="">Все породы</option>
              {/* Будет заполнено из данных */}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
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

      {/* Общая статистика */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-old-money-200">
          <div className="text-sm text-old-money-600 mb-1">Всего оценок</div>
          <div className="text-3xl font-bold text-charcoal-800">{judgeData.total_evaluations || 0}</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-old-money-200">
          <div className="text-sm text-old-money-600 mb-1">Средняя оценка</div>
          <div className="text-3xl font-bold text-charcoal-800">{judgeData.avg_score ? judgeData.avg_score.toFixed(2) : '-'}</div>
        </div>
      </div>

      {/* Статистика по породам */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-old-money-200 mb-6">
        <h2 className="text-lg md:text-xl font-bold text-charcoal-800 mb-4">Статистика по породам</h2>
        {sortedBreeds && sortedBreeds.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {sortedBreeds.map((stat, idx) => (
                <div key={idx} className="bg-old-money-50 rounded-xl p-4">
                  <div 
                    className="flex justify-between items-center mb-3 cursor-pointer"
                    onClick={() => setExpandedBreed(expandedBreed === stat.breed ? null : stat.breed)}
                  >
                    <div className="font-bold text-old-money-800">{stat.breed}</div>
                    <div className="text-gold-600">{expandedBreed === stat.breed ? '▼' : '▶'}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Оцениваний</div>
                      <div className="font-bold text-old-money-800">{stat.evaluations_count || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Оценок</div>
                      <div className="font-bold text-old-money-800">{stat.count}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Средняя</div>
                      <div className="font-bold text-old-money-800">{stat.avg_score ? stat.avg_score.toFixed(2) : '-'}</div>
                    </div>
                  </div>
                  {expandedBreed === stat.breed && stat.dogs && stat.dogs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {stat.dogs.map((dog, dogIdx) => (
                        <div key={dogIdx} className="bg-white rounded-lg p-3">
                          <div 
                            className="flex justify-between items-center mb-2 cursor-pointer"
                            onClick={() => setExpandedDog(expandedDog === dogIdx ? null : dogIdx)}
                          >
                            <div className="text-sm font-medium text-old-money-800">
                              {dog.name}
                              {dog.name_ru && !dog.name.includes(dog.name_ru) && ` (${dog.name_ru})`}
                            </div>
                            <div className="text-gold-600 text-xs">{expandedDog === dogIdx ? '▼' : '▶'}</div>
                          </div>
                          {expandedDog === dogIdx && (
                            <div className="text-xs text-gray-600 mt-2">
                              Оцениваний: {dog.evaluations_count} | Средняя: {dog.avg_score ? dog.avg_score.toFixed(2) : '-'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full divide-y divide-old-money-200 min-w-[700px]">
            <thead>
              <tr>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleBreedSort('breed')}
                >
                  Порода {breedSortField === 'breed' && (breedSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleBreedSort('evaluations_count')}
                >
                  Оцениваний {breedSortField === 'evaluations_count' && (breedSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleBreedSort('count')}
                >
                  Оценок {breedSortField === 'count' && (breedSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleBreedSort('avg_score')}
                >
                  Средняя {breedSortField === 'avg_score' && (breedSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleBreedSort('min_score')}
                >
                  Мин {breedSortField === 'min_score' && (breedSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleBreedSort('max_score')}
                >
                  Макс {breedSortField === 'max_score' && (breedSortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedBreeds.map((stat, idx) => (
                <React.Fragment key={idx}>
                  <tr 
                    className="hover:bg-old-money-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedBreed(expandedBreed === stat.breed ? null : stat.breed)}
                  >
                    <td className="px-3 py-2 text-sm text-old-money-800 font-medium">
                      {stat.breed}
                      {expandedBreed === stat.breed ? ' ▼' : ' ▶'}
                    </td>
                    <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.evaluations_count || 0}</td>
                    <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.count}</td>
                    <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.avg_score ? stat.avg_score.toFixed(2) : '-'}</td>
                    <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.min_score || '-'}</td>
                    <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.max_score || '-'}</td>
                  </tr>
                  {expandedBreed === stat.breed && (
                    <tr>
                      <td colSpan="6" className="px-3 py-4 bg-old-money-50">
                        {stat.dogs && stat.dogs.length > 0 ? (
                          <table className="w-full divide-y divide-old-money-200">
                            <thead>
                              <tr>
                                <th className="px-3 py-1 text-left text-xs font-bold text-gold-700 uppercase">Собака</th>
                                <th className="px-3 py-1 text-center text-xs font-bold text-gold-700 uppercase">Оцениваний</th>
                                <th className="px-3 py-1 text-center text-xs font-bold text-gold-700 uppercase">Средняя</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stat.dogs.map((dog, dogIdx) => (
                                <React.Fragment key={dogIdx}>
                                  <tr 
                                    className="hover:bg-old-money-100 cursor-pointer transition-colors"
                                    onClick={() => setExpandedDog(expandedDog === dogIdx ? null : dogIdx)}
                                  >
                                    <td className="px-3 py-1 text-sm text-old-money-800">
                                      {dog.name}
                                      {dog.name_ru && !dog.name.includes(dog.name_ru) && ` (${dog.name_ru})`}
                                      {expandedDog === dogIdx ? ' ▼' : ' ▶'}
                                    </td>
                                    <td className="px-3 py-1 text-center text-sm text-old-money-800">{Math.round(dog.total_evaluations)}</td>
                                    <td className="px-3 py-1 text-center text-sm text-old-money-800">{dog.avg_score ? dog.avg_score.toFixed(2) : '-'}</td>
                                  </tr>
                                  {expandedDog === dogIdx && dog.scores_by_criteria && (
                                    <tr>
                                      <td colSpan="3" className="px-3 py-3 bg-old-money-100">
                                        <table className="w-full divide-y divide-old-money-200">
                                          <thead>
                                            <tr>
                                              <th className="px-2 py-1 text-left text-xs font-bold text-gold-700 uppercase">Критерий</th>
                                              <th className="px-2 py-1 text-center text-xs font-bold text-gold-700 uppercase">Оценок</th>
                                              <th className="px-2 py-1 text-center text-xs font-bold text-gold-700 uppercase">Средняя</th>
                                              <th className="px-2 py-1 text-center text-xs font-bold text-gold-700 uppercase">Мин</th>
                                              <th className="px-2 py-1 text-center text-xs font-bold text-gold-700 uppercase">Макс</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {Object.entries(dog.scores_by_criteria).map(([idx, scores]) => {
                                              const criteriaNames = ['Манёвренность', 'Резвость', 'Выносливость', 'Преследование', 'Энтузиазм'];
                                              const validScores = scores.filter(s => s !== null && !isNaN(s));
                                              if (validScores.length === 0) return null;
                                              return (
                                                <tr key={idx}>
                                                  <td className="px-2 py-1 text-sm text-old-money-800">{criteriaNames[idx]}</td>
                                                  <td className="px-2 py-1 text-center text-sm text-old-money-800">{validScores.length}</td>
                                                  <td className="px-2 py-1 text-center text-sm text-old-money-800">
                                                    {(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)}
                                                  </td>
                                                  <td className="px-2 py-1 text-center text-sm text-old-money-800">{Math.min(...validScores)}</td>
                                                  <td className="px-2 py-1 text-center text-sm text-old-money-800">{Math.max(...validScores)}</td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-old-money-600 text-sm">Нет данных о собаках</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
          </>
        ) : (
          <p className="text-old-money-600 text-sm">Нет данных</p>
        )}
      </div>

      {/* Статистика по критериям */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-old-money-200">
        <h2 className="text-lg md:text-xl font-bold text-charcoal-800 mb-4">Статистика по критериям</h2>
        {sortedCriteria && sortedCriteria.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {sortedCriteria.map((stat, idx) => (
                <div key={idx} className="bg-old-money-50 rounded-xl p-4">
                  <div className="font-bold text-old-money-800 mb-3">{stat.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Оцениваний</div>
                      <div className="font-bold text-old-money-800">{stat.evaluations_count || 0}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Оценок</div>
                      <div className="font-bold text-old-money-800">{stat.count}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Средняя</div>
                      <div className="font-bold text-old-money-800">{stat.avg_score ? stat.avg_score.toFixed(2) : '-'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Мин</div>
                      <div className="font-bold text-old-money-800">{stat.min_score || '-'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Макс</div>
                      <div className="font-bold text-old-money-800">{stat.max_score || '-'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full divide-y divide-old-money-200 min-w-[700px]">
            <thead>
              <tr>
                <th 
                  className="px-3 py-2 text-left text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleCriteriaSort('name')}
                >
                  Критерий {criteriaSortField === 'name' && (criteriaSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleCriteriaSort('evaluations_count')}
                >
                  Оцениваний {criteriaSortField === 'evaluations_count' && (criteriaSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleCriteriaSort('count')}
                >
                  Оценок {criteriaSortField === 'count' && (criteriaSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleCriteriaSort('avg_score')}
                >
                  Средняя {criteriaSortField === 'avg_score' && (criteriaSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleCriteriaSort('min_score')}
                >
                  Мин {criteriaSortField === 'min_score' && (criteriaSortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-3 py-2 text-center text-xs font-bold text-gold-700 uppercase cursor-pointer hover:text-gold-600"
                  onClick={() => handleCriteriaSort('max_score')}
                >
                  Макс {criteriaSortField === 'max_score' && (criteriaSortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCriteria.map((stat, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm text-old-money-800">{stat.name}</td>
                  <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.evaluations_count || 0}</td>
                  <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.count}</td>
                  <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.avg_score ? stat.avg_score.toFixed(2) : '-'}</td>
                  <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.min_score || '-'}</td>
                  <td className="px-3 py-2 text-center text-sm text-old-money-800">{stat.max_score || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </>
        ) : (
          <p className="text-old-money-600 text-sm">Нет данных</p>
        )}
      </div>
    </div>
  )
}
