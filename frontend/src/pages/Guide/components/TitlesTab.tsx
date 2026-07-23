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
import {
  AbbrTag,
  AbbreviationsTable,
  CertificateLevelsGrid,
  CumulativeTitlesGrid,
  EventTitlesGrid,
  FeatureNotesGrid,
  InfoCallout,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleBadge,
  TitleHierarchySection,
} from './GuideUi'

export default function TitlesTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Официальные источники">
        <p>
          Ниже — выжимка по{' '}
          <strong className="font-semibold text-charcoal-800 dark:text-charcoal-200">курсингу и бегам борзых</strong>{' '}
          из документов РКФ. Это <strong>отдельная</strong> дисциплина от выставок (см. вкладку «Выставки»). При
          расхождении с протоколом или при оформлении диплома ориентируйтесь на полные тексты.
        </p>
        <OfficialSourcesList sources={OFFICIAL_SOURCES} />
      </SectionCard>

      <TitleHierarchySection
        title="Иерархия наград: крутые → сертификаты → титулы дня → собирательные"
        levels={[
          {
            tier: 'prestige',
            label: 'Крутые (титулы старта)',
            badges: ['ЧР РК', 'ПКР РК', 'ЧРКФ РК', 'ПЧРКФ РК'],
            note: 'Присваиваются на статусном мероприятии за 1 место (не путать с выставочным ЧРКФ)',
          },
          {
            tier: 'certificate',
            label: 'Сертификаты',
            badges: ['CACIL', 'CACL', 'CACLBr'],
            note: 'Титульные сертификаты в колонке «титул» протокола',
          },
          {
            tier: 'diploma',
            label: 'Титулы дня',
            note: 'Прочие дипломы старта из протокола (если указаны отдельно от сертификатов и статусных титулов)',
          },
          {
            tier: 'cumulative',
            label: 'Собирательные',
            badges: ['НЧ РК', 'ПЧ РК', 'ГЧР РК', 'ГЧРКФ РК'],
            note: 'Оформляются в РКФ по набору талонов и сертификатов',
          },
        ]}
      />

      <SectionCard title="Раздел «Соревнования» на сайте">
        <p>
          В шапке: <strong>Соревнования → Рейтинг / Судьи</strong>
          (локально ещё <strong>Календарь</strong>). В карточке собаки — медали (1–3 место), очки, титулы
          из протокола (<AbbrTag abbr="CACL" />, <AbbrTag abbr="CACLBr" />, <AbbrTag abbr="ЧР РК" /> и др.), число
          стартов и лучший результат. Чипы титулов в профиле и в истории старта идут <strong>от более крутых к менее</strong>
          (ранг мероприятия → сертификаты); породный <AbbrTag abbr="CACLBr" /> считается отдельно от национального{' '}
          <AbbrTag abbr="CACL" />.
        </p>
        <InfoCallout>
          На сайте <strong>два независимых рейтинга</strong>: по местам (медали) и по очкам — они не смешиваются. Подробнее
          — во вкладке «Рейтинг» этого справочника.
        </InfoCallout>
      </SectionCard>

      <SectionCard title="Сертификаты: бега и курсинг борзых">
        <CertificateLevelsGrid items={COURSING_CERTIFICATES} />
        <RefTag>Положение о титулах, п. 1.4; правила курсинга, п. 4.2–4.3</RefTag>
      </SectionCard>

      <SectionCard title="Титулы, присваиваемые на мероприятии">
        <EventTitlesGrid items={EVENT_TITLES} />
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
        <p className="text-xs text-old-money-600 dark:text-old-money-400">
          Оформляются в РКФ по набору талонов — не путать с титулами одного дня.
        </p>
        <CumulativeTitlesGrid items={CUMULATIVE_TITLES} />
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
        <FeatureNotesGrid items={COURSING_REQUIREMENTS} />
      </SectionCard>

      <SectionCard title="Сокращения">
        <AbbreviationsTable
          rows={ABBREVIATIONS}
          refTag={<RefTag>Положение о титулах, разд. IV; презентация Донино</RefTag>}
        />
      </SectionCard>
    </div>
  )
}
