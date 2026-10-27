import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowRight } from 'lucide-react'
import { Icons } from '../../../lib/icons'
import type { HeroStats, HeroShowStats } from '../../../components/Hero'

export type HomeConceptMode = 'as-is' | 'concept-1' | 'concept-2' | 'concept-3'

interface HomeConceptsProps {
  stats: HeroStats | null
  showStats: HeroShowStats | null
  loading?: boolean
  onOpenSearch?: () => void
}

function formatNum(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн`
  if (value >= 10000) return `${(value / 1000).toFixed(0)} тыс.`
  if (value >= 1000) return `${(value / 1000).toFixed(1)} тыс.`
  return value.toLocaleString('ru-RU')
}

// =========================================================================
// Floating interactive switcher bar at the bottom
// =========================================================================
export function HomeConceptSwitcher({
  mode,
  setMode,
}: {
  mode: HomeConceptMode
  setMode: (m: HomeConceptMode) => void
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none print:hidden">
      <div className="bg-[#252320]/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-2xl border border-camel-400/40 flex items-center gap-1 text-xs">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-camel-300 px-2.5 py-1 hidden sm:inline-block border-r border-charcoal-700">
          Концепт:
        </span>

        <button
          type="button"
          onClick={() => setMode('as-is')}
          className={`px-3 py-1.5 rounded-full transition-all font-medium text-[12px] ${
            mode === 'as-is'
              ? 'bg-camel-600 text-white shadow-sm font-semibold'
              : 'text-charcoal-300 hover:text-white hover:bg-white/10'
          }`}
        >
          0. Как сейчас
        </button>

        <button
          type="button"
          onClick={() => setMode('concept-1')}
          className={`px-3 py-1.5 rounded-full transition-all font-medium text-[12px] ${
            mode === 'concept-1'
              ? 'bg-camel-600 text-white shadow-sm font-semibold'
              : 'text-charcoal-300 hover:text-white hover:bg-white/10'
          }`}
        >
          1. Поиск & Реестр
        </button>

        <button
          type="button"
          onClick={() => setMode('concept-2')}
          className={`px-3 py-1.5 rounded-full transition-all font-medium text-[12px] ${
            mode === 'concept-2'
              ? 'bg-camel-600 text-white shadow-sm font-semibold'
              : 'text-charcoal-300 hover:text-white hover:bg-white/10'
          }`}
        >
          2. Чистый горизонт
        </button>

        <button
          type="button"
          onClick={() => setMode('concept-3')}
          className={`px-3 py-1.5 rounded-full transition-all font-medium text-[12px] ${
            mode === 'concept-3'
              ? 'bg-camel-600 text-white shadow-sm font-semibold'
              : 'text-charcoal-300 hover:text-white hover:bg-white/10'
          }`}
        >
          3. Симметричный кокпит
        </button>
      </div>
    </div>
  )
}

// =========================================================================
// Concept 1: Архитектурный хаб (Поиск + Консолидированный реестр)
// =========================================================================
export function Concept1RightHub({
  stats,
  showStats,
  onOpenSearch,
}: HomeConceptsProps) {
  return (
    <div className="flex flex-col items-end text-right gap-3 max-w-[340px] 3xl:max-w-[400px] pointer-events-auto">
      {/* Editorial Header */}
      <div className="flex flex-col items-end gap-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-camel-100/80 border border-camel-200/80 text-[11px] font-semibold text-camel-800 tracking-wider uppercase">
          <Layers className="w-3 h-3 text-camel-600" aria-hidden />
          <span>Национальный архив</span>
        </div>
        <h2 className="text-xl 3xl:text-2xl font-serif font-bold text-charcoal-900 leading-tight">
          Реестр борзых и спортивных собак
        </h2>
        <p className="text-xs text-charcoal-600 font-medium">
          Официальные результаты соревнований и выставок России
        </p>
      </div>

      {/* Quick Search Bar */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white/95 hover:bg-white backdrop-blur-md rounded-xl border border-camel-300 shadow-md hover:shadow-lg transition-all text-left group"
        aria-label="Быстрый поиск по базе собак"
      >
        <div className="flex items-center gap-2.5 text-charcoal-500 group-hover:text-charcoal-800 min-w-0">
          <Icons.search className="w-4 h-4 text-camel-700 shrink-0" aria-hidden />
          <span className="text-xs sm:text-[13px] truncate font-medium">
            Поиск по кличке, клейму, породе...
          </span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-500 bg-old-money-100 rounded border border-old-money-300 shrink-0">
          ⌘K
        </kbd>
      </button>

      {/* Consolidated Database Status Card */}
      <div className="w-full bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-xl border border-camel-200/80 shadow-md p-3 flex flex-col gap-2 text-left">
        {/* Sport row */}
        <div className="flex items-center justify-between pb-2 border-b border-camel-200/50">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-camel-100 flex items-center justify-center text-camel-800 shrink-0">
              <Icons.trophy className="w-3.5 h-3.5 text-camel-700" aria-hidden />
            </span>
            <div>
              <div className="text-xs font-bold text-charcoal-900">Спорт & Бега</div>
              <div className="text-[10px] text-charcoal-500 font-medium">курсинг и рейсинг</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-xs font-bold text-charcoal-900 tabular-nums">
                {stats ? formatNum(stats.events) : '—'}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">турниров</div>
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-900 tabular-nums">
                {stats ? formatNum(stats.results) : '—'}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">забегов</div>
            </div>
          </div>
        </div>

        {/* Shows row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-forest-100 flex items-center justify-center text-forest-700 shrink-0">
              <Icons.award className="w-3.5 h-3.5 text-forest-600" aria-hidden />
            </span>
            <div>
              <div className="text-xs font-bold text-charcoal-900">Выставки РКФ</div>
              <div className="text-[10px] text-charcoal-500 font-medium">каталоги и ринги</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-xs font-bold text-charcoal-900 tabular-nums">
                {showStats ? formatNum(showStats.exhibitions) : '—'}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">выставок</div>
            </div>
            <div>
              <div className="text-xs font-bold text-charcoal-900 tabular-nums">
                {showStats ? formatNum(showStats.dogs) : '—'}
              </div>
              <div className="text-[9px] text-charcoal-500 uppercase tracking-tight">собак</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =========================================================================
// Concept 2: Чистый горизонт (Нижняя статусная лента)
// =========================================================================
export function Concept2StatsRibbon({
  stats,
  showStats,
  onOpenSearch,
}: HomeConceptsProps) {
  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 pointer-events-auto select-none w-full max-w-[1100px] px-4 hidden md:block">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-camel-300 shadow-xl px-5 py-2.5 flex items-center justify-between gap-6">
        {/* Left Badge */}
        <div className="flex items-center gap-2.5 shrink-0 border-r border-camel-200/80 pr-4">
          <div className="w-7 h-7 rounded-lg bg-camel-100 flex items-center justify-center border border-camel-300 text-camel-800 font-serif font-bold text-xs">
            CS
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold text-charcoal-900">Национальный реестр</div>
            <div className="text-[10px] text-charcoal-500">с 2015 года</div>
          </div>
        </div>

        {/* Center Numbers */}
        <div className="flex items-center justify-around flex-1 gap-4 divide-x divide-camel-200/50">
          <div className="text-center px-2">
            <span className="text-sm font-bold text-charcoal-900 tabular-nums">
              {stats ? formatNum(stats.events) : '—'}
            </span>
            <span className="text-[10.5px] text-charcoal-500 ml-1.5 uppercase font-medium">турниров</span>
          </div>
          <div className="text-center px-2 pl-4">
            <span className="text-sm font-bold text-charcoal-900 tabular-nums">
              {stats ? formatNum(stats.results) : '—'}
            </span>
            <span className="text-[10.5px] text-charcoal-500 ml-1.5 uppercase font-medium">забегов</span>
          </div>
          <div className="text-center px-2 pl-4">
            <span className="text-sm font-bold text-charcoal-900 tabular-nums">
              {showStats ? formatNum(showStats.exhibitions) : '—'}
            </span>
            <span className="text-[10.5px] text-charcoal-500 ml-1.5 uppercase font-medium">выставок</span>
          </div>
          <div className="text-center px-2 pl-4">
            <span className="text-sm font-bold text-charcoal-900 tabular-nums">
              {showStats ? formatNum(showStats.dogs) : '—'}
            </span>
            <span className="text-[10.5px] text-charcoal-500 ml-1.5 uppercase font-medium">собак в базе</span>
          </div>
        </div>

        {/* Right Search Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 bg-camel-50 hover:bg-camel-100 rounded-lg border border-camel-300 text-xs font-semibold text-camel-800 transition-colors shrink-0"
        >
          <Icons.search className="w-3.5 h-3.5 text-camel-700" aria-hidden />
          <span>Быстрый поиск</span>
          <kbd className="px-1 py-0.2 text-[9px] bg-white rounded border border-camel-300 text-charcoal-600">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  )
}

// =========================================================================
// Concept 3: Симметричный кокпит (Правая карточка вровень с подиумами)
// =========================================================================
export function Concept3SymmetricCockpit({
  stats,
  showStats,
  onOpenSearch,
}: HomeConceptsProps) {
  return (
    <div className="w-[320px] xl:w-[350px] 3xl:w-[390px] bg-gradient-to-br from-white/95 to-cream-50/95 backdrop-blur-md rounded-2xl border-2 border-camel-200/80 shadow-lg p-4 flex flex-col gap-3 pointer-events-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-camel-200/60">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-camel-100 border border-camel-300 flex items-center justify-center text-camel-800 shrink-0">
            <Icons.layers className="w-4 h-4 text-camel-700" aria-hidden />
          </span>
          <div>
            <div className="text-sm font-bold text-charcoal-900 font-serif">Единый архив</div>
            <div className="text-[10px] text-charcoal-500 font-medium">спорт & выставки</div>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-semibold text-camel-800 bg-camel-100 rounded-full border border-camel-200">
          РФ • 2015–2026
        </span>
      </div>

      {/* Quick Search */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="w-full flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-camel-300 shadow-sm hover:border-camel-400 transition-all text-xs text-charcoal-500 group"
      >
        <span className="flex items-center gap-2 truncate">
          <Icons.search className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="group-hover:text-charcoal-800">Поиск по 615 000 собакам...</span>
        </span>
        <kbd className="px-1 text-[9px] bg-old-money-100 text-charcoal-500 rounded border">⌘K</kbd>
      </button>

      {/* 2x2 Metric Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/80 rounded-xl p-2.5 border border-camel-200/60 flex flex-col">
          <span className="text-[10px] text-charcoal-500 uppercase font-semibold">Турниры спорта</span>
          <span className="text-base font-bold text-charcoal-900 tabular-nums">
            {stats ? formatNum(stats.events) : '—'}
          </span>
          <span className="text-[9.5px] text-camel-700 font-medium">курсинг и рейсинг</span>
        </div>

        <div className="bg-white/80 rounded-xl p-2.5 border border-camel-200/60 flex flex-col">
          <span className="text-[10px] text-charcoal-500 uppercase font-semibold">Забеги в базе</span>
          <span className="text-base font-bold text-charcoal-900 tabular-nums">
            {stats ? formatNum(stats.results) : '—'}
          </span>
          <span className="text-[9.5px] text-camel-700 font-medium">официальные очки</span>
        </div>

        <div className="bg-white/80 rounded-xl p-2.5 border border-camel-200/60 flex flex-col">
          <span className="text-[10px] text-charcoal-500 uppercase font-semibold">Выставки РКФ</span>
          <span className="text-base font-bold text-charcoal-900 tabular-nums">
            {showStats ? formatNum(showStats.exhibitions) : '—'}
          </span>
          <span className="text-[9.5px] text-forest-700 font-medium">все ранги и ринги</span>
        </div>

        <div className="bg-white/80 rounded-xl p-2.5 border border-camel-200/60 flex flex-col">
          <span className="text-[10px] text-charcoal-500 uppercase font-semibold">Собак в реестре</span>
          <span className="text-base font-bold text-charcoal-900 tabular-nums">
            {showStats ? formatNum(showStats.dogs) : '—'}
          </span>
          <span className="text-[9.5px] text-forest-700 font-medium">профили и титулы</span>
        </div>
      </div>

      {/* Direct Navigation Links */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Link
          to="/competitions"
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-camel-100 hover:bg-camel-200 border border-camel-300 text-xs font-semibold text-camel-900 transition-colors"
        >
          <span>Календарь</span>
          <Icons.arrowRight className="w-3 h-3 text-camel-700" aria-hidden />
        </Link>
        <Link
          to="/shows"
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-old-money-100 hover:bg-old-money-200 border border-old-money-300 text-xs font-semibold text-charcoal-800 transition-colors"
        >
          <span>Выставки</span>
          <Icons.arrowRight className="w-3 h-3 text-charcoal-600" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
