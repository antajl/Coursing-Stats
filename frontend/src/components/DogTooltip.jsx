import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { toPng } from 'html-to-image'
import { DogSilhouettes, getSilhouetteType } from './DogSilhouettes'

export default function DogTooltip({ dogId, position, onClose, pinned = false }) {
  const [dogData, setDogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [exporting, setExporting] = useState(false)
  const tooltipRef = useRef(null)
  const exportRef = useRef(null)

  const handleExport = async () => {
    if (!exportRef.current || exporting) return
    
    try {
      setExporting(true)
      const dataUrl = await toPng(exportRef.current, {
        quality: 1,
        pixelRatio: 2,
      })
      
      const link = document.createElement('a')
      link.download = `${dogData.name_lat.replace(/\s+/g, '_')}_card.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

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

  const silhouetteType = getSilhouetteType(dogData?.breed)
  const formatValue = (value) => value === null || value === undefined ? '—' : value

  if (loading) {
    return (
      <div ref={tooltipRef} style={style} className="bg-white rounded-xl shadow-2xl border border-old-money-200 p-6 min-w-[320px] max-w-[400px] animate-fade-in">
        <div className="text-center py-4">
          <div className="text-old-money-600">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div ref={tooltipRef} style={style} className="bg-white rounded-xl shadow-2xl border border-red-200 p-6 min-w-[320px] max-w-[400px] animate-fade-in">
        <div className="text-center py-4">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (!dogData) return null

  const coursing = dogData.coursing_stats || {}
  const racing = dogData.racing_stats || {}
  const hasCoursingData = coursing.total_starts > 0
  const hasRacingData = racing.total_starts > 0

  return (
    <>
      <DogSilhouettes />
      <div ref={tooltipRef} style={style} className="bg-white rounded-2xl shadow-2xl border-2 border-gold-200 p-5 min-w-[400px] max-w-[500px] relative animate-fade-in-scale">
        <div ref={exportRef} className="relative">
          {/* Header with names and silhouette */}
          <div className="flex items-start gap-4 mb-4 pb-3 border-b border-gray-100">
            {/* Silhouette */}
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-old-money-100 to-old-money-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-old-money-600">
                <use href={`#silhouette-${silhouetteType}`} />
              </svg>
            </div>
            
            {/* Names */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gold-700 truncate">{dogData.name_lat}</h3>
                {dogData.sex && (
                  <span className="text-lg text-gray-500 flex-shrink-0">
                    {dogData.sex === 'M' ? '♂' : '♀'}
                  </span>
                )}
              </div>
              {dogData.name_ru && (
                <div className="text-sm text-gray-600 truncate">{dogData.name_ru}</div>
              )}
            </div>
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
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors z-10"
            >
              ×
            </button>
          )}

          {/* Two column layout */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Coursing Block */}
            {hasCoursingData && (
              <div className="bg-gradient-to-br from-old-money-50 to-old-money-100 rounded-xl p-4 shadow-sm border border-old-money-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-bold text-old-money-700 uppercase tracking-wide">Курсинг</div>
                </div>
                <div className="text-xs text-gray-500 mb-4">курсинг + БЗМП</div>
                
                {/* Hero metric */}
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Лучший результат</div>
                  <div className="text-3xl font-bold text-gold-600">{formatValue(coursing.best_score)}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Всего участий</div>
                    <div className="text-lg font-bold text-old-money-800">{formatValue(coursing.total_starts)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Средний результат</div>
                    <div className="text-lg font-bold text-old-money-800">
                      {coursing.avg_score !== undefined && coursing.avg_score !== null 
                        ? parseFloat(coursing.avg_score).toFixed(2) 
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Medals in one row */}
                {(coursing.gold > 0 || coursing.silver > 0 || coursing.bronze > 0) && (
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white rounded-lg p-2 shadow-sm text-center">
                      <div className="text-lg">🥇</div>
                      <div className="text-sm font-bold text-yellow-700">{coursing.gold || 0}</div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-2 shadow-sm text-center">
                      <div className="text-lg">🥈</div>
                      <div className="text-sm font-bold text-gray-700">{coursing.silver || 0}</div>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-2 shadow-sm text-center">
                      <div className="text-lg">🥉</div>
                      <div className="text-sm font-bold text-orange-700">{coursing.bronze || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Racing Block */}
            {hasRacingData && (
              <div className="bg-gradient-to-br from-steel-50 to-steel-100 rounded-xl p-4 shadow-sm border border-steel-200">
                <div className="text-sm font-bold text-steel-700 uppercase tracking-wide mb-4">Беги (рейсинг)</div>
                
                {/* Hero metric */}
                <div className="bg-white rounded-lg p-4 shadow-sm mb-4 text-center">
                  <div className="text-xs text-gray-500 mb-1 font-medium">Лучшая скорость</div>
                  <div className="text-3xl font-bold text-steel-600">
                    {racing.best_speed ? `${racing.best_speed} км/ч` : '—'}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Всего участий</div>
                    <div className="text-lg font-bold text-steel-800">{formatValue(racing.total_starts)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-500 mb-1 font-medium">Средняя скорость</div>
                    <div className="text-lg font-bold text-steel-800">
                      {racing.avg_speed ? `${racing.avg_speed} км/ч` : '—'}
                    </div>
                  </div>
                </div>

                {/* Medals coming soon */}
                <div className="bg-steel-50 rounded-lg p-3 border border-dashed border-steel-300 text-center">
                  <div className="text-lg">⏳</div>
                  <div className="text-xs text-steel-600 font-medium">медали скоро</div>
                </div>
              </div>
            )}
          </div>

          {/* Additional info */}
          {dogData.owner && (
            <div className="text-sm text-gray-600 pt-3 border-t border-gray-100">
              <span className="font-medium text-gray-700">Владелец:</span> {dogData.owner}
            </div>
          )}

          {/* Watermark for export */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-50">
            procoursing-stats
          </div>
        </div>

        {/* Export button - only in pinned state */}
        {pinned && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="mt-4 w-full bg-gradient-to-r from-gold-400 to-gold-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-gold-500 hover:to-gold-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Экспорт...' : 'Скачать карточку'}
          </button>
        )}
      </div>
    </>
  )
}
