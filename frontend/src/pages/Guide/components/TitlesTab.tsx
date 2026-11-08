import { Award, CheckCircle2, ChevronRight, Compass, Flag, Gauge, Shield, Trophy } from 'lucide-react'
import {
  ABBREVIATIONS,
  COURSING_REQUIREMENTS,
  NATIONAL_CHAMPION_VARIANTS,
  OFFICIAL_SOURCES,
  SPORT_DISCIPLINES,
  TITLE_RANK_LADDER,
} from '../constants'
import { GUIDE_SPORT_TITLES_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function TitlesTab() {
  return (
    <div className="space-y-6">
      {/* 1. Спортивная траектория борзой */}
      <SectionCard title="Спортивная траектория: от первой тренировки до Чемпиона России">
        <p className="text-xs text-charcoal-600">
          Понятный пошаговый путь собаки в спорте — как начать и к чему стремиться:
        </p>

        <div className="grid gap-2 sm:grid-cols-5 pt-1">
          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Ступень 1
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">Беговой допуск</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Квалификационная книжка РКФ: успешный одиночный и парный забег без агрессии.
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Ступень 2
            </div>
            <div className="mt-1 text-sm font-bold text-camel-900">Сертификат CACL</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Победа на состязаниях в породе при кворуме от 3 собак и норме ВС (≥ 66,7% баллов).
            </p>
          </div>

          <div className="rounded-xl border border-camel-200 bg-camel-50/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-800">
              Ступень 3
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">Нац. чемпион (НЧ РК)</div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Пожизненный титул стабильности по одной из 6 официальных схем набора сертификатов.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Ступень 4
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">Чемпион России (ЧР РК)</div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Исключительно 1-е место на главном всероссийском Чемпионате России года (≥ 75% баллов).
            </p>
          </div>

          <div className="rounded-xl border border-camel-300 bg-linear-to-b from-camel-100/70 to-cream-50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-900">
              Ступень 5
            </div>
            <div className="mt-1 text-sm font-bold text-camel-950">Вершина FCI (C.I.C.)</div>
            <p className="mt-1 text-[11px] text-camel-900 leading-snug">
              Международный чемпион по бегам и курсингу (2 × CACIL за рубежом в двух разных странах).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 2. Две спортивные дисциплины */}
      <SectionCard title="Две спортивные дисциплины: курсинг и бега борзых">
        <p className="text-xs text-charcoal-600">
          Официальный спорт борзых в системе РКФ и FCI делится на две принципиально разные дисциплины с раздельным судейством и правилами:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          {SPORT_DISCIPLINES.map((disc) => (
            <div
              key={disc.id}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2 border-b border-old-money-100 pb-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800">
                    {disc.id === 'coursing' ? (
                      <Flag className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Gauge className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </span>
                  <span className="text-xs font-bold text-charcoal-900">{disc.title}</span>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-camel-800">{disc.subtitle}</div>

                <ul className="mt-2.5 space-y-2 text-xs text-charcoal-700">
                  <li className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-900 shrink-0">Трасса:</span>
                    <span>{disc.track}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-900 shrink-0">Судейство:</span>
                    <span>{disc.judging}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-3 rounded-lg border border-camel-200/80 bg-camel-50/50 p-2.5 text-[11px] text-camel-950 font-medium">
                {disc.keyFact}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3. Наглядная лестница титулов: ценность и как получить */}
      <SectionCard title="Лестница титулов: ценность и как получить">
        <p className="text-xs text-charcoal-600">
          Иерархия спортивных наград от мировой вершины FCI до базовых полевых сертификатов (клик по строке раскроет подробные условия регламента):
        </p>

        <TitleLadderList items={TITLE_RANK_LADDER} />
      </SectionCard>

      {/* 4. Калькулятор/Схемы Национального чемпиона (НЧ РК) */}
      <SectionCard title="6 официальных схем оформления титула «Национальный чемпион по РК» (НЧ РК)">
        <p className="text-xs text-charcoal-600">
          С 15.12.2022 титул Чемпиона России набором сертификатов больше не оформляется — вместо него присваивается накопительный титул <strong>НЧ РК</strong> по одной из 6 схем на выбор:
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
          {NATIONAL_CHAMPION_VARIANTS.map((v, idx) => (
            <div
              key={v.combo}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
                  Схема {idx + 1}
                </span>
                <span className="rounded bg-old-money-100 px-2 py-0.5 text-[10px] font-semibold text-charcoal-700">
                  {v.judges}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs font-bold text-camel-900">{v.combo}</div>
              <p className="mt-1 text-[11px] text-charcoal-600">{v.notes}</p>
            </div>
          ))}
        </div>
        <RefTag>Положение РКФ о порядке присвоения титулов по состязаниям, п. 3.3.1</RefTag>
      </SectionCard>

      {/* 5. Ключевые правила состязаний (Памятка участника) */}
      <SectionCard title="Памятка участника: кворум и условия сертификатов">
        <div className="grid gap-3 sm:grid-cols-2">
          {COURSING_REQUIREMENTS.map((req) => (
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

      {/* 6. Словарь сокращений */}
      <SectionCard title="Словарь сокращений в протоколах соревнований">
        <p className="text-xs text-charcoal-600">
          Выберите официальное сокращение титула или сертификата, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={ABBREVIATIONS}
          refTag={<RefTag>Положение РКФ о титулах, разд. IV · abbreviation.pdf</RefTag>}
        />
      </SectionCard>

      {/* 7. Официальные первоисточники и регламенты */}
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600">
          Нормативные документы РКФ и FCI, регламентирующие проведение состязаний и правила присвоения титулов:
        </p>
        <OfficialSourcesList sources={OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 8. Частые вопросы */}
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
