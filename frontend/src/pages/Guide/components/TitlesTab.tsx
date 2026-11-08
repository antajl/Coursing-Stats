import { useEffect, useMemo, useState } from 'react'
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  Compass,
  FileText,
  Flag,
  Gauge,
  HelpCircle,
  Lightbulb,
  Scale,
  Search,
  ShieldCheck,
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
import { executeSmartGuideSearch } from '../smartSearch'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

const POPULAR_QUERIES = [
  { label: 'С какого возраста можно бегать?', query: 'со скольки месяцев возраст' },
  { label: 'Что такое кворум и как делят по полу?', query: 'кворум минимум собак кобели и суки' },
  { label: 'Переход сертификата CACL со 2-го места', query: 'переход r.cacl второе место' },
  { label: 'Как закрыть титул НЧ РК (6 схем)', query: '6 схем нч рк набор сертификатов' },
  { label: 'Как решается ничья (тай-брейк)', query: 'тай-брейк равные баллы ничья' },
  { label: 'Беговой намордник и цвета попон', query: 'намордник попона экипировка' },
  { label: 'Что означает отметка «ВС»?', query: 'норма вс высшая квалификация 66.7' },
] as const

export default function TitlesTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Отслеживание скролла для плавающей кнопки «Наверх»
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Интеллектуальный поиск с раскладками, опечатками и стеммингом
  const searchResult = useMemo(
    () => executeSmartGuideSearch(searchQuery),
    [searchQuery]
  )

  const isSearching = searchQuery.trim().length > 0
  const isSectionVisible = (secId: string) =>
    !isSearching || searchResult.matchedSectionIds.has(secId)

  // 1. Две спортивные дисциплины
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

  // 2. Пошаговый путь
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

  // 3. Иерархия наград в 3 логических блоках
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

  // 4. 6 схем оформления НЧ РК
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

  // 5. Судейство в курсинге
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

  // 6. Памятка участника
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

  // 7. Словарь
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

  // 8. Источники
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

  // 9. FAQ
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
      {/* ИНТЕЛЛЕКТУАЛЬНЫЙ ПОИСК В ШАПКЕ */}
      <div className="rounded-2xl border border-camel-200 bg-linear-to-b from-white to-cream-50/70 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-100 text-camel-900">
              <Search className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-xs sm:text-sm font-bold text-charcoal-900">
              Умный поиск по правилам, регламентам и титулам
            </span>
          </div>
          <span className="text-[11px] font-medium text-charcoal-500 hidden sm:inline">
            Устойчив к опечаткам, окончаниям и смене раскладки
          </span>
        </div>

        {/* Поисковое поле ввода */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-charcoal-400">
            <Search className="h-4 w-4" aria-hidden />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Задайте вопрос или введите слово (например: возраст, кворум, переход CACL, намордник, ничья)..."
            className="w-full rounded-xl border border-old-money-200 bg-white py-3 pl-10 pr-10 text-xs sm:text-sm font-medium text-charcoal-800 placeholder-charcoal-400 shadow-2xs transition-all hover:border-camel-300 focus:border-camel-400 focus:outline-none focus:ring-2 focus:ring-camel-400/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              aria-label="Очистить поиск"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Быстрые чипы частых вопросов */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-charcoal-500 font-medium mr-0.5">Частые темы:</span>
          {POPULAR_QUERIES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setSearchQuery(item.query)}
              className="rounded-full border border-old-money-200 bg-white px-2.5 py-1 text-[11px] font-medium text-charcoal-700 hover:border-camel-300 hover:bg-camel-50 hover:text-camel-900 transition-all cursor-pointer shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ПРЯМОЙ ОТВЕТ НА ВОПРОС (DIRECT ANSWER CARD) */}
      {searchResult.matchedDirectAnswer && (
        <div className="rounded-2xl border-2 border-amber-300 bg-linear-to-r from-amber-50/90 via-cream-50/80 to-amber-50/90 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-amber-950 shadow-2xs">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Быстрый ответ по регламенту: {searchResult.matchedDirectAnswer.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection(searchResult.matchedDirectAnswer!.targetSectionId)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-camel-800 hover:text-camel-950 underline underline-offset-2 cursor-pointer"
            >
              <span>К разделу</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <p className="mt-2.5 text-xs sm:text-sm font-medium text-charcoal-800 leading-relaxed">
            {searchResult.matchedDirectAnswer.shortAnswer}
          </p>

          <ul className="mt-2.5 space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-charcoal-700 leading-relaxed">
            {searchResult.matchedDirectAnswer.bulletPoints.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>

          <div className="mt-3 pt-2 border-t border-amber-200/70 text-[11px] text-amber-900 font-medium">
            Официальный первоисточник: {searchResult.matchedDirectAnswer.officialRef}
          </div>
        </div>
      )}

      {/* СТРОКА РЕЗУЛЬТАТОВ ПОИСКА ПРИ АКТИВНОМ ЗАПРОСЕ */}
      {isSearching && (
        <div className="flex items-center justify-between text-xs text-charcoal-600 px-1 border-b border-old-money-100 pb-2">
          <span>
            Показаны релевантные разделы по запросу «<strong className="text-charcoal-900">{searchQuery}</strong>»
            {searchResult.matchedSectionIds.size > 0 && ` (найдено разделов: ${searchResult.matchedSectionIds.size})`}:
          </span>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="font-bold text-camel-700 hover:text-camel-800 hover:underline cursor-pointer"
          >
            Сбросить и показать всё
          </button>
        </div>
      )}

      {/* ОТОБРАЖЕНИЕ РАЗДЕЛОВ (ЕСЛИ ИЩЕМ — ФИЛЬТРУЕМ, ИНАЧЕ ПОЛНЫЙ ВИД) */}
      {isSectionVisible('sec-disciplines') && renderDisciplines()}
      {isSectionVisible('sec-roadmap') && renderRoadmap()}
      {isSectionVisible('sec-hierarchy') && renderHierarchy()}
      {isSectionVisible('sec-schemes') && renderSchemes()}
      {isSectionVisible('sec-judging') && renderJudging()}
      {isSectionVisible('sec-requirements') && renderRequirements()}
      {isSectionVisible('sec-abbr') && renderAbbreviations()}
      {isSectionVisible('sec-sources') && renderSources()}
      {isSectionVisible('sec-faqs') && renderFaqs()}

      {/* ЕСЛИ СОВСЕМ НИЧЕГО НЕ НАЙДЕНО */}
      {isSearching && searchResult.matchedSectionIds.size === 0 && !searchResult.matchedDirectAnswer && (
        <div className="rounded-2xl border border-dashed border-old-money-200 bg-cream-50/50 p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-charcoal-400 mb-2" aria-hidden />
          <h3 className="text-sm font-bold text-charcoal-800">
            Ничего не найдено по запросу «{searchQuery}»
          </h3>
          <p className="mt-1 text-xs text-charcoal-600 max-w-md mx-auto">
            Попробуйте задать вопрос иначе или выберите одну из популярных тем: возраст, кворум, переход CACL, намордник, 6 схем НЧ РК.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 inline-flex items-center rounded-lg bg-camel-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-camel-800 transition-colors cursor-pointer"
          >
            Показать полный справочник
          </button>
        </div>
      )}

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
