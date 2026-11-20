import { SPORT_CAREER_ROADMAP } from '../../../constants'
import { RefTag, SectionCard } from '../../GuideUi'

export function CareerRoadmapSection() {
  return (
    <div id="sec-roadmap">
      <SectionCard title="Пошаговый путь в спорте: от первой тренировки до Чемпиона России">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Понятный маршрут собаки в спорте борзых — как подготовиться, когда сдавать беговой допуск и как расти в званиях:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          {SPORT_CAREER_ROADMAP.map((step) => (
            <div
              key={step.step}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-xs text-charcoal-900 sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camel-100 text-[11px] font-bold text-camel-900">
                      {step.step}
                    </span>
                    {step.title}
                  </span>
                  <span className="rounded bg-cream-100 px-2 py-0.5 text-[10px] font-semibold text-camel-900 border border-camel-200/70">
                    {step.age}
                  </span>
                </div>

                <div className="mt-2.5 text-xs font-semibold text-camel-900">
                  Цель: {step.goal}
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                  {step.action}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-old-money-100">
                <div className="text-[11px] font-medium text-charcoal-600">
                  <span className="font-semibold text-charcoal-900">Итог: </span>
                  {step.result}
                </div>
                <RefTag>{step.ref}</RefTag>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
