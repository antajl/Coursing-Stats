import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { getDisciplineColor } from '../constants'

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

function getImportantCompetitionStyle(competitionKind) {
  if (isImportantCompetition(competitionKind)) {
    return 'font-semibold'
  }
  return ''
}


export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [events, setEvents] = useState([])
  const [allYears, setAllYears] = useState([])
  const [allCompetitionKinds, setAllCompetitionKinds] = useState([])
  const [allClubs, setAllClubs] = useState([])
  const [allLocations, setAllLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterCompetitionKind, setFilterCompetitionKind] = useState(() => searchParams.get('kind') || '')
  const [filterClub, setFilterClub] = useState(() => searchParams.get('club') || '')
  const [filterLocation, setFilterLocation] = useState(() => searchParams.get('location') || '')
  const [filterDateFrom, setFilterDateFrom] = useState(() => searchParams.get('dateFrom') || '')
  const [filterDateTo, setFilterDateTo] = useState(() => searchParams.get('dateTo') || '')
  const [sortField, setSortField] = useState(() => searchParams.get('sort') || 'date_start')
  const [sortDirection, setSortDirection] = useState(() => searchParams.get('dir') || 'asc')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)
  const filtersRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setFiltersOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchYears() {
      const result = await api.getYears()
      if (result.success) {
        setAllYears(result.data.map(y => y.year))
      } else {
        console.error('Error fetching years:', result.error)
      }
    }

    fetchYears()
  }, [])

  // Синхронизация фильтров с URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filterYear !== '2026') params.set('year', filterYear)
    if (filterDiscipline) params.set('discipline', filterDiscipline)
    if (filterCompetitionKind) params.set('kind', filterCompetitionKind)
    if (filterClub) params.set('club', filterClub)
    if (filterLocation) params.set('location', filterLocation)
    if (filterDateFrom) params.set('dateFrom', filterDateFrom)
    if (filterDateTo) params.set('dateTo', filterDateTo)
    if (sortField !== 'date_start') params.set('sort', sortField)
    if (sortDirection !== 'asc') params.set('dir', sortDirection)
    if (searchQuery) params.set('search', searchQuery)
    setSearchParams(params)
  }, [filterYear, filterDiscipline, filterCompetitionKind, filterClub, filterLocation, filterDateFrom, filterDateTo, sortField, sortDirection, searchQuery, setSearchParams])

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      const result = await api.getEvents(filterYear)
      if (result.success) {
        setEvents(result.data)
        // Извлекаем уникальные значения для фильтров
        const competitionKinds = [...new Set(result.data.map(e => e.competition_kind).filter(Boolean))].sort()
        const clubs = [...new Set(result.data.map(e => e.host_club).filter(Boolean))].sort()
        const locations = [...new Set(result.data.map(e => e.location).filter(Boolean))].sort()
        setAllCompetitionKinds(competitionKinds)
        setAllClubs(clubs)
        setAllLocations(locations)
      } else {
        console.error('Error fetching events:', result.error)
      }
      setLoading(false)
    }

    fetchEvents()
  }, [filterYear])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredEvents = events.filter(event => {
    if (filterYear && event.year !== parseInt(filterYear)) return false
    if (filterDiscipline && event.event_type !== filterDiscipline) return false
    if (filterCompetitionKind && event.competition_kind !== filterCompetitionKind) return false
    if (filterClub && event.host_club !== filterClub) return false
    if (filterLocation && event.location !== filterLocation) return false
    if (filterDateFrom && event.date_start < filterDateFrom) return false
    if (filterDateTo && event.date_start > filterDateTo) return false
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
    } else if (sortField === 'is_past') {
      const today = new Date()
      aVal = new Date(a.date_start) < today
      bVal = new Date(b.date_start) < today
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
      <div className="mb-4 flex flex-wrap gap-3 items-center relative">
        <input
          type="text"
          placeholder="Поиск по названию, месту, клубу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-64 h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        />

        <div className="relative" ref={filtersRef}>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 hover:bg-old-money-50 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm font-medium"
          >
            Больше фильтров
          </button>

          {/* Filters dropdown */}
          {filtersOpen && (
            <div className="absolute right-0 mt-2 w-[600px] bg-white rounded-2xl shadow-2xl border-2 border-old-money-200 z-50 max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-charcoal-800">Фильтры</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="text-charcoal-500 hover:text-charcoal-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Год</label>
                    <select
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Все года</option>
                      {allYears.sort((a, b) => b - a).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
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

                  <div>
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Вид соревнования</label>
                    <select
                      value={filterCompetitionKind}
                      onChange={(e) => setFilterCompetitionKind(e.target.value)}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Все виды</option>
                      {allCompetitionKinds.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Клуб</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'club' ? null : 'club')}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 text-left"
                    >
                      {filterClub || 'Все клубы'}
                    </button>
                    {openDropdown === 'club' && (
                      <div className="absolute z-[60] w-full mt-1 bg-white border-2 border-old-money-300 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                        <label className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                          <input
                            type="radio"
                            name="club"
                            checked={!filterClub}
                            onChange={() => setFilterClub('')}
                            className="mr-2"
                          />
                          Все клубы
                        </label>
                        {allClubs.map(c => (
                          <label key={c} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                            <input
                              type="radio"
                              name="club"
                              checked={filterClub === c}
                              onChange={() => setFilterClub(c)}
                              className="mr-2"
                            />
                            {c}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Локация</label>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 text-left"
                    >
                      {filterLocation || 'Все локации'}
                    </button>
                    {openDropdown === 'location' && (
                      <div className="absolute z-[60] w-full bottom-full mb-1 bg-white border-2 border-old-money-300 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                        <label className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                          <input
                            type="radio"
                            name="location"
                            checked={!filterLocation}
                            onChange={() => setFilterLocation('')}
                            className="mr-2"
                          />
                          Все локации
                        </label>
                        {allLocations.map(l => (
                          <label key={l} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                            <input
                              type="radio"
                              name="location"
                              checked={filterLocation === l}
                              onChange={() => setFilterLocation(l)}
                              className="mr-2"
                            />
                            {l}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Сортировка</label>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
                    >
                      <option value="date_start">По дате</option>
                      <option value="is_past">По статусу (прошедшие/предстоящие)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Дата от</label>
                    <input
                      type="date"
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-old-money-700 mb-2">Дата до</label>
                    <input
                      type="date"
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                      className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setFilterYear('2026')
                      setFilterDiscipline('')
                      setFilterCompetitionKind('')
                      setFilterClub('')
                      setFilterLocation('')
                      setFilterDateFrom('')
                      setFilterDateTo('')
                      setSortField('date_start')
                      setSortDirection('asc')
                    }}
                    className="flex-1 h-12 px-4 py-3 bg-old-money-100 text-old-money-800 rounded-xl hover:bg-old-money-200 transition-colors font-medium"
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="flex-1 h-12 px-4 py-3 bg-camel-600 text-white rounded-xl hover:bg-camel-700 transition-colors font-medium"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 text-sm text-old-money-600">
        Всего событий: {events.length} | Отфильтровано: {filteredEvents.length}
      </div>

      {/* Легенда цветов дисциплин */}
      <div className="mb-4 flex items-center gap-4 text-sm text-old-money-700">
        <span className="font-medium">Дисциплины:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-forest-100 border border-forest-300"></div>
          <span>Курсинг</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warm-blue-100 border border-warm-blue-300"></div>
          <span>БЗМП</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-terracotta-100 border border-terracotta-300"></div>
          <span>Бега</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-old-money-200">
        <table className="w-full divide-y divide-old-money-200 table-auto">
          <thead className="bg-gradient-to-r from-gold-200 to-old-money-200 border-b-2 border-old-money-300">
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
                    <Link
                      to={`/event/${event.id}`}
                      className="text-xs font-medium text-gold-600 hover:text-gold-500 hover:underline transition-colors"
                    >
                      Открыть →
                    </Link>
                  ) : (
                    <span className="text-gray-400 text-xs italic">Ожидается</span>
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
