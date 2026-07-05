import { CRITERIA } from '../constants'
import { InfoCallout, RefTag, SectionCard } from './GuideUi'

export default function ProtocolTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Знак ВС в протоколе">
        <div className="flex flex-wrap items-start gap-3">
          <span className="inline-block rounded border border-camel-200 bg-camel-100 px-2 py-1 text-sm font-semibold text-camel-800 dark:border-camel-700 dark:bg-camel-900/50 dark:text-camel-300">
            ВС
          </span>
          <div className="min-w-0 flex-1">
            <p>
              <strong className="font-semibold text-charcoal-800 dark:text-charcoal-200">Высшая квалификация</strong> —
              в HTML-протоколе procoursing.ru отмечается «+», если собака выполнила квалификационные нормы, необходимые
              для присвоения титула или сертификата на этом старте.
            </p>
            <p className="mt-2">
              Для курсинга ключевая норма РКФ: не менее <strong>⅔</strong> от максимально возможной суммы баллов (п.
              4.3.4 правил). Без выполнения норм титул или CACL не присваивается, даже при высоком месте.
            </p>
          </div>
        </div>
        <RefTag>Правила курсинга, п. 4.3.4 · на сайте — бейдж ВС у итогового балла</RefTag>
      </SectionCard>

      <SectionCard title="Система баллов (курсинг)">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: '5', label: 'критериев', sub: 'М Р В П Э' },
            { n: '20', label: 'макс. за критерий', sub: 'у каждого судьи' },
            { n: '2', label: 'забега', sub: 'сумма складывается' },
            { n: '⅔', label: 'норма для титула', sub: 'от макс. суммы' },
          ].map((stat) => (
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
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Менее 50% баллов в 1-м забеге — нет допуска ко 2-му кругу (п. 7.4.1.3)</li>
          <li>
            При равенстве итога — выше место у большего балла во 2-м забеге; затем по критериям: маневренность →
            скорость → выносливость → преследование (п. 7.4.1.5–7.4.1.6)
          </li>
          <li>
            <strong>Σ</strong> на сайте — сумма оценок; итог в шапке карточки = общая сумма протокола, без деления на
            число судей
          </li>
        </ul>
        <RefTag>Правила курсинга, п. 7.4.1</RefTag>
      </SectionCard>

      <SectionCard title="Судейские критерии">
        <div className="space-y-3">
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
      </SectionCard>

      <SectionCard title="Бега борзых (racing)">
        <p>
          Отдельная таблица протокола: время и скорость по трём забегам, затем ВС и титул. Критериев М/Р/В/П/Э нет —
          оценка по времени и скорости на дистанции. Международный CACIL и национальный CACL присуждаются по тем же
          разделам IV правил.
        </p>
        <RefTag>Правила курсинга, разд. VI</RefTag>
      </SectionCard>

      <SectionCard title="Статусы вне зачёта">
        <p>
          Снятие, дисквалификация, неявка, сход с трассы — вместо баллов текст причины. Место и титул при этом обычно
          не присваиваются.
        </p>
        <InfoCallout>
          Дисквалификации в сезоне накапливаются: вторая — запрет на участие до конца сезона, третья — на следующий
          сезон (п. 3.6.5 правил).
        </InfoCallout>
      </SectionCard>
    </div>
  )
}
