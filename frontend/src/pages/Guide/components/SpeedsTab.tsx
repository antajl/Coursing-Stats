import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Gauge, Timer, Trophy } from 'lucide-react'
import { SectionCard } from './GuideUi'
import {
  BREED_SPEEDS_DATA,
  SPEED_CATEGORY_FILTERS,
  type BreedSpeedCategory,
} from '../speedConstants'
import { GUIDE_SPEEDS_FAQS } from '../guideFaqs'

export default function SpeedsTab() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | BreedSpeedCategory>('all')
  const maxSpeed = 75 // Базис для 100% шкалы

  const filteredBreeds = useMemo(() => {
    if (selectedCategory === 'all') return BREED_SPEEDS_DATA
    return BREED_SPEEDS_DATA.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="space-y-6">
      {/* 0. Фильтр категорий пород */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-old-money-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800">
            <Gauge className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-xs font-bold text-charcoal-900">Категория пород:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SPEED_CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'border border-camel-400 bg-camel-100 text-camel-950 font-bold shadow-2xs'
                    : 'border border-old-money-200 bg-white text-charcoal-700 hover:border-camel-300 hover:text-camel-900'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-camel-200 text-camel-900' : 'bg-old-money-100 text-charcoal-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 1. Наглядная сравнительная диаграмма скоростей */}
      <SectionCard
        title={`Сравнительная шкала максимальной скорости (${filteredBreeds.length} из ${BREED_SPEEDS_DATA.length} пород)`}
      >
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Пиковая скорость прямого спринта по данным официальных радарных замеров и Книги рекордов Гиннесса:
        </p>

        <div className="space-y-2.5 pt-2">
          {filteredBreeds.map((item) => {
            const pct = Math.round((item.peakSpeedNum / maxSpeed) * 100)
            return (
              <div key={item.breed} className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-900 pb-1.5">
                  <span className="truncate pr-2">{item.breed}</span>
                  <span className="font-mono text-camel-900 shrink-0">{item.peakSprint}</span>
                </div>

                {/* Полоса прогресса */}
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-old-money-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-camel-300 via-camel-500 to-camel-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-charcoal-500 font-medium">
                  <span>{item.specialty}</span>
                  <span>Трек РКФ: {item.rkfTrackAvg.split(' ')[0]}</span>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* 2. Подробные карточки пород */}
      <SectionCard
        title={`Рекорды и особенности пород борзых (${filteredBreeds.length})`}
      >
        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          {filteredBreeds.map((item) => (
            <div
              key={item.breed}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-old-money-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900">{item.breed}</h3>
                    <div className="mt-0.5 text-[11px] font-semibold text-camel-800">
                      {item.specialty}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md bg-camel-50 px-2 py-0.5 text-xs font-bold text-camel-900 border border-camel-200/80 shrink-0">
                    <Gauge className="h-3 w-3 text-camel-700" aria-hidden />
                    {item.peakSprint}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-charcoal-700">
                  {item.description}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-old-money-100 pt-2.5 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <Timer className="mt-0.5 h-3 w-3 flex-shrink-0 text-charcoal-500" aria-hidden />
                    <div>
                      <span className="font-semibold text-charcoal-800">Радар Донино:</span>{' '}
                      <span className="text-charcoal-700">{item.doninoRadar}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Trophy className="mt-0.5 h-3 w-3 flex-shrink-0 text-camel-700" aria-hidden />
                    <div>
                      <span className="font-semibold text-charcoal-800">Трек РКФ:</span>{' '}
                      <span className="text-charcoal-700">{item.rkfTrackAvg}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-old-money-100/80 pt-2 text-xs font-medium">
                <Link
                  to={item.competitionsUrl}
                  className="inline-flex items-center gap-1 text-camel-700 underline decoration-camel-300 underline-offset-2 transition-colors hover:text-camel-800"
                >
                  Забеги породы
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </Link>
                {item.doninoRadar !== '—' && (
                  <Link
                    to={item.doninoUrl}
                    className="inline-flex items-center gap-1 text-charcoal-600 underline decoration-charcoal-300 underline-offset-2 transition-colors hover:text-charcoal-800"
                  >
                    Замеры в Донино
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3. Метрология и физика замеров */}
      <SectionCard title="Метрология: почему различаются показатели скорости">
        <div className="space-y-3 text-xs leading-relaxed text-charcoal-700 sm:text-sm">
          <p>
            В спортивной кинологии показатели скорости борзых строго разделяются в зависимости от метода фиксации:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                Пиковая скорость по радару (прямой спринт)
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                Замеряется оптическими створами или доплеровским радаром на прямом отрезке трассы (100–150 м) в момент предельного стартового броска за приманкой. Отражает максимальную мгновенную скорость, которую способна развить собака без сопротивления виражей.
              </p>
            </div>
            <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                Средняя скорость на состязаниях РКФ (замкнутый овал)
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                Вычисляется по электронному таймингу и фотофинишу делением длины дистанции (например, 360 или 480 м) на чистое время круга. Из-за преодоления двух крутых виражей средняя скорость всегда на 5–10 км/ч ниже пиковой скорости по прямой.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 4. Частые вопросы */}
      <SectionCard title="Частые вопросы о скорости и рекордах борзых">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_SPEEDS_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <dt className="text-xs font-bold text-charcoal-900 sm:text-sm">{faq.question}</dt>
              <dd className="mt-1.5 text-xs leading-relaxed text-charcoal-700 sm:text-sm">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  )
}
