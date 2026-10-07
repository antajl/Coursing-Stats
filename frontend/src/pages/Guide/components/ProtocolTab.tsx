import {
  PROTOCOL_ABBREVIATIONS,
  PROTOCOL_LADDER,
  PROTOCOL_OFFICIAL_SOURCES,
  PROTOCOL_REQUIREMENTS,
} from '../protocolConstants'
import { GUIDE_PROTOCOL_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function ProtocolTab() {
  return (
    <div className="space-y-6">
      {/* 1. Наглядная лестница судейских оценок, квалификаций и нормативов */}
      <SectionCard title="Шкала оценок и нормативов в протоколе">
        <p className="text-xs text-charcoal-600">
          Сравнение судейских оценок, квалификационных нормативов и условий получения отметки «ВС» (клик по строке раскроет детали регламента):
        </p>

        <TitleLadderList items={PROTOCOL_LADDER} />
      </SectionCard>

      {/* 2. Ключевые правила состязаний (Памятка участника) */}
      <SectionCard title="Памятка участника: правила чтения протоколов">
        <div className="grid gap-3 sm:grid-cols-2">
          {PROTOCOL_REQUIREMENTS.map((req) => (
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

      {/* 3. Словарь сокращений и терминов */}
      <SectionCard title="Словарь сокращений и обозначений в протоколах">
        <p className="text-xs text-charcoal-600">
          Выберите обозначение оценки, статуса или судейского критерия, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={PROTOCOL_ABBREVIATIONS}
          refTag={<RefTag>Правила проведения состязаний борзых РКФ (курсинг и бега) · разд. IV, VI, VII</RefTag>}
        />
      </SectionCard>

      {/* 4. Официальные первоисточники и регламенты */}
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600">
          Нормативные документы РКФ и FCI, определяющие правила судейства и оформления протоколов:
        </p>
        <OfficialSourcesList sources={PROTOCOL_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 5. Частые вопросы */}
      <SectionCard title="Частые вопросы о чтении протоколов">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_PROTOCOL_FAQS.map((faq) => (
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
