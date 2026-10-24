import { Link } from 'react-router-dom'
import { ExternalLink, Gauge, Timer, Trophy } from 'lucide-react'
import { SectionCard } from './GuideUi'
import { BREED_SPEEDS_DATA } from '../speedConstants'
import { GUIDE_SPEEDS_FAQS } from '../guideFaqs'

export default function SpeedsTab() {
  return (
    <div className="space-y-6">
      {/* 1. Сводная таблица скоростей */}
      <SectionCard title="Скорость и рекорды пород борзых (км/ч)">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Сравнение максимальной скорости спринта, подтверждённых радарных замеров на прямой и средней скорости на официальных состязаниях РКФ:
        </p>

        <div className="space-y-4 pt-2">
          {BREED_SPEEDS_DATA.map((item) => (
            <div
              key={item.breed}
              className="rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-charcoal-900">{item.breed}</h3>
                  <div className="mt-0.5 text-xs font-semibold text-camel-800">
                    {item.specialty}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-camel-50 px-2.5 py-1 text-xs font-bold text-camel-900 border border-camel-200/60">
                    <Gauge className="h-3.5 w-3.5 text-camel-700" aria-hidden />
                    Пик: {item.peakSprint}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-xs leading-relaxed text-charcoal-700 sm:text-sm">
                {item.description}
              </p>

              <div className="mt-3.5 grid gap-2.5 border-t border-old-money-100 pt-3 text-xs sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Timer className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-charcoal-500" aria-hidden />
                  <div>
                    <span className="font-semibold text-charcoal-800">Радар полигона Донино:</span>{' '}
                    <span className="text-charcoal-700">{item.doninoRadar}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Trophy className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-camel-700" aria-hidden />
                  <div>
                    <span className="font-semibold text-charcoal-800">Бега РКФ (360 м овал):</span>{' '}
                    <span className="text-charcoal-700">{item.rkfTrackAvg}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 pt-1 text-xs font-medium">
                <Link
                  to={item.competitionsUrl}
                  className="inline-flex items-center gap-1 text-camel-700 underline decoration-camel-300 underline-offset-2 transition-colors hover:text-camel-800"
                >
                  Турнирная таблица забегов
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

      {/* 2. Метрология и физика замеров */}
      <SectionCard title="Метрология: почему различаются показатели скорости">
        <div className="space-y-3 text-xs leading-relaxed text-charcoal-700 sm:text-sm">
          <p>
            В спортивной кинологии показатели скорости борзых строго разделяются в зависимости от метода фиксации:
          </p>
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                Пиковая скорость по радару (спринт)
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                Замеряется оптическими створами или доплеровским радаром на прямом отрезке трассы (100–150 м) в момент предельного стартового броска за механической приманкой. Отражает максимальную мгновенную скорость, которую способна развить собака.
              </p>
            </div>
            <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                Средняя скорость на состязаниях РКФ
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                Вычисляется по электронному таймингу и фотофинишу делением длины дистанции (например, 360 или 480 м) на время круга. Из-за преодоления двух крутых виражей средняя скорость всегда на 5–10 км/ч ниже пиковой скорости по прямой.
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 3. Частые вопросы */}
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
