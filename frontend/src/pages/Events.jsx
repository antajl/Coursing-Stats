import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { getDisciplineColor } from '../constants'
import FiltersDropdown from '../components/FiltersDropdown'
import FilterSelect from '../components/FilterSelect'

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
  const [allRegions, setAllRegions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterCompetitionKind, setFilterCompetitionKind] = useState(() => searchParams.get('kind') || '')
  const [filterClub, setFilterClub] = useState(() => searchParams.get('club') || '')
  const [filterRegion, setFilterRegion] = useState(() => searchParams.get('region') || '')
  const [filterLocation, setFilterLocation] = useState(() => searchParams.get('location') || '')
  const [filterDateFrom, setFilterDateFrom] = useState(() => searchParams.get('dateFrom') || '')
  const [filterDateTo, setFilterDateTo] = useState(() => searchParams.get('dateTo') || '')
  const [sortField, setSortField] = useState(() => searchParams.get('sort') || 'date_start')
  const [sortDirection, setSortDirection] = useState(() => searchParams.get('dir') || 'asc')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')

  const handleResetFilters = () => {
    setFilterYear('2026')
    setFilterDiscipline('')
    setFilterCompetitionKind('')
    setFilterClub('')
    setFilterRegion('')
    setFilterLocation('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setSortField('date_start')
    setSortDirection('asc')
  }

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
    if (filterRegion) params.set('region', filterRegion)
    if (filterLocation) params.set('location', filterLocation)
    if (filterDateFrom) params.set('dateFrom', filterDateFrom)
    if (filterDateTo) params.set('dateTo', filterDateTo)
    if (sortField !== 'date_start') params.set('sort', sortField)
    if (sortDirection !== 'asc') params.set('dir', sortDirection)
    if (searchQuery) params.set('search', searchQuery)
    setSearchParams(params)
  }, [filterYear, filterDiscipline, filterCompetitionKind, filterClub, filterRegion, filterLocation, filterDateFrom, filterDateTo, sortField, sortDirection, searchQuery, setSearchParams])

  // Очищаем населенный пункт при смене области
  useEffect(() => {
    if (filterRegion && filterLocation) {
      const locationInRegion = events.some(e => {
        if (!e.location) return false
        const parts = e.location.split(',').map(p => p.trim())
        return parts.length >= 2 && parts[0] === filterRegion && parts[1] === filterLocation
      })
      if (!locationInRegion) {
        setFilterLocation('')
      }
    }
  }, [filterRegion, events])

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      const result = await api.getEvents(filterYear)
      if (result.success) {
        setEvents(result.data)
        // Извлекаем уникальные значения для фильтров
        const competitionKinds = [...new Set(result.data.map(e => e.competition_kind).filter(Boolean))].sort()
        const clubs = [...new Set(result.data.map(e => e.host_club).filter(Boolean))].sort()
        
        // Разделяем location на область (населённый пункт вычисляется отдельно в filteredLocations)
        const regions = []
        result.data.forEach(e => {
          if (e.location) {
            const parts = e.location.split(',').map(p => p.trim())
            if (parts.length >= 2) {
              regions.push(parts[0])
            }
          }
        })
        
        setAllCompetitionKinds(competitionKinds)
        setAllClubs(clubs)
        setAllRegions([...new Set(regions)].sort())
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

  // Фильтруем населенные пункты по выбранной области
  const filteredLocations = filterRegion
    ? events
        .filter(e => {
          if (!e.location) return false
          const parts = e.location.split(',').map(p => p.trim())
          return parts.length >= 2 && parts[0] === filterRegion
        })
        .map(e => {
          const parts = e.location.split(',').map(p => p.trim())
          return parts.length >= 2 ? parts[1] : parts[0]
        })
        .filter(Boolean)
    : events
        .map(e => {
          if (!e.location) return null
          const parts = e.location.split(',').map(p => p.trim())
          return parts.length >= 2 ? parts[1] : parts[0]
        })
        .filter(Boolean)

  const filteredEvents = events.filter(event => {
    if (filterYear && event.year !== parseInt(filterYear)) return false
    if (filterDiscipline && event.event_type !== filterDiscipline) return false
    if (filterCompetitionKind && event.competition_kind !== filterCompetitionKind) return false
    if (filterClub && event.host_club !== filterClub) return false
    
    // Фильтрация по области
    if (filterRegion && event.location) {
      const parts = event.location.split(',').map(p => p.trim())
      if (parts.length < 2 || parts[0] !== filterRegion) return false
    } else if (filterRegion && !event.location) {
      return false
    }
    
    // Фильтрация по населенному пункту
    if (filterLocation && event.location) {
      const parts = event.location.split(',').map(p => p.trim())
      const locationPart = parts.length >= 2 ? parts[1] : parts[0]
      if (locationPart !== filterLocation) return false
    } else if (filterLocation && !event.location) {
      return false
    }
    
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

        <FiltersDropdown onReset={handleResetFilters}>
          <div className="grid grid-cols-2 gap-4">
            <FilterSelect
              label="Год"
              value={filterYear}
              onChange={setFilterYear}
              allLabel="Все года"
              options={allYears.sort((a, b) => b - a).map((y) => ({ value: y.toString(), label: y.toString() }))}
            />
            <FilterSelect
              label="Дисциплина"
              value={filterDiscipline}
              onChange={setFilterDiscipline}
              allLabel="Все дисциплины"
              options={[
                { value: 'coursing', label: 'Курсинг' },
                { value: 'bzmp', label: 'БЗМП' },
                { value: 'racing', label: 'Бега' },
              ]}
            />
            <FilterSelect
              label="Вид соревнования"
              value={filterCompetitionKind}
              onChange={setFilterCompetitionKind}
              allLabel="Все виды"
              options={allCompetitionKinds.map((k) => ({ value: k, label: k }))}
            />
            <FilterSelect
              label="Клуб"
              value={filterClub}
              onChange={setFilterClub}
              allLabel="Все клубы"
              options={allClubs.map((c) => ({ value: c, label: c }))}
            />
            <FilterSelect
              label="Область"
              value={filterRegion}
              onChange={setFilterRegion}
              allLabel="Все области"
              options={allRegions.map((r) => ({ value: r, label: r }))}
            />
            <FilterSelect
              label="Населённый пункт"
              value={filterLocation}
              onChange={setFilterLocation}
              allLabel="Все населённые пункты"
              options={[...new Set(filteredLocations)].sort().map((l) => ({ value: l, label: l }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
        </FiltersDropdown>
      </div>

      <div className="mb-4 flex justify-between items-center text-sm text-old-money-600">
        <div>
          Всего событий: {events.length} | Отфильтровано: {filteredEvents.length}
        </div>
        <div className="flex items-center gap-4">
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
              <th 
                className="px-3 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:text-gold-600"
                onClick={() => handleSort('judges')}
              >
                Судьи {sortField === 'judges' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                <td className="px-3 py-3 text-sm text-old-money-800">
                  {event.judges || '-'}
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
