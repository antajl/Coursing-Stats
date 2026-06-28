import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DogTooltip from './DogTooltip';

const PAGE_SIZE = 50;

export default function DogStatsTable({ data, type = 'placement', filterYear }) {
  const [tooltipDog, setTooltipDog] = useState(null)
  const [anchorRect, setAnchorRect] = useState(null)
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-old-money-600">Нет данных</div>;
  }

  const handleSort = (key) => {
    setPage(0)
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    let aValue = a[sortConfig.key]
    let bValue = b[sortConfig.key]
    
    // Handle nested properties
    if (sortConfig.key === 'name') {
      aValue = a.name_lat
      bValue = b.name_lat
    }
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    return sortConfig.direction === 'asc' 
      ? aValue - bValue
      : bValue - aValue
  })

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE)
  const pageData = sortedData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleMouseEnter = (e, dogId) => {
    setAnchorRect(e.target.getBoundingClientRect())
    setTooltipDog(dogId)
  }

  const handleMouseLeave = () => {
    setTooltipDog(null)
    setAnchorRect(null)
  }

  const handleClick = (e, dogId) => {
    e.preventDefault()
    navigate(`/dog/${dogId}`)
  }

  const closeTooltip = () => {
    setTooltipDog(null)
    setAnchorRect(null)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-old-money-200">
        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-3">
          {pageData.map((dog, index) => (
            <div key={dog.dog_id} className="bg-old-money-50 rounded-xl p-4 hover:bg-old-money-100 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">#{page * PAGE_SIZE + index + 1}</div>
                  <button
                    onClick={(e) => handleClick(e, dog.dog_id)}
                    className="text-base font-bold text-gold-600 hover:text-gold-500"
                  >
                    {dog.name_lat}
                  </button>
                  <div className="text-xs text-gray-600 mt-1">{dog.breed}</div>
                  {filterYear && (
                    <div className="text-xs text-gray-500 mt-1">Год: {dog.year}</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {type === 'placement' ? (
                  <>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-lg">🥇</div>
                      <div className="font-bold text-old-money-800">{dog.gold}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-lg">🥈</div>
                      <div className="font-bold text-old-money-800">{dog.silver}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-lg">🥉</div>
                      <div className="font-bold text-old-money-800">{dog.bronze}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <div className="text-gray-500">Участий</div>
                      <div className="font-bold text-old-money-800">{dog.total_starts}</div>
                    </div>
                  </>
                ) : type === 'speed' ? (
                  <>
                    <div className="bg-white rounded-lg p-2 text-center col-span-2">
                      <div className="text-gray-500">Лучшая</div>
                      <div className="font-bold text-old-money-800">{dog.best_speed ? `${dog.best_speed} км/ч` : '-'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center col-span-2">
                      <div className="text-gray-500">Средняя</div>
                      <div className="font-bold text-old-money-800">{dog.avg_speed ? `${dog.avg_speed} км/ч` : '-'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center col-span-4">
                      <div className="text-gray-500">Участий</div>
                      <div className="font-bold text-old-money-800">{dog.total_starts}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-lg p-2 text-center col-span-2">
                      <div className="text-gray-500">Лучший</div>
                      <div className="font-bold text-old-money-800">{dog.best_score ? parseFloat(dog.best_score).toFixed(2).replace(/\.00$/, '') : '-'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center col-span-2">
                      <div className="text-gray-500">Средний</div>
                      <div className="font-bold text-old-money-800">{dog.avg_score ? parseFloat(dog.avg_score).toFixed(2).replace(/\.00$/, '') : '-'}</div>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center col-span-4">
                      <div className="text-gray-500">Участий</div>
                      <div className="font-bold text-old-money-800">{dog.total_starts}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[800px]">
          <thead className="bg-gradient-to-r from-gold-100 to-old-money-100">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                onClick={() => handleSort('rank')}
              >
                # {sortConfig.key === 'rank' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {filterYear && (
                <th 
                  className="px-6 py-4 text-left text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                  onClick={() => handleSort('year')}
                >
                  Год {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              )}
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                onClick={() => handleSort('name')}
              >
                Собака {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                onClick={() => handleSort('breed')}
              >
                Порода {sortConfig.key === 'breed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {type === 'placement' ? (
                <>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('gold')}
                  >
                    🥇 {sortConfig.key === 'gold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('silver')}
                  >
                    🥈 {sortConfig.key === 'silver' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('bronze')}
                  >
                    🥉 {sortConfig.key === 'bronze' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              ) : type === 'speed' ? (
                <>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('best_speed')}
                  >
                    Лучшая скорость {sortConfig.key === 'best_speed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('avg_speed')}
                  >
                    Средняя скорость {sortConfig.key === 'avg_speed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              ) : (
                <>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('best_score')}
                  >
                    Лучший {sortConfig.key === 'best_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                    onClick={() => handleSort('avg_score')}
                  >
                    Средний {sortConfig.key === 'avg_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              )}
              <th 
                className="px-6 py-4 text-center text-xs font-bold text-gold-700 uppercase tracking-wider cursor-pointer hover:bg-gold-200"
                onClick={() => handleSort('total_starts')}
              >
                Участий {sortConfig.key === 'total_starts' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-old-money-200">
            {pageData.map((dog, index) => (
              <tr key={dog.dog_id} className="hover:bg-old-money-50">
                <td className="px-6 py-4 text-sm text-old-money-800 font-bold">
                  {page * PAGE_SIZE + index + 1}
                </td>
                {filterYear && (
                  <td className="px-6 py-4 text-sm text-old-money-800">
                    {dog.year}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-old-money-800">
                  <span 
                    className="text-gold-600 hover:text-gold-500 font-medium cursor-pointer"
                    onMouseEnter={(e) => handleMouseEnter(e, dog.dog_id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleClick(e, dog.dog_id)}
                  >
                    {dog.name_lat}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-old-money-800">
                  {dog.breed}
                </td>
                {type === 'placement' ? (
                  <>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold shadow-md">
                        {dog.gold}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-bold shadow-md">
                        {dog.silver}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold shadow-md">
                        {dog.bronze}
                      </span>
                    </td>
                  </>
                ) : type === 'speed' ? (
                  <>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800 font-bold">
                      {dog.best_speed ? `${dog.best_speed} км/ч` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800">
                      {dog.avg_speed ? `${dog.avg_speed} км/ч` : '-'}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800 font-bold">
                      {dog.best_score ? parseFloat(dog.best_score).toFixed(2).replace(/\.00$/, '') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800">
                      {dog.avg_score ? parseFloat(dog.avg_score).toFixed(2).replace(/\.00$/, '') : '-'}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 text-center text-sm text-old-money-800">
                  {dog.total_starts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-old-money-600">
          <span>
            Показано {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedData.length)} из {sortedData.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg border border-old-money-300 bg-white disabled:opacity-40 hover:bg-old-money-50"
            >
              Назад
            </button>
            <span className="px-3 py-2">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg border border-old-money-300 bg-white disabled:opacity-40 hover:bg-old-money-50"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
      
      {tooltipDog && anchorRect && (
        <DogTooltip
          dogId={tooltipDog}
          anchorRect={anchorRect}
          onClose={closeTooltip}
        />
      )}
    </>
  );
}
