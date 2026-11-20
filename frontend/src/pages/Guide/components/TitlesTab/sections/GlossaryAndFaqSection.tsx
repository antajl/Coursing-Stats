import { ABBREVIATIONS, OFFICIAL_SOURCES } from '../../../constants'
import { GUIDE_SPORT_TITLES_FAQS } from '../../../guideFaqs'
import { SectionCard, AbbreviationsDropdown, OfficialSourcesList, RefTag } from '../../GuideUi'

export function AbbreviationsSection() {
  return (
    <div id="sec-abbr">
      <SectionCard title="Словарь сокращений и терминов соревнований">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Быстрый поиск по всем спортивным сертификатам, титулам и статусам протоколов:
        </p>
        <AbbreviationsDropdown
          rows={ABBREVIATIONS}
          refTag={<RefTag>Положение РКФ о титулах · Правила состязаний борзых</RefTag>}
        />
      </SectionCard>
    </div>
  )
}

export function OfficialSourcesSection() {
  return (
    <div id="sec-sources">
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Нормативные документы РКФ и FCI, регламентирующие проведение состязаний и правила присвоения титулов:
        </p>
        <OfficialSourcesList sources={OFFICIAL_SOURCES} />
      </SectionCard>
    </div>
  )
}

export function FaqSection() {
  return (
    <div id="sec-faqs">
      <SectionCard title="Частые вопросы о соревнованиях">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_SPORT_TITLES_FAQS.map((faq) => (
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
