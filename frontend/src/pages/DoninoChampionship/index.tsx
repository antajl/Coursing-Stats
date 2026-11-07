import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Trophy,
  Calendar,
  FileText,
} from 'lucide-react'
import { SEO } from '../../components/SEO'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  getDoninoChampionship,
  type ChampionshipData,
} from '../../lib/staticData/donino'
import ChampionshipStandingsTab from './ChampionshipStandingsTab'
import ChampionshipStageTab, { prefetchStageData } from './ChampionshipStageTab'
import ChampionshipRulesTab from './ChampionshipRulesTab'
import { setLastDoninoPath } from '../../lib/navState'

type MainTab = 'standings' | 'stage1' | 'stage2' | 'stage3' | 'rules'

export default function DoninoChampionship() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState<ChampionshipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeTab = (searchParams.get('tab') as MainTab) || 'standings'
  const [visitedTabs, setVisitedTabs] = useState<Set<MainTab>>(() => new Set([activeTab]))

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev
      const next = new Set(prev)
      next.add(activeTab)
      return next
    })
  }, [activeTab])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDoninoChampionship()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) {
          setData(res.data)
          // Prefetch stages with results so tab switches are instantaneous and never jerk
          res.data.stages.forEach((s) => {
            if (s.has_results) prefetchStageData(s.id)
          })
        } else {
          setError(res.error || 'Не удалось загрузить данные чемпионата')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // React 19: set document.title in useEffect
  useEffect(() => {
    document.title =
      'Клубный чемпионат Донино по бегам борзых — результаты, лиги и протоколы | Курсинг Статс'
  }, [])

  useEffect(() => {
    setLastDoninoPath('/donino/championship')
  }, [])

  const handleSubNavChange = (id: string) => {
    if (id === 'records') {
      navigate('/speed-records')
    } else if (id === 'analytics') {
      navigate('/donino/analytics')
    }
  }

  const prefetchDoninoTab = (id: string) => {
    if (id === 'records') void import('../SpeedRecords')
    else if (id === 'analytics') void import('../DoninoAnalytics')
  }

  // Warm other Donino tabs in background after initial paint
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const idle =
        typeof window !== 'undefined' && 'requestIdleCallback' in window
          ? window.requestIdleCallback.bind(window)
          : (cb: () => void) => window.setTimeout(cb, 200)
      idle(() => {
        void import('../SpeedRecords')
        void import('../DoninoAnalytics')
      })
    }, 2000)
    return () => window.clearTimeout(timer)
  }, [])

  const navRef = useRef<HTMLElement>(null)

  // Auto-scroll active tab into center view on mobile tab switch inside nav container ONLY (never window scroll)
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const activeBtn = nav.querySelector<HTMLElement>('[data-active="true"]')
    if (activeBtn) {
      const navRect = nav.getBoundingClientRect()
      const btnRect = activeBtn.getBoundingClientRect()
      const relLeft = btnRect.left - navRect.left + nav.scrollLeft
      const targetScroll = relLeft - (nav.clientWidth - btnRect.width) / 2
      nav.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      })
    }
    // Prevent and fix any accidental window horizontal scroll
    if (typeof window !== 'undefined' && window.scrollX > 0) {
      window.scrollTo({ left: 0 })
    }
  }, [activeTab])

  // Mobile horizontal swipe between tournament tabs: standings ↔ stage1 ↔ stage2 ↔ stage3 ↔ rules
  const touchStartRef = useRef<{ x: number; y: number; time: number; target: EventTarget | null } | null>(null)
  const gestureLockRef = useRef<'horizontal' | 'vertical' | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) return
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      target: touch.target,
    }
    gestureLockRef.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (!gestureLockRef.current) {
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 10 && absDy < 10) return
      if (absDy >= absDx) {
        gestureLockRef.current = 'vertical'
        return
      }
      gestureLockRef.current = 'horizontal'
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || (typeof window !== 'undefined' && window.innerWidth >= 1024)) return
    const isHorizontal = gestureLockRef.current === 'horizontal'
    const target = touchStartRef.current.target
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dt = Date.now() - touchStartRef.current.time
    const velocity = Math.abs(dx) / (dt || 1)

    touchStartRef.current = null
    gestureLockRef.current = null

    if (!isHorizontal) return

    // Do not switch tabs if inner ranking swipe already handled this gesture (e.g. time ↔ points)
    if ((e.nativeEvent as any)._doninoSwipeConsumed) {
      return
    }

    // Do not intercept if touch was inside an horizontally scrollable element (e.g. results table)
    let el = target as HTMLElement | null
    while (el && el !== e.currentTarget) {
      if (el.scrollWidth > el.clientWidth) {
        const style = window.getComputedStyle(el)
        if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
          return
        }
      }
      el = el.parentElement
    }

    const isSwipeLeft = dx < -45 || (dx < -25 && velocity > 0.25)
    const isSwipeRight = dx > 45 || (dx > 25 && velocity > 0.25)

    const mainTabsList: MainTab[] = ['standings', 'stage1', 'stage2', 'stage3', 'rules']
    const currentIndex = mainTabsList.indexOf(activeTab)
    if (currentIndex === -1) return

    if (isSwipeLeft && currentIndex < mainTabsList.length - 1) {
      handleTabChange(mainTabsList[currentIndex + 1])
    } else if (isSwipeRight && currentIndex > 0) {
      handleTabChange(mainTabsList[currentIndex - 1])
    }
  }

  const handleTouchCancel = () => {
    touchStartRef.current = null
    gestureLockRef.current = null
  }

  const handleTabChange = (tab: MainTab) => {
    const next = new URLSearchParams(searchParams)
    if (tab === 'standings') {
      next.delete('tab')
    } else {
      next.set('tab', tab)
    }
    setSearchParams(next)
  }

  const subNavTabs = [
    { id: 'records', label: 'Рекорды Донино' },
    { id: 'championship', label: 'Клубный чемпионат' },
    { id: 'analytics', label: 'Аналитика полигона' },
  ]

  const mainTabs = [
    { id: 'standings', label: 'Рейтинг чемпионата', icon: Trophy },
    { id: 'stage1', label: 'I этап (9 авг)', icon: Calendar },
    { id: 'stage2', label: 'II этап (20 сен)', icon: Calendar },
    { id: 'stage3', label: 'III этап (31 окт)', icon: Calendar },
    { id: 'rules', label: 'Регламент', icon: FileText },
  ]

  const stage1 = data?.stages.find((s) => s.stage_num === 1)
  const stage2 = data?.stages.find((s) => s.stage_num === 2)
  const stage3 = data?.stages.find((s) => s.stage_num === 3)

  return (
    <>
      <h1 className="sr-only">
        Клубный чемпионат Донино по бегам борзых: результаты, лиги и протоколы
      </h1>
      <SEO
        title="Клубный чемпионат Донино по бегам борзых — результаты этапов, лиги и переходы | Курсинг Статс"
        description="Серия клубных чемпионатов по рейсингу в Донино (350 м): результаты этапов, протоколы забегов, система лиг («Прогресс», «Чемпионов», «Абсолют») и официальные переходы между лигами."
        canonicalUrl="https://coursing-stats.ru/donino/championship/"
        keywords="клубный чемпионат донино, курсинг в донино, бега борзых донино, лига абсолют, лига чемпионов, лига прогресс, манухин михаил, рейсинг 350м донино"
      />

      {/* Top Mobile/Section SubNav Tabs */}
      <MobileSubNavTabs
        tabs={subNavTabs}
        activeTab="championship"
        onChange={handleSubNavChange}
        onHoverTab={prefetchDoninoTab}
        ariaLabel="Разделы Донино"
      />

      <div className="space-y-4 w-full max-w-full min-w-0">
        {/* Tournament Navigation Tabs */}
        <div className="border-b border-old-money-200 w-full max-w-full overflow-hidden">
          <nav
            ref={navRef}
            className="flex gap-1 sm:gap-2 overflow-x-auto pb-px scrollbar-none w-full max-w-full"
            aria-label="Вкладки турнира"
          >
            {mainTabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  data-active={isActive ? 'true' : undefined}
                  onClick={() => handleTabChange(t.id as MainTab)}
                  className={`min-h-[44px] px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-camel-700 text-charcoal-900 bg-cream-100/70'
                      : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-camel-700' : 'text-charcoal-400'
                    }`}
                  />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Tabs */}
        {loading ? (
          <div className="p-8">
            <SkeletonLoader count={6} />
          </div>
        ) : error || !data ? (
          <div className="p-8 text-center bg-cream-50 rounded-2xl border border-old-money-200 text-charcoal-700">
            {error || 'Данные временно недоступны'}
          </div>
        ) : (
          <div
            className="w-full max-w-full min-w-0 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
          >
            <div
              role="tabpanel"
              className={activeTab === 'standings' ? 'animate-fade-in' : 'hidden'}
            >
              {visitedTabs.has('standings') && (
                <ChampionshipStandingsTab
                  standings={data.standings}
                  promotions={data.promotions}
                  resultsSpreadsheetUrl={data.results_spreadsheet_url}
                  pointsSpreadsheetUrl={data.points_spreadsheet_url}
                />
              )}
            </div>

            <div
              role="tabpanel"
              className={activeTab === 'stage1' ? 'animate-fade-in' : 'hidden'}
            >
              {visitedTabs.has('stage1') && stage1 && (
                <ChampionshipStageTab stage={stage1} />
              )}
            </div>

            <div
              role="tabpanel"
              className={activeTab === 'stage2' ? 'animate-fade-in' : 'hidden'}
            >
              {visitedTabs.has('stage2') && stage2 && (
                <ChampionshipStageTab stage={stage2} />
              )}
            </div>

            <div
              role="tabpanel"
              className={activeTab === 'stage3' ? 'animate-fade-in' : 'hidden'}
            >
              {visitedTabs.has('stage3') && stage3 && (
                <ChampionshipStageTab stage={stage3} />
              )}
            </div>

            <div
              role="tabpanel"
              className={activeTab === 'rules' ? 'animate-fade-in' : 'hidden'}
            >
              {visitedTabs.has('rules') && (
                <ChampionshipRulesTab
                  reglamentUrl={data.reglament_pdf_url}
                  spreadsheetUrl={data.spreadsheet_url}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
