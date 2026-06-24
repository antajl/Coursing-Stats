import { useState } from 'react';
import DogTooltip from './DogTooltip';

export default function DogStatsTable({ data, type = 'placement', filterYear }) {
  const [tooltipDog, setTooltipDog] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState(null)
  const [tooltipPinned, setTooltipPinned] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-old-money-600">Нет данных</div>;
  }

  const handleSort = (key) => {
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

  const handleMouseEnter = (e, dogId) => {
    if (!tooltipPinned && !isClicking) {
      const rect = e.target.getBoundingClientRect()
      setTooltipPosition({
        x: rect.right + 10,
        y: rect.top
      })
      setTooltipDog(dogId)
    }
  }

  const handleMouseLeave = () => {
    if (!tooltipPinned && !isClicking) {
      setTooltipDog(null)
      setTooltipPosition(null)
    }
  }

  const handleClick = (e, dogId) => {
    e.preventDefault()
    setIsClicking(true)
    const rect = e.target.getBoundingClientRect()
    setTooltipPosition({
      x: rect.right + 10,
      y: rect.top
    })
    setTooltipDog(dogId)
    setTooltipPinned(true)
    
    // Reset clicking flag after a short delay
    setTimeout(() => setIsClicking(false), 100)
  }

  const closeTooltip = () => {
    setTooltipDog(null)
    setTooltipPosition(null)
    setTooltipPinned(false)
    setIsClicking(false)
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-old-money-200">
        <table className="w-full">
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
            {sortedData.map((dog, index) => (
              <tr key={dog.dog_id} className="hover:bg-old-money-50">
                <td className="px-6 py-4 text-sm text-old-money-800 font-bold">
                  {index + 1}
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
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gold-400 to-gold-500 text-white font-bold shadow-md">
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
                      {dog.best_score}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800">
                      {dog.avg_score}
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
      
      {tooltipDog && tooltipPosition && (
        <DogTooltip 
          dogId={tooltipDog} 
          position={tooltipPosition} 
          onClose={closeTooltip}
          pinned={tooltipPinned}
        />
      )}
    </>
  );
}
