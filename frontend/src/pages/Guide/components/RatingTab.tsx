import {
  RATING_ABBREVIATIONS,
  RATING_LADDER,
  RATING_OFFICIAL_SOURCES,
  RATING_REQUIREMENTS,
} from '../ratingConstants'
import { GUIDE_RATING_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function RatingTab() {
  return (
    <div className="space-y-6">
      {/* 1. Лестница рейтинговых шкал и показателей сайта */}
      <SectionCard title="Шкалы и показатели рейтинговой системы">
        <p className="text-xs text-charcoal-600">
          Сравнение всех рейтинговых шкал и индексов сайта — от главного медального зачёта сезона до физических замеров скорости (клик по строке раскроет детали регламента):
        </p>

        <TitleLadderList items={RATING_LADDER} />
      </SectionCard>

      {/* 2. Ключевые регламенты расчёта (Памятка участника) */}
      <SectionCard title="Памятка участника: как рассчитывается рейтинг">
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

        {/* Математические формулы индексов */}
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-camel-200 bg-camel-50/60 p-4">
            <div className="font-serif text-sm font-bold text-charcoal-900">
              Формула плотности медалей (standingScore):
            </div>
            <div className="mt-2 rounded-lg border border-camel-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-camel-900 shadow-2xs">
              Плотность наград = (3.0 × Золото + 1.0 × Серебро + 0.5 × Бронза) / (Число забегов + 4)
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              Золотые медали имеют наибольший вес. Знаменатель <code>(+ 4)</code> защищает от случайного взлёта после одного успешного забега и стимулирует стабильное участие.
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
              Индекс стабильности CS v2
            </div>
            <div className="mt-1.5 rounded-md border border-old-money-200 bg-old-money-50/60 p-2 font-mono text-[11px] leading-relaxed text-charcoal-800">
              <p>μ_norm = μ + (85 − baseline_breed)</p>
              <p>μ̃ = (μ_norm × n + 85 × 12) / (n + 12)</p>
              <p>P = B_norm &gt; μ̃ ? 0,15 × min(B_norm − μ̃, 4) : 0</p>
              <p>E = min(2, 0,5 × log₂(S + 1))</p>
              <p>V = σ &gt; 4 ? min(0,5, 0,08 × (σ − 4)) : 0</p>
              <p className="mt-1 font-semibold text-camel-800">CS = round(μ̃ + P + E − V, 2)</p>
            </div>
            <p className="mt-2 text-[11px] text-old-money-600">
              μ_norm — внутрипородный базис, μ̃ — байес, P — пик (+0.6), E — опыт (+2.0), V — поправка на стабильность (-0.5).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 3. Словарь сокращений и терминов */}
      <SectionCard title="Словарь терминов и обозначений рейтинга">
        <p className="text-xs text-charcoal-600">
          Выберите показатель или термин формулы, чтобы увидеть его подробное описание:
        </p>
        <AbbreviationsDropdown
          rows={RATING_ABBREVIATIONS}
          refTag={<RefTag>Спецификации рейтинговых алгоритмов CS v2 · Coursing Stats</RefTag>}
        />
      </SectionCard>

      {/* 4. Официальные первоисточники и регламенты */}
      <SectionCard title="Официальные первоисточники и методология">
        <p className="text-xs text-charcoal-600">
          Нормативные регламенты и математические стандарты, на которых базируется расчёт рейтингов:
        </p>
        <OfficialSourcesList sources={RATING_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 5. Частые вопросы */}
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
    </div>
  )
}
