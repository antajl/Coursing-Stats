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
import { GUIDE_SHOWS_FAQS } from '../guideFaqs'
import {
  AbbrTag,
  AbbreviationsTable,
  CertificateLevelsGrid,
  CumulativeTitlesGrid,
  EventTitlesGrid,
  FeatureNotesGrid,
  ExternalHref,
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
        title="Иерархия наград: крутые → сертификаты → титулы дня → собирательные"
        levels={[
          {
            tier: 'prestige',
            label: 'Крутые (ринг)',
            badges: ['BIS', 'BIG', 'BIS-Ю', 'ЛПП', 'ЛППП', 'ЛЮ', 'ЛВ'],
            note: (
              <>
                Главный ринг: <ShowAbbr abbr="BIS" /> / <ShowAbbr abbr="BIG" /> / <ShowAbbr abbr="BIS-Ю" />…
                ; порода: <ShowAbbr abbr="ЛПП" /> / <ShowAbbr abbr="ЛППП" /> и ЛБ/ЛЩ/ЛЮ/ЛВ. BIS-Ю ≠ ЛЮ и ≠ ЮЧР
                (для ЮЧР нужен JCAC).
              </>
            ),
          },
          {
            tier: 'certificate',
            label: 'Сертификаты',
            badges: ['CACIB', 'CAC', 'JCAC', 'VCAC', 'CW'],
            note: 'Шаг к оформлению чемпионских титулов в РКФ; резервы R.CACIB / R.CAC… — тоже сертификаты',
          },
          {
            tier: 'diploma',
            label: 'Титулы дня',
            badges: ['ЧРКФ', 'КЧК', 'КЧП', 'П «России»'],
            note: 'Дипломы и победители конкретной выставки (зависят от ранга); не путать с оформлением «Чемпион РКФ»',
          },
          {
            tier: 'cumulative',
            label: 'Собирательные',
            badges: ['C.I.B.', 'Чемпион России', 'Юный чемпион России', 'Чемпион РКФ'],
            note: 'Оформляются в РКФ по набору CAC / CACIB / JCAC и срокам между первым и последним',
          },
        ]}
        refTag={
          <RefTag>Положение о сертификатных выставках РКФ; Положение о титулах РКФ</RefTag>
        }
      />

      <SectionCard title="Раздел «Выставки» на сайте">
        <p>
          В шапке: <strong>Выставки → Рейтинг / Судьи</strong>
          (локально ещё <strong>Календарь</strong> и страницы протоколов). В карточке собаки — счётчики наград
          по категориям, число выставок и место в рейтинге. По умолчанию включён фильтр{' '}
          <strong>текущего сезона</strong> (кнопка «Сезон YYYY»); снять её — рейтинг по всем загруженным годам.
          При поиске по кличке сезон не режет выдачу.
        </p>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          На главной в колонке «Выставки» справа — не один ярлык вроде «BOB», а краткая причина места (например{' '}
          <strong className="font-semibold text-charcoal-800 dark:text-charcoal-200">BOB ×18 · VCAC ×27</strong>
          ): самые весомые награды сезона со счётчиками.
        </p>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          Локально на странице выставки: шапка (дата / счётчики / место + строка клуб · ранг · тип), блок{' '}
          <strong>Главный ринг</strong> (вкладки BIS / возраст / BIG), каталог по породам. Клик по кличке открывает
          профиль собаки. Оценки и «Неявка» нормализуются из PDF (в т.ч. переносы вроде «ЩЕ ОП Н», «Нея вка»).
          Награды в таблице — чипы; при переполнении — прокрутка при наведении.
        </p>
        <p>
          В истории выставок в профиле ссылки ведут на{' '}
          <ExternalHref href="https://rkf.online/">rkf.online</ExternalHref>
          {' '}и PDF-отчёт при наличии; на проде нет внутренних страниц протоколов выставок.
        </p>
        <InfoCallout>
          Сертификаты <ShowAbbr abbr="CAC" /> и <ShowAbbr abbr="CACIB" /> — шаг к оформлению титулов в РКФ, но не
          равны титулу «Чемпион». <ShowAbbr abbr="BOB" /> и <ShowAbbr abbr="BIS" /> — награды конкретной выставки.
          На сайте рейтинг считает все распознанные токены протокола (CW, JCAC, ЧРКФ, КЧП, П «России»…) с весами из{' '}
          <code className="text-[11px]">show-award-ranking.ts</code>; кумулятивные титулы (C.I.B., Чемпион России)
          оформляются в РКФ отдельно и в счётчиках одного дня не смешиваются. Бейджи главного ринга (
          <ShowAbbr abbr="BIS" />, <ShowAbbr abbr="BIG" />, <ShowAbbr abbr="BIS-Ю" />…) попадают в рейтинг/профиль
          только если распарсена ведомость type3 (сейчас 2025–2026; покрытие ещё не полное).
        </InfoCallout>
        <InfoCallout>
          Породы в карточках — в обычном регистре (не капс РКФ). Для привычных коротких имён показываем чип
          («Левретка», «Малинуа», «Кане-корсо», «Гальго»); полное официальное название — в подсказке при наведении.
          Разные типы шерсти и размеры не склеиваем; если в протоколе тип не указан (голая «выжла» / «немецкая
          овчарка»), помечаем «тип не указан», а не относим к К-Ш.
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

      <SectionCard title="Частые вопросы">
        <dl className="space-y-4">
          {GUIDE_SHOWS_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-charcoal-900 dark:text-charcoal-100">{faq.question}</dt>
              <dd className="mt-1 text-[13px] text-charcoal-600 dark:text-charcoal-300">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  )
}
