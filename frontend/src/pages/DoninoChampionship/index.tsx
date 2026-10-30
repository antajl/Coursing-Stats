import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Trophy,
  Award,
  Calendar,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { SEO } from '../../components/SEO'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  getDoninoChampionship,
  type ChampionshipData,
} from '../../lib/staticData/donino'
import ChampionshipStandingsTab from './ChampionshipStandingsTab'
import ChampionshipStageTab from './ChampionshipStageTab'
import ChampionshipRulesTab from './ChampionshipRulesTab'

type MainTab = 'standings' | 'stage1' | 'stage2' | 'stage3' | 'rules'

export default function DoninoChampionship() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState<ChampionshipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const activeTab = (searchParams.get('tab') as MainTab) || 'standings'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getDoninoChampionship()
      .then((res) => {
        if (cancelled) return
        if (res.success && res.data) {
          setData(res.data)
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

  const handleSubNavChange = (id: string) => {
    if (id === 'records') {
      navigate('/speed-records/?tab=records')
    } else if (id === 'stats') {
      navigate('/speed-records/?tab=stats')
    }
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
    { id: 'records', label: 'Записи' },
    { id: 'stats', label: 'Статистика' },
    { id: 'championship', label: 'Чемпионат' },
  ]

  const mainTabs = [
    { id: 'standings', label: 'Сводный зачёт и Лиги', icon: Trophy },
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
        ariaLabel="Разделы Донино"
      />

      <div className="space-y-6">
        {/* Hero Banner */}
        <div className="rounded-3xl border border-old-money-200 bg-cream-50/90 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Сезон 2026
                </span>
                <span className="text-xs text-charcoal-600">Курсинг в Донино</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-serif font-bold text-charcoal-900">
                Клубный чемпионат Донино
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl leading-relaxed">
                Серия клубных чемпионатов по рейсингу (бегам борзых) на дистанции 350 метров. Старт из боксов, фотофиниш и трёхуровневая система лиг: «Прогресс», «Чемпионов» и «Абсолют».
              </p>
            </div>

            {/* Quick Stats Badges */}
            {data && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                <div className="p-2.5 rounded-xl bg-cream-100 border border-old-money-200 text-center">
                  <div className="text-[10px] text-charcoal-500 font-medium">Участников</div>
                  <div className="text-base sm:text-lg font-bold font-serif text-charcoal-900">
                    {data.stats.total_dogs_participated}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-[10px] text-amber-800 font-medium">Лига Абсолют</div>
                  <div className="text-base sm:text-lg font-bold font-serif text-amber-950">
                    {data.stats.dogs_in_absolut}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-camel-50 border border-camel-200 text-center">
                  <div className="text-[10px] text-camel-800 font-medium">Лига Чемпионов</div>
                  <div className="text-base sm:text-lg font-bold font-serif text-charcoal-900">
                    {data.stats.dogs_in_champions}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-100 border border-stone-200 text-center">
                  <div className="text-[10px] text-stone-600 font-medium">Ротаций лиг</div>
                  <div className="text-base sm:text-lg font-bold font-serif text-charcoal-900">
                    {data.stats.promotions_count}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Navigation Tabs */}
        <div className="border-b border-old-money-200">
          <nav
            className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-px scrollbar-none"
            aria-label="Вкладки турнира"
          >
            {mainTabs.map((t) => {
              const Icon = t.icon
              const isActive = activeTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTabChange(t.id as MainTab)}
                  className={`min-h-[44px] px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-camel-700 text-charcoal-900 bg-cream-100/70 font-bold'
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
          <>
            {activeTab === 'standings' && (
              <ChampionshipStandingsTab
                standings={data.standings}
                promotions={data.promotions}
              />
            )}

            {activeTab === 'stage1' && stage1 && (
              <ChampionshipStageTab stage={stage1} />
            )}

            {activeTab === 'stage2' && stage2 && (
              <ChampionshipStageTab stage={stage2} />
            )}

            {activeTab === 'stage3' && stage3 && (
              <ChampionshipStageTab stage={stage3} />
            )}

            {activeTab === 'rules' && (
              <ChampionshipRulesTab reglamentUrl={data.reglament_pdf_url} />
            )}
          </>
        )}
      </div>
    </>
  )
}
