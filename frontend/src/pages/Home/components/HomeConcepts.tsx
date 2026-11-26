import { Link } from 'react-router-dom'
import { Trophy, Award, ArrowRight, Layers, ShieldCheck, Gauge } from 'lucide-react'
import type { HeroStats, HeroShowStats } from '../../../components/Hero'

interface HomeConceptsProps {
  stats: HeroStats | null
  showStats: HeroShowStats | null
  maxDoninoSpeed?: number | null
  breedHubsCount?: number
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
// Concept Symmetric Final (Чистый монолит без лишних строк и кнопок):
// 1. Верхний таб: «База данных» и «83 породы & хабы →» (h=36px)
// 2. Тело карточки: 3 равноправных кита (Спорт · Выставки · Донино)
//    Каждый сектор получает ~93px высоты, свободное дыхание и чистую сетку
// 3. Полное отсутствие промежуточных тавтологий и дублирующих кнопок
// =========================================================================
export function ConceptSymmetricFinal({ stats, showStats, maxDoninoSpeed, breedHubsCount }: HomeConceptsProps) {
  const breedsLabel = stats?.breeds
    ? `${stats.breeds} пород и ${breedHubsCount || 82} хаба →`
    : 'Каталог пород →'
  const speedRecordLabel = maxDoninoSpeed && maxDoninoSpeed > 0
    ? `${Number.isInteger(maxDoninoSpeed) ? maxDoninoSpeed : maxDoninoSpeed.toFixed(1)} км/ч`
    : '—'
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
          <span>{breedsLabel}</span>
        </Link>
      </div>

      {/* 2. ТЕЛО КАРТОЧКИ: 3 равноправных монолитных сектора */}
      <div className="home-v2-stats-cockpit flex flex-col flex-1 min-h-0 overflow-hidden relative">
        <div className="flex flex-col flex-1 min-h-0 bg-white/95 divide-y divide-[rgba(195,168,128,0.40)]">
          {/* Сектор 1: Соревнования борзых */}
          <Link
            to="/competitions/ranking/2026/"
            className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 2xl:py-2.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          >
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-camel-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-camel-900 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                <span>Соревнования борзых</span>
              </span>
              <span className="text-[9.5px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>курсинг и рейсинг</span>
                <ArrowRight className="w-2.5 h-2.5 text-camel-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.events) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">турниров</div>
              </div>
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.results) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">забегов</div>
              </div>
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.dogs) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">собак</div>
              </div>
            </div>
          </Link>

          {/* Сектор 2: Выставки и ринги */}
          <Link
            to="/shows/ranking/2026/"
            className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 2xl:py-2.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          >
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-old-money-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-forest-700 shrink-0" aria-hidden />
                <span>Выставки и ринги</span>
              </span>
              <span className="text-[9.5px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>все ранги РКФ</span>
                <ArrowRight className="w-2.5 h-2.5 text-old-money-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-old-money-200/50">
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.exhibitions) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">выставок</div>
              </div>
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.appearances) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">записей</div>
              </div>
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {showStats ? formatNum(showStats.dogs) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">собак</div>
              </div>
            </div>
          </Link>

          {/* Сектор 3: Полигон Донино */}
          <Link
            to="/speed-records/2026/"
            className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 2xl:py-2.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          >
            <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-camel-200/40">
              <span className="text-[10.5px] 2xl:text-[11px] font-bold uppercase tracking-wider text-camel-950 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                <span>Полигон Донино</span>
              </span>
              <span className="text-[9.5px] text-charcoal-600 font-medium flex items-center gap-0.5">
                <span>радар и спринт 350 м</span>
                <ArrowRight className="w-2.5 h-2.5 text-camel-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" aria-hidden />
              </span>
            </div>
            <div className="grid grid-cols-3 text-center divide-x divide-camel-200/50">
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">{speedRecordLabel}</div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">рекорд</div>
              </div>
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">
                  {stats ? formatNum(stats.donino_records) : '—'}
                </div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">замеров</div>
              </div>
              <div className="px-1">
                <div className="text-[13px] 2xl:text-[14px] font-bold text-charcoal-900 tabular-nums">3 лиги</div>
                <div className="text-[8px] 2xl:text-[8.5px] text-charcoal-600 font-semibold uppercase tracking-wider">чемпионат</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
