import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Gauge, ArrowUpRight } from 'lucide-react'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import DogSexIcon from '../../components/DogSexIcon'
import { parseDogName } from '../../lib/dogName'
import type { AnnualDogLeader } from '../../hooks/useStaticData'

export interface SpeedRecordItem {
  breed?: string
  name?: string
  sex?: string
  speed_km_h?: number
  date?: string
  track_type?: string
}

interface BreedHubColumnsProps {
  annualLeaders: AnnualDogLeader[]
  annualLeadersLoading: boolean
  speedRecords: SpeedRecordItem[]
  doninoLoading: boolean
  canonicalKey: string
  breedNameRu: string
}

function formatSeasonsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} сезонов`
  if (mod10 === 1) return `${count} сезон`
  if (mod10 >= 2 && mod10 <= 4) return `${count} сезона`
  return `${count} сезонов`
}

function formatRunsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} замеров`
  if (mod10 === 1) return `${count} замер`
  if (mod10 >= 2 && mod10 <= 4) return `${count} замера`
  return `${count} замеров`
}

export default function BreedHubColumns({
  annualLeaders,
  annualLeadersLoading,
  speedRecords,
  doninoLoading,
  canonicalKey,
  breedNameRu,
}: BreedHubColumnsProps) {
  const [activeMobileTab, setActiveMobileTab] = useState<'champions' | 'donino'>('champions')

  const hasDoninoRecords = speedRecords.length > 0

  // Мобильный свайп-жест между Залом славы и Донино
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const hadMovedRef = useRef(false)
  const gapPx = 16

  const getSlideOffset = useCallback(
    (slideIndex: number) => {
      return slideIndex === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
    },
    [gapPx],
  )

  useEffect(() => {
    if (trackRef.current && (typeof window === 'undefined' || window.innerWidth < 1024)) {
      const slideIndex = activeMobileTab === 'champions' ? 0 : 1
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(slideIndex)}, 0, 0)`
    }
  }, [activeMobileTab, getSlideOffset])

  const startDrag = (clientX: number, clientY: number) => {
    if (!hasDoninoRecords || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || !hasDoninoRecords || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = touchStartRef.current
    const dx = clientX - touch.x
    const dy = clientY - touch.y

    if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
      hadMovedRef.current = true
    }

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 7 && absDy < 7) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }

    if (gestureLockRef.current === 'horizontal' && trackRef.current) {
      const currentSlide = activeMobileTab === 'champions' ? 0 : 1
      const isAtLeftEdge = currentSlide === 0 && dx > 0
      const isAtRightEdge = currentSlide === 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = currentSlide === 0 ? '0%' : `calc(-100% - ${gapPx}px)`
      trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
    }
  }

  const endDrag = (clientX: number) => {
    if (!touchStartRef.current || !hasDoninoRecords || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    const track = trackRef.current
    const currentSlide = activeMobileTab === 'champions' ? 0 : 1

    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetSlide: 0 | 1 = currentSlide

      if (isSwipeLeft && currentSlide === 0) {
        targetSlide = 1
      } else if (isSwipeRight && currentSlide === 1) {
        targetSlide = 0
      }

      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(targetSlide)}, 0, 0)`

      if (targetSlide !== currentSlide) {
        setActiveMobileTab(targetSlide === 0 ? 'champions' : 'donino')
      }
    } else if (track) {
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  const cancelDrag = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current && hasDoninoRecords) {
      const currentSlide = activeMobileTab === 'champions' ? 0 : 1
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(currentSlide)}, 0, 0)`
    }
  }

  // Плашка заголовка Зала славы
  const championsPlaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 truncate">
          <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="truncate">Зал славы по годам</span>
          {annualLeaders.length > 0 && (
            <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
              · {formatSeasonsCount(annualLeaders.length)}
            </span>
          )}
        </span>
      }
      actionPlacement="right"
      action={
        <Link
          to={`/competitions/ranking/2026/?breed=${encodeURIComponent(canonicalKey)}`}
          className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2 sm:px-2.5 text-xs font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer shrink-0"
          title={`Полный официальный рейтинг породы ${breedNameRu}`}
        >
          <span className="hidden sm:inline">Рейтинг</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
        </Link>
      }
    />
  )

  // Плашка заголовка Донино
  const doninoPlaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 truncate">
          <Gauge className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="truncate">Рекорды Донино (км/ч)</span>
          {speedRecords.length > 0 && (
            <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
              · {formatRunsCount(speedRecords.length)}
            </span>
          )}
        </span>
      }
      actionPlacement="right"
      action={
        <Link
          to="/speed-records/"
          className="cs-glass-pill inline-flex h-8 items-center gap-1 rounded-full px-2 sm:px-2.5 text-xs font-semibold text-charcoal-700 hover:text-camel-800 cursor-pointer shrink-0"
          title="Открыть общую таблицу рекордов полигона Донино"
        >
          <span className="hidden sm:inline">Все рекорды</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
        </Link>
      }
    />
  )

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Мобильный переключатель колонок (Зал славы ↔ Рекорды Донино) */}
      {hasDoninoRecords && (
        <div className="flex lg:hidden items-center p-1 rounded-xl bg-cream-100/90 border border-old-money-200/60 gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveMobileTab('champions')}
            className={`flex-1 min-h-[36px] flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMobileTab === 'champions'
                ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-camel-700" />
            <span>Зал славы ({annualLeaders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('donino')}
            className={`flex-1 min-h-[36px] flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMobileTab === 'donino'
                ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Gauge className="h-3.5 w-3.5 text-camel-700" />
            <span>Донино ({speedRecords.length})</span>
          </button>
        </div>
      )}

      {/* Контейнер колонок: на десктопе 2 колонки рядом, на мобильном плавный свайп */}
      <div
        className="w-full relative overflow-x-clip lg:overflow-visible touch-pan-y select-none"
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={(e) => endDrag(e.changedTouches[0].clientX)}
        onTouchCancel={cancelDrag}
        onMouseDown={(e) => {
          if (e.button === 0) startDrag(e.clientX, e.clientY)
        }}
        onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
        onMouseUp={(e) => endDrag(e.clientX)}
        onMouseLeave={cancelDrag}
        onClickCapture={(e) => {
          if (hadMovedRef.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        <div
          ref={trackRef}
          className={`flex flex-nowrap w-full min-w-0 items-start gap-4 lg:grid ${
            hasDoninoRecords ? 'lg:grid-cols-2 lg:gap-6' : 'lg:grid-cols-1'
          } lg:!transform-none`}
          style={{
            transform:
              typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'none'
                : !hasDoninoRecords
                ? 'none'
                : `translate3d(${getSlideOffset(activeMobileTab === 'champions' ? 0 : 1)}, 0, 0)`,
            willChange: hasDoninoRecords ? 'transform' : 'auto',
          }}
        >
          {/* Слайд 1: Зал славы (соревнования по годам) */}
          <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
            <DoninoColumnShell plaque={championsPlaque}>
              {annualLeadersLoading ? (
                <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива по годам…</p>
              ) : annualLeaders.length === 0 ? (
                <div className="py-8 text-center text-xs text-old-money-600 px-4">
                  <p>В официальных протоколах состязаний РКФ с 2015 года забегов породы пока не зафиксировано.</p>
                </div>
              ) : (
                <>
                  {/* Десктопный вид (Таблица) */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-old-money-200/60 bg-cream-50/50 text-[11px] font-semibold uppercase tracking-wider text-charcoal-600">
                          <th className="py-2.5 px-3 w-16 text-center">Сезон</th>
                          <th className="py-2.5 px-3">Лучшая собака года</th>
                          <th className="py-2.5 px-2.5 w-20 text-center">Пол</th>
                          <th className="py-2.5 px-2.5 w-20 text-right">Забегов</th>
                          <th className="py-2.5 px-3 w-24 text-center">Медали</th>
                          <th className="py-2.5 px-3 w-28 text-right">Показатель</th>
                          <th className="py-2.5 px-2.5 w-16 text-right">Рейтинг</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-old-money-100">
                        {annualLeaders.map((item) => {
                          const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
                          const isMale = item.sex === 'M' || item.sex === 'К'
                          const isFemale = item.sex === 'F' || item.sex === 'С'
                          const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

                          return (
                            <tr key={item.year} className="hover:bg-cream-50/60 transition-colors">
                              <td className="py-2.5 px-3 text-center">
                                <span className="inline-block px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 text-camel-950 border border-camel-200/80">
                                  {item.year}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 min-w-[140px]">
                                <Link
                                  to={`/dog/${item.dog_id}/`}
                                  className="font-medium text-camel-950 hover:text-camel-800 hover:underline block leading-snug truncate"
                                >
                                  {primary}
                                </Link>
                                {secondary && (
                                  <span className="text-[11px] text-charcoal-500 block leading-tight truncate">
                                    {secondary}
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-2.5 text-center">
                                <div className="inline-flex items-center gap-1" title={isMale ? 'Кобель' : isFemale ? 'Сука' : '—'}>
                                  <DogSexIcon sex={sexVal} size={13} variant="colored" />
                                  <span className="text-xs text-charcoal-700 font-medium">
                                    {isMale ? 'К' : isFemale ? 'С' : '—'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2.5 text-right text-xs font-sans tabular-nums text-charcoal-700">
                                {item.total_starts} заб.
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {item.gold > 0 ? (
                                  <span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-semibold font-sans tabular-nums text-xs border border-amber-200/60">
                                    {item.gold} зол.
                                  </span>
                                ) : (
                                  <span className="text-charcoal-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {item.best_speed ? (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-camel-100 text-camel-950 font-semibold font-sans tabular-nums text-xs border border-camel-200">
                                    {item.best_speed.toFixed(1)} км/ч
                                  </span>
                                ) : item.rating_score ? (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-cream-100 text-charcoal-700 font-sans tabular-nums text-xs border border-cream-200">
                                    {item.rating_score.toFixed(1)} CS
                                  </span>
                                ) : (
                                  <span className="text-charcoal-400 text-xs">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-2.5 text-right">
                                <Link
                                  to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(canonicalKey)}`}
                                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-800 hover:text-camel-950 hover:underline"
                                  title={`Открыть рейтинг ${item.year} года`}
                                >
                                  <span>{item.year}</span>
                                  <ArrowUpRight className="h-3 w-3" />
                                </Link>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Мобильный вид (Фиксированная сетка без скачков слева направо) */}
                  <ol className="divide-y divide-old-money-100 text-sm sm:hidden">
                    {annualLeaders.map((item) => {
                      const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
                      const isMale = item.sex === 'M' || item.sex === 'К'
                      const isFemale = item.sex === 'F' || item.sex === 'С'
                      const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

                      return (
                        <li key={item.year} className="p-3 flex flex-col gap-1.5 hover:bg-cream-50/60 transition-colors">
                          {/* Верхняя строка: Год + Имя собаки + Ссылка на рейтинг */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="px-2 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 text-camel-950 border border-camel-200/80 shrink-0">
                                {item.year}
                              </span>
                              <Link
                                to={`/dog/${item.dog_id}/`}
                                className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate text-sm"
                              >
                                {primary}
                              </Link>
                            </div>
                            <Link
                              to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(canonicalKey)}`}
                              className="text-xs font-semibold text-camel-800 hover:underline shrink-0 flex items-center gap-0.5"
                              title={`Открыть полный рейтинг ${item.year} года`}
                            >
                              <span className="text-[11px]">Рейтинг</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                          </div>

                          {secondary && (
                            <div className="text-[11px] text-charcoal-500 truncate pl-0.5">
                              {secondary}
                            </div>
                          )}

                          {/* Нижняя строка: Фиксированная 4-колоночная сетка (строго фиксированные ячейки) */}
                          <div className="grid grid-cols-4 items-center text-xs pt-1.5 border-t border-old-money-100/70 font-sans tabular-nums">
                            {/* Клетка 1: Иконка и пол собаки */}
                            <div className="flex items-center gap-1 min-w-0" title={isMale ? 'Кобель' : isFemale ? 'Сука' : 'Пол не указан'}>
                              <DogSexIcon sex={sexVal} size={13} variant="colored" />
                              <span className="text-[11px] text-charcoal-700 font-medium truncate">
                                {isMale ? 'Кобель' : isFemale ? 'Сука' : '—'}
                              </span>
                            </div>

                            {/* Клетка 2: Количество забегов */}
                            <div className="text-center text-[11px] text-charcoal-600 font-medium">
                              <span>{item.total_starts} заб.</span>
                            </div>

                            {/* Клетка 3: Медали (золото) */}
                            <div className="text-center">
                              {item.gold > 0 ? (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10.5px] font-semibold border border-amber-200/60">
                                  {item.gold} зол.
                                </span>
                              ) : (
                                <span className="text-charcoal-400 text-xs">—</span>
                              )}
                            </div>

                            {/* Клетка 4: Рекорд скорости или балл */}
                            <div className="text-right">
                              {item.best_speed ? (
                                <span className="inline-block px-1.5 py-0.2 rounded bg-camel-100 text-camel-950 text-[11px] font-semibold border border-camel-200">
                                  {item.best_speed.toFixed(1)} км/ч
                                </span>
                              ) : item.rating_score ? (
                                <span className="text-[11px] text-charcoal-600 font-medium">
                                  {item.rating_score.toFixed(1)} CS
                                </span>
                              ) : (
                                <span className="text-charcoal-400 text-xs">—</span>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                </>
              )}
            </DoninoColumnShell>
          </div>

          {/* Слайд 2: Рекорды Донино (замеры скорости) */}
          {hasDoninoRecords && (
            <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto">
              <DoninoColumnShell plaque={doninoPlaque} bodyClassName="flex flex-col divide-y divide-old-money-100">
                {doninoLoading ? (
                  <p className="text-xs text-old-money-600 py-6 text-center">Загрузка замеров скорости…</p>
                ) : (
                  <ol className="divide-y divide-old-money-100 text-sm">
                    {speedRecords.map((r, i) => {
                      const yearFromDate = r.date ? r.date.split('-')[0] : ''

                      return (
                        <li
                          key={`${r.name}-${i}`}
                          className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-3 hover:bg-cream-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <span className="w-5 text-center font-bold font-sans tabular-nums text-xs text-old-money-500 shrink-0">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {r.name && r.breed ? (
                                  <Link
                                    to={`/donino-dog/${encodeURIComponent(r.name)}/${encodeURIComponent(r.breed)}/`}
                                    className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block"
                                  >
                                    {r.name}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-camel-950 truncate block">{r.name}</span>
                                )}
                                {r.sex && (
                                  <DogSexIcon sex={r.sex} size={12} variant="colored" className="shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 mt-0.5">
                                {yearFromDate && <span>{yearFromDate} г.</span>}
                                {yearFromDate && r.track_type && <span className="text-old-money-300">·</span>}
                                {r.track_type && <span>Трасса: {r.track_type}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base sm:text-lg font-sans font-bold tabular-nums text-camel-800">
                              {r.speed_km_h}
                            </span>
                            <span className="text-xs text-charcoal-600 ml-1">км/ч</span>
                          </div>
                        </li>
                      )
                    })}
                  </ol>
                )}
              </DoninoColumnShell>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
