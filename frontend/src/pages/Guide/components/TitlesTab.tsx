import {
  ABBREVIATIONS,
  CH_RUSSIA_VARIANTS,
  COURSING_CERTIFICATES,
  COURSING_CACL_QUALIFICATION,
  COURSING_REQUIREMENTS,
  CUMULATIVE_TITLES,
  EVENT_TITLES,
  NATIONAL_CHAMPION_VARIANTS,
  OFFICIAL_SOURCES,
  STATUS_EVENT_RULES,
} from '../constants'
import { AbbrTag, ExternalHref, InfoCallout, RefTag, SectionCard, TitleBadge } from './GuideUi'

export default function TitlesTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Официальные источники">
        <p>
          Ниже — выжимка по <strong className="font-semibold text-charcoal-800 dark:text-charcoal-200">курсингу и бегам борзых</strong>{' '}
          из документов РКФ. При расхождении с протоколом или при оформлении диплома ориентируйтесь на полные
          тексты.
        </p>
        <ul className="space-y-3">
          {OFFICIAL_SOURCES.map((src) => (
            <li
              key={src.href}
              className={`rounded-lg border px-3 py-2.5 ${
                src.supplementary
                  ? 'border-old-money-200 bg-old-money-50/50 dark:border-charcoal-600 dark:bg-charcoal-800/40'
                  : 'border-camel-200 bg-white dark:border-camel-900/50 dark:bg-charcoal-800/60'
              }`}
            >
              <ExternalHref href={src.href}>{src.label}</ExternalHref>
              <p className="mt-1 text-xs text-old-money-600 dark:text-old-money-400">{src.note}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Иерархия: от сертификата к гранд-чемпиону">
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-old-money-300 bg-old-money-50 px-4 py-3 dark:border-charcoal-500 dark:bg-charcoal-800/80">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500">На мероприятии</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <TitleBadge title="CACL" />
              <TitleBadge title="CACIL" />
              <TitleBadge title="CACLBr" />
            </div>
            <p className="mt-2 text-xs">Титульные сертификаты в колонке «титул» протокола</p>
          </div>
          <div className="ml-4 border-l-2 border-camel-300 pl-4 dark:border-camel-700">
            <div className="rounded-lg border border-camel-200 bg-camel-50/80 px-4 py-3 dark:border-camel-800 dark:bg-camel-950/20">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-camel-700 dark:text-camel-400">
                Титулы старта
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <TitleBadge title="Чемпион России" />
                <TitleBadge title="Победитель Кубка России" />
                <TitleBadge title="Чемпион РКФ" />
              </div>
            </div>
          </div>
          <div className="ml-8 border-l-2 border-old-money-200 pl-4 dark:border-charcoal-600">
            <div className="rounded-lg border border-old-money-200 bg-white px-4 py-3 dark:border-charcoal-600 dark:bg-charcoal-800/60">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500">Кумулятивные</div>
              <p className="mt-1 text-xs">НЧ РК, ПЧ РК, ГЧР РК, ГЧРКФ РК — оформляются в РКФ по набору талонов</p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Сертификаты: бега и курсинг борзых">
        <div className="grid gap-3 sm:grid-cols-3">
          {COURSING_CERTIFICATES.map((item) => (
            <div
              key={item.code}
              className="rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 dark:border-charcoal-600 dark:bg-charcoal-800/50"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                {item.level}
              </div>
              <div className="mt-2">
                <TitleBadge title={item.code} />
              </div>
            </div>
          ))}
        </div>
        <RefTag>Положение о титулах, п. 1.4; правила курсинга, п. 4.2–4.3</RefTag>
      </SectionCard>

      <SectionCard title="Титулы, присваиваемые на мероприятии">
        <div className="grid gap-3 sm:grid-cols-2">
          {EVENT_TITLES.map((item) => (
            <div
              key={item.abbr}
              className="rounded-lg border border-old-money-200 bg-old-money-50/60 p-3 dark:border-charcoal-600 dark:bg-charcoal-800/50"
            >
              <div className="flex flex-wrap items-center gap-2">
                <AbbrTag abbr={item.abbr} title={item.title} />
                <TitleBadge title={item.title} />
              </div>
              <p className="mt-2 text-sm">{item.condition}</p>
              <RefTag>{item.ref}</RefTag>
            </div>
          ))}
        </div>
        <InfoCallout>
          На квалификационных состязаниях (п. 1.2.7 правил) титулы <strong>не присваиваются</strong>. За 1 место на
          ЧР / Кубке / ЧРКФ сертификат CACL не выдаётся — победитель получает титул ранга. CACL идёт со 2-го места при{' '}
          {COURSING_CACL_QUALIFICATION} (положение о титулах, п. 3.4.2; правила курсинга, п. 4.3.4).
        </InfoCallout>
      </SectionCard>

      <SectionCard title="Статусные мероприятия: кто что получает">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-old-money-200 dark:border-charcoal-600">
                <th className="pb-2 pr-3 font-semibold">Ранг</th>
                <th className="pb-2 pr-3 font-semibold">1 место (общий)</th>
                <th className="pb-2 pr-3 font-semibold">2 место</th>
                <th className="pb-2 font-semibold">В породе</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-old-money-100 dark:divide-charcoal-700">
              {STATUS_EVENT_RULES.map((row) => (
                <tr key={row.rank}>
                  <td className="py-2.5 pr-3 font-medium">{row.rank}</td>
                  <td className="py-2.5 pr-3">
                    <TitleBadge title={row.first} />
                  </td>
                  <td className="py-2.5 pr-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <TitleBadge title={row.secondBadge} />
                    </div>
                    <p className="mt-1">{row.secondDetail}</p>
                  </td>
                  <td className="py-2.5 text-xs">{row.breed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RefTag>Положение о титулах, п. 3.4.2–3.4.3; презентация Донино (примеры ЧР / КР)</RefTag>
      </SectionCard>

      <SectionCard title="Кумулятивные титулы">
        <div className="grid gap-3 md:grid-cols-2">
          {CUMULATIVE_TITLES.map((item) => (
            <div
              key={item.abbr}
              className="rounded-lg border border-old-money-200 p-3 dark:border-charcoal-600"
            >
              <AbbrTag abbr={item.abbr} title={item.title} />
              <p className="mt-1 font-medium text-charcoal-800 dark:text-charcoal-200">{item.title}</p>
              <p className="mt-1 text-xs">{item.summary}</p>
              <RefTag>{item.ref}</RefTag>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Варианты оформления «Национальный чемпион» (НЧ РК)">
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {NATIONAL_CHAMPION_VARIANTS.map((variant) => (
            <li key={variant}>{variant}</li>
          ))}
        </ol>
        <RefTag>Положение о титулах, п. 3.3.1.1–3.3.1.6 · с 15.12.2022</RefTag>
      </SectionCard>

      <SectionCard title="Варианты оформления «Чемпион России» по курсингу">
        <p className="text-xs text-old-money-600 dark:text-old-money-400">
          Помимо победы на ЧР — накопление CACL и других талонов (между 2-м и 7-м вариантами — не менее 1 года и 1
          дня):
        </p>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
          {CH_RUSSIA_VARIANTS.map((variant) => (
            <li key={variant}>{variant}</li>
          ))}
        </ol>
        <RefTag>Правила курсинга, п. 4.3.5.1–4.3.5.2</RefTag>
      </SectionCard>

      <SectionCard title="Особенности курсинга">
        <div className="grid gap-2 sm:grid-cols-2">
          {COURSING_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5 dark:border-charcoal-600 dark:bg-charcoal-800/40"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-old-money-500">{req.label}</div>
              <p className="mt-1">{req.text}</p>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Сокращения">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-sm">
            <tbody className="divide-y divide-old-money-100 dark:divide-charcoal-700">
              {ABBREVIATIONS.map((row) => (
                <tr key={row.abbr}>
                  <td className="py-2 pr-4 whitespace-nowrap">
                    <AbbrTag abbr={row.abbr} title={row.full} />
                  </td>
                  <td className="py-2 text-charcoal-700 dark:text-charcoal-300">{row.full}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RefTag>Положение о титулах, разд. IV; презентация Донино</RefTag>
      </SectionCard>

    </div>
  )
}
