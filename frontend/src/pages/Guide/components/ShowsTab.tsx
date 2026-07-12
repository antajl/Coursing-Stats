import {
  SHOW_ABBREVIATIONS,
  SHOW_ABBR_LOOKUP,
  SHOW_CERTIFICATES,
  SHOW_CHAMPIONSHIP_TITLES,
  SHOW_EVENT_AWARDS_PRIORITY,
  SHOW_EVENT_TITLES,
  SHOW_FEATURE_NOTES,
  SHOW_OFFICIAL_SOURCES,
  SHOW_RANKS,
} from '../showConstants'
import {
  AbbrTag,
  AbbreviationsTable,
  CertificateLevelsGrid,
  CumulativeTitlesGrid,
  EventTitlesGrid,
  FeatureNotesGrid,
  InfoCallout,
  OfficialSourcesList,
  PriorityAwardsList,
  RefTag,
  SectionCard,
  TitleHierarchySection,
} from './GuideUi'

function ShowAbbr({ abbr }: { abbr: string }) {
  return <AbbrTag abbr={abbr} title={SHOW_ABBR_LOOKUP[abbr]} />
}

export default function ShowsTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Официальные источники">
        <p>
          Ниже — выжимка по{' '}
          <strong className="font-semibold text-charcoal-800 dark:text-charcoal-200">выставкам собак (conformation)</strong>{' '}
          по документам РКФ и FCI. Это <strong>отдельная</strong> дисциплина от курсинга, бегов и БЗМП (см. вкладку
          «Соревнования»). При расхождении с протоколом ориентируйтесь на полные тексты.
        </p>
        <OfficialSourcesList sources={SHOW_OFFICIAL_SOURCES} />
      </SectionCard>

      <TitleHierarchySection
        title="Иерархия: от сертификата к интернациональному чемпиону"
        levels={[
          {
            tier: 'root',
            label: 'На выставке',
            badges: ['CAC', 'CACIB', 'JCAC'],
            note: 'Сертификаты в протоколе — шаг к оформлению чемпионских титулов в РКФ',
          },
          {
            tier: 'mid',
            label: 'Награды и титулы выставки',
            badges: ['BOB', 'BIG', 'BIS', 'ЧРКФ', 'ЧФ'],
            note: (
              <>
                <ShowAbbr abbr="BOB" /> / <ShowAbbr abbr="BIG" /> / <ShowAbbr abbr="BIS" /> — сравнение на ринге; ЧРКФ
                и ЧФ — на выставках соответствующего ранга
              </>
            ),
          },
          {
            tier: 'leaf',
            label: 'Кумулятивные',
            badges: ['Чемпион России', 'C.I.B.', 'Юный чемпион России', 'Чемпион РКФ'],
            note: 'Оформляются в РКФ по набору CAC / CACIB / JCAC и срокам между первым и последним',
          },
        ]}
        refTag={
          <RefTag>Положение о сертификатных выставках РКФ; Положение о титулах РКФ</RefTag>
        }
      />

      <SectionCard title="Раздел «Выставки» на сайте">
        <p>
          В шапке: <strong>Выставки → Рейтинг / Календарь / Чемпионы / Судьи</strong>. В карточке собаки — счётчики{' '}
          <ShowAbbr abbr="CAC" />, <ShowAbbr abbr="CACIB" />, <ShowAbbr abbr="BOB" />, <ShowAbbr abbr="BIS" />, число
          выставок и лучшее место.
        </p>
        <InfoCallout>
          Сертификаты <ShowAbbr abbr="CAC" /> и <ShowAbbr abbr="CACIB" /> — шаг к оформлению титулов в РКФ, но не
          равны титулу «Чемпион». <ShowAbbr abbr="BOB" /> и <ShowAbbr abbr="BIS" /> — награды конкретной выставки.
          Бейджи в рейтинге упорядочены по приоритету (см. ниже).
        </InfoCallout>
      </SectionCard>

      <SectionCard title="Сертификаты на выставках">
        <CertificateLevelsGrid items={SHOW_CERTIFICATES} />
        <RefTag>Положение о сертификатных выставках РКФ, п. 9.5</RefTag>
      </SectionCard>

      <SectionCard title="Награды и титулы на выставке">
        <EventTitlesGrid
          items={SHOW_EVENT_TITLES.map((item) => ({ ...item, abbrTitle: SHOW_ABBR_LOOKUP[item.abbr] }))}
        />
        <p className="text-[13px]">Полный приоритет наград одного дня (сверху — престижнее):</p>
        <PriorityAwardsList
          items={SHOW_EVENT_AWARDS_PRIORITY.map((item) => ({
            ...item,
            abbrTitle: SHOW_ABBR_LOOKUP[item.abbr.split(' / ')[0]],
          }))}
        />
        <RefTag>Положение о сертификатных выставках РКФ, п. 9.4–9.6</RefTag>
      </SectionCard>

      <SectionCard title="Ранги выставок: кто что получает">
        <p className="text-[13px]">
          От ранга зависит, какие сертификаты можно присудить. Чем выше ранг, тем больше возможностей (например,{' '}
          <ShowAbbr abbr="CACIB" /> только на CACIB FCI).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-old-money-200 dark:border-charcoal-600">
                <th className="py-2 pr-3 font-semibold">Ранг</th>
                <th className="py-2 pr-3 font-semibold">Тип</th>
                <th className="py-2 font-semibold">Сертификаты / титулы</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-old-money-100 dark:divide-charcoal-700">
              {SHOW_RANKS.map((row) => (
                <tr key={row.rank}>
                  <td className="py-2 pr-3 font-mono text-xs font-bold text-camel-700 dark:text-camel-400">
                    {row.rank}
                  </td>
                  <td className="py-2 pr-3 text-charcoal-600 dark:text-charcoal-300">{row.scope}</td>
                  <td className="py-2 text-charcoal-600 dark:text-charcoal-300">{row.certs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RefTag>Положение о сертификатных выставках РКФ, п. 1.2</RefTag>
      </SectionCard>

      <SectionCard title="Кумулятивные титулы">
        <p className="text-xs text-old-money-600 dark:text-old-money-400">
          Оформляются в РКФ по набору сертификатов — не путать с наградами одного дня.
        </p>
        <CumulativeTitlesGrid
          items={SHOW_CHAMPIONSHIP_TITLES.map((item) => ({ ...item, abbrTitle: SHOW_ABBR_LOOKUP[item.abbr] }))}
        />
        <InfoCallout>
          На крупных выставках («Россия», «Евразия», «Кубок РКФ» и др.) один <ShowAbbr abbr="CAC" /> может
          засчитываться как два; часть <ShowAbbr abbr="R.CAC" /> — как один <ShowAbbr abbr="CAC" />.
        </InfoCallout>
      </SectionCard>

      <SectionCard title="Особенности выставок">
        <FeatureNotesGrid items={SHOW_FEATURE_NOTES} />
      </SectionCard>

      <SectionCard title="Сокращения">
        <AbbreviationsTable
          rows={SHOW_ABBREVIATIONS}
          abbrLookup={SHOW_ABBR_LOOKUP}
          refTag={<RefTag>Положение о сертификатных выставках РКФ; Положение о титулах РКФ</RefTag>}
        />
      </SectionCard>
    </div>
  )
}
