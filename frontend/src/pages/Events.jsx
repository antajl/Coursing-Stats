import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.PROD 
  ? 'https://procoursing-stats.antajltube.workers.dev'
  : 'http://127.0.0.1:8787'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

function isImportantCompetition(competitionKind) {
  if (!competitionKind) return false
  const upperKind = competitionKind.toUpperCase()
  return upperKind.includes('ЧЕМПИОНАТ РОССИИ') || upperKind.includes('КУБОК РОССИИ')
}

function getDisciplineColor(eventType) {
  switch(eventType) {
    case 'coursing':
      return 'bg-green-50 hover:bg-green-100'
    case 'bzmp':
      return 'bg-blue-50 hover:bg-blue-100'
    case 'racing':
      return 'bg-red-50 hover:bg-red-100'
    default:
      return 'hover:bg-old-money-50'
  }
}

function getImportantCompetitionStyle(competitionKind) {
  if (isImportantCompetition(competitionKind)) {
    return 'font-semibold'
  }
  return ''
}

function translateEventType(type) {
  const translations = {
    'coursing': 'Курсинг',
    'bzmp': 'БЗМП',
    'racing': 'Бега',
    'unknown': 'Неизвестно'
  }
  return translations[type] || type
}

export default function Events() {
  const [events, setEvents] = useState([])
  const [allYears, setAllYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState('2026')
  const [filterType, setFilterType] = useState('')
  const [sortField, setSortField] = useState('date_start')
  const [sortDirection, setSortDirection] = useState('asc')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState(null)
  const [lastUpdateTime, setLastUpdateTime] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const UPDATE_COOLDOWN = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

  useEffect(() => {
    fetchYears()
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [filterYear])

  const fetchYears = async () => {
    try {
      const response = await fetch(`${API_URL}/api/years`)
      const yearsData = await response.json()
      setAllYears(yearsData.map(y => y.year))
    } catch (error) {
      console.error('Error fetching years:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const url = filterYear ? `${API_URL}/api/events?year=${filterYear}` : `${API_URL}/api/events`
      console.log('Fetching from:', url)
      const response = await fetch(url)
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Events data:', data)
      console.log('Events count:', data.length)
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
      console.error('Error details:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleUpdate = async () => {
    // Check cooldown
    if (lastUpdateTime) {
      const timeSinceLastUpdate = Date.now() - lastUpdateTime
      if (timeSinceLastUpdate < UPDATE_COOLDOWN) {
        const remainingTime = Math.ceil((UPDATE_COOLDOWN - timeSinceLastUpdate) / 1000 / 60 / 60)
        setUpdateMessage({
          type: 'warning',
          text: `Обновление доступно через ${remainingTime} часов.`
        })
        setTimeout(() => setUpdateMessage(null), 3000)
        return
      }
    }

    setUpdateLoading(true)
    setUpdateMessage(null)
    
    try {
      console.log('Sending update request to:', `${API_URL}/api/update/trigger`)
      const response = await fetch(`${API_URL}/api/update/trigger`, {
        method: 'POST'
      })
      console.log('Update response status:', response.status)
      console.log('Update response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Update response data:', data)
      
      if (data.success) {
        setLastUpdateTime(Date.now())
        setUpdateMessage({
          type: 'success',
          text: 'Обновление запущено. Данные будут обновлены в ближайшее время.'
        })
        
        // Refresh events after a short delay
        setTimeout(() => {
          fetchEvents()
        }, 2000)
      } else {
        setUpdateMessage({
          type: 'error',
          text: 'Ошибка при запуске обновления'
        })
      }
    } catch (error) {
      console.error('Error triggering update:', error)
      console.error('Error details:', error.message)
      setUpdateMessage({
        type: 'error',
        text: `Ошибка при запуске обновления: ${error.message}`
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filterYear && event.year !== parseInt(filterYear)) return false
    if (filterType && event.event_type !== filterType) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      // Search through all text fields
      const searchableFields = [
        event.title,
        event.location,
        event.host_club,
        event.region,
        event.event_type,
        event.competition_kind,
        event.competition_type,
        event.rank_label,
        event.date_start,
        event.date_end
      ]
      
      const hasMatch = searchableFields.some(field => {
        if (!field) return false
        return field.toString().toLowerCase().includes(query)
      })
      
      if (!hasMatch) return false
    }
    return true
  }).sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    
    if (sortField === 'date_start') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return <div className="text-center py-8 text-old-money-600">Загрузка...</div>
  }

  return (
    <div className="p-4">
      {/* Search and filters section */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        >
          <option value="">Все годы</option>
          {allYears.sort((a, b) => b - a).map(year => (
            <option key={year} value={year} className="text-gray-900">{year}</option>
          ))}
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        >
          <option value="">Все типы</option>
          <option value="coursing" className="text-gray-900">Курсинг</option>
          <option value="bzmp" className="text-gray-900">БЗМП</option>
          <option value="racing" className="text-gray-900">Бега</option>
        </select>

        <input
          type="text"
          placeholder="Поиск по названию, месту, клубу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-64 h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        />
      </div>

      {updateMessage && (
        <div className={`mb-4 p-4 rounded-xl ${
          updateMessage.type === 'success' 
            ? 'bg-green-50 border-2 border-green-200 text-green-800' 
            : updateMessage.type === 'warning'
            ? 'bg-amber-50 border-2 border-amber-200 text-amber-800'
            : 'bg-red-50 border-2 border-red-200 text-red-800'
        }`}>
          {updateMessage.text}
        </div>
      )}

      <div className="mb-4 text-sm text-old-money-600">
        Всего событий: {events.length} | Отфильтровано: {filteredEvents.length}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-old-money-200">
        <table className="w-full divide-y divide-old-money-200 table-auto">
          <thead className="bg-gradient-to-r from-gold-100 to-old-money-100">
            <tr>
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600 w-auto"
                onClick={() => handleSort('date_start')}
              >
                Дата {sortField === 'date_start' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600 w-auto"
                onClick={() => handleSort('competition_kind')}
              >
                Вид {sortField === 'competition_kind' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600 w-auto"
                onClick={() => handleSort('competition_type')}
              >
                Дисциплина {sortField === 'competition_type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('title')}
              >
                Клуб-организатор {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('host_club')}
              >
                Клуб {sortField === 'host_club' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('location')}
              >
                Локация {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider w-auto">
                Результаты
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-old-money-200">
            {filteredEvents.map((event) => (
              <tr 
                key={event.id} 
                className={`${getDisciplineColor(event.event_type)} ${getImportantCompetitionStyle(event.competition_kind)} transition-all duration-300`}
              >
                <td className="px-3 py-3 text-sm text-old-money-800">
                  {formatDate(event.date_start)}
                </td>
                <td className="px-3 py-3 text-center text-sm text-old-money-800">
                  {event.competition_kind || '-'}
                </td>
                <td className="px-3 py-3 text-center text-sm text-old-money-800">
                  {event.competition_type || '-'}
                </td>
                <td className="px-3 py-3 text-sm text-old-money-800">
                  {event.title}
                </td>
                <td className="px-3 py-3 text-sm text-old-money-800">
                  {event.host_club}
                </td>
                <td className="px-3 py-3 text-sm text-old-money-800">
                  {event.location}
                </td>
                <td className="px-3 py-3 text-sm">
                  {event.results_url ? (
                    <a 
                      href={event.results_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-old-money-600 to-old-money-700 text-white shadow-md hover:from-old-money-500 hover:to-old-money-600 transition-all duration-300"
                    >
                      Открыть
                    </a>
                  ) : (
                    <></>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
