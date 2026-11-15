import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Award,
  ArrowRight,
  Sparkles,
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

export type CockpitVariant = 'v1' | 'v2' | 'v3'

function formatNum(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '—'
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} млн`
  if (value >= 10000) return `${(value / 1000).toFixed(0)} тыс.`
  if (value >= 1000) return `${(value / 1000).toFixed(1)} тыс.`
  return value.toLocaleString('ru-RU')
}

export function ConceptSymmetricFinal({ stats, showStats }: HomeConceptsProps) {
  const [variant, setVariant] = useState<CockpitVariant>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cs_cockpit_variant') as CockpitVariant | null
      if (saved === 'v1' || saved === 'v2' || saved === 'v3') return saved
    }
    // По умолчанию открываем запрошенный синтез (вариант 2: Донино + стиль Действий)
    return 'v2'
  })

  const handleSelectVariant = (v: CockpitVariant) => {
    setVariant(v)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cs_cockpit_variant', v)
    }
  }

  return (
    <div className="home-v2-monolith-shell w-[330px] xl:w-[360px] 2xl:w-[380px] 3xl:w-[420px] flex flex-col pointer-events-auto text-left select-none">
      {/* 1. ВЕРХНЯЯ ПОЛОСА: Чистая цельная плашка точно по высоте и форме левых табов с переключателем вариантов */}
      <div className="home-v2-stats-cockpit-tab flex items-center justify-between text-xs select-none shrink-0">
        <span className="text-[11.5px] font-bold text-camel-900 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
          <span className="hidden sm:inline">База данных</span>
          <span className="sm:hidden">База</span>
        </span>

        {/* Интерактивный переключатель 3 вариантов оформления */}
        <div
          role="group"
          aria-label="Выбор варианта оформления витрины"
          className="inline-flex rounded-full bg-cream-200/90 p-0.5 border border-camel-300/80 shadow-2xs shrink-0"
        >
          <button
            type="button"
            onClick={() => handleSelectVariant('v1')}
            className={`px-2 py-0.5 rounded-full text-[9.5px] 2xl:text-[10px] font-semibold transition-all cursor-pointer ${
              variant === 'v1'
                ? 'bg-camel-700 text-white shadow-xs'
                : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-white/50'
            }`}
            title="Вариант 1: Монолитный Old Money (как сейчас: 2 блока, спорт + выставки, чистый футер)"
          >
            1. Монолит
          </button>
          <button
            type="button"
            onClick={() => handleSelectVariant('v2')}
            className={`px-2 py-0.5 rounded-full text-[9.5px] 2xl:text-[10px] font-semibold transition-all cursor-pointer ${
              variant === 'v2'
                ? 'bg-camel-700 text-white shadow-xs'
                : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-white/50'
            }`}
            title="Вариант 2 (Запрошенный): Донино + стиль Действий (3 блока: спорт + выставки + Донино, кнопки судей и правил)"
          >
            2. Донино + Действия
          </button>
          <button
            type="button"
            onClick={() => handleSelectVariant('v3')}
            className={`px-2 py-0.5 rounded-full text-[9.5px] 2xl:text-[10px] font-semibold transition-all cursor-pointer ${
              variant === 'v3'
                ? 'bg-camel-700 text-white shadow-xs'
                : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-white/50'
            }`}
            title="Вариант 3: 2 блока (спорт + выставки) со стилем действий"
          >
            3. 2 блока
          </button>
        </div>
      </div>

      {/* 2. ТЕЛО КАРТОЧКИ */}
      {variant === 'v1' && (
        <CockpitVariantMonolith stats={stats} showStats={showStats} />
      )}
      {variant === 'v2' && (
        <CockpitVariantTriplePillar stats={stats} showStats={showStats} />
      )}
      {variant === 'v3' && (
        <CockpitVariantActions stats={stats} showStats={showStats} />
      )}
    </div>
  )
}

// =========================================================================
// ВАРИАНТ 1: «Монолитный Old Money»
// - Устранена тавтология в шапке (вместо «Спорт и выставки» -> «Вся Россия · 240+ клубов»)
// - Монолитное тело без зазоров (встык, как строки подиума слева)
// - Полноценные ссылки прямо в секторах («В рейтинг сезона →», «Каталоги и ринги →»)
// - Просторный футер без дублирующих кнопок, ничего не залазит на рамку
// =========================================================================
function CockpitVariantMonolith({ stats, showStats }: HomeConceptsProps) {
  return (
    <div className="home-v2-stats-cockpit flex flex-col justify-between overflow-hidden relative flex-1 min-h-0">
      {/* Шапка карточки */}
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative shrink-0">
        <span className="shrink-0">Статистика</span>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <span className="truncate min-w-0 text-[12.5px] font-bold text-camel-800">
            Вся Россия · 240+ клубов
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto">
          <span className="shrink-0 text-[11px] font-normal text-old-money-600">
            с 2015 года
          </span>
        </div>
      </div>

      {/* Внутренние монолитные секторы (Спорт и Выставки) */}
      <div className="flex flex-col flex-1 min-h-0 bg-white/95 divide-y divide-[rgba(195,168,128,0.40)]">
        {/* Сектор 1: Спорт и бега */}
        <Link
          to="/competitions/ranking/2026/"
          className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 2xl:py-2.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          aria-label="Перейти в раздел Спорт: состязания, курсинг и бега"
        >
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-camel-200/40">
            <span className="text-[11px] 2xl:text-[11.5px] font-bold uppercase tracking-wider text-camel-900 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-camel-700" aria-hidden />
              <span>Спорт и бега</span>
            </span>
            <span className="text-[9.5px] 2xl:text-[10px] text-camel-800 font-semibold flex items-center gap-1 group-hover:text-camel-950 transition-colors">
              <span>В рейтинг сезона</span>
              <ArrowRight className="w-3 h-3 text-camel-600 group-hover:translate-x-0.5 transition-transform" aria-hidden />
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
          to="/shows/ranking/2026/"
          className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 2xl:py-2.5 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
          aria-label="Перейти в раздел Выставки: каталоги, ринги, собаки"
        >
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-old-money-200/40">
            <span className="text-[11px] 2xl:text-[11.5px] font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-forest-700" aria-hidden />
              <span>Выставки РКФ</span>
            </span>
            <span className="text-[9.5px] 2xl:text-[10px] text-camel-800 font-semibold flex items-center gap-1 group-hover:text-camel-950 transition-colors">
              <span>Каталоги и ринги</span>
              <ArrowRight className="w-3 h-3 text-camel-600 group-hover:translate-x-0.5 transition-transform" aria-hidden />
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

      {/* Футер */}
      <div className="home-v2-stats-cockpit-footer h-[36px] 2xl:h-[38px] px-3 2xl:px-3.5 bg-cream-50/70 border-t border-old-money-200/70 flex items-center justify-between gap-2 shrink-0 box-border">
        <span className="text-[10px] 2xl:text-[10.5px] text-charcoal-600 font-medium flex items-center gap-1.5 shrink-0 truncate">
          <Sparkles className="w-3.5 h-3.5 text-camel-600 shrink-0" aria-hidden />
          <span className="hidden xl:inline">Электронный кинологический архив</span>
          <span className="xl:hidden">Электронный архив</span>
        </span>
        <Link
          to="/breeds/"
          className="cs-glass-pill px-2.5 py-0.5 rounded-full text-[10px] 2xl:text-[10.5px] font-semibold flex items-center gap-1 hover:border-camel-400 hover:text-camel-900 shrink-0"
          title="Каталог всех 83 пород и персональные хабы"
        >
          <span>Каталог 83 пород</span>
          <ArrowRight className="w-3 h-3 text-camel-700" aria-hidden />
        </Link>
      </div>
    </div>
  )
}

// =========================================================================
// ВАРИАНТ 2: «Три кита + стиль Действий» (Запрошенный пользователем синтез)
// - Включает все 3 кита: Спорт, Выставки, Полигон Донино
// - Визуальный язык Варианта 3:
//   * Шапка: «Реестр» | «Единая база борзых и судей» | «2015–2026»
//   * Секторы: «Соревнования борзых», «Выставки и ринги», «Полигон Донино»
//   * Приглушенные подписи (charcoal-600) и плавные стрелки при наведении (hover)
//   * Футер из Варианта 3: «Архив» + 3 быстрых инструмента [Судьи], [Правила], [Породы →]
// =========================================================================
function CockpitVariantTriplePillar({ stats, showStats }: HomeConceptsProps) {
  return (
    <div className="home-v2-stats-cockpit flex flex-col justify-between overflow-hidden relative flex-1 min-h-0">
      {/* Шапка карточки в визуальном стиле Варианта 3 */}
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative shrink-0">
        <span className="shrink-0">Реестр</span>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <span className="truncate min-w-0 text-[12.5px] font-bold text-camel-800">
            Единая база борзых и судей
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto">
          <span className="shrink-0 text-[11px] font-normal text-old-money-600">
            2015–2026
          </span>
        </div>
      </div>

      {/* 3 сектора: Спорт · Выставки · Донино в визуальном стиле Варианта 3 */}
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

      {/* Футер: 3 функциональные кнопки поиска и перехода из Варианта 3 */}
      <div className="home-v2-stats-cockpit-footer h-[36px] 2xl:h-[38px] px-2 2xl:px-3 bg-cream-50/70 border-t border-old-money-200/70 flex items-center justify-between gap-1 shrink-0 box-border">
        <span className="text-[9.5px] 2xl:text-[10px] text-charcoal-600 font-medium flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-camel-600 shrink-0" aria-hidden />
          <span className="hidden xl:inline">Архив</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/shows/judges/"
            className="cs-glass-pill px-1.5 2xl:px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-semibold flex items-center gap-0.5 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="База судей и экспертов"
          >
            <Search className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            <span>Судьи</span>
          </Link>
          <Link
            to="/guide/"
            className="cs-glass-pill px-1.5 2xl:px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-semibold flex items-center gap-0.5 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="Справочник правил и титулов"
          >
            <BookOpen className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            <span>Правила</span>
          </Link>
          <Link
            to="/breeds/"
            className="cs-glass-pill px-1.5 2xl:px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-semibold flex items-center gap-0.5 hover:border-camel-400 hover:text-camel-900 shrink-0"
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

// =========================================================================
// ВАРИАНТ 3: «Быстрые действия» (Action Cockpit)
// - Шапка «Единая база борзых и судей»
// - Секторы без дублирующих слов
// - В футере 2 функциональные кнопки поиска вместо повторения спорта и выставок
// =========================================================================
function CockpitVariantActions({ stats, showStats }: HomeConceptsProps) {
  return (
    <div className="home-v2-stats-cockpit flex flex-col justify-between overflow-hidden relative flex-1 min-h-0">
      {/* Шапка карточки */}
      <div className="home-v2-col-head home-v2-col-head--tabs !flex-nowrap gap-1.5 sm:gap-2 relative shrink-0">
        <span className="shrink-0">Реестр</span>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <span className="truncate min-w-0 text-[12.5px] font-bold text-camel-800">
            Единая база борзых и судей
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 ml-auto">
          <span className="shrink-0 text-[11px] font-normal text-old-money-600">
            2015–2026
          </span>
        </div>
      </div>

      {/* Тело карточки: 2 сектора */}
      <div className="flex flex-col flex-1 min-h-0 bg-white/95 divide-y divide-[rgba(195,168,128,0.40)]">
        <Link
          to="/competitions/ranking/2026/"
          className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-camel-200/40">
            <span className="text-[11px] 2xl:text-[11.5px] font-bold uppercase tracking-wider text-camel-900 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-camel-700" aria-hidden />
              <span>Соревнования борзых</span>
            </span>
            <span className="text-[9.5px] text-charcoal-600 font-medium flex items-center gap-0.5">
              <span>курсинг и рейсинг</span>
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

        <Link
          to="/shows/ranking/2026/"
          className="group flex-1 flex flex-col justify-center px-3.5 2xl:px-4 py-2 transition-colors hover:bg-cream-50/70 text-inherit no-underline"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-old-money-200/40">
            <span className="text-[11px] 2xl:text-[11.5px] font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-forest-700" aria-hidden />
              <span>Выставки и ринги</span>
            </span>
            <span className="text-[9.5px] text-charcoal-600 font-medium flex items-center gap-0.5">
              <span>все ранги РКФ</span>
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

      {/* Футер: 3 функциональные кнопки поиска и перехода */}
      <div className="home-v2-stats-cockpit-footer h-[36px] 2xl:h-[38px] px-2 2xl:px-3 bg-cream-50/70 border-t border-old-money-200/70 flex items-center justify-between gap-1 shrink-0 box-border">
        <span className="text-[9.5px] 2xl:text-[10px] text-charcoal-600 font-medium flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-camel-600 shrink-0" aria-hidden />
          <span className="hidden xl:inline">Архив</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Link
            to="/shows/judges/"
            className="cs-glass-pill px-1.5 2xl:px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-semibold flex items-center gap-0.5 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="База судей и экспертов"
          >
            <Search className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            <span>Судьи</span>
          </Link>
          <Link
            to="/guide/"
            className="cs-glass-pill px-1.5 2xl:px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-semibold flex items-center gap-0.5 hover:border-camel-400 hover:text-camel-900 shrink-0"
            title="Справочник правил и титулов"
          >
            <BookOpen className="w-2.5 h-2.5 text-camel-700" aria-hidden />
            <span>Правила</span>
          </Link>
          <Link
            to="/breeds/"
            className="cs-glass-pill px-1.5 2xl:px-2 py-0.5 rounded-full text-[9px] 2xl:text-[10px] font-semibold flex items-center gap-0.5 hover:border-camel-400 hover:text-camel-900 shrink-0"
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
