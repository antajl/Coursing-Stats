import { GUIDE_RATING_FAQS } from '../guideFaqs'
import { InfoCallout, SectionCard } from './GuideUi'

export default function RatingTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Что такое индекс CS">
        <p>
          <strong>CS (Coursing Stats)</strong> — индекс для рейтинга «по очкам» на курсинге и БЗМП. Он отвечает на
          вопрос: насколько стабильно собака получает высокие оценки судей, а не «сколько баллов суммой за все годы».
        </p>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          На карточке крупно — индекс CS; мелко — среднее и лучшее за старт, число стартов. Рейтинг «по местам»
          (медали) считается отдельно и с CS не смешивается.
        </p>
      </SectionCard>

      <SectionCard title="Как устроен рейтинг на сайте">
        <p>
          В <strong>Статистика → Рейтинг</strong> две колонки: курсинг/БЗМП и рейсинг. В левой — переключатель{' '}
          <strong>очки</strong> (по умолчанию) и <strong>места</strong>.
        </p>
        <ul className="list-inside list-disc space-y-1 pl-1 text-[13px]">
          <li>
            <strong>Очки</strong> — порядок по индексу CS (оценки судей; курсинг и БЗМП на одной шкале).
          </li>
          <li>
            <strong>Места</strong> — медали (золото / серебро / бронза) за сезон или карьеру.
          </li>
          <li>
            <strong>Рейсинг</strong> — скорость из протоколов бегов, км/ч (без CS).
          </li>
        </ul>
        <InfoCallout>
          Подсказка ⓘ у переключателя «очки» на странице рейтинга. Сумма <em>grand total</em> из протокола
          procoursing.ru на место в списке «по очкам» не влияет.
        </InfoCallout>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          И в соревнованиях, и в выставках по умолчанию включён фильтр <strong>текущего сезона</strong> (кнопка
          «Сезон YYYY»). Снять кнопку — смотреть карьеру / все загруженные годы.
        </p>
      </SectionCard>

      <SectionCard title="Формула CS (версия v1)">
        <p className="text-[13px]">
          В расчёт входят: сглаженная средняя оценка одного судьи (чтобы один-два старта не доминировали), бонус до{' '}
          <strong>0,6</strong> за лучший результат выше среднего и бонус до <strong>2</strong> за число стартов.
        </p>

        <div className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-charcoal-800 dark:border-charcoal-600 dark:bg-charcoal-900/40 dark:text-charcoal-100">
          <p>μ̃ = (μ × n + 85 × 12) / (n + 12)</p>
          <p>P = B &gt; μ̃ ? 0,15 × min(B − μ̃, 4) : 0</p>
          <p>E = min(2, 0,5 × log₂(S + 1))</p>
          <p className="font-semibold text-camel-800 dark:text-camel-300">CS = round(μ̃ + P + E, 2)</p>
        </div>

        <p className="text-[13px]">
          <strong>Пример:</strong> СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ — μ=87, n=64, B=97, S=16 →{' '}
          <strong>CS=89,28</strong>. Собака с одним стартом и μ=96 получит CS≈88,85 — ниже стабильной карьеры.
        </p>

        <ul className="list-inside list-disc space-y-1 pl-1 text-[13px] text-charcoal-600 dark:text-charcoal-300">
          <li>Константы prior=85 и k=12 зафиксированы — индекс не «плывёт» без новых стартов собаки.</li>
          <li>Курсинг и БЗМП используют одну шкалу оценок судей.</li>
        </ul>
      </SectionCard>

      <SectionCard title="Частые вопросы">
        <dl className="space-y-4">
          {GUIDE_RATING_FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-semibold text-charcoal-900 dark:text-charcoal-100">{faq.question}</dt>
              <dd className="mt-1 text-[13px] text-charcoal-600 dark:text-charcoal-300">{faq.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          Выставки — вкладка <strong>«Выставки»</strong>; источники и контакты — <strong>«О сайте»</strong>.
        </p>
      </SectionCard>
    </div>
  )
}
