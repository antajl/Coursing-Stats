import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Zap, Gauge, ArrowUpRight } from 'lucide-react'
import DoninoColumnPlaque, { DoninoColumnShell } from '../SpeedRecords/DoninoColumnPlaque'
import DoninoListRecordRow from '../SpeedRecords/DoninoListRecordRow'
import DogSexIcon from '../../components/DogSexIcon'
import MedalBadge from '../../components/MedalBadge'
import { parseDogName } from '../../lib/dogName'
import type { AnnualDogLeader } from '../../hooks/useStaticData'
import { breedToSlug } from '../../lib/breedMapping'

export interface SpeedRecordItem {
  breed?: string
  name?: string
  sex?: string
  speed_km_h?: number
  date?: string
  track_type?: string
  status?: string
  history?: unknown
  screenshot_url?: string
}

interface BreedHubColumnsProps {
  annualLeaders?: AnnualDogLeader[]
  coursingLeaders?: AnnualDogLeader[]
  racingLeaders?: AnnualDogLeader[]
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

type ColumnTabId = 'coursing' | 'racing' | 'donino'

export default function BreedHubColumns({
  annualLeaders,
  coursingLeaders,
  racingLeaders,
  annualLeadersLoading,
  speedRecords,
  doninoLoading,
  canonicalKey,
  breedNameRu,
}: BreedHubColumnsProps) {
  const coursingList = useMemo(
    () => coursingLeaders || annualLeaders || [],
    [coursingLeaders, annualLeaders],
  )
  const racingList = useMemo(() => racingLeaders || [], [racingLeaders])
  const doninoList = useMemo(() => speedRecords || [], [speedRecords])

  const hasCoursing = coursingList.length > 0 || annualLeadersLoading
  const hasRacing = racingList.length > 0
  const hasDonino = doninoList.length > 0

  // Список активных колонок для мобильной навигации
  const activeTabs = useMemo(() => {
    const tabs: Array<{ id: ColumnTabId; label: string; count: number; icon: typeof Trophy }> = []
    if (hasCoursing) tabs.push({ id: 'coursing', label: 'Курсинг', count: coursingList.length, icon: Trophy })
    if (hasRacing) tabs.push({ id: 'racing', label: 'Рейсинг', count: racingList.length, icon: Zap })
    if (hasDonino) tabs.push({ id: 'donino', label: 'Донино', count: doninoList.length, icon: Gauge })
    return tabs
  }, [hasCoursing, hasRacing, hasDonino, coursingList.length, racingList.length, doninoList.length])

  const [activeMobileTab, setActiveMobileTab] = useState<ColumnTabId>('coursing')

  // Гарантируем, что активный мобильный таб существует среди доступных
  useEffect(() => {
    if (activeTabs.length > 0 && !activeTabs.some((t) => t.id === activeMobileTab)) {
      setActiveMobileTab(activeTabs[0].id)
    }
  }, [activeTabs, activeMobileTab])

  // Мобильный свайп-жест между слайдами
  const trackRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)
  const hadMovedRef = useRef(false)
  const gapPx = 16

  const activeTabIndex = useMemo(() => {
    const idx = activeTabs.findIndex((t) => t.id === activeMobileTab)
    return idx >= 0 ? idx : 0
  }, [activeTabs, activeMobileTab])

  const getSlideOffset = useCallback(
    (slideIndex: number) => {
      return slideIndex === 0 ? '0%' : `calc(-${slideIndex * 100}% - ${slideIndex * gapPx}px)`
    },
    [gapPx],
  )

  useEffect(() => {
    if (trackRef.current && (typeof window === 'undefined' || window.innerWidth < 1024)) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`
    }
  }, [activeTabIndex, getSlideOffset])

  const startDrag = (clientX: number, clientY: number) => {
    if (activeTabs.length <= 1 || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    touchStartRef.current = { x: clientX, y: clientY, time: Date.now() }
    gestureLockRef.current = null
    hadMovedRef.current = false
    if (trackRef.current) {
      trackRef.current.style.transition = 'none'
    }
  }

  const moveDrag = (clientX: number, clientY: number) => {
    if (!touchStartRef.current || activeTabs.length <= 1 || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
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
      const isAtLeftEdge = activeTabIndex === 0 && dx > 0
      const isAtRightEdge = activeTabIndex === activeTabs.length - 1 && dx < 0
      const appliedDx = isAtLeftEdge || isAtRightEdge ? dx * 0.22 : dx
      const base = getSlideOffset(activeTabIndex)
      trackRef.current.style.transform = `translate3d(calc(${base} + ${appliedDx}px), 0, 0)`
    }
  }

  const endDrag = (clientX: number) => {
    if (!touchStartRef.current || activeTabs.length <= 1 || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return

    const isHorizontal = gestureLockRef.current === 'horizontal'
    const dx = clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    const track = trackRef.current

    if (isHorizontal && track) {
      const isSwipeLeft = dx < -35 || (dx < -15 && velocity > 0.2)
      const isSwipeRight = dx > 35 || (dx > 15 && velocity > 0.2)
      let targetIndex = activeTabIndex

      if (isSwipeLeft && activeTabIndex < activeTabs.length - 1) {
        targetIndex = activeTabIndex + 1
      } else if (isSwipeRight && activeTabIndex > 0) {
        targetIndex = activeTabIndex - 1
      }

      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(targetIndex)}, 0, 0)`

      if (targetIndex !== activeTabIndex) {
        setActiveMobileTab(activeTabs[targetIndex].id)
      }
    } else if (track) {
      track.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      track.style.transform = `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`
    }
  }

  const cancelDrag = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
    if (trackRef.current && activeTabs.length > 1) {
      trackRef.current.style.transition = 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1)'
      trackRef.current.style.transform = `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`
    }
  }

  // 1. Плашка заголовка Курсинга
  const coursingPlaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 truncate">
          <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="truncate">Курсинг по годам</span>
          {coursingList.length > 0 && (
            <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
              · {formatSeasonsCount(coursingList.length)}
            </span>
          )}
        </span>
      }
      actionPlacement="right"
      action={
        <Link
          to={`/competitions/ranking/2026/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}&tab=coursing`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
          title={`Рейтинг курсинга породы ${breedNameRu}`}
        >
          <span>Рейтинг</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
        </Link>
      }
    />
  )

  // 2. Плашка заголовка Рейсинга
  const racingPlaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 truncate">
          <Zap className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="truncate">Рейсинг по годам</span>
          {racingList.length > 0 && (
            <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
              · {formatSeasonsCount(racingList.length)}
            </span>
          )}
        </span>
      }
      actionPlacement="right"
      action={
        <Link
          to={`/competitions/ranking/2026/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}&tab=racing`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
          title={`Рейтинг рейсинга породы ${breedNameRu}`}
        >
          <span>Рейтинг</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
        </Link>
      }
    />
  )

  // 3. Плашка заголовка Донино
  const doninoPlaque = (
    <DoninoColumnPlaque
      asHeader
      title={
        <span className="inline-flex items-center gap-1.5 truncate">
          <Gauge className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="truncate">Рекорды Донино (км/ч)</span>
          {doninoList.length > 0 && (
            <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
              · {formatRunsCount(doninoList.length)}
            </span>
          )}
        </span>
      }
      actionPlacement="right"
      action={
        <Link
          to="/speed-records/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-camel-800 hover:text-camel-950 transition-colors cursor-pointer shrink-0"
          title="Открыть общую таблицу рекордов полигона Донино"
        >
          <span>Все рекорды</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-camel-700" aria-hidden />
        </Link>
      }
    />
  )

  // Общий рендерер таблицы чемпионов сезона (без двойного заголовка)
  const renderChampionsTable = (items: AnnualDogLeader[], mode: 'coursing' | 'racing') => {
    const isRacing = mode === 'racing'
    const tabParam = isRacing ? 'racing' : 'coursing'

    if (items.length === 0) {
      return (
        <div className="py-8 text-center text-xs text-old-money-600 px-4">
          <p>
            {isRacing
              ? 'В открытых протоколах рейсинга с 2018 года забегов породы пока не зафиксировано.'
              : 'В открытых протоколах состязаний с 2015 года забегов породы пока не зафиксировано.'}
          </p>
        </div>
      )
    }

    return (
      <>
        {/* Десктопный вид: таблица без лишнего thead (начинается прямо под плашкой) */}
        <div className="hidden sm:block flex-1 min-w-0">
          <table className="w-full text-left text-sm table-auto h-full">
            <tbody className="divide-y divide-old-money-100">
              {items.map((item) => {
                const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
                const isMale = item.sex === 'M' || item.sex === 'К'
                const isFemale = item.sex === 'F' || item.sex === 'С'
                const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

                const tooltipTitle = isRacing
                  ? `Чемпион рейсинга ${item.year} года: ${item.gold} золотых побед из ${item.total_starts} стартов${item.best_speed ? `, пиковая скорость ${item.best_speed.toFixed(1)} км/ч` : ''}`
                  : `Чемпион курсинга ${item.year} года: ${item.gold} золотых побед из ${item.total_starts} стартов`

                return (
                  <tr
                    key={item.year}
                    className="hover:bg-cream-50/60 transition-colors"
                    title={tooltipTitle}
                  >
                    <td className="py-2.5 px-2.5 text-center whitespace-nowrap w-16">
                      <Link
                        to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}&tab=${tabParam}`}
                        className="inline-block px-2.5 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 transition-all shadow-2xs cursor-pointer"
                        title={`Открыть рейтинг ${item.year} года`}
                      >
                        {item.year}
                      </Link>
                    </td>
                    <td className="py-2 px-3 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          to={`/dog/${item.dog_id}/`}
                          className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate block"
                        >
                          {primary}
                        </Link>
                        {sexVal && (
                          <span title={isMale ? 'Кобель' : 'Сука'} className="inline-flex shrink-0">
                            <DogSexIcon sex={sexVal} size={12} variant="colored" />
                          </span>
                        )}
                      </div>
                      {secondary && (
                        <span className="text-[11px] text-charcoal-500 block leading-tight truncate">
                          {secondary}
                        </span>
                      )}
                    </td>

                    {/* Колонка результатов */}
                    <td className="py-2 px-3 text-right whitespace-nowrap w-36 sm:w-40">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-[11px] leading-tight font-sans">
                          <span className="text-charcoal-600 font-medium">{item.total_starts} заб.</span>
                          {isRacing && item.best_speed && <span className="text-charcoal-400">·</span>}
                          {isRacing && item.best_speed && (
                            <span className="inline-flex items-baseline gap-0.5 font-bold text-charcoal-900 text-xs">
                              <span>{item.best_speed.toFixed(1)}</span>
                              <span className="text-[10px] font-normal text-charcoal-500">км/ч</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <MedalBadge variant="gold" count={item.gold || 0} size="sm" />
                          <MedalBadge variant="silver" count={item.silver || 0} size="sm" />
                          <MedalBadge variant="bronze" count={item.bronze || 0} size="sm" />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Мобильный вид (список карточек) */}
        <ol className="divide-y divide-old-money-100 text-sm sm:hidden">
          {items.map((item) => {
            const { primary, secondary } = parseDogName(item.name_lat, item.name_ru)
            const isMale = item.sex === 'M' || item.sex === 'К'
            const isFemale = item.sex === 'F' || item.sex === 'С'
            const sexVal = isMale ? 'm' : isFemale ? 'f' : ''

            return (
              <li key={item.year} className="p-3 flex flex-col gap-1.5 hover:bg-cream-50/60 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    to={`/competitions/ranking/${item.year}/?breed=${encodeURIComponent(breedToSlug(canonicalKey))}&tab=${tabParam}`}
                    className="px-2.5 py-0.5 rounded-full font-bold font-sans tabular-nums text-xs bg-camel-100 hover:bg-camel-200 active:scale-95 text-camel-950 border border-camel-200/80 shrink-0 transition-all shadow-2xs cursor-pointer"
                    title={`Открыть рейтинг ${item.year} года`}
                  >
                    {item.year}
                  </Link>

                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Link
                      to={`/dog/${item.dog_id}/`}
                      className="font-medium text-camel-950 hover:text-camel-800 hover:underline truncate text-sm"
                    >
                      {primary}
                    </Link>
                    {sexVal && (
                      <span title={isMale ? 'Кобель' : 'Сука'} className="inline-flex shrink-0">
                        <DogSexIcon sex={sexVal} size={12} variant="colored" />
                      </span>
                    )}
                  </div>
                </div>

                {secondary && (
                  <div className="text-[11px] text-charcoal-500 pl-0.5 truncate">
                    {secondary}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-old-money-100/70 font-sans tabular-nums">
                  <div className="text-left text-[11px] text-charcoal-600 font-medium flex items-center gap-1">
                    <span>{item.total_starts} заб.</span>
                    {isRacing && item.best_speed && <span className="text-charcoal-400">·</span>}
                    {isRacing && item.best_speed && (
                      <span className="inline-flex items-baseline gap-0.5 font-bold text-charcoal-900 text-xs">
                        <span>{item.best_speed.toFixed(1)}</span>
                        <span className="text-[10px] font-normal text-charcoal-500">км/ч</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <MedalBadge variant="gold" count={item.gold || 0} size="sm" />
                    <MedalBadge variant="silver" count={item.silver || 0} size="sm" />
                    <MedalBadge variant="bronze" count={item.bronze || 0} size="sm" />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </>
    )
  }

  // Расчет классов адаптивной сетки десктопа
  const totalColumnsCount = (hasCoursing ? 1 : 0) + (hasRacing ? 1 : 0) + (hasDonino ? 1 : 0)
  const desktopGridClass =
    totalColumnsCount >= 3
      ? 'lg:grid-cols-3 lg:gap-4 xl:gap-5'
      : totalColumnsCount === 2
      ? 'lg:grid-cols-2 lg:gap-6'
      : 'lg:grid-cols-1'

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Мобильный переключатель колонок (если доступно 2 или 3 дисциплины) */}
      {activeTabs.length > 1 && (
        <div className="flex lg:hidden items-center p-1 rounded-xl bg-cream-100/90 border border-old-money-200/60 gap-1 select-none">
          {activeTabs.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeMobileTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMobileTab(tab.id)}
                className={`flex-1 min-h-[36px] flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-camel-950 shadow-xs border border-old-money-200/80 font-bold'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5 text-camel-700 shrink-0" />
                <span className="truncate">
                  {tab.label} ({tab.count})
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Контейнер колонок: на десктопе до 3 колонок в ряд, на мобильном плавный свайп жестами */}
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
          className={`flex flex-nowrap w-full min-w-0 items-start gap-4 lg:grid ${desktopGridClass} lg:items-stretch lg:!transform-none`}
          style={{
            transform:
              typeof window !== 'undefined' && window.innerWidth >= 1024
                ? 'none'
                : activeTabs.length <= 1
                ? 'none'
                : `translate3d(${getSlideOffset(activeTabIndex)}, 0, 0)`,
            willChange: activeTabs.length > 1 ? 'transform' : 'auto',
          }}
        >
          {/* Колонка 1: Курсинг по годам */}
          {hasCoursing && (
            <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto lg:h-full">
              <DoninoColumnShell plaque={coursingPlaque} className="h-full flex flex-col" bodyClassName="flex-1 flex flex-col">
                {annualLeadersLoading ? (
                  <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива по годам…</p>
                ) : (
                  renderChampionsTable(coursingList, 'coursing')
                )}
              </DoninoColumnShell>
            </div>
          )}

          {/* Колонка 2: Рейсинг по годам (круговой трек РКФ) */}
          {hasRacing && (
            <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto lg:h-full">
              <DoninoColumnShell plaque={racingPlaque} className="h-full flex flex-col" bodyClassName="flex-1 flex flex-col">
                {annualLeadersLoading ? (
                  <p className="text-xs text-old-money-600 py-6 text-center">Загрузка архива рейсинга…</p>
                ) : (
                  renderChampionsTable(racingList, 'racing')
                )}
              </DoninoColumnShell>
            </div>
          )}

          {/* Колонка 3: Рекорды Донино (замеры скорости на прямой) */}
          {hasDonino && (
            <div className="w-full max-w-full min-w-0 shrink-0 basis-full lg:w-auto lg:min-w-0 lg:shrink lg:basis-auto lg:h-full">
              <DoninoColumnShell plaque={doninoPlaque} className="h-full flex flex-col" bodyClassName="flex-1 flex flex-col justify-between">
                {doninoLoading ? (
                  <p className="text-xs text-old-money-600 py-6 text-center">Загрузка замеров скорости…</p>
                ) : (
                  <div className="flex-1 flex flex-col justify-between divide-y divide-old-money-100 [&>*:last-child_.donino-list-row-link]:border-b-0 [&>*:last-child_.donino-list-row-screen]:border-b-0">
                    {doninoList.map((r, i) => (
                      <DoninoListRecordRow
                        key={`donino-${r.breed || breedNameRu}-${r.name}-${i}`}
                        mode="speed"
                        name={r.name || ''}
                        breed={r.breed || breedNameRu}
                        sex={r.sex}
                        date={r.date}
                        status={r.status}
                        history={r.history}
                        speedKmh={r.speed_km_h}
                        screenshotUrl={r.screenshot_url}
                        trackType={r.track_type}
                        rank={i + 1}
                        embedded
                      />
                    ))}
                  </div>
                )}
              </DoninoColumnShell>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
