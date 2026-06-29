import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTopPlacement, useTopScore, useTopSpeed, useBreeds, useYears } from '../hooks/useApi'
import DogStatsTable from '../components/DogStatsTable'
import FiltersDropdown from '../components/FiltersDropdown'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import SkeletonLoader from '../components/SkeletonLoader'

export default function TopDogs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isStandalone = !searchParams.get('tab') // If no 'tab' param, it's standalone page

  const [activeTab, setActiveTab] = useState(() => searchParams.get('rankingTab') || 'placement')
  const [filterBreed, setFilterBreed] = useState(() => searchParams.get('breed') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')
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

  // Синхронизация activeTab с URL - только для standalone
  useEffect(() => {
    if (isStandalone) {
      const currentTab = searchParams.get('rankingTab') || 'placement'
      setActiveTab(currentTab)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStandalone])

  // React Query hooks
  const { data: breedsData, isLoading: breedsLoading } = useBreeds()
  const { data: yearsData, isLoading: yearsLoading } = useYears()
  const { data: topPlacementData, isLoading: placementLoading } = useTopPlacement(filterYear, filterBreed, parseInt(filterStartsFrom) || 0)
  const { data: topScoreData, isLoading: scoreLoading } = useTopScore(filterYear, filterBreed, parseInt(filterStartsFrom) || 0)
  const { data: topSpeedData, isLoading: speedLoading } = useTopSpeed(filterYear, filterBreed, parseInt(filterStartsFrom) || 0)

  const loading = breedsLoading || yearsLoading || placementLoading || scoreLoading || speedLoading
  
  // API возвращает { success: true, data: [...] }, поэтому нужно извлечь data.data
  const breeds = breedsData?.success ? (Array.isArray(breedsData.data) ? breedsData.data : []) : []
  const years = yearsData?.success ? (Array.isArray(yearsData.data) ? yearsData.data : []) : []
  
  // Извлекаем значения из объектов
  const breedValues = breeds.map((b: any) => typeof b === 'object' ? b.breed : b)
  const yearValues = years.map((y: any) => typeof y === 'object' ? y.year : y)
  
  // Для top endpoints с пагинацией: { success: true, data: { items: [...], total, ... } }
  const topPlacement = topPlacementData?.success ? (Array.isArray(topPlacementData.data) ? topPlacementData.data : (topPlacementData.data?.items || [])) : []
  const topScore = topScoreData?.success ? (Array.isArray(topScoreData.data) ? topScoreData.data : (topScoreData.data?.items || [])) : []
  const topSpeed = topSpeedData?.success ? (Array.isArray(topSpeedData.data) ? topSpeedData.data : (topSpeedData.data?.items || [])) : []

  if (loading) {
    return <SkeletonLoader variant="card" count={4} />
  }

  const handleResetFilters = () => {
    setFilterYear('2026')
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

  // Синхронизация фильтров с URL - только для standalone страницы
  useEffect(() => {
    if (!isStandalone) return; // Don't update URL when inside Procoursing
    
    const params = new URLSearchParams(searchParams)
    if (filterBreed) params.set('breed', filterBreed)
    if (filterYear) params.set('year', filterYear)
    if (searchQuery) params.set('search', searchQuery)
    if (activeTab) params.set('rankingTab', activeTab)
    if (filterStartsFrom) params.set('startsFrom', filterStartsFrom)
    if (filterStartsTo) params.set('startsTo', filterStartsTo)
    if (filterScoreFrom) params.set('scoreFrom', filterScoreFrom)
    if (filterScoreTo) params.set('scoreTo', filterScoreTo)
    if (filterScoreType !== 'best') params.set('scoreType', filterScoreType)
    if (filterSpeedFrom) params.set('speedFrom', filterSpeedFrom)
    if (filterSpeedTo) params.set('speedTo', filterSpeedTo)
    if (filterSpeedType !== 'best') params.set('speedType', filterSpeedType)
    setSearchParams(params)
  }, [filterBreed, filterYear, searchQuery, activeTab, filterStartsFrom, filterStartsTo, filterScoreFrom, filterScoreTo, filterScoreType, filterSpeedFrom, filterSpeedTo, filterSpeedType, setSearchParams, isStandalone])

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

  return (
    <div className="p-4">

      {/* Tabs section */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('placement')}
          className={`min-w-[120px] flex-1 rounded-xl px-4 py-3 font-bold transition-all duration-200 ${
            activeTab === 'placement' 
              ? 'bg-camel-600 dark:bg-camel-700 text-white shadow-md' 
              : 'bg-white dark:bg-charcoal-800 border border-old-money-300 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-50 dark:hover:bg-charcoal-700'
          }`}
        >
          По местам
        </button>
        <button
          onClick={() => setActiveTab('score')}
          className={`min-w-[120px] flex-1 rounded-xl px-4 py-3 font-bold transition-all duration-200 ${
            activeTab === 'score' 
              ? 'bg-camel-600 text-white shadow-md' 
              : 'bg-white border border-old-money-300 text-charcoal-700 hover:bg-cream-50'
          }`}
        >
          По очкам
        </button>
        <button
          onClick={() => setActiveTab('speed')}
          className={`min-w-[120px] flex-1 rounded-xl px-4 py-3 font-bold transition-all duration-200 ${
            activeTab === 'speed' 
              ? 'bg-camel-600 text-white shadow-md' 
              : 'bg-white border border-old-money-300 text-charcoal-700 hover:bg-cream-50'
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
          className="h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-5 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
        />

        <div className="flex gap-3">
          <div className="min-w-[120px] flex-1">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
              disabled={false}
            >
              <option value="">Все года</option>
              {yearValues.map((y) => (
                <option key={y} value={y} className="text-gray-900 dark:text-gray-100">{y}</option>
              ))}
            </select>
          </div>

          <FiltersDropdown onReset={handleResetFilters}>
            <div className="flex gap-3 items-center flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <select
                  value={filterBreed}
                  onChange={(e) => setFilterBreed(e.target.value)}
                  className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                >
                  <option value="">Все породы</option>
                  {breedValues.map((b) => (
                    <option key={b} value={b} className="text-gray-900">{b}</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">Участий от</label>
              <input
                type="number"
                value={filterStartsFrom}
                onChange={(e) => setFilterStartsFrom(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="От"
                className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-charcoal-700 dark:text-charcoal-300">Участий до</label>
              <input
                type="number"
                value={filterStartsTo}
                onChange={(e) => setFilterStartsTo(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="До"
                className="h-12 w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="border-t-2 border-old-money-200 dark:border-charcoal-600 pt-4">
            <h3 className="mb-3 text-sm font-bold text-charcoal-800 dark:text-charcoal-200">Фильтры по очкам</h3>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                step="0.01"
                value={filterScoreFrom}
                onChange={(e) => setFilterScoreFrom(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="От"
                className="h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                step="0.01"
                value={filterScoreTo}
                onChange={(e) => setFilterScoreTo(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="До"
                className="h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <select
                value={filterScoreType}
                onChange={(e) => setFilterScoreType(e.target.value)}
                className="h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
              >
                <option value="best">Лучший</option>
                <option value="avg">Средний</option>
              </select>
            </div>
          </div>

          <div className="border-t-2 border-old-money-200 dark:border-charcoal-600 pt-4">
            <h3 className="mb-3 text-sm font-bold text-charcoal-800 dark:text-charcoal-200">Фильтры по скорости</h3>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                step="0.1"
                value={filterSpeedFrom}
                onChange={(e) => setFilterSpeedFrom(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="От"
                className="h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <input
                type="number"
                step="0.1"
                value={filterSpeedTo}
                onChange={(e) => setFilterSpeedTo(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="До"
                className="h-12 w-36 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <select
                value={filterSpeedType}
                onChange={(e) => setFilterSpeedType(e.target.value)}
                className="h-12 flex-1 rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
              >
                <option value="best">Лучшая</option>
                <option value="avg">Средняя</option>
              </select>
            </div>
          </div>
        </FiltersDropdown>
        </div>
      </div>

      {filteredPlacement.length === 0 && filteredScore.length === 0 && filteredSpeed.length === 0 ? (
        <EmptyState
          title="Нет данных для выбранных фильтров"
          description="Попробуйте изменить год или убрать фильтры"
        />
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
