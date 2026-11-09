import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  Compass,
  ExternalLink,
  Flag,
  Gauge,
  Layers,
  MapPin,
  Ruler,
  Sparkles,
  Timer,
  Trophy,
} from 'lucide-react'
import {
  DONINO_ABBREVIATIONS,
  DONINO_BENCHMARKS,
  DONINO_HEIGHT_CLASSES,
  DONINO_OFFICIAL_SOURCES,
  DONINO_REQUIREMENTS,
  DONINO_SPEED_LADDER,
  DONINO_TRACK_TECH,
} from '../doninoConstants'
import {
  BREED_SPEEDS_DATA,
  SPEED_CATEGORY_FILTERS,
  type BreedSpeedCategory,
} from '../speedConstants'
import { GUIDE_DONINO_FAQS, GUIDE_SPEEDS_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

const ALL_SPEEDS_DONINO_FAQS = [...GUIDE_SPEEDS_FAQS, ...GUIDE_DONINO_FAQS]

export default function DoninoTab() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | BreedSpeedCategory>('all')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const maxSpeed = 75 // Базис для 100% шкалы

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredBreeds = useMemo(() => {
    if (selectedCategory === 'all') return BREED_SPEEDS_DATA
    return BREED_SPEEDS_DATA.filter((item) => item.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="space-y-6">
      {/* 1. Фильтр категорий пород */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-old-money-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-800">
            <Gauge className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-xs font-bold text-charcoal-900">Категория пород:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SPEED_CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'border border-camel-400 bg-camel-100 text-camel-950 font-bold shadow-2xs'
                    : 'border border-old-money-200 bg-white text-charcoal-700 hover:border-camel-300 hover:text-camel-900'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-camel-200 text-camel-900' : 'bg-old-money-100 text-charcoal-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Сравнительная шкала максимальной скорости */}
      <SectionCard
        title={`Сравнительная шкала максимальной скорости (${filteredBreeds.length} из ${BREED_SPEEDS_DATA.length} пород)`}
      >
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Пиковая скорость прямого спринта по данным официальных радарных замеров и Книги рекордов Гиннесса:
        </p>

        <div className="space-y-2.5 pt-2">
          {filteredBreeds.map((item) => {
            const pct = Math.round((item.peakSpeedNum / maxSpeed) * 100)
            return (
              <div key={item.breed} className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-900 pb-1.5">
                  <span className="truncate pr-2">{item.breed}</span>
                  <span className="font-mono text-camel-900 shrink-0">{item.peakSprint}</span>
                </div>

                {/* Полоса прогресса */}
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-old-money-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-camel-300 via-camel-500 to-camel-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-charcoal-500 font-medium">
                  <span>{item.specialty}</span>
                  <span>Трек РКФ: {item.rkfTrackAvg.split(' ')[0]}</span>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* 3. Подробные карточки пород */}
      <SectionCard
        title={`Рекорды и особенности пород борзых (${filteredBreeds.length})`}
      >
        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          {filteredBreeds.map((item) => (
            <div
              key={item.breed}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs transition-shadow hover:shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-old-money-100 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-charcoal-900">{item.breed}</h3>
                    <div className="mt-0.5 text-[11px] font-semibold text-camel-800">
                      {item.specialty}
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-md bg-camel-50 px-2 py-0.5 text-xs font-bold text-camel-900 border border-camel-200/80 shrink-0">
                    <Gauge className="h-3 w-3 text-camel-700" aria-hidden />
                    {item.peakSprint}
                  </span>
                </div>

                <p className="mt-2.5 text-xs leading-relaxed text-charcoal-700">
                  {item.description}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-old-money-100 pt-2.5 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <Timer className="mt-0.5 h-3 w-3 flex-shrink-0 text-charcoal-500" aria-hidden />
                    <div>
                      <span className="font-semibold text-charcoal-800">Радар Донино:</span>{' '}
                      <span className="text-charcoal-700">{item.doninoRadar}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Trophy className="mt-0.5 h-3 w-3 flex-shrink-0 text-camel-700" aria-hidden />
                    <div>
                      <span className="font-semibold text-charcoal-800">Трек РКФ:</span>{' '}
                      <span className="text-charcoal-700">{item.rkfTrackAvg}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 flex flex-wrap items-center gap-3 border-t border-old-money-100/80 pt-2 text-xs font-medium">
                <Link
                  to={item.competitionsUrl}
                  className="inline-flex items-center gap-1 text-camel-700 underline decoration-camel-300 underline-offset-2 transition-colors hover:text-camel-800"
                >
                  Забеги породы
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </Link>
                {item.doninoRadar !== '—' && (
                  <Link
                    to={item.doninoUrl}
                    className="inline-flex items-center gap-1 text-charcoal-600 underline decoration-charcoal-300 underline-offset-2 transition-colors hover:text-charcoal-800"
                  >
                    Замеры в Донино
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Визитная карточка бегового комплекса в Донино */}
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

      {/* 5. Иерархия соревновательных лиг чемпионата */}
      <SectionCard title="Иерархия соревновательных лиг в Донино">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Официальная система лиг клубного чемпионата по рейсингу в Донино (клик по строке раскроет правила допуска и переходов между лигами):
        </p>

        <TitleLadderList items={DONINO_SPEED_LADDER} />
      </SectionCard>

      {/* 6. Скоростные ориентиры 350 м по породам */}
      <SectionCard title="Скоростные ориентиры и эталонные времена 350 м">
        <p className="text-xs text-charcoal-600 sm:text-sm">
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

      {/* 7. Ростовые промеры */}
      <SectionCard title="Ростовые классы для уиппетов и левреток (промеры в холке)">
        <p className="text-xs text-charcoal-600 sm:text-sm">
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

      {/* 8. Анатомия начисления баллов Чемпионата Донино */}
      <SectionCard title="Анатомия начисления баллов Чемпионата Донино">
        <p className="text-xs text-charcoal-600 sm:text-sm">
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
            to="/donino/championship/"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-camel-400 bg-camel-100 px-3 py-1.5 text-xs font-semibold text-camel-950 shadow-2xs transition-colors hover:bg-camel-200/80"
          >
            <Award className="h-3.5 w-3.5 text-camel-800" aria-hidden />
            <span>Рейтинг чемпионата</span>
            <ChevronRight className="h-3.5 w-3.5 text-camel-700 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            to="/donino/analytics/"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-2xs transition-colors hover:border-camel-300 hover:text-camel-800"
          >
            <BarChart3 className="h-3.5 w-3.5 text-charcoal-600" aria-hidden />
            <span>Аналитика и динамика лиг</span>
            <ChevronRight className="h-3.5 w-3.5 text-charcoal-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            to="/speed-records/"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-2xs transition-colors hover:border-camel-300 hover:text-camel-800"
          >
            <Gauge className="h-3.5 w-3.5 text-charcoal-600" aria-hidden />
            <span>Таблицы рекордов скорости</span>
            <ChevronRight className="h-3.5 w-3.5 text-charcoal-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </SectionCard>

      {/* 9. Техническое устройство комплекса */}
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

      {/* 10. Ключевые правила и регламент (Памятка участника) */}
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

      {/* 11. Словарь понятий и терминов */}
      <SectionCard title="Словарь понятий и обозначений полигона">
        <p className="text-xs text-charcoal-600 sm:text-sm">
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

      {/* 12. Официальные первоисточники */}
      <SectionCard title="Официальные первоисточники и материалы">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Портал бегового клуба и методические материалы полигона:
        </p>
        <OfficialSourcesList sources={DONINO_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 13. Частые вопросы */}
      <SectionCard title="Частые вопросы о скорости и Донино">
        <dl className="space-y-3 sm:space-y-3.5">
          {ALL_SPEEDS_DONINO_FAQS.map((faq) => (
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

      {/* ПЛАВАЮЩАЯ ЛИПКАЯ КНОПКА «НАВЕРХ» */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-camel-800 text-white shadow-xl border border-camel-600/50 transition-all hover:bg-camel-900 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Вернуться к началу страницы"
          title="Наверх"
        >
          <ChevronUp className="h-6 w-6" aria-hidden />
        </button>
      )}
    </div>
  )
}
