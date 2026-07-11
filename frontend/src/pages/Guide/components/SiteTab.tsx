import { useState } from 'react'
import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react'
import { ExternalHref, InfoCallout, SectionCard } from './GuideUi'

function ContactLink({
  label,
  value,
  href,
  icon: Icon,
  external,
}: {
  label: string
  value: string
  href: string
  icon: typeof Mail
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-3 rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 transition-colors hover:border-camel-300 hover:bg-camel-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/50 dark:hover:border-camel-800 dark:hover:bg-camel-950/20"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
        <Icon className="h-5 w-5 text-camel-700 dark:text-camel-400" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
          {label}
        </span>
        <span className="block font-medium text-camel-800 dark:text-camel-300">{value}</span>
      </span>
    </a>
  )
}

function DiscordContact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('antajl')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex w-full items-center gap-3 rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 text-left transition-colors hover:border-camel-300 hover:bg-camel-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/50 dark:hover:border-camel-800 dark:hover:bg-camel-950/20"
      title="Скопировать ник Discord"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
        <MessageCircle className="h-5 w-5 text-camel-700 dark:text-camel-400" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
          Discord
        </span>
        <span className="block font-medium text-camel-800 dark:text-camel-300">antajl</span>
        <span className="mt-0.5 block text-[11px] text-old-money-500 dark:text-old-money-400">
          {copied ? 'Ник скопирован' : 'Нажмите, чтобы скопировать ник'}
        </span>
      </span>
      {copied ? (
        <Check className="h-4 w-4 flex-shrink-0 text-camel-600 dark:text-camel-400" aria-hidden />
      ) : (
        <Copy className="h-4 w-4 flex-shrink-0 text-old-money-400" aria-hidden />
      )}
    </button>
  )
}

export default function SiteTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Что такое Coursing Stats">
        <p>
          Некоммерческий агрегатор статистики: результаты соревнований с procoursing.ru (курсинг, БЗМП, бега борзых)
          и рекорды полигона Донино. Проект не связан с ProCoursing и РКФ.
        </p>
      </SectionCard>

      <SectionCard title="Рейтинг на сайте">
        <p>
          В разделе <strong>Статистика → Рейтинг</strong> две независимые вкладки для курсинга и БЗМП:{' '}
          <strong>места</strong> (медали за сезон или карьеру) и <strong>очки</strong> (оценки судей). Они{' '}
          <strong>не сводятся</strong> в одну формулу.
        </p>

        <p className="font-medium text-charcoal-800 dark:text-charcoal-100">Вкладка «очки» — порядок в списке</p>
        <p>
          Собаки сортируются по <strong>индексу CS v1</strong> (внутренняя метрика Coursing Stats). На карточке
          показаны три числа из протоколов; для места в рейтинге используется только индекс.
        </p>

        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-old-money-200 bg-old-money-50/60 px-3 py-2 font-mono text-[11px] dark:border-charcoal-600 dark:bg-charcoal-800/40">
          <span className="rounded bg-white px-2 py-0.5 font-semibold text-charcoal-800 dark:bg-charcoal-700 dark:text-charcoal-100">
            средняя
          </span>
          <span className="text-camel-700 dark:text-camel-400">+</span>
          <span className="rounded bg-white px-2 py-0.5 font-semibold text-charcoal-800 dark:bg-charcoal-700 dark:text-charcoal-100">
            пик
          </span>
          <span className="text-camel-700 dark:text-camel-400">+</span>
          <span className="rounded bg-white px-2 py-0.5 font-semibold text-charcoal-800 dark:bg-charcoal-700 dark:text-charcoal-100">
            старты
          </span>
          <span className="ml-1 text-old-money-600 dark:text-old-money-400">= индекс CS</span>
        </div>

        <ul className="list-inside list-disc space-y-1.5 pl-1">
          <li>
            <strong>Средняя оценка судей</strong> — основа (оценка одного судьи за пробу, не сумма протокола). При
            малом числе выездов сглаживается к prior=85 (≈68-й перцентиль поля на 2026-07), чтобы один удачный день
            не обгонял стабильную карьеру.
          </li>
          <li>
            <strong>+ до 0,6</strong> — бонус за лучший результат выше сглаженной средней (только если B &gt; μ̃).
          </li>
          <li>
            <strong>+ до 2</strong> — бонус за опыт (число стартов, жёсткий cap).
          </li>
        </ul>

        <p className="font-medium text-charcoal-800 dark:text-charcoal-100">Цифры на карточке собаки</p>
        <ul className="list-inside list-disc space-y-1 pl-1">
          <li>
            <strong>Средняя</strong> — среднее по всем оценкам судей.
          </li>
          <li>
            <strong>Лучш. оценка</strong> — максимум одного судьи за пробу.
          </li>
          <li>
            <strong>Сумма (протокол)</strong> — как в протоколе procoursing.ru; зависит от числа судей и проб,{' '}
            <strong>не</strong> определяет место в рейтинге «по очкам».
          </li>
        </ul>

        <InfoCallout>
          Подсказка ⓘ рядом с переключателем «очки» — кратко и простым языком; полная формула и примеры — ниже
          на этой странице. Рейсинг — отдельная колонка, сортировка по скорости (км/ч).
        </InfoCallout>

        <p className="font-medium text-charcoal-800 dark:text-charcoal-100">Полная формула (CS v1)</p>
        <p className="text-[13px]">
          Обозначения: μ — средняя оценка судей по карьере; n — число отдельных оценок судей; B — лучшая оценка одного
          судьи; S — число стартов. Курсинг и БЗМП объединяются в одну μ.
        </p>

        <div className="space-y-2 rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-3 font-mono text-[11px] leading-relaxed text-charcoal-800 dark:border-charcoal-600 dark:bg-charcoal-900/40 dark:text-charcoal-100">
          <p>
            <span className="text-old-money-600 dark:text-old-money-400">1. Сглаженная средняя</span> (prior = 85, k = 12):
          </p>
          <p className="pl-2">μ̃ = (μ × n + 85 × 12) / (n + 12)</p>
          <p>
            <span className="text-old-money-600 dark:text-old-money-400">2. Бонус пика</span> (если B &gt; μ̃, вес 0,15, макс. +4 к разнице):
          </p>
          <p className="pl-2">P = 0,15 × min(B − μ̃, 4) &nbsp; только если B &gt; μ̃, иначе 0</p>
          <p>
            <span className="text-old-money-600 dark:text-old-money-400">3. Бонус стартов</span> (вес 0,5, макс. 2):
          </p>
          <p className="pl-2">E = min(2, 0,5 × log₂(S + 1))</p>
          <p>
            <span className="text-old-money-600 dark:text-old-money-400">4. Индекс CS</span> (округление до 2 знаков):
          </p>
          <p className="pl-2 font-semibold text-camel-800 dark:text-camel-300">CS = round(μ̃ + P + E, 2)</p>
        </div>

        <p className="font-medium text-charcoal-800 dark:text-charcoal-100">Пример: СТАНГЕРС ЛАНД ИНГРИД ЭЛЕГАНТ</p>
        <p className="text-[13px]">
          Данные из <code>top-score-all.json</code> (2026-07): μ = 87, n = 64, B = 97, S = 16 →{' '}
          <strong>rating_score = 89,28</strong>.
        </p>
        <div className="space-y-1 rounded-lg border border-camel-200/80 bg-camel-50/50 px-3 py-3 font-mono text-[11px] leading-relaxed text-charcoal-800 dark:border-camel-900 dark:bg-camel-950/20 dark:text-charcoal-100">
          <p>μ̃ = (87 × 64 + 85 × 12) / 76 = 6588 / 76 = <strong>86,68</strong></p>
          <p>P = 0,15 × min(97 − 86,68, 4) = 0,15 × 4 = <strong>0,60</strong></p>
          <p>E = min(2, 0,5 × log₂(17)) = min(2, 2,04) = <strong>2,00</strong></p>
          <p className="pt-1 font-semibold text-camel-800 dark:text-camel-300">CS = 86,68 + 0,60 + 2,00 = 89,28</p>
        </div>

        <p className="font-medium text-charcoal-800 dark:text-charcoal-100">Контраст: один старт, высокая средняя</p>
        <p className="text-[13px]">
          Собака с μ = 96 за 1 старт (n = 4 оценки судей за выезд), B = 98, S = 1:
        </p>
        <div className="space-y-1 rounded-lg border border-old-money-200 bg-old-money-50/40 px-3 py-3 font-mono text-[11px] leading-relaxed text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-900/30 dark:text-charcoal-200">
          <p>μ̃ = (96 × 4 + 85 × 12) / 16 = <strong>87,75</strong> — сглаживание «опускает» разовый успех</p>
          <p>P = 0,15 × min(98 − 87,75, 4) = <strong>0,60</strong></p>
          <p>E = 0,5 × log₂(2) = <strong>0,50</strong></p>
          <p className="font-semibold">CS ≈ <strong>88,85</strong> — ниже, чем у ИНГРИД (89,28) при μ = 87 и 16 стартах</p>
        </div>

        <p className="font-medium text-charcoal-800 dark:text-charcoal-100">Параметры и ограничения</p>
        <ul className="list-inside list-disc space-y-1.5 pl-1 text-[13px]">
          <li>
            <strong>prior = 85</strong> — округлённый ориентир верхней части типичных средних (между медианой ~83,4 и
            p75 ~85,7 по карьерным avg_judge_score; ≈68-й перцентиль поля на момент введения CS v1). Не порог CACL и
            не среднее арифметическое всех собак.
          </li>
          <li>
            <strong>k = 12</strong> — сколько «виртуальных» оценок добавляется при сглаживании; эвристика, не
            подгонка под отдельные примеры.
          </li>
          <li>
            <strong>CS v1 — фиксированные константы.</strong> prior и k заданы в коде и не пересчитываются при каждом
            обновлении базы. Индекс собаки меняется только от её новых результатов (и при смене версии формулы с
            записью в истории проекта). При росте базы без новых стартов CS не «плывёт» из‑за сдвига общего среднего.
          </li>
          <li>
            <strong>Курсинг и БЗМП — одна шкала.</strong> Оценка судьи (<code>judge.sum</code>) — сумма баллов по
            критериям протокола (0–20 за критерий), одинаковый формат в обеих дисциплинах. В индексе CS они
            объединяются в одну μ по всем стартам. Эмпирика (2026-07, 16 549 оценок, 728 собак в индексе): средняя по
            отдельным оценкам — курсинг 83,9, БЗМП 82,7; медианы 85 и 84; карьерные avg_judge_score — 82,7 vs 82,0
            (медианы 83,5 и 83,3). Систематического смещения нет, различие &lt; 1 балла.
          </li>
          <li>
            <strong>n</strong> — число оценок судей (не стартов). В большинстве протоколов kурсинга на старт ≈4 оценки
            (несколько проб × судьи); разброс 1–6. Эффект «быстрее накопить n при 3 судьях» теоретически возможен, но
            в текущей базе слабый (93% стартов с 4 оценками; макс. S ≈ 19).
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Связь с автором">
        <div className="grid gap-2 md:grid-cols-3">
          <ContactLink label="Почта" value="antajl@yandex.ru" href="mailto:antajl@yandex.ru" icon={Mail} />
          <ContactLink label="Telegram" value="@antajl" href="https://t.me/antajl" icon={Send} external />
          <DiscordContact />
        </div>
      </SectionCard>

      <SectionCard title="Источники данных">
        <ul className="space-y-2">
          <li>
            <ExternalHref href="http://procoursing.ru">Procoursing.ru</ExternalHref> — календарь и протоколы
          </li>
          <li>
            <ExternalHref href="https://runningdog.ru/">Курсинг Донино</ExternalHref>
          </li>
          <li>
            <ExternalHref href="https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009">
              Рекорды Донино (курсинг)
            </ExternalHref>
          </li>
          <li>
            <ExternalHref href="https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/edit?pli=1&gid=0#gid=0">
              Рекорды Донино (бега борзых)
            </ExternalHref>
          </li>
          <li>
            <ExternalHref href="https://rkf.org.ru/dressirovka-i-sport/polozhenija/">Положения РКФ</ExternalHref>
          </li>
        </ul>
      </SectionCard>
    </div>
  )
}
