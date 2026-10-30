import { Link } from 'react-router-dom'
import { Trophy, Award, ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react'
import type { HeroStats, HeroShowStats } from '../../../components/Hero'

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
// Concept Symmetric Final:
// 1. Верхний таб ровно на уровне левого SegmentedTabs (home-v2-stats-cockpit-tab: h=34px, mb-2.5)
// 2. Тело карточки с точно такой же шапкой home-v2-col-head (Статистика | Россия · 240+ пород | с 2015 года)
// 3. Белый чистый фон обоих секторов (Спорт и Выставки)
// 4. Точная высота, идеально совпадающая с левыми колонками подиума (.home-v2-stats-cockpit: 276.5px / 292.5px)
// =========================================================================
export function ConceptSymmetricFinal({ stats, showStats }: HomeConceptsProps) {
  return (
    <div className="w-[330px] xl:w-[360px] 2xl:w-[380px] 3xl:w-[420px] flex flex-col pointer-events-auto text-left select-none">
      {/* 1. ВЕРХНЯЯ ПОЛОСА: Чистая цельная плашка точно по высоте и форме левых табов */}
      <div className="home-v2-stats-cockpit-tab mb-2.5 flex items-center justify-between text-xs select-none">
        <span className="text-[11.5px] font-bold text-camel-900 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-camel-700" aria-hidden />
          <span>База данных и реестр</span>
        </span>
        <span className="text-[11px] font-medium text-charcoal-600 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-camel-700" aria-hidden />
          <span>Россия · 240+ пород</span>
        </span>
      </div>

      {/* 2. ТЕЛО КАРТОЧКИ: Точно совпадает по высоте и стилю с левыми колонками (.home-v2-col) */}
      <div className="home-v2-stats-cockpit flex flex-col justify-between overflow-hidden relative">
        {/* Шапка карточки — точная копия плашки над подиумами (home-v2-col-head) */}
        <div className="home-v2-col-head home-v2-col-head--tabs !px-3 shrink-0">
          <span className="font-serif font-bold text-camel-900 text-xs 2xl:text-[13px] shrink-0">
            Статистика
          </span>
          <span className="text-[11px] font-bold text-camel-800 shrink-0">
            Спорт и выставки
          </span>
          <span className="text-[10.5px] font-normal text-old-money-600 shrink-0">
            с 2015 года
          </span>
        </div>

        {/* Внутренние белые секторы (Спорт и Выставки) */}
        <div className="p-2 2xl:p-2.5 flex flex-col gap-1.5 2xl:gap-2 my-auto">
          {/* Сектор 1: Спорт и бега борзых */}
          <Link
            to="/competitions/"
            className="group block bg-white/95 hover:bg-cream-50/80 rounded-xl p-2 2xl:p-2.5 border border-camel-200/80 hover:border-camel-300 shadow-2xs transition-all text-inherit no-underline"
            aria-label="Перейти в раздел Спорт: состязания, курсинг и бега"
          >
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-camel-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-camel-900 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-camel-700" aria-hidden />
                <span>Спорт и бега</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>курсинг & рейсинг</span>
                <ArrowRight className="w-2.5 h-2.5 text-camel-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.events) : '—'}
                </div>
                <div className="text-[8.5px] 2xl:text-[9px] text-charcoal-600 font-semibold uppercase tracking-wider">турниров</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.results) : '—'}
                </div>
                <div className="text-[8.5px] 2xl:text-[9px] text-charcoal-600 font-semibold uppercase tracking-wider">забегов</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.dogs) : '—'}
                </div>
                <div className="text-[8.5px] 2xl:text-[9px] text-charcoal-600 font-semibold uppercase tracking-wider">собак</div>
              </div>
            </div>
          </Link>

          {/* Сектор 2: Выставки */}
          <Link
            to="/shows/"
            className="group block bg-white/95 hover:bg-cream-50/80 rounded-xl p-2 2xl:p-2.5 border border-old-money-200/80 hover:border-old-money-300 shadow-2xs transition-all text-inherit no-underline"
            aria-label="Перейти в раздел Выставки: каталоги, ринги, собаки"
          >
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-old-money-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-forest-700" aria-hidden />
                <span>Выставки</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>все ранги & ринги</span>
                <ArrowRight className="w-2.5 h-2.5 text-old-money-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-old-money-200/50">
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.exhibitions) : '—'}
                </div>
                <div className="text-[8.5px] 2xl:text-[9px] text-charcoal-600 font-semibold uppercase tracking-wider">выставок</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.appearances) : '—'}
                </div>
                <div className="text-[8.5px] 2xl:text-[9px] text-charcoal-600 font-semibold uppercase tracking-wider">записей</div>
              </div>
              <div className="px-1">
                <div className="text-[13.5px] 2xl:text-[14.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.dogs) : '—'}
                </div>
                <div className="text-[8.5px] 2xl:text-[9px] text-charcoal-600 font-semibold uppercase tracking-wider">собак</div>
              </div>
            </div>
          </Link>
        </div>

        {/* 3. НИЖНЯЯ СТРОКА: Статус архива и кнопки прямого перехода (нижний срез карточки) */}
        <div className="px-3 py-1.5 2xl:py-2 bg-cream-50/70 border-t border-camel-200/50 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[10px] 2xl:text-[10.5px] text-charcoal-600 font-medium flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-camel-600 shrink-0" aria-hidden />
            <span>Архивы и протоколы</span>
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to="/competitions/"
              className="px-2.5 py-1 rounded-lg bg-camel-100 hover:bg-camel-200 border border-camel-300 text-[10.5px] font-semibold text-camel-900 transition-colors flex items-center gap-1"
            >
              <span>Спорт</span>
              <ArrowRight className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            </Link>
            <Link
              to="/shows/"
              className="px-2.5 py-1 rounded-lg bg-old-money-100 hover:bg-old-money-200 border border-old-money-300 text-[10.5px] font-semibold text-charcoal-800 transition-colors flex items-center gap-1"
            >
              <span>Выставки</span>
              <ArrowRight className="w-2.5 h-2.5 text-old-money-600" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
