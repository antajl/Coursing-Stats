import { FileText, Layers, ShieldCheck } from 'lucide-react'
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

      {/* 3. Архитектура протокола на сайте */}
      <SectionCard title="Анатомия протокола на сайте Coursing Stats">
        <p className="text-xs text-charcoal-600">
          Интерфейс результатов состязаний на сайте оптимизирован для максимальной плотности данных, строгого единообразия колонок и быстрой сверки с каталогом:
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800">
                <Layers className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900">
                Монолитная таблица
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              Все породы и заезды выводятся в единой фиксированной сетке колонок без разрывов шапки. Порядок групп соответствует официальному каталогу состязания, а совместные забеги кобелей и сук объединяются в группу «Микс».
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900">
                Квалификация и попоны
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              Цвет попоны отображается компактным бейджем с номером заезда прямо внутри. Знак высшей квалификации <code className="rounded bg-camel-100 px-1 py-0.5 text-camel-900 font-semibold text-[11px]">[СС]</code> выводится инлайн рядом с итоговым баллом, исключая раздувание строк по высоте.
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-800">
                <FileText className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900">
                Векторные протоколы
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              В верхней панели состязания доступны прямые ссылки на автономный эталонный векторный протокол (HTML/PDF), а также оригинальные каталоги, регламенты и сканы дипломов на Google Диске.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 4. Словарь сокращений и терминов */}
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
