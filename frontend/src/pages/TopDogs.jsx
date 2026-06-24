import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import DogStatsTable from '../components/DogStatsTable'

export default function TopDogs() {
  const [topPlacement, setTopPlacement] = useState([])
  const [topScore, setTopScore] = useState([])
  const [breeds, setBreeds] = useState([])
  const [years, setYears] = useState([])
  
  const [loadingFilters, setLoadingFilters] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)
  
  const [activeTab, setActiveTab] = useState('placement')
  const [filterBreed, setFilterBreed] = useState('')
  const [filterYear, setFilterYear] = useState('2026')
  const [topSpeed, setTopSpeed] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    if (filterYear) {
      fetchTopData()
    }
  }, [filterYear])

  useEffect(() => {
    if (filterBreed) {
      fetchTopData()
    }
  }, [filterBreed])

  const fetchFilters = async () => {
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
    } catch (error) {
      console.error('Error fetching filters:', error)
      setError(`Ошибка при загрузке фильтров: ${error.message}`)
    } finally {
      setLoadingFilters(false)
    }
  }

  const fetchTopData = async () => {
    setLoadingData(true)
    setError(null)
    
    try {
      const [placementResult, scoreResult, speedResult] = await Promise.all([
        api.getTopPlacement(filterYear, filterBreed, 0),
        api.getTopScore(filterYear, filterBreed, 0),
        api.getTopSpeed(filterYear, filterBreed, 0)
      ])
      
      if (placementResult.source === 'mock') {
        console.log('✓ TopPlacement загружены из моков')
      } else {
        console.log('✓ TopPlacement загружены из API')
      }

      if (scoreResult.source === 'mock') {
        console.log('✓ TopScore загружены из моков')
      } else {
        console.log('✓ TopScore загружены из API')
      }

      if (speedResult.source === 'mock') {
        console.log('✓ TopSpeed загружены из моков')
      } else {
        console.log('✓ TopSpeed загружены из API')
      }
      
      setTopPlacement(placementResult.data || [])
      setTopScore(scoreResult.data || [])
      setTopSpeed(speedResult.data || [])

      if (!placementResult.success || !scoreResult.success) {
        setError('Не удалось загрузить данные таблиц. Используются демо-данные.')
      }
    } catch (error) {
      console.error('Error fetching top data:', error)
      setError(`Ошибка при загрузке таблиц: ${error.message}`)
    } finally {
      setLoadingData(false)
    }
  }

  const filteredPlacement = topPlacement.filter(dog => {
    if (filterBreed && dog.breed !== filterBreed) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = dog.name_lat && dog.name_lat.toLowerCase().includes(query)
      const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
      const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
      if (!nameMatch && !breedMatch && !startsMatch) return false
    }
    return true
  })

  const filteredScore = topScore.filter(dog => {
    if (filterBreed && dog.breed !== filterBreed) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = dog.name_lat && dog.name_lat.toLowerCase().includes(query)
      const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
      const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
      if (!nameMatch && !breedMatch && !startsMatch) return false
    }
    return true
  })

  const filteredSpeed = topSpeed.filter(dog => {
    if (filterBreed && dog.breed !== filterBreed) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = dog.name_lat && dog.name_lat.toLowerCase().includes(query)
      const breedMatch = dog.breed && dog.breed.toLowerCase().includes(query)
      const startsMatch = dog.total_starts && dog.total_starts.toString().includes(query)
      if (!nameMatch && !breedMatch && !startsMatch) return false
    }
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
      
      {/* Search and filters section */}
      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
          disabled={loadingFilters}
        >
          <option value="">Все годы</option>
          {years.map(y => (
            <option key={y.year} value={y.year} className="text-gray-900">{y.year}</option>
          ))}
        </select>
        
        <select
          value={filterBreed}
          onChange={(e) => {
            setFilterBreed(e.target.value)
          }}
          className="h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        >
          <option value="">Все породы</option>
          {breeds.map(b => (
            <option key={b.breed} value={b.breed} className="text-gray-900">{b.breed}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Поиск по кличке, породе или количеству участий..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-64 h-12 px-5 py-3 bg-white border-2 border-old-money-300 rounded-xl text-old-money-800 focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all duration-300 shadow-sm"
        />
      </div>

      {/* Tabs section */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab('placement')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'placement' 
              ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-lg shadow-gold-500/30' 
              : 'bg-white border-2 border-old-money-300 text-old-money-700 hover:bg-old-money-50'
          }`}
        >
          По местам
        </button>
        <button
          onClick={() => setActiveTab('score')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'score' 
              ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-lg shadow-gold-500/30' 
              : 'bg-white border-2 border-old-money-300 text-old-money-700 hover:bg-old-money-50'
          }`}
        >
          По очкам
        </button>
        <button
          onClick={() => setActiveTab('speed')}
          className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
            activeTab === 'speed' 
              ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-lg shadow-gold-500/30' 
              : 'bg-white border-2 border-old-money-300 text-old-money-700 hover:bg-old-money-50'
          }`}
        >
          По скорости
        </button>
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
        <DogStatsTable data={filteredPlacement} type="placement" filterYear={filterYear} />
      ) : activeTab === 'score' ? (
        <DogStatsTable data={filteredScore} type="score" filterYear={filterYear} />
      ) : (
        <DogStatsTable data={filteredSpeed} type="speed" filterYear={filterYear} />
      )}
    </div>
  )
}
