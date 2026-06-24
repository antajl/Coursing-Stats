import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'

export default function DogTooltip({ dogId, position, onClose, pinned = false }) {
  const [dogData, setDogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    const fetchDogData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await api.getDogProfile(dogId)
        // Use data regardless of success (mock data fallback)
        if (result.data) {
          setDogData(result.data)
        } else {
          setError('Не удалось загрузить данные')
        }
      } catch (err) {
        setError('Ошибка загрузки')
        console.error('Error fetching dog data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (dogId) {
      fetchDogData()
    }
  }, [dogId])

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!position) return null

  const style = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
  }

  if (loading) {
    return (
      <div ref={tooltipRef} style={style} className="bg-white rounded-xl shadow-2xl border border-old-money-200 p-6 min-w-[320px] max-w-[400px]">
        <div className="text-center py-4">
          <div className="text-old-money-600">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div ref={tooltipRef} style={style} className="bg-white rounded-xl shadow-2xl border border-red-200 p-6 min-w-[320px] max-w-[400px]">
        <div className="text-center py-4">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (!dogData) return null

  const coursing = dogData.coursing_stats || {}
  const racing = dogData.racing_stats || {}

  return (
    <div ref={tooltipRef} style={style} className="bg-white rounded-2xl shadow-2xl border-2 border-gold-200 p-5 min-w-[600px] max-w-[800px] relative">
      {/* Header */}
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gold-700">{dogData.name_lat}</h3>
      </div>

      {/* Breed */}
      <div className="mb-5">
        <div className="bg-gradient-to-r from-gold-100 to-gold-50 text-gold-800 rounded-full text-sm font-semibold inline-block py-1.5 px-4 shadow-sm">
          {dogData.breed}
        </div>
      </div>

      {/* Close button - absolute positioned */}
      {pinned && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors"
        >
          ×
        </button>
      )}

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Coursing Block */}
        <div className="bg-gradient-to-br from-old-money-50 to-old-money-100 rounded-xl p-4 shadow-sm border border-old-money-200">
          <div className="text-sm font-bold text-old-money-700 uppercase tracking-wide mb-4">Курсинг</div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Всего участий</div>
              <div className="text-xl font-bold text-old-money-800">{coursing.total_starts || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Лучший результат</div>
              <div className="text-xl font-bold text-gold-600">{coursing.best_score || '—'}</div>
            </div>
            <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Средний результат</div>
              <div className="text-xl font-bold text-old-money-800">
                {coursing.avg_score !== undefined && coursing.avg_score !== null 
                  ? parseFloat(coursing.avg_score).toFixed(2) 
                  : '—'}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Золото</div>
              <div className="text-xl font-bold text-yellow-700">{coursing.gold || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Серебро</div>
              <div className="text-xl font-bold text-gray-700">{coursing.silver || 0}</div>
            </div>
            <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Бронза</div>
              <div className="text-xl font-bold text-orange-700">{coursing.bronze || 0}</div>
            </div>
          </div>
        </div>

        {/* Racing Block */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm border border-blue-200">
          <div className="text-sm font-bold text-blue-700 uppercase tracking-wide mb-4">Беги (рейсинг)</div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Всего участий</div>
              <div className="text-xl font-bold text-blue-800">{racing.total_starts || 0}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Лучшая скорость</div>
              <div className="text-xl font-bold text-blue-600">
                {racing.best_speed ? `${racing.best_speed} км/ч` : '—'}
              </div>
            </div>
            <div className="col-span-2 bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-500 mb-1 font-medium">Средняя скорость</div>
              <div className="text-xl font-bold text-blue-800">
                {racing.avg_speed ? `${racing.avg_speed} км/ч` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info */}
      {dogData.owner && (
        <div className="text-sm text-gray-600 pt-3 border-t border-gray-100">
          <span className="font-medium text-gray-700">Владелец:</span> {dogData.owner}
        </div>
      )}
    </div>
  )
}
