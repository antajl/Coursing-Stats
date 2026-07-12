import { InfoCallout, SectionCard } from './GuideUi'

export default function RatingTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Как устроен рейтинг">
        <p>
          В <strong>Статистике → Рейтинг</strong> — две колонки: курсинг/БЗМП и рейсинг. В левой колонке переключатель{' '}
          <strong>очки</strong> (по умолчанию) и <strong>места</strong>. Это <strong>разные</strong> рейтинги, формулы
          не смешиваются.
        </p>
        <ul className="list-inside list-disc space-y-1 pl-1 text-[13px]">
          <li>
            <strong>Очки</strong> — порядок по индексу CS (оценки судей, курсинг + БЗМП вместе).
          </li>
          <li>
            <strong>Места</strong> — медали за сезон или карьеру.
          </li>
          <li>
            <strong>Рейсинг</strong> — скорость, км/ч.
          </li>
        </ul>
        <InfoCallout>
          Краткая подсказка — ⓘ у переключателя «очки» на странице рейтинга. Сумма из протокола procoursing.ru на
          место в списке «по очкам» не влияет.
        </InfoCallout>
      </SectionCard>

      <SectionCard title="Индекс CS (версия v1)">
        <p className="text-[13px]">
          Составной показатель: <strong>средняя оценка одного судьи</strong> (с лёгким сглаживанием при малом числе
          выездов) + до <strong>0,6</strong> за лучший результат + до <strong>2</strong> за число стартов. На карточке
          крупно — индекс, мелко — ср., лучш., Σ и старты.
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
          <li>Константы prior=85 и k=12 зафиксированы в коде — индекс не «плывёт» без новых стартов собаки.</li>
          <li>Курсинг и БЗМП — одна шкала оценок судей (различие в данных &lt; 1 балла).</li>
          <li>Подробности для разработчиков — <code>backend/lib/rating/coursing-rating-score.ts</code>.</li>
        </ul>
      </SectionCard>
    </div>
  )
}
