import React from 'react'
import { FileSpreadsheet, ExternalLink } from 'lucide-react'

export type LeagueFilter = 'all' | 'Абсолют' | 'Чемпионов' | 'Прогресс' | 'Юниоры'

function pluralizeDogs(count: number, genitive = false): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (genitive) {
    if (mod100 >= 11 && mod100 <= 19) return `${count} собак`
    if (mod10 === 1) return `${count} собаки`
    return `${count} собак`
  }
  if (mod100 >= 11 && mod100 <= 19) return `${count} собак`
  if (mod10 === 1) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count} собаки`
  return `${count} собак`
}

interface ChampionshipLinksCardProps {
  selectedLeague: LeagueFilter
  onSelectLeague: (league: LeagueFilter) => void
  dynamicLeagueCounts: Record<string, number>
  filteredCount: number
  resultsSpreadsheetUrl?: string | null
  pointsSpreadsheetUrl?: string | null
}

export default function ChampionshipLinksCard({
  selectedLeague,
  onSelectLeague,
  dynamicLeagueCounts,
  filteredCount,
  resultsSpreadsheetUrl,
  pointsSpreadsheetUrl,
}: ChampionshipLinksCardProps) {
  const total = dynamicLeagueCounts.total || 0
  return (
    <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3 text-xs text-charcoal-700">
      <div className="flex items-center justify-between gap-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
          Сезон 2026
        </span>
        <span className="text-xs font-semibold text-charcoal-800">
          {selectedLeague !== 'all'
            ? `Лига «${selectedLeague}»: ${filteredCount} из ${pluralizeDogs(total, true)}`
            : `Всего: ${pluralizeDogs(total)}`}
        </span>
      </div>

      {/* League distribution badges (dynamic, reflecting current breed/search) */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {(['Абсолют', 'Чемпионов', 'Прогресс', 'Юниоры'] as const).map((league) => {
          const count = dynamicLeagueCounts[league] || 0
          const isSelected = selectedLeague === league

          const badgeBase =
            league === 'Абсолют'
              ? 'bg-amber-50 text-amber-950 border-amber-200'
              : league === 'Чемпионов'
              ? 'bg-camel-100 text-charcoal-800 border-old-money-200'
              : league === 'Прогресс'
              ? 'bg-cream-100 text-charcoal-800 border-old-money-200'
              : 'bg-sky-50 text-sky-900 border-sky-200'

          const activeStyle = isSelected
            ? 'ring-2 ring-camel-600 font-bold shadow-xs'
            : 'hover:opacity-100'

          return (
            <button
              key={league}
              type="button"
              onClick={() => onSelectLeague(isSelected ? 'all' : league)}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-all cursor-pointer ${badgeBase} ${activeStyle} ${
                count === 0 ? 'opacity-40' : ''
              }`}
              title={
                isSelected
                  ? `Сбросить фильтр лиги «${league}»`
                  : `Фильтровать по лиге «${league}» (${count})`
              }
            >
              {league} <b>{count}</b>
            </button>
          )
        })}
      </div>

      {/* External Links */}
      <div className="space-y-1.5 pt-2 border-t border-old-money-200">
        <a
          href={
            resultsSpreadsheetUrl ||
            'https://docs.google.com/spreadsheets/d/1OKA9-I7oiY3xOisuxiDUOpn6C6bGxSQMkZDcuwtXiJg/edit?gid=22361699#gid=22361699'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs"
          title="Официальная таблица результатов забегов с временами и переходами в лиги"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Результаты забегов (Google)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
        </a>

        <a
          href={
            pointsSpreadsheetUrl ||
            'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0'
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs"
          title="Официальная таблица начисления очков, бонусов за лучшее время и рекорда серии"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Разбалловка и бонусы (Google)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
        </a>

        <a
          href="https://runningdog.ru"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-between px-3 py-2 rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-xs font-semibold text-charcoal-800 transition-colors shadow-2xs"
          title="Официальный сайт бегового клуба «Курсинг в Донино»"
        >
          <div className="flex items-center gap-2">
            <span className="p-0.5 rounded border border-old-money-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
              <img
                src="/assets/icons/runningdog.png"
                alt=""
                width={20}
                height={12}
                className="w-[20px] h-[12px] object-contain shrink-0"
              />
            </span>
            <span>Курсинг в Донино</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
        </a>
      </div>
    </div>
  )
}
