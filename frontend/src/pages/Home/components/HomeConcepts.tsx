import { Link } from 'react-router-dom'
import { Trophy, Award, ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react'
import type { HeroStats, HeroShowStats } from '../../../components/Hero'

export type HomeConceptMode = 'symmetric-final' | 'as-is'

interface HomeConceptsProps {
  stats: HeroStats | null
  showStats: HeroShowStats | null
  loading?: boolean
}

function formatNum(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '—'
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
      <div className="bg-[#252320]/95 backdrop-blur-md text-white rounded-full p-1.5 shadow-2xl border border-camel-400/40 flex items-center gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => setMode('symmetric-final')}
          className={`px-3.5 py-1.5 rounded-full transition-all font-medium text-[12px] ${
            mode === 'symmetric-final'
              ? 'bg-camel-600 text-white shadow-sm font-semibold'
              : 'text-charcoal-300 hover:text-white hover:bg-white/10'
          }`}
        >
          Симметричный кокпит (100% высота и плашка)
        </button>

        <button
          type="button"
          onClick={() => setMode('as-is')}
          className={`px-2.5 py-1.5 rounded-full transition-all text-[11px] ${
            mode === 'as-is'
              ? 'bg-charcoal-700 text-white shadow-sm font-semibold'
              : 'text-charcoal-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Как было
        </button>
      </div>
    </div>
  )
}

// =========================================================================
// Concept Symmetric Final:
// 1. Верхний таб ровно на уровне левого SegmentedTabs (home-v2-stats-cockpit-tab: h=34px, mb-2.5)
// 2. Тело карточки с точно такой же шапкой home-v2-col-head (Статистика | Россия · 240+ пород | с 2015 года)
// 3. Белый чистый фон обоих секторов (Спорт и Выставки)
// 4. Точная высота, идеально совпадающая с левыми колонками подиума (.home-v2-stats-cockpit: 276.5px / 292.5px)
// =========================================================================
export function ConceptSymmetricFinal({ stats, showStats }: HomeConceptsProps) {
  return (
    <div className="w-[330px] xl:w-[360px] 2xl:w-[380px] 3xl:w-[420px] flex flex-col pointer-events-auto text-left select-none">
      {/* 1. ВЕРХНЯЯ ПОЛОСА: Точно такой же формы и высоты как SegmentedTabs слева */}
      <div
        role="tablist"
        aria-label="Реестр и база данных"
        className="home-v2-stats-cockpit-tab mb-2.5 flex items-center gap-1 select-none"
      >
        <div
          role="tab"
          aria-selected="true"
          className="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap min-w-0 py-1 px-1.5 sm:px-2.5 rounded-md text-[11px] bg-white text-charcoal-900 shadow-2xs border border-old-money-200/80 font-semibold"
        >
          <Layers className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span>База данных и реестр</span>
        </div>
        <div
          role="tab"
          aria-selected="false"
          className="flex items-center justify-center gap-1 whitespace-nowrap min-w-0 py-1 px-2 sm:px-2.5 rounded-md text-[11px] text-charcoal-600 font-medium"
        >
          <ShieldCheck className="w-3 h-3 text-camel-700 shrink-0" aria-hidden />
          <span>РФ · с 2015 года</span>
        </div>
      </div>

      {/* 2. ТЕЛО КАРТОЧКИ: Точно совпадает по высоте и стилю с левыми колонками (.home-v2-col) */}
      <div className="home-v2-stats-cockpit flex flex-col justify-between overflow-hidden relative">
        {/* Шапка карточки — точная копия плашки над подиумами (home-v2-col-head) */}
        <div className="home-v2-col-head home-v2-col-head--tabs !px-3 shrink-0">
          <span className="font-serif font-bold text-camel-900 text-xs 2xl:text-[13px] shrink-0">
            Статистика
          </span>
          <span className="text-[11px] font-bold text-camel-800 shrink-0">
            Россия · 240+ пород
          </span>
          <span className="text-[10.5px] font-normal text-old-money-600 shrink-0">
            с 2015 года
          </span>
        </div>

        {/* Внутренние белые секторы (Спорт и Выставки) */}
        <div className="p-2 2xl:p-2.5 flex flex-col gap-1.5 2xl:gap-2 my-auto">
          {/* Сектор 1: Спорт и бега борзых */}
          <div className="bg-white/95 rounded-xl p-2 2xl:p-2.5 border border-camel-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-camel-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-camel-900 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-camel-700" aria-hidden />
                <span>Спорт и бега</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium">курсинг & рейсинг</span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.events) : '—'}
                </div>
                <div className="text-[9px] text-charcoal-500 font-medium uppercase tracking-tight">турниров</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.results) : '—'}
                </div>
                <div className="text-[9px] text-charcoal-500 font-medium uppercase tracking-tight">забегов</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.dogs) : '—'}
                </div>
                <div className="text-[9px] text-charcoal-500 font-medium uppercase tracking-tight">собак</div>
              </div>
            </div>
          </div>

          {/* Сектор 2: Выставки РКФ */}
          <div className="bg-white/95 rounded-xl p-2 2xl:p-2.5 border border-old-money-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-old-money-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-forest-700" aria-hidden />
                <span>Выставки РКФ</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium">все ранги & ринги</span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-old-money-200/50">
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.exhibitions) : '—'}
                </div>
                <div className="text-[9px] text-charcoal-500 font-medium uppercase tracking-tight">выставок</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.appearances) : '—'}
                </div>
                <div className="text-[9px] text-charcoal-500 font-medium uppercase tracking-tight">записей</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.dogs) : '—'}
                </div>
                <div className="text-[9px] text-charcoal-500 font-medium uppercase tracking-tight">собак</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. НИЖНЯЯ СТРОКА: Статус архива и кнопки прямого перехода (нижний срез карточки) */}
        <div className="px-3 py-1.5 2xl:py-2 bg-cream-50/70 border-t border-camel-200/50 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[10px] 2xl:text-[10.5px] text-charcoal-600 font-medium flex items-center gap-1 truncate">
            <Sparkles className="w-3 h-3 text-camel-600 shrink-0" aria-hidden />
            <span>Единая база родословных и карьер</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/competitions"
              className="px-2.5 py-1 rounded-lg bg-camel-100 hover:bg-camel-200 border border-camel-300 text-[10.5px] font-semibold text-camel-900 transition-colors flex items-center gap-1"
            >
              <span>Календарь</span>
              <ArrowRight className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            </Link>
            <Link
              to="/shows"
              className="px-2.5 py-1 rounded-lg bg-old-money-100 hover:bg-old-money-200 border border-old-money-300 text-[10.5px] font-semibold text-charcoal-800 transition-colors"
            >
              Выставки
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
