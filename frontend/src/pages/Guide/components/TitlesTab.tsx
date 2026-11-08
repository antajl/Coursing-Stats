import { useState } from 'react'
import {
  Award,
  CheckCircle2,
  ChevronUp,
  Compass,
  FileText,
  Flag,
  Gauge,
  HelpCircle,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import {
  ABBREVIATIONS,
  COURSING_JUDGING_CRITERIA,
  COURSING_REQUIREMENTS,
  COURSING_TIE_BREAK_STEPS,
  NATIONAL_CHAMPION_VARIANTS,
  OFFICIAL_SOURCES,
  SPORT_BLANKET_COLORS,
  SPORT_CAREER_ROADMAP,
  SPORT_DISCIPLINES,
  SPORT_TIER_ANNUAL_EVENTS,
  SPORT_TIER_CERTIFICATES,
  SPORT_TIER_CUMULATIVE,
} from '../constants'
import { GUIDE_SPORT_TITLES_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

type DemoVariant = 1 | 2 | 3 | 4
type ScenarioMode = 'all' | 'beginner' | 'titles' | 'judging'

const VARIANT_INFO: Record<DemoVariant, { title: string; desc: string }> = {
  1: {
    title: 'Вариант 1: Сценарный переключатель фокуса (Role-Based Lens)',
    desc: 'Разделяет массивную страницу на 3 понятных пользовательских сценария («Новичку», «Титулы», «Судейство»). Страница становится в 3 раза короче и не перегружает деталями.',
  },
  2: {
    title: 'Вариант 2: Липкая панель быстрых переходов (Sticky Jump-Bar)',
    desc: 'Сохраняет все 9 блоков, но закрепляет вверху горизонтальную строку навигации по якорям со скролл-переходом и кнопкой возврата наверх.',
  },
  3: {
    title: 'Вариант 3: Интеллектуальный Spotlight-поиск и подсказки',
    desc: 'Вверху ставится умная поисковая строка и 4 кнопки быстрых вопросов («С какого возраста?», «Схемы НЧ», «Тай-брейк»). Мгновенно фильтрует карточки по запросу.',
  },
  4: {
    title: 'Вариант 4: Архитектурное разделение (Чистый спорт и карьера, 5 блоков)',
    desc: 'Убирает дублирование с вкладкой «Протоколы»: оставляет в состязаниях только маршрут, титулы и схемы НЧ (5 блоков). Техническое судейство живёт в «Протоколах».',
  },
}

export default function TitlesTab() {
  const [demoVariant, setDemoVariant] = useState<DemoVariant>(1)
  const [scenario, setScenario] = useState<ScenarioMode>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Фильтрация для Варианта 3 (Spotlight Search)
  const q = searchQuery.trim().toLowerCase()
  const isMatch = (text: string) => !q || text.toLowerCase().includes(q)

  // Секция 1: Дисциплины
  const renderDisciplines = () => (
    <div id="sec-disciplines">
      <SectionCard title="Две спортивные дисциплины: курсинг и бега борзых">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Официальный спорт борзых в системе РКФ и FCI делится на две принципиально разные дисциплины с раздельными правилами, судейством и титулами:
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2 pt-1">
          {SPORT_DISCIPLINES.map((disc) => (
            <div
              key={disc.id}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2 border-b border-old-money-100 pb-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-camel-100 text-camel-900 shadow-2xs">
                    {disc.id === 'coursing' ? (
                      <Flag className="h-4 w-4" aria-hidden />
                    ) : (
                      <Gauge className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-charcoal-900">{disc.title}</span>
                    <div className="text-[11px] font-medium text-camel-800">{disc.subtitle}</div>
                  </div>
                </div>

                <ul className="mt-3 space-y-2 text-xs text-charcoal-700">
                  <li className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-900 shrink-0">Трасса:</span>
                    <span>{disc.track}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-900 shrink-0">Судейство:</span>
                    <span>{disc.judging}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-3.5 rounded-lg border border-camel-200/90 bg-camel-50/60 p-2.5 text-[11px] font-medium text-camel-950">
                {disc.keyFact}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  // Секция 2: Маршрут
  const renderRoadmap = () => (
    <div id="sec-roadmap">
      <SectionCard title="Пошаговый путь в спорте: от первой тренировки до Чемпиона России">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Понятный маршрут собаки в официальном спорте борзых — как подготовиться, когда сдавать беговой допуск и как расти в званиях:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 pt-1">
          {SPORT_CAREER_ROADMAP.map((step) => (
            <div
              key={step.step}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                  <span className="flex items-center gap-1.5 font-bold text-xs text-charcoal-900 sm:text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camel-100 text-[11px] font-bold text-camel-900">
                      {step.step}
                    </span>
                    {step.title}
                  </span>
                  <span className="rounded bg-cream-100 px-2 py-0.5 text-[10px] font-semibold text-camel-900 border border-camel-200/70">
                    {step.age}
                  </span>
                </div>

                <div className="mt-2.5 text-xs font-semibold text-camel-900">
                  Цель: {step.goal}
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                  {step.action}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-old-money-100">
                <div className="text-[11px] font-medium text-charcoal-600">
                  <span className="font-semibold text-charcoal-900">Итог: </span>
                  {step.result}
                </div>
                <RefTag>{step.ref}</RefTag>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  // Секция 3: Иерархия титулов
  const renderHierarchy = () => (
    <div id="sec-hierarchy">
      <SectionCard title="Иерархия спортивных сертификатов и титулов РКФ">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Все спортивные награды борзых выстроены в естественном порядке от первой квалификационной книжки до высших званий (клик по строке раскроет условия и правила):
        </p>

        <div className="space-y-4 pt-1">
          {/* 1. Допуск и сертификаты */}
          <div className="rounded-xl border border-old-money-200 bg-cream-50/40 p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-old-money-200 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-old-money-100 text-charcoal-800">
                <FileText className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                  1. Базовый старт: беговой допуск и сертификаты состязаний
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Зарабатываются непосредственно в поле или на треке по результатам забегов
                </p>
              </div>
            </div>

            <div className="mt-3">
              <TitleLadderList items={SPORT_TIER_CERTIFICATES} />
            </div>
          </div>

          {/* 2. Главные турниры года */}
          <div className="rounded-xl border border-amber-300/80 bg-amber-50/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-200 text-amber-900">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                  2. Главные турниры года: победы в официальных финалах
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Разыгрываются 1 раз в год. Присуждаются исключительно за 1-е место при норме от 75% баллов
                </p>
              </div>
            </div>

            <div className="mt-3">
              <TitleLadderList items={SPORT_TIER_ANNUAL_EVENTS} />
            </div>
          </div>

          {/* 3. Накопительные карьерные титулы */}
          <div className="rounded-xl border border-camel-300 bg-camel-50/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-camel-200 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-200 text-camel-900">
                <Award className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                  3. Накопительные титулы стабильности и мультиспорт
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Оформляются по сумме побед за карьеру или за объединение спорта и выставок
                </p>
              </div>
            </div>

            <div className="mt-3">
              <TitleLadderList items={SPORT_TIER_CUMULATIVE} />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  // Секция 4: 6 схем НЧ РК
  const renderSchemes = () => (
    <div id="sec-schemes">
      <SectionCard title="6 официальных схем оформления титула «Национальный чемпион по РК» (НЧ РК)">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          С 15.12.2022 титул Чемпиона России набором сертификатов больше не оформляется — вместо него присваивается накопительный титул <strong>НЧ РК</strong> по одной из 6 схем на выбор:
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
          {NATIONAL_CHAMPION_VARIANTS.map((v, idx) => (
            <div
              key={v.combo}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
                  Схема {idx + 1}
                </span>
                <span className="rounded bg-old-money-100 px-2 py-0.5 text-[10px] font-semibold text-charcoal-700">
                  {v.judges}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs font-bold text-camel-900">{v.combo}</div>
              <p className="mt-1 text-[11px] text-charcoal-600">{v.notes}</p>
            </div>
          ))}
        </div>
        <RefTag>Положение РКФ о порядке присвоения титулов по состязаниям, п. 3.3.1</RefTag>
      </SectionCard>
    </div>
  )

  // Секция 5: Судейство в курсинге
  const renderJudging = () => (
    <div id="sec-judging">
      <SectionCard title="Судейство в курсинге: 5 официальных критериев и тай-брейк">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          В курсинге каждый судья оценивает собаку в обоих кругах по 5 нормативным критериям FCI/РКФ (максимум 20 баллов по каждому критерию, до 100 баллов за забег):
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {COURSING_JUDGING_CRITERIA.map((crit) => (
            <div
              key={crit.id}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                <span className="text-xs font-bold text-charcoal-900">
                  {crit.name}
                </span>
                <span className="rounded bg-camel-100 px-2 py-0.5 text-[10px] font-bold text-camel-900">
                  до {crit.maxPoints} б.
                </span>
              </div>
              <div className="mt-1 text-[10px] font-semibold text-camel-700 uppercase tracking-wide">
                {crit.nameEn} · Приоритет № {crit.tieBreakOrder}
              </div>
              <p className="mt-2 text-xs text-charcoal-800 leading-snug">
                {crit.summary}
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-charcoal-500">
                {crit.focus}
              </p>
            </div>
          ))}
        </div>

        {/* Каскад тай-брейка */}
        <div className="mt-3 rounded-xl border border-camel-200/90 bg-cream-50/60 p-4">
          <div className="flex items-center gap-2 border-b border-camel-200/80 pb-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-camel-200 text-camel-900">
              <Scale className="h-3 w-3" aria-hidden />
            </span>
            <h3 className="text-xs font-bold text-charcoal-900 sm:text-sm">
              Как распределяются места при равенстве итоговых баллов (Тай-брейк)
            </h3>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-3 text-xs">
            {COURSING_TIE_BREAK_STEPS.map((step) => (
              <div
                key={step.step}
                className="rounded-lg border border-old-money-200 bg-white p-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-camel-900">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-camel-100 text-[10px]">
                    {step.step}
                  </span>
                  <span>{step.label}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-charcoal-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
          <RefTag>Правила проведения состязаний по курсингу борзых РКФ, п. 7.4.1.5</RefTag>
        </div>
      </SectionCard>
    </div>
  )

  // Секция 6: Памятка участника
  const renderRequirements = () => (
    <div id="sec-requirements">
      <SectionCard title="Памятка участника: регламент, кворум и экипировка">
        <div className="grid gap-3 sm:grid-cols-2">
          {COURSING_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-camel-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                  {req.label}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                  {req.text}
                </p>
              </div>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>

        {/* Цвета попон */}
        <div className="mt-3 rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-charcoal-900 sm:text-sm">
            Официальная цветовая кодировка попон состязаний (РКФ / FCI)
          </h3>
          <p className="mt-1 text-xs text-charcoal-600">
            Судьи и зрители идентифицируют бегущих собак по цвету номеров попон:
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {SPORT_BLANKET_COLORS.map((b) => (
              <div
                key={b.number}
                className="flex flex-col items-center justify-center rounded-lg border p-2 text-center shadow-2xs transition-all"
              >
                <span
                  className={`inline-block rounded border px-2 py-0.5 text-xs font-bold shadow-2xs ${b.badgeClass}`}
                >
                  № {b.number} · {b.name}
                </span>
                <span className="mt-1.5 text-[10px] leading-tight text-charcoal-600 font-medium">
                  {b.desc}
                </span>
              </div>
            ))}
          </div>
          <RefTag>Правила состязаний борзых РКФ, разд. III · п. 3.2</RefTag>
        </div>
      </SectionCard>
    </div>
  )

  // Секция 7: Словарь
  const renderAbbreviations = () => (
    <div id="sec-abbr">
      <SectionCard title="Словарь сокращений и терминов соревнований">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Быстрый поиск по всем спортивным сертификатам, титулам и статусам протоколов:
        </p>
        <AbbreviationsDropdown
          rows={ABBREVIATIONS}
          refTag={<RefTag>Положение РКФ о титулах · Правила состязаний борзых</RefTag>}
        />
      </SectionCard>
    </div>
  )

  // Секция 8: Источники
  const renderSources = () => (
    <div id="sec-sources">
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Нормативные документы РКФ и FCI, регламентирующие проведение состязаний и правила присвоения титулов:
        </p>
        <OfficialSourcesList sources={OFFICIAL_SOURCES} />
      </SectionCard>
    </div>
  )

  // Секция 9: FAQ
  const renderFaqs = () => (
    <div id="sec-faqs">
      <SectionCard title="Частые вопросы о соревнованиях">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_SPORT_TITLES_FAQS.map((faq) => (
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

  return (
    <div className="space-y-6">
      {/* ПАНЕЛЬ ПЕРЕКЛЮЧЕНИЯ ВАРИАНТОВ ДЛЯ ТЕСТИРОВАНИЯ */}
      <div className="sticky top-0 z-30 rounded-xl border border-camel-300 bg-amber-50/95 p-3 shadow-md backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-camel-200 px-2 py-0.5 text-[11px] font-bold text-camel-950 uppercase tracking-wider">
              <Sparkles className="h-3 w-3 text-camel-800" aria-hidden />
              Тест вариантов UX
            </span>
            <span className="text-xs text-charcoal-700 font-medium hidden sm:inline">
              Выберите способ компоновки страницы:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDemoVariant(1)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                demoVariant === 1
                  ? 'bg-camel-700 text-white shadow-xs'
                  : 'bg-white text-charcoal-700 hover:bg-camel-100 border border-camel-200'
              }`}
            >
              1. Сценарный фокус
            </button>
            <button
              type="button"
              onClick={() => setDemoVariant(2)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                demoVariant === 2
                  ? 'bg-camel-700 text-white shadow-xs'
                  : 'bg-white text-charcoal-700 hover:bg-camel-100 border border-camel-200'
              }`}
            >
              2. Липкий Jump-Bar
            </button>
            <button
              type="button"
              onClick={() => setDemoVariant(3)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                demoVariant === 3
                  ? 'bg-camel-700 text-white shadow-xs'
                  : 'bg-white text-charcoal-700 hover:bg-camel-100 border border-camel-200'
              }`}
            >
              3. Spotlight-поиск
            </button>
            <button
              type="button"
              onClick={() => setDemoVariant(4)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                demoVariant === 4
                  ? 'bg-camel-700 text-white shadow-xs'
                  : 'bg-white text-charcoal-700 hover:bg-camel-100 border border-camel-200'
              }`}
            >
              4. Чистый спорт (5 блоков)
            </button>
          </div>
        </div>

        <p className="mt-2 text-xs text-charcoal-700 leading-snug border-t border-camel-200/80 pt-1.5">
          <strong>{VARIANT_INFO[demoVariant].title}:</strong> {VARIANT_INFO[demoVariant].desc}
        </p>
      </div>

      {/* ============================================================== */}
      {/* РЕНДЕР ВАРИАНТА 1: СЦЕНАРНЫЙ ПЕРЕКЛЮЧАТЕЛЬ ФОКУСА (ROLE-BASED) */}
      {/* ============================================================== */}
      {demoVariant === 1 && (
        <div className="space-y-6">
          {/* Сегментный переключатель сценария */}
          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800 mb-2">
              Выберите интересующий сценарий (страница адаптируется под вашу задачу):
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => setScenario('all')}
                className={`rounded-lg p-2.5 text-left text-xs transition-all cursor-pointer border ${
                  scenario === 'all'
                    ? 'border-camel-500 bg-camel-100/80 font-bold text-camel-950 shadow-2xs'
                    : 'border-old-money-200 bg-white text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                <div className="font-bold">Все разделы</div>
                <div className="text-[10px] text-charcoal-500 font-normal">Полный справочник (9)</div>
              </button>

              <button
                type="button"
                onClick={() => setScenario('beginner')}
                className={`rounded-lg p-2.5 text-left text-xs transition-all cursor-pointer border ${
                  scenario === 'beginner'
                    ? 'border-camel-500 bg-camel-100/80 font-bold text-camel-950 shadow-2xs'
                    : 'border-old-money-200 bg-white text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                <div className="font-bold text-emerald-900">Новичку в спорте</div>
                <div className="text-[10px] text-charcoal-500 font-normal">Старт, допуск, книжка</div>
              </button>

              <button
                type="button"
                onClick={() => setScenario('titles')}
                className={`rounded-lg p-2.5 text-left text-xs transition-all cursor-pointer border ${
                  scenario === 'titles'
                    ? 'border-camel-500 bg-camel-100/80 font-bold text-camel-950 shadow-2xs'
                    : 'border-old-money-200 bg-white text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                <div className="font-bold text-amber-900">Титулы и схемы НЧ</div>
                <div className="text-[10px] text-charcoal-500 font-normal">CACL, 6 схем НЧ, FCI</div>
              </button>

              <button
                type="button"
                onClick={() => setScenario('judging')}
                className={`rounded-lg p-2.5 text-left text-xs transition-all cursor-pointer border ${
                  scenario === 'judging'
                    ? 'border-camel-500 bg-camel-100/80 font-bold text-camel-950 shadow-2xs'
                    : 'border-old-money-200 bg-white text-charcoal-700 hover:bg-cream-50'
                }`}
              >
                <div className="font-bold text-blue-900">Судейство и правила</div>
                <div className="text-[10px] text-charcoal-500 font-normal">5 критериев, тай-брейк</div>
              </button>
            </div>
          </div>

          {/* Отображение выбранных блоков */}
          {(scenario === 'all' || scenario === 'beginner') && renderDisciplines()}
          {(scenario === 'all' || scenario === 'beginner') && renderRoadmap()}
          {(scenario === 'all' || scenario === 'titles') && renderHierarchy()}
          {(scenario === 'all' || scenario === 'titles') && renderSchemes()}
          {(scenario === 'all' || scenario === 'judging') && renderJudging()}
          {(scenario === 'all' || scenario === 'beginner' || scenario === 'judging') && renderRequirements()}
          {(scenario === 'all' || scenario === 'judging') && renderAbbreviations()}
          {(scenario === 'all' || scenario === 'titles') && renderSources()}
          {(scenario === 'all' || scenario === 'beginner') && renderFaqs()}
        </div>
      )}

      {/* ============================================================== */}
      {/* РЕНДЕР ВАРИАНТА 2: ЛИПКАЯ ПАНЕЛЬ БЫСТРЫХ ПЕРЕХОДОВ (JUMP-BAR) */}
      {/* ============================================================== */}
      {demoVariant === 2 && (
        <div className="space-y-6">
          {/* Липкая панель якорей */}
          <div className="sticky top-20 z-20 -mx-1 rounded-xl border border-old-money-200 bg-white/95 p-2 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 pl-1">
                Перейти:
              </span>
              <button
                type="button"
                onClick={() => scrollToSection('sec-disciplines')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Дисциплины
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-roadmap')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Маршрут (4 шага)
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-hierarchy')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Титулы РКФ
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-schemes')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                6 схем НЧ РК
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-judging')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Судейство (5 качеств)
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-requirements')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Памятка и попоны
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-abbr')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Словарь
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-sources')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                Регламенты
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('sec-faqs')}
                className="shrink-0 rounded-md bg-cream-50 px-2.5 py-1 font-semibold text-charcoal-700 hover:bg-camel-100 hover:text-camel-900 border border-old-money-200 transition-colors"
              >
                FAQ
              </button>
            </div>
          </div>

          {/* Все 9 блоков подряд */}
          {renderDisciplines()}
          {renderRoadmap()}
          {renderHierarchy()}
          {renderSchemes()}
          {renderJudging()}
          {renderRequirements()}
          {renderAbbreviations()}
          {renderSources()}
          {renderFaqs()}

          {/* Плавающая кнопка Наверх */}
          <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-camel-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Вернуться к началу страницы"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* РЕНДЕР ВАРИАНТА 3: SPOTLIGHT-ПОИСК И БЫСТРЫЕ ВОПРОСЫ           */}
      {/* ============================================================== */}
      {demoVariant === 3 && (
        <div className="space-y-6">
          {/* Интерактивная поисковая шапка */}
          <div className="rounded-xl border border-camel-300 bg-white p-4 shadow-sm">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-charcoal-400">
                <Search className="h-4 w-4" aria-hidden />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Быстрый поиск по состязаниям (например: возраст, кворум, переход CACL, намордник, ВС)..."
                className="w-full rounded-lg border border-old-money-200 bg-white py-2.5 pl-10 pr-9 text-xs sm:text-sm font-medium text-charcoal-800 placeholder-charcoal-400 shadow-2xs transition-colors hover:border-camel-300 focus:border-camel-400 focus:outline-none focus:ring-1 focus:ring-camel-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
                  aria-label="Очистить поиск"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Быстрые подсказки */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-charcoal-500 font-medium mr-1">Частые вопросы:</span>
              <button
                type="button"
                onClick={() => setSearchQuery('возраст')}
                className="rounded-full border border-old-money-200 bg-cream-50 px-2.5 py-1 text-[11px] font-medium text-charcoal-700 hover:border-camel-300 hover:bg-camel-50 cursor-pointer"
              >
                С какого возраста можно бегать?
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('кворум')}
                className="rounded-full border border-old-money-200 bg-cream-50 px-2.5 py-1 text-[11px] font-medium text-charcoal-700 hover:border-camel-300 hover:bg-camel-50 cursor-pointer"
              >
                Что такое кворум?
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('переход')}
                className="rounded-full border border-old-money-200 bg-cream-50 px-2.5 py-1 text-[11px] font-medium text-charcoal-700 hover:border-camel-300 hover:bg-camel-50 cursor-pointer"
              >
                Как сертификат CACL переходит 2-му месту?
              </button>
              <button
                type="button"
                onClick={() => setSearchQuery('тай-брейк')}
                className="rounded-full border border-old-money-200 bg-cream-50 px-2.5 py-1 text-[11px] font-medium text-charcoal-700 hover:border-camel-300 hover:bg-camel-50 cursor-pointer"
              >
                Как решается ничья в курсинге?
              </button>
            </div>
          </div>

          {/* Результаты фильтрации */}
          {searchQuery ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-charcoal-600 px-1">
                <span>
                  Показаны блоки, содержащие «<strong className="text-charcoal-900">{searchQuery}</strong>»:
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="font-bold text-camel-700 hover:underline cursor-pointer"
                >
                  Сбросить и показать всё
                </button>
              </div>

              {(isMatch('курсинг') || isMatch('бега') || isMatch('дисциплин')) && renderDisciplines()}
              {(isMatch('маршрут') || isMatch('возраст') || isMatch('допуск') || isMatch('книжк')) && renderRoadmap()}
              {(isMatch('титул') || isMatch('cacl') || isMatch('cacil') || isMatch('иерархи')) && renderHierarchy()}
              {(isMatch('нч рк') || isMatch('схем') || isMatch('набор')) && renderSchemes()}
              {(isMatch('судейств') || isMatch('балл') || isMatch('маневренност') || isMatch('тай-брейк')) && renderJudging()}
              {(isMatch('кворум') || isMatch('попон') || isMatch('намордник') || isMatch('переход') || isMatch('вс')) && renderRequirements()}
              {isMatch('сокращен') && renderAbbreviations()}
              {isMatch('регламент') && renderSources()}
              {renderFaqs()}
            </div>
          ) : (
            <div className="space-y-6">
              {renderDisciplines()}
              {renderRoadmap()}
              {renderHierarchy()}
              {renderSchemes()}
              {renderJudging()}
              {renderRequirements()}
              {renderAbbreviations()}
              {renderSources()}
              {renderFaqs()}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* РЕНДЕР ВАРИАНТА 4: ЧИСТЫЙ СПОРТ И КАРЬЕРА (5 БЛОКОВ)           */}
      {/* ============================================================== */}
      {demoVariant === 4 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-camel-200 bg-camel-50/60 p-3.5 text-xs text-charcoal-700">
            <strong>Архитектурная чистота:</strong> Вкладка «Соревнования» фокусируется исключительно на спортивной карьере, сертификатах и титулах (всего 5 блоков). Вся техническая судейская часть (5 критериев, тай-брейк, цвета попон и чеклисты протоколов) живёт в соседней вкладке <strong>«Протоколы»</strong>.
          </div>

          {renderDisciplines()}
          {renderRoadmap()}
          {renderHierarchy()}
          {renderSchemes()}
          {renderSources()}
          {renderFaqs()}
        </div>
      )}
    </div>
  )
}
