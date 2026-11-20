import { Scale } from 'lucide-react'
import { COURSING_JUDGING_CRITERIA, COURSING_TIE_BREAK_STEPS } from '../../../constants'
import { RefTag, SectionCard } from '../../GuideUi'

export function JudgingCriteriaSection() {
  return (
    <div id="sec-judging">
      <SectionCard id="criteria" title="Судейство в курсинге: 5 критериев оценки и тай-брейк">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          В курсинге каждый судья оценивает собаку в обоих кругах по 5 нормативным критериям FCI/РКФ (максимум 20 баллов по каждому критерию, до 100 баллов за забег):
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {COURSING_JUDGING_CRITERIA.map((crit) => (
            <div
              key={crit.id}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                <span className="text-xs font-bold text-charcoal-900">
                  {crit.name}
                </span>
                <span className="rounded bg-camel-100 px-2 py-0.5 text-[10px] font-bold text-camel-900">
                  до {crit.maxPoints} б.
                </span>
              </div>
              <div className="mt-1 text-[10px] font-semibold text-camel-700 uppercase tracking-wide">
                {crit.nameEn} · Приоритет № {crit.tieBreakOrder}
              </div>
              <p className="mt-2 text-xs text-charcoal-800 leading-snug">
                {crit.summary}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-charcoal-500">
                {crit.focus}
              </p>
            </div>
          ))}
        </div>

        {/* Каскад тай-брейка */}
        <div className="mt-3 rounded-xl border border-camel-200/90 bg-cream-50/60 p-4">
          <div className="flex items-center gap-2 border-b border-camel-200/80 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camel-200 text-camel-900">
              <Scale className="h-3 w-3" aria-hidden />
            </span>
            <h3 className="text-xs font-bold text-charcoal-900 sm:text-sm">
              Как распределяются места при равенстве итоговых баллов (Тай-брейк)
            </h3>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3 text-xs">
            {COURSING_TIE_BREAK_STEPS.map((step) => (
              <div
                key={step.step}
                className="rounded-lg border border-old-money-200 bg-white p-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-camel-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-camel-100 text-[10px]">
                    {step.step}
                  </span>
                  <span>{step.label}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-charcoal-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          <RefTag>Правила проведения состязаний по курсингу борзых РКФ, п. 7.4.1.5</RefTag>
        </div>
      </SectionCard>
    </div>
  )
}
