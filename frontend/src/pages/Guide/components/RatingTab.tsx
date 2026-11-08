import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react'
import {
  CS_V2_COMPONENTS,
  OLYMPIC_CASCADE_STEPS,
  RATING_ABBREVIATIONS,
  RATING_DOMAINS,
  RATING_OFFICIAL_SOURCES,
  RATING_REQUIREMENTS,
} from '../ratingConstants'
import { GUIDE_RATING_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
} from './GuideUi'

function OlympicCascadeStepper() {
  const stepIcons = [Trophy, Activity, Sparkles, CheckCircle2]
  const transitions = [
    'Равенство побед? Вступает в силу плотность наград (standingScore / КПД)',
    'Разница standingScore ≤ 0.12? Вступает в силу индекс качества бега CS v2',
    'Равенство индекса CS v2? Решает общее число пройденных забегов',
  ]

  return (
    <div className="pt-2">
      <div className="space-y-1">
        {OLYMPIC_CASCADE_STEPS.map((step, idx) => {
          const StepIcon = stepIcons[idx] ?? Trophy
          const isFirst = idx === 0
          const hasTransition = idx < OLYMPIC_CASCADE_STEPS.length - 1

          return (
            <div key={step.rank}>
              {/* Карточка ступени каскада */}
              <div
                className={`rounded-2xl border p-4 sm:p-5 shadow-2xs transition-shadow hover:shadow-xs ${
                  isFirst
                    ? 'border-amber-300/90 bg-linear-to-b from-amber-50/70 via-cream-50/50 to-white'
                    : 'border-old-money-200 bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5 border-b border-old-money-100 pb-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl font-serif text-sm font-bold shadow-2xs ${
                        isFirst
                          ? 'border border-amber-500 bg-amber-200 text-amber-950'
                          : 'border border-camel-300 bg-camel-100 text-camel-900'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                          Ступень {step.rank}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-camel-300 bg-camel-50 px-2 py-0.5 text-[10px] font-bold text-camel-900">
                          {step.prestigeLabel}
                        </span>
                      </div>
                      <h3 className="mt-0.5 font-serif text-sm sm:text-base font-bold text-charcoal-900">
                        {step.name}
                      </h3>
                    </div>
                  </div>

                  <span className="self-start text-[11px] font-semibold text-charcoal-600 bg-old-money-50 border border-old-money-200 rounded-md px-2 py-0.5">
                    {step.howToGet}
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-charcoal-700">
                  {step.details}
                </p>

                {step.extraList && step.extraList.length > 0 && (
                  <ul className="mt-3 space-y-1.5 rounded-xl border border-old-money-100 bg-cream-50/50 p-3 text-xs text-charcoal-700">
                    {step.extraList.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <span className="text-camel-700 font-bold shrink-0">·</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {step.ref && (
                  <div className="mt-3">
                    <RefTag>{step.ref}</RefTag>
                  </div>
                )}
              </div>

              {/* Соединительный элемент каскада (переходное условие) */}
              {hasTransition && (
                <div className="my-2.5 flex items-center justify-center">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-camel-200/90 bg-camel-50/90 px-3 py-1 text-[11px] font-semibold text-camel-950 shadow-2xs">
                    <ArrowDown className="h-3 w-3 text-camel-700" aria-hidden />
                    <span>{transitions[idx]}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RatingTab() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const [showFormulaDetails, setShowFormulaDetails] = useState(false)

  return (
    <div className="space-y-6">
      {/* 1. Три независимых направления рейтинга */}
      <SectionCard title="Три независимых мира статистики">
        <p className="text-xs text-charcoal-600">
          Спорт, выставки РКФ и замеры полигона Донино изолированы друг от друга. Очки экстерьера, спортивные победы и секунды трека никогда не смешиваются в общую цифру:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {RATING_DOMAINS.map((domain) => (
            <div
              key={domain.id}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                  <span className="text-xs font-bold text-charcoal-900">{domain.name}</span>
                  <span className="rounded-full border border-camel-300 bg-camel-50 px-2 py-0.5 text-[10px] font-semibold text-camel-900">
                    {domain.tag}
                  </span>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-camel-800">
                  {domain.subtitle}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                  {domain.details}
                </p>
                <div className="mt-2.5 rounded-md border border-old-money-200 bg-old-money-50/60 px-2.5 py-1.5 font-mono text-[11px] text-charcoal-800">
                  <span className="font-semibold text-charcoal-900">Метрика:</span> {domain.metric}
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-old-money-100">
                <Link
                  to={domain.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-camel-700 hover:text-camel-800 underline decoration-camel-300 underline-offset-2"
                >
                  Перейти в рейтинг
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 2. Олимпийский каскад главного зачёта сезона */}
      <SectionCard title="Олимпийский медальный каскад соревнований">
        <p className="text-xs text-charcoal-600">
          В зачёте сезона курсинга и БЗМП места распределяются по строгой 4-ступенчатой системе приоритетов:
        </p>

        <OlympicCascadeStepper />
      </SectionCard>

      {/* 3. Формулы и математика: standingScore и CS v2 */}
      <SectionCard title="Анатомия расчёта: standingScore и индекс CS v2">
        <div className="space-y-4">
          {/* standingScore */}
          <div className="rounded-xl border border-camel-200 bg-camel-50/60 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-200/80 text-camel-900">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="font-serif text-sm font-bold text-charcoal-900">
                Показатель плотности наград (standingScore / КПД)
              </span>
            </div>
            <div className="mt-2.5 rounded-lg border border-camel-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-camel-900 shadow-2xs">
              standingScore = (3.0 × Золото + 1.0 × Серебро + 0.5 × Бронза) / (Число забегов + 4)
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              Золотые медали имеют наибольший вес (3.0). Коэффициент <code>(+ 4)</code> защищает от случайного взлёта после одного удачного забега: собака с 1 золотом за 1 старт получает <code>3.0 / 5 = 0.60</code>, а собака с 3 золотыми за 5 стартов — <code>9.0 / 9 = 1.00</code>.
            </p>
            <div className="mt-2.5 rounded-lg border border-camel-300/80 bg-white/90 p-2.5 text-xs text-charcoal-800">
              <span className="font-semibold text-camel-900">Правило тай-брейка (разница ≤ 0.12):</span> Если плотность наград двух участников практически равна, решающим фактором становится качество бега по судейским оценкам — выше оказывается собака с большим индексом <strong>CS v2</strong>.
            </div>
          </div>

          {/* 5 слагаемых CS v2 */}
          <div className="rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-old-money-100 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-old-money-100 text-charcoal-800">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="font-serif text-sm font-bold text-charcoal-900">
                5 слагаемых индекса CS v2 простыми словами
              </span>
            </div>

            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {CS_V2_COMPONENTS.map((comp) => (
                <div
                  key={comp.name}
                  className="rounded-lg border border-old-money-200 bg-cream-50/50 p-2.5"
                >
                  <div className="text-xs font-bold text-charcoal-900">{comp.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] font-semibold text-camel-800">
                    {comp.code}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-charcoal-700">
                    {comp.summary}
                  </p>
                </div>
              ))}
            </div>

            {/* Раскрываемый блок с формулой для математиков */}
            <div className="mt-3 pt-2 border-t border-old-money-100">
              <button
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-camel-800 cursor-pointer"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showFormulaDetails ? 'rotate-180' : ''}`}
                  aria-hidden
                />
                <span>{showFormulaDetails ? 'Скрыть строгую формулу' : 'Показать строгую математическую формулу'}</span>
              </button>

              {showFormulaDetails && (
                <div className="mt-2 rounded-lg border border-old-money-200 bg-old-money-50/70 p-3 font-mono text-[11px] leading-relaxed text-charcoal-800">
                  <p>μ_norm = μ + (85 − baseline_breed)</p>
                  <p>μ̃ = (μ_norm × n + 85 × 12) / (n + 12)</p>
                  <p>P = B_norm &gt; μ̃ ? 0.15 × min(B_norm − μ̃, 4) : 0</p>
                  <p>E = min(2, 0.5 × log₂(S + 1))</p>
                  <p>V = σ &gt; 4 ? min(0.5, 0.08 × (σ − 4)) : 0</p>
                  <p className="mt-1.5 font-semibold text-camel-800 border-t border-old-money-200/80 pt-1">
                    CS = round(μ̃ + P + E − V, 2)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 4. Памятка участника: регламент расчёта */}
      <SectionCard title="Памятка участника: регламент расчёта рейтингов">
        <div className="grid gap-3 sm:grid-cols-2">
          {RATING_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                {req.label}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                {req.text}
              </p>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5. Словарь сокращений и терминов */}
      <SectionCard title="Словарь терминов и обозначений рейтинга">
        <p className="text-xs text-charcoal-600">
          Выберите показатель или обозначение, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={RATING_ABBREVIATIONS}
          refTag={<RefTag>Спецификации рейтинговых алгоритмов CS v2 · Coursing Stats</RefTag>}
        />
      </SectionCard>

      {/* 6. Официальные первоисточники */}
      <SectionCard title="Официальные первоисточники и методология">
        <p className="text-xs text-charcoal-600">
          Нормативные регламенты и стандарты, на которых базируется расчёт рейтингов:
        </p>
        <OfficialSourcesList sources={RATING_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 7. Частые вопросы */}
      <SectionCard title="Частые вопросы о рейтингах">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_RATING_FAQS.map((faq) => (
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

      {/* ПЛАВАЮЩАЯ ЛИПКАЯ КНОПКА «НАВЕРХ» */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-camel-800 text-white shadow-xl border border-camel-600/50 transition-all hover:bg-camel-900 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Вернуться к началу страницы"
          title="Наверх"
        >
          <ChevronUp className="h-6 w-6" aria-hidden />
        </button>
      )}
    </div>
  )
}
