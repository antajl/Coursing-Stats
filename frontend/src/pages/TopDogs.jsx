import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import DogStatsTable from '../components/DogStatsTable'
import FiltersDropdown from '../components/FiltersDropdown'

export default function TopDogs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [topPlacement, setTopPlacement] = useState([])
  const [topScore, setTopScore] = useState([])
  const [topSpeed, setTopSpeed] = useState([])
  const [breeds, setBreeds] = useState([])
  const [years, setYears] = useState([])

  const [loadingFilters, setLoadingFilters] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)

  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'placement')
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '')
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  
  // Новые фильтры
  const [filterStartsFrom, setFilterStartsFrom] = useState(() => searchParams.get('startsFrom') || '')
  const [filterStartsTo, setFilterStartsTo] = useState(() => searchParams.get('startsTo') || '')
  const [filterScoreFrom, setFilterScoreFrom] = useState(() => searchParams.get('scoreFrom') || '')
  const [filterScoreTo, setFilterScoreTo] = useState(() => searchParams.get('scoreTo') || '')
  const [filterScoreType, setFilterScoreType] = useState(() => searchParams.get('scoreType') || 'best')
  const [filterSpeedFrom, setFilterSpeedFrom] = useState(() => searchParams.get('speedFrom') || '')
  const [filterSpeedTo, setFilterSpeedTo] = useState(() => searchParams.get('speedTo') || '')
  const [filterSpeedType, setFilterSpeedType] = useState(() => searchParams.get('speedType') || 'best')

  // Track which tabs have been loaded
  const [loadedTabs, setLoadedTabs] = useState({ placement: false, score: false, speed: false })

  const handleResetFilters = () => {
    setFilterYear('')
    setFilterBreed('')
    setFilterStartsFrom('')
    setFilterStartsTo('')
    setFilterScoreFrom('')
    setFilterScoreTo('')
    setFilterScoreType('best')
    setFilterSpeedFrom('')
    setFilterSpeedTo('')
    setFilterSpeedType('best')
  }

  // Синхронизация фильтров с URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filterBreed) params.set('breed', filterBreed)
    if (filterYear) params.set('year', filterYear)
    if (searchQuery) params.set('search', searchQuery)
    if (activeTab !== 'score') params.set('tab', activeTab)
    if (filterStartsFrom) params.set('startsFrom', filterStartsFrom)
    if (filterStartsTo) params.set('startsTo', filterStartsTo)
    if (filterScoreFrom) params.set('scoreFrom', filterScoreFrom)
    if (filterScoreTo) params.set('scoreTo', filterScoreTo)
    if (filterScoreType !== 'best') params.set('scoreType', filterScoreType)
    if (filterSpeedFrom) params.set('speedFrom', filterSpeedFrom)
    if (filterSpeedTo) params.set('speedTo', filterSpeedTo)
    if (filterSpeedType !== 'best') params.set('speedType', filterSpeedType)
    setSearchParams(params)
  }, [filterBreed, filterYear, searchQuery, activeTab, filterStartsFrom, filterStartsTo, filterScoreFrom, filterScoreTo, filterScoreType, filterSpeedFrom, filterSpeedTo, setSearchParams])

  useEffect(() => {
    async function fetchFilters() {
      setLoadingFilters(true)
      setError(null)
      
      try {
        const [breedsResult, yearsResult] = await Promise.all([
          api.getBreeds(),
          api.getYears()
        ])

        if (!breedsResult.success || !yearsResult.success) {
          setError('Не удалось загрузить фильтры. Используются демо-данные.')
        }

        setBreeds(breedsResult.data || [])
        setYears(yearsResult.data || [])
      } catch (err) {
        console.error('Error fetching filters:', err)
        setError(`Ошибка при загрузке фильтров: ${err.message}`)
      } finally {
        setLoadingFilters(false)
      }
    }

    fetchFilters()
  }, [])

  useEffect(() => {
    async function fetchTopData() {
      // Only load data for the active tab if not already loaded
      if (loadedTabs[activeTab] && topPlacement.length > 0 && topScore.length > 0 && topSpeed.length > 0) {
        return
      }

      setLoadingData(true)
      setError(null)

      try {
        // Load only the active tab's data
        let result
        if (activeTab === 'placement') {
          result = await api.getTopPlacement(filterYear, filterBreed, 0)
          setTopPlacement(result.data || [])
        } else if (activeTab === 'score') {
          result = await api.getTopScore(filterYear, filterBreed, 0)
          setTopScore(result.data || [])
        } else if (activeTab === 'speed') {
          result = await api.getTopSpeed(filterYear, filterBreed, 0)
          setTopSpeed(result.data || [])
        }

        if (!result.success) {
          setError('Не удалось загрузить данные таблиц. Используются демо-данные.')
        }

        setLoadedTabs(prev => ({ ...prev, [activeTab]: true }))
      } catch (err) {
        console.error('Error fetching top data:', err)
        setError(`Ошибка при загрузке таблиц: ${err.message}`)
      } finally {
        setLoadingData(false)
      }
    }

    fetchTopData()
  }, [filterYear, filterBreed, activeTab])

  const filteredPlacement = topPlacement.filter(dog => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = dog.name_lat && dog.name_lat.toLowerCase().includes(query)
      const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
      const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
      if (!nameMatch && !breedMatch && !startsMatch) return false
    }
    
    // Фильтр по количеству участий
    if (filterStartsFrom && dog.total_starts < parseInt(filterStartsFrom)) return false
    if (filterStartsTo && dog.total_starts > parseInt(filterStartsTo)) return false
    
    return true
  })

  const filteredScore = topScore.filter(dog => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = dog.name_lat && dog.name_lat.toLowerCase().includes(query)
      const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
      const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
      if (!nameMatch && !breedMatch && !startsMatch) return false
    }
    
    // Фильтр по количеству участий
    if (filterStartsFrom && dog.total_starts < parseInt(filterStartsFrom)) return false
    if (filterStartsTo && dog.total_starts > parseInt(filterStartsTo)) return false
    
    // Фильтр по очкам
    const scoreValue = filterScoreType === 'best' ? dog.best_score : dog.avg_score
    if (filterScoreFrom && scoreValue < parseFloat(filterScoreFrom)) return false
    if (filterScoreTo && scoreValue > parseFloat(filterScoreTo)) return false
    
    return true
  })

  const filteredSpeed = topSpeed.filter(dog => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = dog.name_lat && dog.name_lat.toLowerCase().includes(query)
      const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
      const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
      if (!nameMatch && !breedMatch && !startsMatch) return false
    }
    
    // Фильтр по количеству участий
    if (filterStartsFrom && dog.total_starts < parseInt(filterStartsFrom)) return false
    if (filterStartsTo && dog.total_starts > parseInt(filterStartsTo)) return false
    
    // Фильтр по скорости
    const speedValue = filterSpeedType === 'best' ? dog.best_speed : dog.avg_speed
    if (filterSpeedFrom && speedValue < parseFloat(filterSpeedFrom)) return false
    if (filterSpeedTo && speedValue > parseFloat(filterSpeedTo)) return false
    
    return true
  })

  if (loadingFilters) {
    return (
      <div className="text-center py-12 text-old-money-600">
        <div className="text-lg font-medium">Загрузка фильтров...</div>
        <div className="text-sm mt-2">Пожалуйста, подождите</div>
      </div>
    )
  }


  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <p className="font-medium">⚠️ {error}</p>
          <p className="text-sm mt-1">Сайт использует демонстрационные данные. Проверьте соединение с сервером.</p>
        </div>
      )}

      {/* Tabs section */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('placement')}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'placement' 
              ? 'bg-camel-600 text-white shadow-lg' 
              : 'bg-white border-2 border-cream-300 text-charcoal-700 hover:bg-cream-50'
          }`}
        >
          По местам
        </button>
        <button
          onClick={() => setActiveTab('score')}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'score' 
              ? 'bg-camel-600 text-white shadow-lg' 
              : 'bg-white border-2 border-cream-300 text-charcoal-700 hover:bg-cream-50'
          }`}
        >
          По очкам
        </button>
        <button
          onClick={() => setActiveTab('speed')}
          className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'speed' 
              ? 'bg-camel-600 text-white shadow-lg' 
              : 'bg-white border-2 border-cream-300 text-charcoal-700 hover:bg-cream-50'
          }`}
        >
          По скорости
        </button>
      </div>
      
      {/* Search and filters section */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch">
        <input
          type="text"
          placeholder="Поиск по кличке, породе или количеству участий..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        />

        <div className="flex gap-3">
          <div className="min-w-[120px] flex-1">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
              disabled={loadingFilters}
            >
              <option value="">Все года</option>
              {years.map((y) => (
                <option key={y.year} value={y.year} className="text-gray-900">{y.year}</option>
              ))}
            </select>
          </div>

          <FiltersDropdown onReset={handleResetFilters}>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <select
                  value={filterBreed}
                  onChange={(e) => setFilterBreed(e.target.value)}
                  className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
                >
                  <option value="">Все породы</option>
                  {breeds.map((b) => (
                    <option key={b.breed} value={b.breed} className="text-gray-900">{b.breed}</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-old-money-700 mb-2">Участий от</label>
              <input
                type="number"
                value={filterStartsFrom}
                onChange={(e) => setFilterStartsFrom(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="От"
                className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-old-money-700 mb-2">Участий до</label>
              <input
                type="number"
                value={filterStartsTo}
                onChange={(e) => setFilterStartsTo(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="До"
                className="w-full h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="border-t-2 border-old-money-200 pt-4">
            <h3 className="text-sm font-bold text-charcoal-700 mb-3">Фильтры по очкам</h3>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                step="0.01"
                value={filterScoreFrom}
                onChange={(e) => setFilterScoreFrom(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="От"
                className="w-36 h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                step="0.01"
                value={filterScoreTo}
                onChange={(e) => setFilterScoreTo(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="До"
                className="w-36 h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <select
                value={filterScoreType}
                onChange={(e) => setFilterScoreType(e.target.value)}
                className="flex-1 h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
              >
                <option value="best">Лучший</option>
                <option value="avg">Средний</option>
              </select>
            </div>
          </div>

          <div className="border-t-2 border-old-money-200 pt-4">
            <h3 className="text-sm font-bold text-charcoal-700 mb-3">Фильтры по скорости</h3>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                step="0.1"
                value={filterSpeedFrom}
                onChange={(e) => setFilterSpeedFrom(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="От"
                className="w-36 h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                step="0.1"
                value={filterSpeedTo}
                onChange={(e) => setFilterSpeedTo(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="До"
                className="w-36 h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <select
                value={filterSpeedType}
                onChange={(e) => setFilterSpeedType(e.target.value)}
                className="flex-1 h-12 px-4 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300"
              >
                <option value="best">Лучшая</option>
                <option value="avg">Средняя</option>
              </select>
            </div>
          </div>
        </FiltersDropdown>
        </div>
      </div>

      {loadingData && (
        <div className="text-center py-12 text-old-money-600">
          <div className="text-lg font-medium">Загрузка данных таблицы...</div>
        </div>
      )}

      {filteredPlacement.length === 0 && filteredScore.length === 0 && filteredSpeed.length === 0 ? (
        <div className="text-center py-12 text-old-money-600">
          <p className="text-xl">Нет данных для выбранных фильтров</p>
          <p className="text-sm mt-2">Попробуйте изменить год или убрать фильтры</p>
        </div>
      ) : activeTab === 'placement' ? (
        <DogStatsTable key={`placement-${filterYear}-${filterBreed}`} data={filteredPlacement} type="placement" filterYear={filterYear} />
      ) : activeTab === 'score' ? (
        <DogStatsTable key={`score-${filterYear}-${filterBreed}`} data={filteredScore} type="score" filterYear={filterYear} />
      ) : (
        <DogStatsTable key={`speed-${filterYear}-${filterBreed}`} data={filteredSpeed} type="speed" filterYear={filterYear} />
      )}
    </div>
  )
}
