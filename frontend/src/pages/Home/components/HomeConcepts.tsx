import { Link } from 'react-router-dom'
import {
  Trophy,
  Award,
  ArrowRight,
  Layers,
  ShieldCheck,
  Gauge,
  Search,
  BookOpen,
} from 'lucide-react'
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
// Concept Symmetric Final (Зафиксированный дизайн правого консольного кокпита):
// 1. Верхний таб: «База данных» и «83 породы & хабы →» (h=36px)
// 2. Шапка карточки: «Статистика» | «Вся Россия · 240+ клубов» | «2015–2026»
// 3. Три кита: Соревнования борзых · Выставки и ринги · Полигон Донино
// 4. Футер: 3 центрированные кнопки прямого доступа [Судьи], [Правила], [Породы →]
// 5. Точная высота, идеально совпадающая с левой консолью лидеров: 316px (336px на 2K)
// =========================================================================
export function ConceptSymmetricFinal({ stats, showStats }: HomeConceptsProps) {
  return (
    <div className="home-v2-monolith-shell w-[330px] xl:w-[360px] 2xl:w-[380px] 3xl:w-[420px] flex flex-col pointer-events-auto text-left select-none">
      {/* 1. ВЕРХНЯЯ ПОЛОСА: Чистая цельная плашка точно по высоте и форме левых табов */}
      <div className="home-v2-stats-cockpit-tab flex items-center justify-between text-xs select-none shrink-0">
        <span className="text-[11.5px] font-bold text-camel-900 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span>База данных</span>
        </span>
        <Link
          to="/breeds/"
          className="text-[11px] font-semibold text-camel-800 hover:text-camel-950 flex items-center gap-1 transition-colors hover:underline"
          title="Каталог пород и персональные хабы"
        >
          <ShieldCheck className="w-3 h-3 text-camel-700" aria-hidden />
          <span>83 породы & хабы →</span>
        </Link>
      </div>

      {/* 2. ТЕЛО КАРТОЧКИ */}
      <div className="home-v2-stats-cockpit flex flex-col justify-between overflow-hidden relative flex-1 min-h-0">
        {/* Шапка карточки: лаконично, без тавтологий с верхней полосой */}
        <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative shrink-0">
          <span className="shrink-0">Статистика</span>
          <div className="flex min-w-0 flex-1 items-center justify-center">
            <span className="truncate min-w-0 text-[12.5px] font-bold text-camel-800">
              Вся Россия · 240+ клубов
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 ml-auto">
            <span className="shrink-0 text-[11px] font-normal text-old-money-600">
              2015–2026
            </span>
          </div>
        </div>

        {/* 3 сектора: Спорт · Выставки · Донино */}
        <div className="flex flex-col flex-1 min-h-0 bg-white/95 divide-y divide-[rgba(195,168,128,0.40)]">
          {/* Сектор 1: Соревнования борзых */}
          <Link
            to="/competitions/ranking/2026/"
            className="group flex-1 flex flex-col justify-center px-3 2xl:px-3.5 py-1.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          >
            <div className="flex items-center justify-between pb-0.5 mb-1 border-b border-camel-200/40">
              <span className="text-[10px] 2xl:text-[10.5px] font-bold uppercase tracking-wider text-camel-900 flex items-center gap-1.5">
                <Trophy className="w-3 h-3 text-camel-700" aria-hidden />
                <span>Соревнования борзых</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>курсинг и рейсинг</span>
                <ArrowRight className="w-2.5 h-2.5 text-camel-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.events) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">турниров</div>
              </div>
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.results) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">забегов</div>
              </div>
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.dogs) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">собак</div>
              </div>
            </div>
          </Link>

          {/* Сектор 2: Выставки и ринги */}
          <Link
            to="/shows/ranking/2026/"
            className="group flex-1 flex flex-col justify-center px-3 2xl:px-3.5 py-1.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          >
            <div className="flex items-center justify-between pb-0.5 mb-1 border-b border-old-money-200/40">
              <span className="text-[10px] 2xl:text-[10.5px] font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-forest-700" aria-hidden />
                <span>Выставки и ринги</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>все ранги РКФ</span>
                <ArrowRight className="w-2.5 h-2.5 text-old-money-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-old-money-200/50">
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.exhibitions) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">выставок</div>
              </div>
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.appearances) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">записей</div>
              </div>
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.dogs) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">собак</div>
              </div>
            </div>
          </Link>

          {/* Сектор 3: Полигон Донино */}
          <Link
            to="/speed-records/2026/"
            className="group flex-1 flex flex-col justify-center px-3 2xl:px-3.5 py-1.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          >
            <div className="flex items-center justify-between pb-0.5 mb-1 border-b border-camel-200/40">
              <span className="text-[10px] 2xl:text-[10.5px] font-bold uppercase tracking-wider text-camel-950 flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-camel-700" aria-hidden />
                <span>Полигон Донино</span>
              </span>
              <span className="text-[9px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>радар и спринт 350 м</span>
                <ArrowRight className="w-2.5 h-2.5 text-camel-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">до 65 км/ч</div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">рекорд</div>
              </div>
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.donino_records) : '1.3 тыс.'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">замеров</div>
              </div>
              <div className="px-1">
                <div className="text-[12.5px] 2xl:text-[13.5px] font-bold text-charcoal-900 tabular-nums">3 лиги</div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">чемпионат</div>
              </div>
            </div>
          </Link>
        </div>

        {/* 4. Футер: 3 функциональные кнопки поиска и перехода по центру */}
        <div className="home-v2-stats-cockpit-footer h-[36px] 2xl:h-[38px] px-2.5 2xl:px-3 bg-cream-50/70 border-t border-old-money-200/70 flex items-center justify-center !justify-center gap-1.5 2xl:gap-2 shrink-0 box-border">
          <Link
            to="/shows/judges/"
            className="cs-glass-pill px-2 2xl:px-2.5 py-0.5 rounded-full text-[9.5px] 2xl:text-[10px] font-semibold flex items-center gap-1 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="База судей и экспертов"
          >
            <Search className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            <span>Судьи</span>
          </Link>
          <Link
            to="/guide/"
            className="cs-glass-pill px-2 2xl:px-2.5 py-0.5 rounded-full text-[9.5px] 2xl:text-[10px] font-semibold flex items-center gap-1 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="Справочник правил и титулов"
          >
            <BookOpen className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            <span>Правила</span>
          </Link>
          <Link
            to="/breeds/"
            className="cs-glass-pill px-2 2xl:px-2.5 py-0.5 rounded-full text-[9.5px] 2xl:text-[10px] font-semibold flex items-center gap-1 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="Каталог пород"
          >
            <span>Породы</span>
            <ArrowRight className="w-2.5 h-2.5 text-camel-700" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}
