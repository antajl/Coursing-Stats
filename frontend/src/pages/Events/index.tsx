import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useYears, useEvents } from '../../hooks/useApi'
import { getDisciplineColor } from '../../constants'
import FiltersDropdown from '../../components/FiltersDropdown'
import FilterSelect from '../../components/FilterSelect'
import EmptyState from '../../components/EmptyState'
import SkeletonLoader from '../../components/SkeletonLoader'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

function formatDateRange(dateStart, dateEnd) {
  if (!dateStart) return ''
  
  const startParts = dateStart.split('-')
  if (startParts.length !== 3) return dateStart
  
  const [year, month, day] = startParts
  
  // Если dateEnd отсутствует, показываем только дату начала
  if (!dateEnd) {
    return `${day}.${month}.${year}`
  }
  
  const endParts = dateEnd.split('-')
  // Проверяем, что формат даты конца валидный
  if (endParts.length !== 3) {
    return `${day}.${month}.${year}`
  }
  
  const [, , endDay] = endParts
  return `${day}-${endDay}.${month}.${year}`
}

function parseDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr)
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
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')
  const [filterDiscipline, setFilterDiscipline] = useState(() => searchParams.get('discipline') || '')
  const [filterCompetitionKind, setFilterCompetitionKind] = useState(() => searchParams.get('kind') || '')
  const [filterRegion, setFilterRegion] = useState(() => searchParams.get('region') || '')
  const [filterLocation, setFilterLocation] = useState(() => searchParams.get('location') || '')
  const [filterDateFrom, setFilterDateFrom] = useState(() => searchParams.get('dateFrom') || '')
  const [filterDateTo, setFilterDateTo] = useState(() => searchParams.get('dateTo') || '')
  const [sortField, setSortField] = useState(() => searchParams.get('sort') || 'date_start')
  const [sortDirection, setSortDirection] = useState(() => searchParams.get('dir') || 'asc')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')

  // React Query hooks
  const { data: yearsData } = useYears()
  const { data: eventsData, isLoading: eventsLoading } = useEvents(filterYear)

  // API возвращает { success: true, data: [...] }
  const yearsSuccess = yearsData?.success
  const yearsArray = yearsSuccess ? (Array.isArray(yearsData.data) ? yearsData.data : []) : []
  const eventsSuccess = eventsData?.success
  const eventsArray = eventsSuccess ? (Array.isArray(eventsData.data) ? eventsData.data : []) : []

  const allYears = yearsArray.map((y: any) => y.year)
  const events = eventsArray
  const loading = eventsLoading

  // Вычисляем фильтры из events
  const allCompetitionKinds = [...new Set(events.map(e => e.competition_kind).filter(Boolean))].sort()
  const allRegions = [...new Set(events.map(e => {
    if (!e.location) return null
    const parts = e.location.split(',').map(p => p.trim())
    return parts.length >= 2 ? parts[0] : null
  }).filter(Boolean))].sort()

  const handleResetFilters = () => {
    setFilterYear('2026')
    setFilterDiscipline('')
    setFilterCompetitionKind('')
    setFilterRegion('')
    setFilterLocation('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setSortField('date_start')
    setSortDirection('asc')
  }

  // Синхронизация фильтров с URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filterYear !== '2026') params.set('year', filterYear)
    if (filterDiscipline) params.set('discipline', filterDiscipline)
    if (filterCompetitionKind) params.set('kind', filterCompetitionKind)
    if (filterRegion) params.set('region', filterRegion)
    if (filterLocation) params.set('location', filterLocation)
    if (filterDateFrom) params.set('dateFrom', filterDateFrom)
    if (filterDateTo) params.set('dateTo', filterDateTo)
    if (sortField !== 'date_start') params.set('sort', sortField)
    if (sortDirection !== 'asc') params.set('dir', sortDirection)
    if (searchQuery) params.set('search', searchQuery)
    setSearchParams(params)
  }, [filterYear, filterDiscipline, filterCompetitionKind, filterRegion, filterLocation, filterDateFrom, filterDateTo, sortField, sortDirection, searchQuery, setSearchParams])

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
    
    if (filterDateFrom && parseDate(event.date_start) < parseDate(filterDateFrom)) return false
    if (filterDateTo && parseDate(event.date_start) > parseDate(filterDateTo)) return false
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
      aVal = parseDate(aVal)
      bVal = parseDate(bVal)
    } else if (sortField === 'is_past') {
      const today = new Date()
      aVal = parseDate(a.date_start) < today
      bVal = parseDate(b.date_start) < today
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return <SkeletonLoader variant="card" count={6} />
  }

  return (
    <div className="p-4">
      {/* Search and filters section */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          placeholder="Поиск по названию, месту, клубу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-5 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
        />

        <div className="grid grid-cols-2 md:flex gap-3">
          <FilterSelect
            label=""
            value={filterYear}
            onChange={setFilterYear}
            allLabel="Все года"
            options={allYears.sort((a, b) => b - a).map((y) => ({ value: y.toString(), label: y.toString() }))}
            className="md:flex-1"
          />

          <FilterSelect
            label=""
            value={filterCompetitionKind}
            onChange={setFilterCompetitionKind}
            allLabel="Вид"
            options={allCompetitionKinds.map((k) => ({ value: k, label: k }))}
            className="md:flex-1"
          />

          <FilterSelect
            label=""
            value={filterDiscipline}
            onChange={setFilterDiscipline}
            allLabel="Дисциплина"
            options={[
              { value: 'coursing', label: 'Курсинг' },
              { value: 'bzmp', label: 'БЗМП' },
              { value: 'racing', label: 'Бега' },
              { value: 'other', label: 'Другие' },
            ]}
            className="md:flex-1"
          />

          <FiltersDropdown onReset={handleResetFilters}>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-semibold text-old-money-700 dark:text-old-money-400 mb-2">Дата от</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-old-money-700 dark:text-old-money-400 mb-2">Дата до</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 focus-visible:ring-2 focus-visible:ring-camel-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-900"
              />
            </div>
          </div>
        </FiltersDropdown>
        </div>
      </div>

      <div className="mb-4 hidden md:flex flex-wrap justify-between items-start gap-4 text-sm text-old-money-600 dark:text-old-money-400">
        <div>
          Всего событий: {events.length} | Отфильтровано: {filteredEvents.length}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium">Дисциплины:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-forest-300 dark:bg-forest-900/20 border border-forest-400 dark:border-forest-700"></div>
            <span>Курсинг</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warm-blue-300 dark:bg-warm-blue-900/20 border border-warm-blue-400 dark:border-warm-blue-700"></div>
            <span>БЗМП</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-terracotta-300 dark:bg-terracotta-900/20 border border-terracotta-400 dark:border-terracotta-700"></div>
            <span>Бега</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-camel-300 dark:bg-camel-900/20 border border-camel-400 dark:border-camel-700"></div>
            <span>Другие</span>
          </div>
        </div>
      </div>

      {/* Mobile stats - simplified */}
      <div className="md:hidden mb-3 text-xs text-old-money-500 dark:text-old-money-400">
        {filteredEvents.length} из {events.length} событий
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-old-money-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800 shadow-md">
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="События не найдены"
            description="Попробуйте изменить фильтры или поисковый запрос"
          />
        ) : (
          <>
        <div className="md:hidden space-y-3 p-3 min-w-[320px]">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className={`${getDisciplineColor(event.event_type)} ${getImportantCompetitionStyle(event.competition_kind)} rounded-xl p-4 transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="mb-1 text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                    {formatDateRange(event.date_start, event.date_end)}
                  </div>
                  {event.competition_kind && (
                    <div className="mb-1 text-xs font-medium text-camel-700 dark:text-camel-400">{event.competition_kind}</div>
                  )}
                  {event.location && (
                    <div className="text-xs text-old-money-600 dark:text-old-money-400">{event.location}</div>
                  )}
                </div>
                {event.results_url ? (
                  <Link
                    to={`/event/${event.id}`}
                    className="ml-2 text-xs font-medium text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300 hover:underline"
                  >
                    <span className="md:hidden">Открыть</span>
                    <span className="hidden md:inline">Открыть →</span>
                  </Link>
                ) : (
                  <span className="text-gray-400 text-xs italic ml-2">Ожидается</span>
                )}
              </div>
              <div className="flex gap-2 text-xs text-old-money-700 dark:text-old-money-400">
                {event.competition_type && (
                  <span className="bg-white/50 px-2 py-1 rounded">{event.competition_type}</span>
                )}
                {event.judges && (
                  <span className="bg-white/50 px-2 py-1 rounded truncate">{event.judges}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full divide-y divide-charcoal-200 dark:divide-charcoal-700 table-auto min-w-[800px]">
            <thead className="border-b border-old-money-300 dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-700">
            <tr>
              <th 
                className="w-auto cursor-pointer px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('date_start')}
              >
                Дата {sortField === 'date_start' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="w-auto cursor-pointer px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('competition_kind')}
              >
                Вид {sortField === 'competition_kind' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="w-auto cursor-pointer px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('competition_type')}
              >
                Дисциплина {sortField === 'competition_type' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('location')}
              >
                Локация {sortField === 'location' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="cursor-pointer px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('judges')}
              >
                Судьи {sortField === 'judges' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="w-auto px-3 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">
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
                <td className="px-3 py-3 text-sm text-old-money-800 dark:text-old-money-300 whitespace-nowrap">
                  {formatDateRange(event.date_start, event.date_end)}
                </td>
                <td className="px-3 py-3 text-center text-sm text-old-money-800 dark:text-old-money-300">
                  {event.competition_kind || '-'}
                </td>
                <td className="px-3 py-3 text-center text-sm text-old-money-800 dark:text-old-money-300">
                  {event.competition_type || '-'}
                </td>
                <td className="px-3 py-3 text-sm text-old-money-800 dark:text-old-money-300">
                  {event.location}
                </td>
                <td className="px-3 py-3 text-sm text-old-money-800 dark:text-old-money-300">
                  {event.judges || '-'}
                </td>
                <td className="px-3 py-3 text-sm">
                  {event.results_url ? (
                    <Link
                      to={`/event/${event.id}`}
                      className="text-xs font-medium text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300 hover:underline"
                    >
                      Открыть
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
        </>
        )}
      </div>
    </div>
  )
}
