import { Link } from 'react-router-dom'
import { Award, BarChart3, ChevronRight, Sparkles, Timer, Trophy } from 'lucide-react'
import {
  DONINO_ABBREVIATIONS,
  DONINO_OFFICIAL_SOURCES,
  DONINO_REQUIREMENTS,
  DONINO_SPEED_LADDER,
} from '../doninoConstants'
import { GUIDE_DONINO_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function DoninoTab() {
  return (
    <div className="space-y-6">
      {/* 1. Иерархия соревновательных лиг чемпионата */}
      <SectionCard title="Иерархия соревновательных лиг в Донино">
        <p className="text-xs text-charcoal-600">
          Официальная система лиг клубного чемпионата по рейсингу в Донино (клик по строке раскроет правила допуска и переходов между лигами):
        </p>

        <TitleLadderList items={DONINO_SPEED_LADDER} />
      </SectionCard>

      {/* 2. Ключевые правила и регламент замеров (Памятка участника) */}
      <SectionCard title="Памятка участника: регламент и замеры в Донино">
        <div className="grid gap-3 sm:grid-cols-2">
          {DONINO_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                {req.label}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                {req.text}
              </p>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3. Анатомия начисления баллов Чемпионата Донино */}
      <SectionCard title="Анатомия начисления баллов Чемпионата Донино">
        <p className="text-xs text-charcoal-600">
          Итоговая сумма очков собаки в таблице клубного чемпионата формируется из трёх слагаемых: базовых очков за занятое место в классе, очков за каждый предварительный и финальный заезд, а также специальных скоростных бонусов.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* Места на этапе */}
          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900">
                Места на этапе
              </span>
            </div>
            <ul className="mt-2.5 space-y-1 font-mono text-xs text-charcoal-700">
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>1 место</span>
                <span className="font-semibold text-camel-800">100 б.</span>
              </li>
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>2 место</span>
                <span className="font-semibold text-charcoal-900">95 б.</span>
              </li>
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>3 место</span>
                <span className="font-semibold text-charcoal-900">90 б.</span>
              </li>
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>4 место</span>
                <span className="font-semibold text-charcoal-700">86 б.</span>
              </li>
              <li className="flex justify-between text-charcoal-500">
                <span>5 место и далее</span>
                <span>82, 78 б... (-4)</span>
              </li>
            </ul>
          </div>

          {/* Баллы за заезды */}
          <div className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-800">
                <Timer className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-900">
                Баллы за круги
              </span>
            </div>
            <ul className="mt-2.5 space-y-1 font-mono text-xs text-charcoal-700">
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>1-е в заезде</span>
                <span className="font-semibold text-sky-800">+4 б.</span>
              </li>
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>2-е в заезде</span>
                <span className="font-semibold text-charcoal-900">+3 б.</span>
              </li>
              <li className="flex justify-between border-b border-old-money-100 pb-1">
                <span>3-е в заезде</span>
                <span className="font-semibold text-charcoal-900">+2 б.</span>
              </li>
              <li className="flex justify-between">
                <span>4-е в заезде</span>
                <span className="font-semibold text-charcoal-700">+1 б.</span>
              </li>
            </ul>
            <p className="mt-2 text-[10px] text-charcoal-500">
              Начисляются за каждый состоявшийся круг этапа (1 круг, 2 круг, финал).
            </p>
          </div>

          {/* Специальные бонусы */}
          <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-3.5 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950">
                Бонусы за рекорды
              </span>
            </div>
            <ul className="mt-2.5 space-y-2 text-xs text-charcoal-700">
              <li className="rounded-lg border border-amber-200/80 bg-white p-2">
                <div className="flex justify-between font-semibold text-charcoal-900">
                  <span>Рекорд чемпионата</span>
                  <span className="font-mono text-amber-700">+5 б.</span>
                </div>
                <p className="mt-0.5 text-[10px] text-charcoal-600">
                  Абсолютно лучшее чистое время серии турниров в классе
                </p>
              </li>
              <li className="rounded-lg border border-amber-200/80 bg-white p-2">
                <div className="flex justify-between font-semibold text-charcoal-900">
                  <span>Лучшее время этапа</span>
                  <span className="font-mono text-amber-700">+2 б.</span>
                </div>
                <p className="mt-0.5 text-[10px] text-charcoal-600">
                  Наивысшая скорость в классе на конкретном этапе
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Интерактивные разделы Чемпионата */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2">
          <Link
            to="/donino/championship/standings"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-camel-400 bg-camel-100 px-3 py-1.5 text-xs font-semibold text-camel-950 shadow-2xs transition-colors hover:bg-camel-200/80"
          >
            <Award className="h-3.5 w-3.5 text-camel-800" aria-hidden />
            <span>Рейтинг чемпионата</span>
            <ChevronRight className="h-3.5 w-3.5 text-camel-700 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            to="/donino/championship/analytics"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-2xs transition-colors hover:border-camel-300 hover:text-camel-800"
          >
            <BarChart3 className="h-3.5 w-3.5 text-charcoal-600" aria-hidden />
            <span>Аналитика и динамика лиг</span>
            <ChevronRight className="h-3.5 w-3.5 text-charcoal-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </SectionCard>

      {/* 4. Словарь понятий и сокращений */}
      <SectionCard title="Словарь понятий и обозначений полигона">
        <p className="text-xs text-charcoal-600">
          Выберите обозначение или термин полигона Донино, чтобы увидеть его подробное описание:
        </p>
        <AbbreviationsDropdown
          rows={DONINO_ABBREVIATIONS}
          refTag={
            <RefTag>
              Регламент бегового комплекса «Курсинг в Донино» · runningdog.ru
            </RefTag>
          }
        />
      </SectionCard>

      {/* 4. Официальные первоисточники и регламенты */}
      <SectionCard title="Официальные первоисточники и материалы">
        <p className="text-xs text-charcoal-600">
          Портал бегового клуба и методические материалы полигона:
        </p>
        <OfficialSourcesList sources={DONINO_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 5. Частые вопросы */}
      <SectionCard title="Частые вопросы о Донино">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_DONINO_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <dt className="text-xs font-bold text-charcoal-900 sm:text-sm">{faq.question}</dt>
              <dd className="mt-1.5 text-xs leading-relaxed text-charcoal-700 sm:text-sm">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  )
}
