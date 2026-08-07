import { useState } from 'react'
import ToolbarSegmentControl from '../../../components/toolbar/ToolbarSegmentControl'
import {
  COURSING_CACL_QUALIFICATION,
  COURSING_CERTIFICATES,
  COURSING_REQUIREMENTS,
  CRITERIA,
} from '../constants'
import { AbbrTag, InfoCallout, RefTag, SectionCard } from './GuideUi'

const PROTOCOL_SEGMENTS = [
  { id: 'coursing', label: 'Курсинг' },
  { id: 'racing', label: 'Бега' },
] as const

function StatGrid({ items }: { items: { label: string; sub: string }[] }) {
  return (
    <div className={`grid gap-2 ${items.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-old-money-200 bg-old-money-50/80 px-3 py-3 text-center dark:border-charcoal-600 dark:bg-charcoal-800/60"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-camel-700 dark:text-camel-400">
            {item.label}
          </div>
          <div className="mt-1 text-[11px] text-old-money-500">{item.sub}</div>
        </div>
      ))}
    </div>
  )
}

function ScoringStatGrid({
  items,
}: {
  items: { n: string; label: string; sub: string }[]
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-old-money-200 bg-old-money-50/80 px-3 py-3 text-center dark:border-charcoal-600 dark:bg-charcoal-800/60"
        >
          <div className="font-serif text-2xl font-bold text-camel-700 dark:text-camel-400">{stat.n}</div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-old-money-600">{stat.label}</div>
          <div className="text-[11px] text-old-money-500">{stat.sub}</div>
        </div>
      ))}
    </div>
  )
}

export default function ProtocolTab() {
  const [segment, setSegment] = useState<string>('coursing')

  return (
    <div className="space-y-4">
      <SectionCard title="Квалификация (ВС)">
        <div className="flex flex-wrap items-start gap-3">
          <span className="inline-block rounded border border-camel-200 bg-camel-100 px-2 py-1 text-sm font-semibold text-camel-800 dark:border-camel-700 dark:bg-camel-900/50 dark:text-camel-300">
            ВС
          </span>
          <div className="min-w-0 flex-1">
            <p>
              <strong className="font-semibold text-charcoal-800 dark:text-charcoal-200">Высшая квалификация</strong> —
              в HTML-протоколе procoursing.ru отмечается «CC» или «+» (зависит от формата таблицы), если собака выполнила
              квалификационные нормы, необходимые для присвоения титула или сертификата на этом старте.
            </p>
            <p className="mt-2 text-xs text-old-money-600 dark:text-old-money-400">
              В таблице колонка называется CC или ВС; на сайте — бейдж ВС у итогового балла. См. «Структура таблицы» в
              сегменте дисциплины.
            </p>
          </div>
        </div>
        <RefTag>Правила курсинга, п. 4.3.4</RefTag>
      </SectionCard>

      <ToolbarSegmentControl
        segments={[...PROTOCOL_SEGMENTS]}
        value={segment}
        onChange={setSegment}
        ariaLabel="Дисциплина протокола"
      />

      {segment === 'coursing' && (
        <>
          <SectionCard title="Структура таблицы">
            <p>
              Таблица на procoursing.ru: для каждой собаки — <strong>два забега</strong> с номером забега (цвет формы) и
              оценками судей по критериям; затем суммы, колонка CC (ВС) и титул.
            </p>
            <StatGrid
              items={[
                { label: 'Забег × 2', sub: 'номер забега, оценки М Р В П Э' },
                { label: 'Суммы', sub: 'по забегу, по судье, общая' },
                { label: 'CC / Титул', sub: 'квалификация и сертификат' },
              ]}
            />
            <p className="text-xs text-old-money-600 dark:text-old-money-400">
              На сайте в карточке результата — таблица забегов с оценками судей; итог в шапке = общая сумма протокола
              (<strong>Σ</strong>), без деления на число судей.
            </p>
            <RefTag>Правила курсинга, разд. VII; парсер — 25 колонок</RefTag>
          </SectionCard>

          <SectionCard title="Оценка результата">
            <ScoringStatGrid
              items={[
                { n: '5', label: 'критериев', sub: 'М Р В П Э' },
                { n: '20', label: 'макс. за критерий', sub: 'у каждого судьи' },
                { n: '2', label: 'забега', sub: 'сумма складывается' },
                { n: '⅔', label: 'норма для титула', sub: 'от макс. суммы' },
              ]}
            />
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Менее 50% баллов в 1-м забеге — нет допуска ко 2-му кругу (п. 7.4.1.3)</li>
              <li>
                При равенстве итога — выше место у большего балла во 2-м забеге; затем по критериям: маневренность →
                скорость → выносливость → преследование (п. 7.4.1.5–7.4.1.6)
              </li>
            </ul>
            <div className="space-y-3 pt-1">
              {CRITERIA.map((c) => (
                <div
                  key={c.key}
                  className="flex gap-3 rounded-lg border border-old-money-200 bg-white px-3 py-2.5 dark:border-charcoal-600 dark:bg-charcoal-800/40"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-camel-100 font-serif text-lg font-bold text-camel-800 dark:bg-camel-900/40 dark:text-camel-300">
                    {c.key}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-charcoal-800 dark:text-charcoal-200">{c.name}</div>
                    <p className="mt-0.5 text-xs leading-relaxed">{c.summary}</p>
                    <RefTag>{c.ref}</RefTag>
                  </div>
                </div>
              ))}
            </div>
            <RefTag>Правила курсинга, п. 7.4.1–7.4.6</RefTag>
          </SectionCard>

          <SectionCard title="Квалификация и титулы">
            <p className="text-xs text-old-money-600 dark:text-old-money-400">
              Ключевая норма для титула: {COURSING_CACL_QUALIFICATION} (п. 4.3.4). Без выполнения норм титул или{' '}
              <AbbrTag abbr="CACL" /> не присваивается, даже при высоком месте.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {COURSING_CERTIFICATES.map((item) => (
                <div
                  key={item.code}
                  className="rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 dark:border-charcoal-600 dark:bg-charcoal-800/50"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                    {item.level}
                  </div>
                  <div className="mt-1">
                    <AbbrTag abbr={item.code} />
                  </div>
                </div>
              ))}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {COURSING_REQUIREMENTS.filter((r) => r.label !== 'Второй круг').map((r) => (
                <li key={r.label}>
                  <strong>{r.label}:</strong> {r.text}
                </li>
              ))}
            </ul>
            <RefTag>Правила курсинга, п. 4.1.5, 4.3.2.1–4.3.4</RefTag>
          </SectionCard>
        </>
      )}

      {segment === 'racing' && (
        <>
          <SectionCard title="Структура таблицы">
            <p>
              Отдельная таблица на procoursing.ru: для каждой собаки — до <strong>трёх забегов</strong> с номером забега,
              попоной, временем и скоростью; затем колонка ВС и титул.
            </p>
            <StatGrid
              items={[
                { label: 'Забег × 3', sub: 'номер, попона, время, скорость' },
                { label: 'Дистанция', sub: 'в метрах (колонка протокола)' },
                { label: 'ВС / Титул', sub: 'квалификация и сертификат' },
              ]}
            />
            <p className="text-xs text-old-money-600 dark:text-old-money-400">
              Формат колонок: 18 ячеек (CC — время и скорость в одной ячейке; отметка «CC») или 21 ячейка (ВС — время и
              скорость раздельно; отметка «+»). См. блок «Квалификация (ВС)» выше.
            </p>
            <p className="text-xs text-old-money-600 dark:text-old-money-400">
              На сайте в карточке результата — таблица забегов (время, скорость км/ч, попона); итоговое «лучшее время» из
              протокола.
            </p>
            <RefTag>Правила курсинга, разд. VI; парсер — 18 или 21 колонка</RefTag>
          </SectionCard>

          <SectionCard title="Оценка результата">
            <p className="text-xs text-old-money-600 dark:text-old-money-400">
              Критериев <strong>М / Р / В / П / Э</strong> нет — место определяется по времени на финише (разд. VI).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  key: 'Время',
                  name: 'Время на дистанции',
                  summary: 'Фиксируется для каждого забега; для итога учитывается лучшее время собаки в протоколе',
                  ref: 'Правила курсинга, разд. VI',
                },
                {
                  key: 'Скорость',
                  name: 'Скорость',
                  summary: 'В ячейке протокола — м/с и км/ч; на сайте отображается в км/ч',
                },
              ].map((metric) => (
                <div
                  key={metric.key}
                  className="flex gap-3 rounded-lg border border-old-money-200 bg-white px-3 py-2.5 dark:border-charcoal-600 dark:bg-charcoal-800/40"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-camel-100 font-serif text-sm font-bold text-camel-800 dark:bg-camel-900/40 dark:text-camel-300">
                    {metric.key}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-charcoal-800 dark:text-charcoal-200">{metric.name}</div>
                    <p className="mt-0.5 text-xs leading-relaxed">{metric.summary}</p>
                    {'ref' in metric && metric.ref ? <RefTag>{metric.ref}</RefTag> : null}
                  </div>
                </div>
              ))}
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Состязания состоят из предварительных и финальных забегов; для финалиста — минимум два забега (п. 6.1.1.4)
              </li>
            </ul>
            <RefTag>Правила курсинга, разд. VI; п. 6.1.1.4</RefTag>
          </SectionCard>

          <SectionCard title="Квалификация и титулы">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>
                Временный сертификат выдаётся собаке, успешно прошедшей все забеги; результат вносится в квалификационную
                книжку (п. 5.1.1.1)
              </li>
              <li>
                <AbbrTag abbr="CACIL" /> и <AbbrTag abbr="CACL" /> присуждаются по тем же правилам разд. IV, что и на
                курсинге; минимум 3 собаки породы на старте (п. 4.3.2.1)
              </li>
              <li>На квалификационных состязаниях титулы не присваиваются (п. 4.1.5)</li>
            </ul>
            <div className="grid gap-3 sm:grid-cols-3">
              {COURSING_CERTIFICATES.map((item) => (
                <div
                  key={item.code}
                  className="rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 dark:border-charcoal-600 dark:bg-charcoal-800/50"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
                    {item.level}
                  </div>
                  <div className="mt-1">
                    <AbbrTag abbr={item.code} />
                  </div>
                </div>
              ))}
            </div>
            <RefTag>Правила курсинга, разд. IV; п. 5.1.1.1</RefTag>
          </SectionCard>
        </>
      )}

      <SectionCard title="Статусы вне зачёта">
        <p>
          Снятие, дисквалификация, неявка, сход с трассы — вместо баллов или времени текст причины. Место и титул при
          этом обычно не присваиваются.
        </p>
        <InfoCallout>
          Дисквалификации в сезоне накапливаются: первая — без запрета; вторая — 4 недели; третья — 8 недель;
          четвёртая — до конца сезона (п. 3.6.5 правил).
        </InfoCallout>
      </SectionCard>
    </div>
  )
}
