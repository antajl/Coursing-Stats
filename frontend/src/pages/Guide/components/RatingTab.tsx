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
          На карточке крупно — индекс CS; мелко — среднее и лучшее за старт, число стартов. Рейтинг по{' '}
          <strong>медалям</strong> считается отдельно и с CS не смешивается.
        </p>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          Текущая формула: <strong>CS v1</strong> (в данных — поле <code>rating_score_version: cs-v1</code>). Смена
          версии будет явно указана здесь и в индексах, без тихого пересчёта «как будто так было всегда».
        </p>
      </SectionCard>

      <SectionCard title="Как устроен рейтинг на сайте">
        <p>
          В <strong>Статистика → Рейтинг</strong> две колонки: курсинг/БЗМП и рейсинг. В левой —{' '}
          <strong>один список</strong>: на карточке медали, Elo и индекс CS.
        </p>
        <ul className="list-inside list-disc space-y-1 pl-1 text-[13px]">
          <li>
            Порядок мест: <strong>Elo → CS → медали</strong> (золото, серебро, бронза).
          </li>
          <li>
            <strong>Рейсинг</strong> — отдельно, по скорости км/ч.
          </li>
        </ul>
        <InfoCallout>
          Подсказка ⓘ у заголовка колонки. Для сравнения силы удобнее выбрать породу — Elo считается в пулах по
          породам.
        </InfoCallout>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          По умолчанию включён фильтр <strong>текущего сезона</strong>. Снять кнопку — смотреть карьеру.
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

      <SectionCard title="Что такое Elo-рейтинг">
        <p>
          <strong>Elo</strong> — система рейтинга на основе парных сравнений в забегах. Учитывает оценки судей и{' '}
          <strong>силу соперников</strong>: выиграть у сильного ценнее, чем у слабого.
        </p>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          В одном пуле — <strong>курсинг и БЗМП</strong> (хронологически). Породы считаются отдельно (
          <code>breedPools</code>). Медали и CS с Elo не смешиваются.
        </p>
        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          Текущая версия: <strong>Elo v2</strong> (параметры: scale=8, K0=50 после перекалибровки на корпусе
          coursing+BZMP). Рейтинг соперника берётся на момент забега — без утечки из будущего.
        </p>
      </SectionCard>

      <SectionCard title="Формула Elo (v2)">
        <p className="text-[13px]">
          Для обычных забегов — Elo с мягким исходом из разницы судейских баллов. Для дисквалификации — жёсткий
          проигрыш.
        </p>

        <div className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-charcoal-800 dark:border-charcoal-600 dark:bg-charcoal-900/40 dark:text-charcoal-100">
          <p>E_A = 1 / (1 + 10^((R_B − R_A) / 400))</p>
          <p>S_A = 0,5 + 0,5 × tanh((score_A − score_B) / scale) — scored</p>
          <p>S_A = 0 при DQ (партнёр получает S=1; соло DQ — vs равный виртуальный соперник)</p>
          <p>R_A' = R_A + K × (S_A − E_A)</p>
          <p>K = K0 / (1 + n / 12)</p>
        </div>

        <p className="text-[13px]">
          <strong>Параметры:</strong> scale=8, K0=50, начальный рейтинг 1500.
        </p>

        <ul className="list-inside list-disc space-y-1 pl-1 text-[13px] text-charcoal-600 dark:text-charcoal-300">
          <li>
            <strong>DQ</strong> снижает Elo (S=0). Bye-run без DQ только увеличивает опыт n (K уменьшается).
          </li>
          <li>
            Elo: участвует в едином списке как главный ключ сортировки; при равенстве — CS, затем медали.
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Три показателя — один список">
        <p className="text-[13px]">
          Медали, CS и Elo по-прежнему разные смыслы, но места в рейтинге задаёт фиксированный порядок
          тай-брейков (не смесь в одно число):
        </p>

        <ul className="list-inside list-disc space-y-1 pl-1 text-[13px] text-charcoal-600 dark:text-charcoal-300">
          <li>
            <strong>Elo</strong> — сила через соперников (главный ключ сортировки).
          </li>
          <li>
            <strong>CS</strong> — при равном Elo: стабильность оценок судей.
          </li>
          <li>
            <strong>Медали</strong> — при равном CS: золото → серебро → бронза.
          </li>
        </ul>

        <p className="text-[13px] text-charcoal-600 dark:text-charcoal-300">
          Выбирайте породу, если нужен более честный топ «кто сильнее среди своих».
        </p>
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
