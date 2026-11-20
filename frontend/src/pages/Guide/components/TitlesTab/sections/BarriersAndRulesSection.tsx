import { Lock, CheckCircle2 } from 'lucide-react'
import { DISQUALIFICATION_RULES } from '../../../protocolConstants'
import { SectionCard } from '../../GuideUi'

export function BarriersAndRulesSection() {
  return (
    <>
      {/* Шкала квалификационных барьеров соревнований */}
      <SectionCard title="Шкала квалификационных барьеров соревнований">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Процент набранных баллов от максимальной суммы состязаний (по Правилам курсинга РКФ):
        </p>

        <div className="grid gap-2 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Барьер 1 круга
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">&lt; 50% баллов</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Сход со состязаний: собака не допускается ко 2-му забегу.
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Проходной зачёт
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">50 – 66,6%</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Оценки «Удовлетворительно» и «Хорошо». Норматив ВС не выполнен.
            </p>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Высшая квалификация
            </div>
            <div className="mt-1 text-sm font-bold text-amber-950">≥ 66,7% (Норма ВС)</div>
            <p className="mt-1 text-[11px] text-amber-900 leading-snug">
              Обязательное условие для получения титульных сертификатов CACL/CACIL.
            </p>
          </div>

          <div className="rounded-xl border border-camel-300 bg-camel-100/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-900">
              Высший эталон
            </div>
            <div className="mt-1 text-sm font-bold text-camel-950">≥ 75% («Отлично»)</div>
            <p className="mt-1 text-[11px] text-camel-900 leading-snug">
              Безупречная работа; норматив победы на Чемпионате России (ЧР РК).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Острый вопрос: почему 1 место без CACL? */}
      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-200 text-amber-900 shrink-0">
            <Lock className="h-3.5 w-3.5" aria-hidden />
          </span>
          <h3 className="font-serif text-sm font-bold text-amber-950 sm:text-base">
            Почему собака заняла 1-е место, но не получила сертификат CACL?
          </h3>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-charcoal-800">
          Для присуждения чемпионского сертификата CACL или CACIL победителю недостаточно просто опередить соперников. Регламент РКФ требует одновременного выполнения двух обязательных условий:
        </p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
              Условие 1 · Квалификационный балл ВС
            </div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Собака обязана набрать не менее 50% баллов в 1-м круге и не менее <strong>66,7% (⅔)</strong> от максимальной суммы по итогам двух кругов. Если балл ниже — CACL не выдаётся.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
              Условие 2 · Официальный кворум
            </div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              В породе на старт обязаны выйти <strong>не менее 3 собак</strong> (или 3 собак одного пола при раздельном забеге). При 1 или 2 участниках присуждается только место без CACL.
            </p>
          </div>
        </div>
      </div>

      {/* Статусы сходов и накопительные дисквалификации */}
      <SectionCard title="Статусы вне зачёта и накопительные дисквалификации">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Причины отсутствия баллов в протоколе и шкала санкций за агрессию или помеху напарнику:
        </p>

        <div className="grid gap-2 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-charcoal-800">DNS</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Did Not Start</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Неявка на старт забега к моменту пуска.</p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-amber-800">DNF</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Did Not Finish</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Сход с дистанции или прекращение преследования.</p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-sky-800">INJ</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Injured</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Снятие ветеринарным врачом из-за травмы.</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-rose-800">DISQ</span>
            <div className="mt-0.5 text-xs font-semibold text-rose-950">Дисквалификация</div>
            <p className="mt-1 text-[11px] text-rose-900">Агрессия или умышленная помеха напарнику.</p>
          </div>
        </div>

        <div className="mt-3.5 rounded-xl border border-rose-200 bg-white p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-charcoal-900">Накопительные санкции за дисквалификацию (РКФ):</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
            {DISQUALIFICATION_RULES.map((d) => (
              <div key={d.step} className="rounded-lg border border-old-money-200 bg-old-money-50/50 p-2.5">
                <div className="font-semibold text-charcoal-900">{d.step}:</div>
                <div className="font-medium text-rose-800 mt-0.5">{d.sanction}</div>
                <p className="mt-0.5 text-[11px] text-charcoal-600 leading-snug">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </>
  )
}
