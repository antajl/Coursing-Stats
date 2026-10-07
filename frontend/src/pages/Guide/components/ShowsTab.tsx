import {
  SHOW_ABBREVIATIONS,
  SHOW_OFFICIAL_SOURCES,
  SHOW_REQUIREMENTS,
  SHOW_TITLE_LADDER,
} from '../showConstants'
import { GUIDE_SHOWS_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function ShowsTab() {
  return (
    <div className="space-y-6">
      {/* 1. Наглядная лестница титулов: ценность и как получить */}
      <SectionCard title="Лестница титулов: ценность и как получить">
        <p className="text-xs text-charcoal-600">
          Сравнение всех выставочных титулов от абсолютной вершины до базовых сертификатов ринга (клик по строке раскроет детали регламента):
        </p>

        <TitleLadderList items={SHOW_TITLE_LADDER} />
      </SectionCard>

      {/* 2. Ключевые правила выставок (Памятка участника) */}
      <SectionCard title="Памятка участника: регламент и ранги выставок">
        <div className="grid gap-3 sm:grid-cols-2">
          {SHOW_REQUIREMENTS.map((req) => (
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

      {/* 3. Словарь сокращений */}
      <SectionCard title="Словарь сокращений в протоколах">
        <p className="text-xs text-charcoal-600">
          Выберите официальное сокращение титула или сертификата, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={SHOW_ABBREVIATIONS}
          refTag={
            <RefTag>
              Положение о сертификатных выставках РКФ · Список титулов и принятые сокращения в родословных РКФ
            </RefTag>
          }
        />
      </SectionCard>

      {/* 4. Официальные первоисточники и регламенты */}
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600">
          Нормативные документы РКФ и FCI, регламентирующие выставочные правила и присвоение титулов:
        </p>
        <OfficialSourcesList sources={SHOW_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 5. Частые вопросы */}
      <SectionCard title="Частые вопросы о выставках">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_SHOWS_FAQS.map((faq) => (
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
