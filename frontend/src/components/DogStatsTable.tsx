import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DogTooltip from './DogTooltip';
import DogNameLines from './DogNameLines';
import { parseDogName } from '../lib/dogName';
import { MedalIcon } from './MedalTally';

const PAGE_SIZE = 50;

export default function DogStatsTable({ data, type = 'placement', filterYear }) {
  const getRowYear = (dog) => dog.year ?? filterYear
  const [tooltipDog, setTooltipDog] = useState(null)
  const [pointer, setPointer] = useState(null)
  const [page, setPage] = useState(0)
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-old-money-600 dark:text-old-money-400">Нет данных</div>;
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
      aValue = parseDogName(a.name_lat, a.name_ru).primary
      bValue = parseDogName(b.name_lat, b.name_ru).primary
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
    setPointer({ x: e.clientX, y: e.clientY })
    setTooltipDog(dogId)
  }

  const handleMouseLeave = () => {
    setTooltipDog(null)
    setPointer(null)
  }

  const handleClick = (e, dogId) => {
    e.preventDefault()
    navigate(`/dog/${dogId}`)
  }

  const closeTooltip = () => {
    setTooltipDog(null)
    setPointer(null)
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-md">
        {/* Mobile cards */}
        <div className="md:hidden space-y-3 p-3">
          {pageData.map((dog, index) => (
            <div key={dog.dog_id} className="rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-700 p-4 transition-colors hover:bg-cream-100 dark:hover:bg-charcoal-600">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-xs text-old-money-500 dark:text-old-money-400 mb-1">#{page * PAGE_SIZE + index + 1}</div>
                  <button
                    onClick={(e) => handleClick(e, dog.dog_id)}
                    className="text-left transition-colors hover:text-camel-800 dark:hover:text-camel-300"
                  >
                    <DogNameLines
                      name_lat={dog.name_lat}
                      name_ru={dog.name_ru}
                      primaryClassName="text-base font-bold text-camel-700 dark:text-camel-400"
                    />
                  </button>
                  <div className="text-xs text-old-money-600 dark:text-old-money-400 mt-1">{dog.breed}</div>
                  {filterYear && (
                    <div className="text-xs text-old-money-500 dark:text-old-money-400 mt-1">Год: {getRowYear(dog)}</div>
                  )}
                </div>
              </div>
              {type === 'placement' && (
                <div className="grid grid-cols-4 gap-2 text-xs mb-1.5">
                  <div className="flex justify-center" title="1-е место">
                    <MedalIcon variant="gold" size="sm" />
                  </div>
                  <div className="flex justify-center" title="2-е место">
                    <MedalIcon variant="silver" size="sm" />
                  </div>
                  <div className="flex justify-center" title="3-е место">
                    <MedalIcon variant="bronze" size="sm" />
                  </div>
                  <div className="text-center text-old-money-500 dark:text-old-money-400">Участий</div>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 text-xs">
                {type === 'placement' ? (
                  <>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center">
                      <div className="font-bold tabular-nums text-old-money-800 dark:text-old-money-200">{dog.gold}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center">
                      <div className="font-bold tabular-nums text-old-money-800 dark:text-old-money-200">{dog.silver}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center">
                      <div className="font-bold tabular-nums text-old-money-800 dark:text-old-money-200">{dog.bronze}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center">
                      <div className="font-bold tabular-nums text-old-money-800 dark:text-old-money-200">{dog.total_starts}</div>
                    </div>
                  </>
                ) : type === 'speed' ? (
                  <>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center col-span-2">
                      <div className="text-old-money-500 dark:text-old-money-400">Лучшая</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-200">{dog.best_speed ? `${dog.best_speed} км/ч` : '-'}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center col-span-2">
                      <div className="text-old-money-500 dark:text-old-money-400">Средняя</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-200">{dog.avg_speed ? `${dog.avg_speed} км/ч` : '-'}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center col-span-4">
                      <div className="text-old-money-500 dark:text-old-money-400">Участий</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-200">{dog.total_starts}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center col-span-2">
                      <div className="text-old-money-500 dark:text-old-money-400">Лучший</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-200">{dog.best_score ? parseFloat(dog.best_score).toFixed(2).replace(/\.00$/, '') : '-'}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center col-span-2">
                      <div className="text-old-money-500 dark:text-old-money-400">Средний</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-200">{dog.avg_score ? parseFloat(dog.avg_score).toFixed(2).replace(/\.00$/, '') : '-'}</div>
                    </div>
                    <div className="bg-white dark:bg-charcoal-700 rounded-lg p-2 text-center col-span-4">
                      <div className="text-old-money-500 dark:text-old-money-400">Участий</div>
                      <div className="font-bold text-old-money-800 dark:text-old-money-200">{dog.total_starts}</div>
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
          <thead className="bg-cream-100 dark:bg-charcoal-700">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('rank')}
              >
                # {sortConfig.key === 'rank' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {filterYear && (
                <th 
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                  onClick={() => handleSort('year')}
                >
                  Год {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
              )}
              <th 
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('name')}
              >
                Собака {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('breed')}
              >
                Порода {sortConfig.key === 'breed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              {type === 'placement' ? (
                <>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('gold')}
                    title="1-е место"
                    aria-label="1-е место"
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      <MedalIcon variant="gold" size="md" />
                      {sortConfig.key === 'gold' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('silver')}
                    title="2-е место"
                    aria-label="2-е место"
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      <MedalIcon variant="silver" size="md" />
                      {sortConfig.key === 'silver' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('bronze')}
                    title="3-е место"
                    aria-label="3-е место"
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      <MedalIcon variant="bronze" size="md" />
                      {sortConfig.key === 'bronze' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </span>
                  </th>
                </>
              ) : type === 'speed' ? (
                <>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('best_speed')}
                  >
                    Лучшая скорость {sortConfig.key === 'best_speed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('avg_speed')}
                  >
                    Средняя скорость {sortConfig.key === 'avg_speed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              ) : (
                <>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('best_score')}
                  >
                    Лучший {sortConfig.key === 'best_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('avg_score')}
                  >
                    Средний {sortConfig.key === 'avg_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </>
              )}
              <th 
                className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 cursor-pointer hover:bg-cream-200 dark:hover:bg-charcoal-600"
                onClick={() => handleSort('total_starts')}
              >
                Участий {sortConfig.key === 'total_starts' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
            {pageData.map((dog, index) => (
              <tr key={dog.dog_id} className="transition-colors hover:bg-cream-50 dark:hover:bg-charcoal-700">
                <td className="px-6 py-4 text-sm text-old-money-800 dark:text-old-money-300 font-bold">
                  {page * PAGE_SIZE + index + 1}
                </td>
                {filterYear && (
                  <td className="px-6 py-4 text-sm text-old-money-800 dark:text-old-money-300">
                    {getRowYear(dog)}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-old-money-800 dark:text-old-money-300">
                  <span 
                    className="cursor-pointer transition-colors hover:text-camel-800 dark:hover:text-camel-300"
                    onMouseEnter={(e) => handleMouseEnter(e, dog.dog_id)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleClick(e, dog.dog_id)}
                  >
                    <DogNameLines
                      name_lat={dog.name_lat}
                      name_ru={dog.name_ru}
                      primaryClassName="font-medium text-camel-700 dark:text-camel-400"
                    />
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-old-money-800 dark:text-old-money-300">
                  {dog.breed}
                </td>
                {type === 'placement' ? (
                  <>
                    <td className="px-6 py-4 text-center text-sm font-semibold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                      {dog.gold}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                      {dog.silver}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold tabular-nums text-charcoal-800 dark:text-charcoal-100">
                      {dog.bronze}
                    </td>
                  </>
                ) : type === 'speed' ? (
                  <>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800 dark:text-old-money-200 font-bold">
                      {dog.best_speed ? `${dog.best_speed} км/ч` : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800 dark:text-old-money-200">
                      {dog.avg_speed ? `${dog.avg_speed} км/ч` : '-'}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800 dark:text-old-money-200 font-bold">
                      {dog.best_score ? parseFloat(dog.best_score).toFixed(2).replace(/\.00$/, '') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-old-money-800 dark:text-old-money-200">
                      {dog.avg_score ? parseFloat(dog.avg_score).toFixed(2).replace(/\.00$/, '') : '-'}
                    </td>
                  </>
                )}
                <td className="px-6 py-4 text-center text-sm text-old-money-800 dark:text-old-money-200">
                  {dog.total_starts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-old-money-700 dark:text-old-money-400">
          <span>
            Показано {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedData.length)} из {sortedData.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-2 transition-colors hover:bg-cream-50 dark:hover:bg-charcoal-700 disabled:opacity-40"
            >
              Назад
            </button>
            <span className="px-3 py-2 min-h-[44px] flex items-center">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="min-h-[44px] min-w-[44px] rounded-lg border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-2 transition-colors hover:bg-cream-50 dark:hover:bg-charcoal-700 disabled:opacity-40"
            >
              Вперёд
            </button>
          </div>
        </div>
      )}
      
      {tooltipDog && pointer && (
        <DogTooltip
          dogId={tooltipDog}
          pointer={pointer}
          onClose={closeTooltip}
        />
      )}
    </>
  );
}
