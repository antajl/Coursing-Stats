import { Link } from 'react-router-dom'
import { Award, BarChart3, CheckCircle2, ChevronRight, Compass, Flag, Gauge, Layers, MapPin, Ruler, Sparkles, Timer, Trophy } from 'lucide-react'
import {
  DONINO_ABBREVIATIONS,
  DONINO_BENCHMARKS,
  DONINO_HEIGHT_CLASSES,
  DONINO_OFFICIAL_SOURCES,
  DONINO_REQUIREMENTS,
  DONINO_SPEED_LADDER,
  DONINO_TRACK_TECH,
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
      {/* 1. Визитная карточка бегового комплекса в Донино */}
      <div className="rounded-2xl border border-camel-200/90 bg-linear-to-b from-white via-cream-50/70 to-camel-50/40 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800">
                <Compass className="h-3.5 w-3.5" aria-hidden />
              </span>
              <h2 className="font-serif text-sm sm:text-base font-bold text-charcoal-900">
                Беговой комплекс в Донино (runningdog.ru)
              </h2>
            </div>
            <p className="mt-1 text-xs text-charcoal-600 leading-relaxed max-w-2xl">
              Главный круглогодичный специализированный полигон России для бегов борзых (рейсинг 350 м) и лазерных замеров скорости курсинга. Открыт для тренировок, клубных турниров и квалификаций любых пород собак.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 self-start shrink-0 rounded-full border border-old-money-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-charcoal-700 shadow-2xs">
            <MapPin className="h-3 w-3 text-camel-700" aria-hidden />
            <span>Московская обл., д. Донино</span>
          </div>
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-1 border-t border-old-money-100 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-old-money-200 px-2 py-0.5 text-charcoal-700">
            <Timer className="h-3 w-3 text-sky-700" aria-hidden />
            350 м овальный песчаный трек
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-old-money-200 px-2 py-0.5 text-charcoal-700">
            <Flag className="h-3 w-3 text-camel-700" aria-hidden />
            4-местные стартовые боксы
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-old-money-200 px-2 py-0.5 text-charcoal-700">
            <Gauge className="h-3 w-3 text-amber-700" aria-hidden />
            Фотофиниш до 0,001 с и радар км/ч
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white border border-old-money-200 px-2 py-0.5 text-charcoal-700">
            <Trophy className="h-3 w-3 text-camel-700" aria-hidden />
            Клубный чемпионат по системе 3 лиг
          </span>
        </div>
      </div>

      {/* 2. Иерархия соревновательных лиг чемпионата */}
      <SectionCard title="Иерархия соревновательных лиг в Донино">
        <p className="text-xs text-charcoal-600">
          Официальная система лиг клубного чемпионата по рейсингу в Донино (клик по строке раскроет правила допуска и переходов между лигами):
        </p>

        <TitleLadderList items={DONINO_SPEED_LADDER} />
      </SectionCard>

      {/* 3. Скоростные ориентиры 350 м по породам */}
      <SectionCard title="Скоростные ориентиры и эталонные времена 350 м">
        <p className="text-xs text-charcoal-600">
          Типичные показатели чистого времени и скорости на песчаном треке Донино:
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {DONINO_BENCHMARKS.map((b) => (
            <div
              key={b.breed}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-1 border-b border-old-money-100 pb-1.5">
                <span className="text-xs font-bold text-charcoal-900">{b.breed}</span>
                <span className="rounded bg-camel-100 px-1.5 py-0.5 text-[10px] font-bold text-camel-900">
                  {b.speedKmH}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-[11px] text-charcoal-500">Время на 350 м:</span>
                <span className="font-mono text-xs font-bold text-charcoal-900">{b.trackTime}</span>
              </div>
              <div className="mt-1 flex items-baseline justify-between text-[11px]">
                <span className="text-charcoal-500">Радар (пик):</span>
                <span className="font-semibold text-camel-800">{b.radarPeak}</span>
              </div>
              <p className="mt-1.5 text-[10px] text-charcoal-600 border-t border-old-money-100/80 pt-1">
                {b.note}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Ростовые промеры */}
      <SectionCard title="Ростовые классы для уиппетов и левреток (промеры в холке)">
        <p className="text-xs text-charcoal-600">
          Для исключения преимущества в росте и рычагах участники делятся на 3 независимых ростовых зачёта:
        </p>

        <div className="space-y-2 pt-1">
          {DONINO_HEIGHT_CLASSES.map((h) => (
            <div
              key={h.category}
              className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800 shrink-0">
                  <Ruler className="h-3.5 w-3.5" aria-hidden />
                </span>
                <div>
                  <span className="text-xs font-bold text-charcoal-900">{h.category}</span>
                  <p className="text-[11px] text-charcoal-600">{h.desc}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="rounded-md border border-old-money-200 bg-old-money-50/70 px-2 py-0.5 text-charcoal-800">
                  Уиппет: ♂ {h.whippetMale} / ♀ {h.whippetFemale}
                </span>
                <span className="rounded-md border border-old-money-200 bg-old-money-50/70 px-2 py-0.5 text-charcoal-800">
                  Левретка: {h.ig}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 5. Анатомия начисления баллов Чемпионата Донино */}
      <SectionCard title="Анатомия начисления баллов Чемпионата Донино">
        <p className="text-xs text-charcoal-600">
          Итоговая сумма очков собаки формируется из трёх слагаемых: базовых очков за занятое место в классе, очков за заезды каждого круга и скоростных бонусов.
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
          <Link
            to="/speed-records"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-2xs transition-colors hover:border-camel-300 hover:text-camel-800"
          >
            <Gauge className="h-3.5 w-3.5 text-charcoal-600" aria-hidden />
            <span>Таблицы рекордов скорости</span>
            <ChevronRight className="h-3.5 w-3.5 text-charcoal-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </SectionCard>

      {/* 6. Техническое устройство комплекса */}
      <SectionCard title="Технологии трека и система хронометража">
        <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
          {DONINO_TRACK_TECH.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="text-xs font-bold text-charcoal-900">{t.title}</div>
              <p className="mt-1 text-xs text-charcoal-600 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 7. Ключевые правила и регламент (Памятка участника) */}
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

      {/* 8. Словарь понятий и терминов */}
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

      {/* 9. Официальные первоисточники */}
      <SectionCard title="Официальные первоисточники и материалы">
        <p className="text-xs text-charcoal-600">
          Портал бегового клуба и методические материалы полигона:
        </p>
        <OfficialSourcesList sources={DONINO_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 10. Частые вопросы */}
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
