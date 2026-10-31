import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Trophy,
  Award,
  Calendar,
  ShieldCheck,
  FileText,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { SEO } from '../../components/SEO'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import SkeletonLoader from '../../components/SkeletonLoader'
import {
  getDoninoChampionship,
  type ChampionshipData,
  type ChampionshipStage,
} from '../../lib/staticData/donino'
import ChampionshipStandingsTab from './ChampionshipStandingsTab'
import ChampionshipStageTab from './ChampionshipStageTab'
import ChampionshipRulesTab from './ChampionshipRulesTab'
import ChampionshipStatsTab from './ChampionshipStatsTab'

type MainTab = 'standings' | 'analytics' | 'stage1' | 'stage2' | 'stage3' | 'rules'

function formatDogsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 19) return `${count} собак`
  if (mod10 === 1) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count} собаки`
  return `${count} собак`
}

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
    { id: 'analytics', label: 'Разбалловка и бонусы', icon: BarChart3 },
    { id: 'stage1', label: 'I этап (9 авг)', icon: Calendar },
    { id: 'stage2', label: 'II этап (20 сен)', icon: Calendar },
    { id: 'stage3', label: 'III этап (31 окт)', icon: Calendar },
    { id: 'rules', label: 'Регламент', icon: FileText },
  ]

  const stage1 = data?.stages.find((s) => s.stage_num === 1)
  const stage2 = data?.stages.find((s) => s.stage_num === 2)
  const stage3 = data?.stages.find((s) => s.stage_num === 3)

  // Dynamic header stats based on active tab
  const activeStats = useMemo(() => {
    if (!data) return null

    let stage: ChampionshipStage | undefined
    let stageTitle = ''
    if (activeTab === 'stage1') {
      stage = stage1
      stageTitle = 'I этап'
    } else if (activeTab === 'stage2') {
      stage = stage2
      stageTitle = 'II этап'
    } else if (activeTab === 'stage3') {
      stage = stage3
      stageTitle = 'III этап'
    }

    if (stage) {
      if (stage.results && stage.results.length > 0) {
        let absolut = 0
        let champions = 0
        let progress = 0
        let juniors = 0

        for (const r of stage.results) {
          if (r.league === 'Абсолют') absolut++
          else if (r.league === 'Чемпионов') champions++
          else if (r.league === 'Прогресс') progress++
          else if (r.league === 'Юниоры') juniors++
        }

        return {
          title: `${stageTitle} (${formatDogsCount(stage.results.length)}):`,
          absolut,
          champions,
          progress,
          juniors,
          isUpcoming: false,
        }
      }

      return {
        title: `${stageTitle}: 31 октября 2026 (ожидаются результаты)`,
        absolut: 0,
        champions: 0,
        progress: 0,
        juniors: 0,
        isUpcoming: true,
      }
    }

    // Default for 'standings', 'analytics', 'rules' -> Full season stats
    return {
      title: `Всего: ${formatDogsCount(data.stats.total_dogs_participated)}:`,
      absolut: data.stats.dogs_in_absolut,
      champions: data.stats.dogs_in_champions,
      progress: data.stats.dogs_in_progress,
      juniors: data.stats.dogs_in_juniors,
      isUpcoming: false,
    }
  }, [data, activeTab, stage1, stage2, stage3])

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

      <div className="space-y-4">
        {/* Sleek Unboxed Tournament Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-charcoal-900 tracking-tight">
                Клубный чемпионат Донино
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                Сезон 2026
              </span>
            </div>

            {/* Dynamic inline statistics depending on tab */}
            {activeStats && (
              <div className="flex items-center gap-1.5 text-xs text-charcoal-600 flex-wrap">
                <span className="font-semibold text-charcoal-800">{activeStats.title}</span>
                {!activeStats.isUpcoming && (
                  <>
                    {activeStats.absolut > 0 && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-950 font-medium border border-amber-200 text-[11px]">
                        Абсолют <b>{activeStats.absolut}</b>
                      </span>
                    )}
                    {activeStats.champions > 0 && (
                      <span className="px-2 py-0.5 rounded bg-cream-100 text-charcoal-800 font-medium border border-old-money-200 text-[11px]">
                        Чемпионов <b>{activeStats.champions}</b>
                      </span>
                    )}
                    {activeStats.progress > 0 && (
                      <span className="px-2 py-0.5 rounded bg-cream-100 text-charcoal-800 font-medium border border-old-money-200 text-[11px]">
                        Прогресс <b>{activeStats.progress}</b>
                      </span>
                    )}
                    {activeStats.juniors > 0 && (
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-900 font-medium border border-sky-200 text-[11px]">
                        Юниоры <b>{activeStats.juniors}</b>
                      </span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Top-Right: External links */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
            <a
              href="https://runningdog.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-old-money-200 bg-cream-50 hover:bg-cream-100 text-xs font-semibold text-charcoal-700 transition-colors shadow-2xs shrink-0"
              title="Официальный сайт бегового клуба «Курсинг в Донино»"
            >
              <span className="p-0.5 rounded border border-old-money-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                <img
                  src="/assets/icons/runningdog.png"
                  alt=""
                  width={22}
                  height={14}
                  className="w-[22px] h-[14px] object-contain shrink-0"
                />
              </span>
              <span>runningdog.ru</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
            </a>

            <a
              href={data?.results_spreadsheet_url || 'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-old-money-200 bg-cream-50 hover:bg-cream-100 text-xs font-semibold text-charcoal-700 transition-colors shadow-2xs shrink-0"
              title="Официальная таблица результатов забегов с временами и переходами в лиги"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Результаты забегов</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
            </a>

            <a
              href={data?.points_spreadsheet_url || 'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-old-money-200 bg-cream-50 hover:bg-cream-100 text-xs font-semibold text-charcoal-700 transition-colors shadow-2xs shrink-0"
              title="Официальная таблица начисления очков, бонусов за лучшее время и рекорды трека"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700" />
              <span>Разбалловка и бонусы</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
            </a>
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
                onSelectRulesTab={() => handleTabChange("rules")}
              />
            )}

            {activeTab === 'analytics' && (
              <ChampionshipStatsTab standings={data.standings} />
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
              <ChampionshipRulesTab
                reglamentUrl={data.reglament_pdf_url}
                spreadsheetUrl={data.spreadsheet_url}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}
