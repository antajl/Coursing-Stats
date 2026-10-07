import {
  DONINO_ABBREVIATIONS,
  DONINO_OFFICIAL_SOURCES,
  DONINO_REQUIREMENTS,
  DONINO_SPEED_LADDER,
} from '../doninoConstants'
import { GUIDE_DONINO_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function DoninoTab() {
  return (
    <div className="space-y-6">
      {/* 1. Иерархия соревновательных лиг чемпионата */}
      <SectionCard title="Иерархия соревновательных лиг в Донино">
        <p className="text-xs text-charcoal-600">
          Официальная система лиг клубного чемпионата по рейсингу в Донино (клик по строке раскроет правила допуска и переходов между лигами):
        </p>

        <TitleLadderList items={DONINO_SPEED_LADDER} />
      </SectionCard>

      {/* 2. Ключевые правила и регламент замеров (Памятка участника) */}
      <SectionCard title="Памятка участника: регламент и замеры в Донино">
        <div className="grid gap-3 sm:grid-cols-2">
          {DONINO_REQUIREMENTS.map((req) => (
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

      {/* 3. Словарь понятий и сокращений */}
      <SectionCard title="Словарь понятий и обозначений полигона">
        <p className="text-xs text-charcoal-600">
          Выберите обозначение или термин полигона Донино, чтобы увидеть его подробное описание:
        </p>
        <AbbreviationsDropdown
          rows={DONINO_ABBREVIATIONS}
          refTag={
            <RefTag>
              Регламент бегового комплекса «Курсинг в Донино» · runningdog.ru
            </RefTag>
          }
        />
      </SectionCard>

      {/* 4. Официальные первоисточники и регламенты */}
      <SectionCard title="Официальные первоисточники и материалы">
        <p className="text-xs text-charcoal-600">
          Портал бегового клуба и методические материалы полигона:
        </p>
        <OfficialSourcesList sources={DONINO_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 5. Частые вопросы */}
      <SectionCard title="Частые вопросы о Донино">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_DONINO_FAQS.map((faq) => (
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
