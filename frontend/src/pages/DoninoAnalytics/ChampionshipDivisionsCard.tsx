import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, ChevronRight, Crown, Shield, Star } from 'lucide-react'
import type { ChampionshipData } from '../../lib/staticData/donino'

interface ChampionshipDivisionsCardProps {
  data: ChampionshipData | null
  loading: boolean
}

const LEAGUES = [
  {
    name: 'Абсолют',
    title: 'Лига «Абсолют»',
    desc: 'Высший дивизион, быстрейшие борзые полигона',
    icon: Crown,
    badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
    iconColor: 'text-amber-700',
  },
  {
    name: 'Чемпионов',
    title: 'Лига «Чемпионов»',
    desc: 'Основной дивизион, высокая конкуренция',
    icon: Trophy,
    badgeBg: 'bg-camel-100 text-camel-950 border-camel-300',
    iconColor: 'text-camel-700',
  },
  {
    name: 'Прогресс',
    title: 'Лига «Прогресс»',
    desc: 'Развивающийся дивизион, борьба за повышение',
    icon: Shield,
    badgeBg: 'bg-charcoal-100 text-charcoal-900 border-charcoal-300',
    iconColor: 'text-charcoal-700',
  },
  {
    name: 'Юниоры',
    title: 'Лига «Юниоры»',
    desc: 'Молодые собаки до 18 месяцев',
    icon: Star,
    badgeBg: 'bg-cream-200 text-charcoal-800 border-cream-300',
    iconColor: 'text-camel-600',
  },
]

export default function ChampionshipDivisionsCard({
  data,
  loading,
}: ChampionshipDivisionsCardProps) {
  const standings = data?.standings ?? []

  // Counts & leaders by league
  const leagueCounts = useMemo(() => {
    const counts: Record<
      string,
      { count: number; bestTime: number | null; leaderName: string | null; leaderBreed: string | null }
    > = {
      Абсолют: { count: 0, bestTime: null, leaderName: null, leaderBreed: null },
      Чемпионов: { count: 0, bestTime: null, leaderName: null, leaderBreed: null },
      Прогресс: { count: 0, bestTime: null, leaderName: null, leaderBreed: null },
      Юниоры: { count: 0, bestTime: null, leaderName: null, leaderBreed: null },
    }

    for (const s of standings) {
      const l = s.current_league
      if (counts[l]) {
        counts[l].count++
        if (s.best_time && (!counts[l].bestTime || s.best_time < counts[l].bestTime!)) {
          counts[l].bestTime = s.best_time
          counts[l].leaderName = s.name_ru || s.name
          counts[l].leaderBreed = s.breed || 'Уиппет'
        }
      }
    }

    return counts
  }, [standings])

  return (
    <div className="rounded-2xl border border-old-money-200 bg-white/95 p-3.5 sm:p-4 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-200/80 pb-2">
        <div>
          <h3 className="text-sm sm:text-base font-serif font-bold text-charcoal-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-4 h-4 text-camel-700" />
            Клубный чемпионат: ориентиры дивизионов
          </h3>
        </div>
        <Link
          to="/donino/championship"
          className="inline-flex items-center gap-1 text-xs font-semibold text-camel-900 hover:text-charcoal-950 bg-camel-50 hover:bg-camel-100 border border-camel-300 px-2.5 py-1 rounded-xl transition-all shadow-2xs"
        >
          <span>В чемпионат</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        {LEAGUES.map((league) => {
          const Icon = league.icon
          const info = leagueCounts[league.name] || {
            count: 0,
            bestTime: null,
            leaderName: null,
            leaderBreed: null,
          }
          return (
            <div
              key={league.name}
              className="rounded-xl border border-cream-300/80 bg-cream-50/50 p-2 sm:p-2.5 flex flex-col justify-between space-y-1.5"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${league.iconColor}`} />
                    <span className="font-serif font-bold text-charcoal-900 text-xs sm:text-sm">
                      {league.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-md border ${league.badgeBg}`}
                  >
                    {info.count} соб.
                  </span>
                </div>
                <div className="text-[11px] text-charcoal-500 leading-tight">
                  {league.desc}
                </div>
              </div>

              <div className="pt-1.5 border-t border-cream-200/80 flex items-center justify-between text-xs gap-1">
                <span className="text-charcoal-500 text-[11px] shrink-0">Рекорд:</span>
                {info.bestTime ? (
                  <span className="font-semibold text-camel-900 tabular-nums text-right truncate text-[11px]">
                    {info.bestTime.toFixed(2)} сек{' '}
                    {info.leaderName && info.leaderBreed ? (
                      <Link
                        to={`/donino-dog/${encodeURIComponent(info.leaderName)}/${encodeURIComponent(info.leaderBreed)}/`}
                        className="font-normal text-camel-700 hover:text-camel-950 hover:underline text-[10px]"
                        title={`Профиль собаки ${info.leaderName}`}
                      >
                        ({info.leaderName})
                      </Link>
                    ) : (
                      <span className="font-normal text-charcoal-500 text-[10px]">
                        ({info.leaderName})
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-charcoal-400 italic text-[11px]">По регламенту</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
