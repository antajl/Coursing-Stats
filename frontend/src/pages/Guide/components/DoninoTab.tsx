import {
  ExternalHref,
  InfoCallout,
  RefTag,
  SectionCard,
} from './GuideUi'
import { GUIDE_DONINO_FAQS } from '../guideFaqs'

export const DONINO_SOURCES = [
  {
    label: 'Беговой клуб «Курсинг в Донино»',
    href: 'https://runningdog.ru/',
    note: 'Официальный портал бегового полигона: расписание тренировок, заездов и клубных стартов',
  },
  {
    label: 'Таблицы рекордов и замеров полигона',
    href: 'https://runningdog.ru/gallery/%D0%9F%D1%80%D0%B5%D0%B7%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F_%D0%BE_%D0%BF%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0%D1%85_%D0%BF%D1%80%D0%B8%D1%81%D0%B2%D0%BE%D0%B5%D0%BD%D0%B8%D1%8F_%D1%82%D0%B8%D1%82%D1%83%D0%BB%D0%BE%D0%B2_1.pdf',
    note: 'Методические материалы полигона по правилам и нормативам',
    supplementary: true,
  },
] as const

export default function DoninoTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="О полигоне Курсинг Донино">
        <p>
          Беговой комплекс <strong>«Курсинг в Донино»</strong> (Московская область) — одна из ключевых площадок для
          тренировок, тестирования физической формы и состязаний борзых и спортивных собак в России.
        </p>
        <p className="text-charcoal-600">
          Сайт <strong>Coursing Stats</strong> бережно систематизирует данные тренировочных замеров и клубных состязаний
          в Донино в интерактивные таблицы рекордов и персональные карточки собак.
        </p>
        <div className="space-y-2">
          {DONINO_SOURCES.map((src) => (
            <div
              key={src.href}
              className={`rounded-lg border px-3.5 py-2.5 ${
                'supplementary' in src && src.supplementary
                  ? 'border-old-money-200 bg-old-money-50/50'
                  : 'border-camel-200 bg-white'
              }`}
            >
              <ExternalHref href={src.href}>{src.label}</ExternalHref>
              <p className="mt-1 text-xs text-old-money-600">{src.note}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Две разные дисциплины: скорость и спринт">
        <p>
          В Донино фиксируются результаты по двум <strong>принципиально разным дисциплинам</strong>. Их показатели имеют
          разные физические единицы и никогда не объединяются в одну таблицу:
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Speed records */}
          <div className="rounded-xl border border-camel-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-serif text-base font-bold text-camel-900">
                1. Замер скорости
              </span>
              <span className="rounded-md border border-camel-200 bg-camel-50 px-2 py-0.5 font-mono text-xs font-bold text-camel-800">
                км/ч
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              <strong>Трасса:</strong> естественный полевой рельеф курсинга с поворотами за искусственной механической
              приманкой (зайцем).
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
              <strong>Фиксация:</strong> электронный оптический створ (лазерные датчики) или сертифицированный радар на
              скоростном контрольном отрезке трассы.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal-600">
              <strong>Смысл:</strong> измерение максимальной мгновенной/отрезковой скорости собаки в преследовании цели.
            </p>
          </div>

          {/* 350m coursing records */}
          <div className="rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-serif text-base font-bold text-charcoal-900">
                2. Бега 350 метров
              </span>
              <span className="rounded-md border border-old-money-200 bg-old-money-50 px-2 py-0.5 font-mono text-xs font-bold text-old-money-700">
                секунды
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-charcoal-700">
              <strong>Дистанция:</strong> фиксированный спринтерский отрезок 350 метров по ровному грунтовому/песчаному треку.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
              <strong>Фиксация:</strong> электронный хронометраж от момента старта до пересечения финишной линии.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal-600">
              <strong>Смысл:</strong> чистое время прохождения классической дистанции гладкого спринта. Чем меньше секунд, тем выше место.
            </p>
          </div>
        </div>

        <InfoCallout>
          <strong>Обратите внимание:</strong> в разделе <strong>Курсинг Донино</strong> на сайте вкладка «Записи» отображает
          две параллельные колонки: замеры скорости (км/ч) и спринты 350 м (секунды). Вы можете фильтровать их по породам,
          годам и сортировать по скорости, времени или дате.
        </InfoCallout>
      </SectionCard>

      <SectionCard title="Как формируются рекорды">
        <p>
          На странице <strong>Курсинг Донино → Статистика</strong> ведётся автоматический расчёт рекордов:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-old-money-200 bg-old-money-50/60 p-3.5">
            <div className="font-serif text-sm font-bold text-charcoal-900">Абсолютные рекорды (All-time)</div>
            <p className="mt-1 text-xs text-charcoal-600">
              Лучшие показатели за всю историю наблюдений полигона. Считаются отдельно для каждой породы и раздельно для кобелей и сук.
            </p>
          </div>
          <div className="rounded-lg border border-old-money-200 bg-old-money-50/60 p-3.5">
            <div className="font-serif text-sm font-bold text-charcoal-900">Рекорды сезона</div>
            <p className="mt-1 text-xs text-charcoal-600">
              Лучшие скорости и секунды, показанные собаками в рамках выбранного календарного года.
            </p>
          </div>
        </div>

        <p className="text-xs text-charcoal-600">
          Для каждого замера в карточке сохраняется дата, порода, кличка собаки, а при наличии — фото/скан протокола фиксации.
        </p>
      </SectionCard>

      <SectionCard title="Отличие Донино от официального спорта РКФ">
        <div className="space-y-2 text-xs leading-relaxed text-charcoal-700">
          <p>
            Важно понимать различие между клубными замерами и официальными состязаниями РКФ:
          </p>
          <ul className="list-disc space-y-1.5 pl-4 text-xs">
            <li>
              <strong>Замеры Донино</strong> — это объективная фиксация физических параметров (скорость в км/ч, время в секундах). Здесь нет субъективных оценок судейской коллегии по критериям и не выдаются сертификаты РКФ (CACL, CACIL).
            </li>
            <li>
              <strong>Соревнования РКФ (курсинг / БЗМП)</strong> — официальный кинологический спорт, где судьи оценивают технику бега по 5 критериям (маневренность, скорость, выносливость, преследование, энтузиазм), присваивают квалификацию ВС и титулы рангов.
            </li>
          </ul>
        </div>
        <RefTag>Разделение данных: docs/sheets/01-three-domains.md, docs/sheets/05-donino.md</RefTag>
      </SectionCard>

      <SectionCard title="Частые вопросы по Донино">
        <dl className="space-y-4">
          {GUIDE_DONINO_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-charcoal-900">{faq.question}</dt>
              <dd className="mt-1 text-sm text-charcoal-600">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  )
}
