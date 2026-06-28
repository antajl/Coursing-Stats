import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '../services/api'
import { DogSilhouettes, getSilhouetteType } from './DogSilhouettes'

// Вычисляет позицию карточки так, чтобы она не выходила за границы экрана
function computePosition(anchorRect, cardWidth, cardHeight) {
  const margin = 12
  const vw = window.innerWidth
  const vh = window.innerHeight

  let x = anchorRect.right + margin
  let y = anchorRect.top

  // Не помещается справа → открываем слева
  if (x + cardWidth > vw - margin) {
    x = anchorRect.left - cardWidth - margin
  }
  // Не помещается слева тоже → прижимаем к правому краю
  if (x < margin) {
    x = vw - cardWidth - margin
  }
  // Не помещается снизу → сдвигаем вверх
  if (y + cardHeight > vh - margin) {
    y = vh - cardHeight - margin
  }
  // Не уходим выше экрана
  if (y < margin) {
    y = margin
  }

  return { x, y }
}

export default function DogTooltip({ dogId, anchorRect, onClose }) {
  const [dogData, setDogData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [position, setPosition] = useState({ x: -9999, y: -9999 })

  const tooltipRef = useRef(null)

  // Пересчитываем позицию когда карточка отрендерилась и мы знаем её размер
  useEffect(() => {
    if (!anchorRect || !tooltipRef.current) return
    const rect = tooltipRef.current.getBoundingClientRect()
    const pos = computePosition(anchorRect, rect.width, rect.height)
    setPosition(pos)
  }, [anchorRect, dogData])

  useEffect(() => {
    if (!dogId) return
    const fetchDogData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await api.getDogProfile(dogId)
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
    fetchDogData()
  }, [dogId])

  // Закрытие по клику снаружи
  const handleClickOutside = useCallback((e) => {
    if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  if (!anchorRect) return null

  const style = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
    // Прячем до первого пересчёта позиции чтобы не было прыжка
    visibility: position.x === -9999 ? 'hidden' : 'visible',
  }

  // ── Загрузка ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div ref={tooltipRef} style={style}
        className="bg-white rounded-2xl shadow-2xl border border-old-money-200 p-5 w-[320px] md:w-[440px] animate-fade-in">
        <div className="flex items-center gap-3 text-old-money-500">
          <div className="w-4 h-4 border-2 border-old-money-300 border-t-gold-500 rounded-full animate-spin" />
          <span className="text-sm">Загрузка...</span>
        </div>
      </div>
    )
  }

  // ── Ошибка ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div ref={tooltipRef} style={style}
        className="bg-white rounded-2xl shadow-2xl border border-red-200 p-5 w-[320px] md:w-[440px] animate-fade-in">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    )
  }

  if (!dogData) return null

  const coursing = dogData.coursing_stats || {}
  const racing = dogData.racing_stats || {}
  const hasCoursingData = coursing.total_starts > 0
  const hasRacingData = racing.total_starts > 0

  const silhouetteType = getSilhouetteType(dogData?.breed)

  // Имя на русском показываем только если оно отличается от латинского
  const showRuName = dogData.name_ru && dogData.name_ru !== dogData.name_lat

  const hasCourseMedals = coursing.gold > 0 || coursing.silver > 0 || coursing.bronze > 0

  const formatScore = (v) =>
    v !== undefined && v !== null ? parseFloat(v).toFixed(2) : '—'

  // Ссылка на лучшее соревнование
  const bestScoreUrl = coursing.best_score_event_url || null
  const bestSpeedUrl = racing.best_speed_event_url || null

  // ── ПОЛНАЯ карточка (единственный режим) ─────────────────────────────────
  return (
    <>
      <DogSilhouettes />
      <div ref={tooltipRef} style={style}
        className="bg-white rounded-2xl shadow-2xl border border-old-money-200 w-[320px] md:w-[440px] animate-fade-in-scale">

        <div className="p-4 md:p-5 relative">

          {/* ── Шапка ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-old-money-100">
            {/* Силуэт */}
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-old-money-100 to-old-money-200 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-old-money-600">
                <use href={`#silhouette-${silhouetteType}`} />
              </svg>
            </div>

            {/* Имя и порода — всё выровнено по левому краю силуэта */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gold-700 leading-tight">
                  {dogData.name_lat}
                </h3>
                {dogData.sex && (
                  <span className="text-sm text-gray-400 flex-shrink-0">
                    {dogData.sex === 'M' ? '♂' : '♀'}
                  </span>
                )}
              </div>
              {showRuName && (
                <div className="text-xs text-gray-500 mt-0.5 truncate">{dogData.name_ru}</div>
              )}
              {/* Порода — под именем, не правее */}
              <div className="mt-1.5">
                <span className="inline-block bg-old-money-100 text-old-money-700 text-xs font-medium rounded-full py-0.5 px-3">
                  {dogData.breed}
                </span>
              </div>
            </div>
          </div>

          {/* ── Блоки дисциплин ───────────────────────────────────────────── */}
          <div className={`grid gap-3 mb-4 ${hasCoursingData && hasRacingData ? 'grid-cols-2' : 'grid-cols-1'}`}>

            {/* Курсинг */}
            {hasCoursingData && (
              <div className="bg-gradient-to-br from-old-money-50 to-old-money-100 rounded-xl p-3 border border-old-money-200">
                <div className="text-xs font-bold text-old-money-700 mb-3">Курсинг / БЗМП</div>

                {/* Лучший результат — кликабельный если есть ссылка */}
                {bestScoreUrl ? (
                  <a
                    href={bestScoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-3 shadow-sm mb-3 text-center group hover:bg-gold-50 transition-colors"
                    title="Открыть протокол соревнования"
                  >
                    <div className="text-[10px] text-gray-400 mb-1">Лучший результат</div>
                    <div className="text-2xl font-bold text-gold-600 leading-none group-hover:text-gold-500">
                      {coursing.best_score ?? '—'}
                    </div>
                    <div className="text-[10px] text-gold-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      открыть протокол →
                    </div>
                  </a>
                ) : (
                  <div className="bg-white rounded-lg p-3 shadow-sm mb-3 text-center">
                    <div className="text-[10px] text-gray-400 mb-1">Лучший результат</div>
                    <div className="text-2xl font-bold text-gold-600 leading-none">
                      {coursing.best_score ?? '—'}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                    <div className="text-[10px] text-gray-400 mb-0.5">Участия</div>
                    <div className="text-base font-bold text-old-money-800">{coursing.total_starts}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                    <div className="text-[10px] text-gray-400 mb-0.5">Средний</div>
                    <div className="text-base font-bold text-old-money-800">{formatScore(coursing.avg_score)}</div>
                  </div>
                </div>

                {/* Медали */}
                {hasCourseMedals && (
                  <div className="flex gap-1.5">
                    {[
                      { emoji: '🥇', count: coursing.gold, color: 'text-yellow-700' },
                      { emoji: '🥈', count: coursing.silver, color: 'text-gray-600' },
                      { emoji: '🥉', count: coursing.bronze, color: 'text-orange-700' },
                    ].map(({ emoji, count, color }) => (
                      <div key={emoji} className="flex-1 bg-white rounded-lg py-1.5 shadow-sm text-center">
                        <div className="text-sm">{emoji}</div>
                        <div className={`text-xs font-bold ${color}`}>{count || 0}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Рейсинг */}
            {hasRacingData && (
              <div className="bg-gradient-to-br from-steel-50 to-steel-100 rounded-xl p-3 border border-steel-200">
                <div className="text-xs font-bold text-steel-700 mb-3">Рейсинг</div>

                {/* Лучшая скорость — кликабельная если есть ссылка */}
                {bestSpeedUrl ? (
                  <a
                    href={bestSpeedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-white rounded-lg p-3 shadow-sm mb-3 text-center group hover:bg-steel-50 transition-colors"
                    title="Открыть протокол соревнования"
                  >
                    <div className="text-[10px] text-gray-400 mb-1">Лучшая скорость</div>
                    {/* whitespace-nowrap не даёт км/ч переноситься */}
                    <div className="text-2xl font-bold text-steel-600 leading-none group-hover:text-steel-500 whitespace-nowrap">
                      {racing.best_speed ?? '—'}
                      {racing.best_speed && <span className="text-sm font-normal text-gray-400 ml-1">км/ч</span>}
                    </div>
                    <div className="text-[10px] text-steel-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      открыть протокол →
                    </div>
                  </a>
                ) : (
                  <div className="bg-white rounded-lg p-3 shadow-sm mb-3 text-center">
                    <div className="text-[10px] text-gray-400 mb-1">Лучшая скорость</div>
                    <div className="text-2xl font-bold text-steel-600 leading-none whitespace-nowrap">
                      {racing.best_speed ?? '—'}
                      {racing.best_speed && <span className="text-sm font-normal text-gray-400 ml-1">км/ч</span>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                    <div className="text-[10px] text-gray-400 mb-0.5">Участия</div>
                    <div className="text-base font-bold text-steel-800">{racing.total_starts}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 shadow-sm text-center">
                    <div className="text-[10px] text-gray-400 mb-0.5">Средняя</div>
                    {/* whitespace-nowrap предотвращает перенос "км/ч" на вторую строку */}
                    <div className="text-base font-bold text-steel-800 whitespace-nowrap">
                      {racing.avg_speed
                        ? <>{racing.avg_speed}<span className="text-[10px] font-normal text-gray-400 ml-0.5">км/ч</span></>
                        : '—'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Владелец ──────────────────────────────────────────────────── */}
          {dogData.owner && (
            <div className="text-xs text-gray-500 pt-3 border-t border-old-money-100">
              <span className="font-medium text-gray-600">Владелец:</span> {dogData.owner}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
