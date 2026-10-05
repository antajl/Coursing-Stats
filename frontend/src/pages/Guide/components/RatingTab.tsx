import { GUIDE_RATING_FAQS } from '../guideFaqs'
import { InfoCallout, SectionCard } from './GuideUi'

export default function RatingTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="Что такое индекс CS">
        <p>
          <strong>CS (Coursing Stats)</strong> — индекс для рейтинга «по очкам» на курсинге и БЗМП. Он отвечает на
          вопрос: насколько стабильно собака получает высокие оценки судей, а не «сколько баллов суммой за все годы».
        </p>
        <p className="text-charcoal-600">
          На карточке крупно — индекс CS; мелко — среднее и лучшее за участие, число участий. Рейтинг по{' '}
          <strong>медалям</strong> считается отдельно и с CS не смешивается.
        </p>
        <p className="text-charcoal-600">
          Текущая формула: <strong>CS v1</strong> (в данных — поле <code>rating_score_version: cs-v1</code>). Смена
          версии будет явно указана здесь и в индексах, без тихого пересчёта «как будто так было всегда».
        </p>
      </SectionCard>

      <SectionCard title="Как устроен зачёт сезона на сайте">
        <p>
          В разделе <strong>Соревнования → Рейтинг</strong> представлены две колонки: <strong>курсинг/БЗМП</strong> и <strong>рейсинг (бега)</strong>.
        </p>
        <p>
          В левой колонке действует <strong>единый зачёт сезона</strong>. На карточке каждой собаки отображаются её медали, индекс CS и рейтинг Elo:
        </p>
        <div className="space-y-2 rounded-xl border border-old-money-200 bg-old-money-50/70 p-4">
          <div className="font-serif text-sm font-bold text-charcoal-900">
            Формула плотности медалей (standingScore):
          </div>
          <div className="rounded-lg border border-camel-200 bg-white px-3 py-2 font-mono text-xs font-semibold text-camel-900 shadow-2xs">
            Плотность наград = (3 × 🥇 + 1 × 🥈 + 0.5 × 🥉) / (Число стартов + 4)
          </div>
          <ul className="list-disc space-y-1 pl-4 text-xs text-charcoal-700">
            <li>
              <strong>Золото весомее серебра и бронзы.</strong>
            </li>
            <li>
              <strong>Эффективность (КПД):</strong> при одинаковом количестве медалей выше в таблице располагается собака, набравшая их за меньшее число стартов. Знаменатель <code>(+ 4)</code> защищает от случайного взлёта после одного единственного удачного старта.
            </li>
            <li>
              <strong>Тай-брейк:</strong> если плотность медалей двух собак практически равна (разница &le; 0.12), место решает <strong>индекс CS</strong>.
            </li>
          </ul>
        </div>
        <p className="text-xs text-charcoal-600">
          <strong>Рейсинг (бега):</strong> отдельная шкала в правой колонке. Ранжируется строго по максимальной скорости (км/ч) из протоколов забегов.
        </p>
        <p className="text-xs text-charcoal-600">
          По умолчанию включён фильтр <strong>текущего сезона</strong>. Сняв кнопку года, можно посмотреть суммарную статистику за всю карьеру.
        </p>
      </SectionCard>

      <SectionCard title="Формула индекса CS (версия v1)">
        <p>
          <strong>CS (Coursing Stats)</strong> — индекс стабильности судейских оценок на курсинге и БЗМП. Он складывается из трёх понятных факторов:
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-old-money-200 bg-white p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">1. Базовый уровень</div>
            <p className="mt-1 text-xs text-charcoal-600">
              Сглаженная средняя оценка судей (байесовское среднее с априорной базой 85 баллов). Не даёт взлететь за 1 забег.
            </p>
          </div>
          <div className="rounded-lg border border-old-money-200 bg-white p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">2. Пиковый бонус</div>
            <p className="mt-1 text-xs text-charcoal-600">
              До +0.6 балла за выдающиеся забеги собаки выше её собственного среднего уровня.
            </p>
          </div>
          <div className="rounded-lg border border-old-money-200 bg-white p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">3. Бонус за опыт</div>
            <p className="mt-1 text-xs text-charcoal-600">
              До +2.0 баллов за стабильные регулярные старты на протяжении сезона и карьеры.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-charcoal-800">
          <p>μ̃ = (μ × n + 85 × 12) / (n + 12) — базовое сглаженное среднее</p>
          <p>P = B &gt; μ̃ ? 0,15 × min(B − μ̃, 4) : 0 — пиковый бонус</p>
          <p>E = min(2, 0,5 × log₂(S + 1)) — логарифмический бонус за старты</p>
          <p className="font-semibold text-camel-800">CS = round(μ̃ + P + E, 2)</p>
        </div>

        <p className="text-xs text-charcoal-700">
          <strong>Пример:</strong> СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ — средний балл 87 при 64 оценках, лучший 97, 16 стартов →{' '}
          <strong>CS = 89,28</strong>. Собака с одним участием и баллом 96 получит CS ≈ 88,85 — ниже стабильной карьеры.
        </p>
      </SectionCard>

      <SectionCard title="Что такое Elo-рейтинг (версия v2)">
        <p>
          <strong>Elo</strong> — международная система оценки относительной силы на основе парных соперничеств в забегах:
        </p>

        <ul className="list-disc space-y-1 pl-4 text-xs text-charcoal-700">
          <li>
            <strong>Начальный уровень:</strong> 1500 очков.
          </li>
          <li>
            <strong>Сила соперников:</strong> победа над признанным лидером приносит много очков Elo, а победа над явным аутсайдером — минимальную прибавку.
          </li>
          <li>
            <strong>Дисквалификация (DQ):</strong> жёстко наказывается обнулением исхода забега (S=0) и ощутимой потерей рейтинга.
          </li>
          <li>
            <strong>Справка, а не сортировка:</strong> рейтинг Elo выводится на карточке собаки для оценки её уровня, но <strong>не меняет порядок мест в общем зачёте сезона</strong>.
          </li>
        </ul>

        <div className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-charcoal-800">
          <p>E_A = 1 / (1 + 10^((R_B − R_A) / 400)) — матожидание исхода</p>
          <p>S_A = 0,5 + 0,5 × tanh((score_A − score_B) / 8) — мягкий счёт по разнице баллов</p>
          <p>R_A' = R_A + K × (S_A − E_A) — обновление рейтинга с динамическим коэффициентом опыта K</p>
        </div>
      </SectionCard>

      <SectionCard title="Три показателя — единая система">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-camel-200 bg-white p-3.5 shadow-2xs">
            <div className="font-serif text-sm font-bold text-camel-900">1. Медали (Зачёт)</div>
            <p className="mt-1 text-xs text-charcoal-600">
              Главный критерий распределения мест. Золото &gt; Серебро &gt; Бронза, с поправкой на эффективность по числу стартов.
            </p>
          </div>
          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="font-serif text-sm font-bold text-old-money-800">2. Индекс CS</div>
            <p className="mt-1 text-xs text-charcoal-600">
              Тай-брейк при равных медалях: объективная стабильность судейских оценок техники бега.
            </p>
          </div>
          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="font-serif text-sm font-bold text-charcoal-800">3. Рейтинг Elo</div>
            <p className="mt-1 text-xs text-charcoal-600">
              Справочная сила собаки относительно уровня её прямых соперников на поле.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Частые вопросы">
        <dl className="space-y-4">
          {GUIDE_RATING_FAQS.map((faq) => (
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
