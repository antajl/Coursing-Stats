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
  Info,
  Lightbulb,
  Lock,
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
import { DISQUALIFICATION_RULES } from '../protocolConstants'
import { executeSmartGuideSearch } from '../smartSearch'
import {
  AbbreviationsDropdown,
  GuideTopicsTicker,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

const POPULAR_QUERIES = [
  { label: 'Как читать строку протокола?', query: 'как читать протокол анатомия строки норма вс' },
  { label: 'С какого возраста можно бегать?', query: 'со скольки месяцев возраст' },
  { label: 'Что такое кворум и как делят по полу?', query: 'кворум минимум собак кобели и суки' },
  { label: 'Переход сертификата CACL со 2-го места', query: 'переход r.cacl второе место' },
  { label: '6 схем оформления титула НЧ РК', query: '6 схем нч рк набор сертификатов' },
  { label: '5 критериев судейства (100 баллов)', query: '5 критериев судейства маневренность' },
  { label: 'Как решается ничья (тай-брейк)', query: 'тай-брейк равные баллы ничья' },
  { label: 'Беговой намордник и цвета попон', query: 'намордник попона экипировка' },
  { label: 'Что означает отметка «ВС»?', query: 'норма вс высшая квалификация 66.7' },
  { label: 'В чём разница: курсинг и бега?', query: 'разница курсинг и бега отличие' },
] as const

type ProtocolColKey = 'catalog' | 'dog' | 'heat1' | 'heat2' | 'sum' | 'placement'

const COL_EXPLANATIONS: Record<ProtocolColKey, { title: string; desc: string }> = {
  catalog: {
    title: '№ по каталогу состязания',
    desc: 'Порядковый номер собаки в официальном каталоге турнира. По каталожному номеру формируется жеребьёвка забегов 1-го круга.',
  },
  dog: {
    title: 'Кличка собаки и владелец',
    desc: 'Официальное имя собаки по документам РКФ/FCI (с приоритетом кириллического написания), номер родословной и фамилия владельца.',
  },
  heat1: {
    title: '1 круг: цвет попоны и баллы судей',
    desc: 'В курсинге используются 2 попоны: Красная (№ 1) и Белая (№ 2). Балл — сумма оценок всех судей за первый пуск. Барьер допуска ко 2-му кругу — не менее 50% баллов.',
  },
  heat2: {
    title: '2 круг: смена напарника и трассы',
    desc: 'Во втором круге меняется конфигурация траектории и напарник. Баллы 2-го круга имеют решающее значение при равенстве итоговой суммы.',
  },
  sum: {
    title: 'Итог Σ (прямая сумма) и знак [ВС]',
    desc: 'Прямая сумма баллов всех судей за оба круга без деления. Золотистый бейдж [ВС] означает выполнение нормы Высшей квалификации (≥ 66,7% от максимума).',
  },
  placement: {
    title: 'Итоговое место и сертификат [CACL]',
    desc: 'Занятое место в породе/полу. Сертификат кандидата в чемпионы [CACL] присуждается 1-му месту только при одновременном наличии знака [ВС] и кворума от 3 собак.',
  },
}

export default function TitlesTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [activeCol, setActiveCol] = useState<ProtocolColKey>('sum')

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

  // 7. Анатомия протокола и квалификационные барьеры
  const renderProtocol = () => (
    <div id="sec-protocol" className="space-y-6">
      <SectionCard title="Анатомия строки протокола соревнований">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Нажмите на любую ячейку образца протокола, чтобы увидеть подробное объяснение колонки:
        </p>

        <div className="rounded-xl border border-camel-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[640px] font-sans text-xs">
              {/* Шапка примера */}
              <div className="grid grid-cols-12 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-old-money-100">
                <span className="col-span-1">№</span>
                <span className="col-span-4">Кличка собаки</span>
                <span className="col-span-2 text-center">1 круг</span>
                <span className="col-span-2 text-center">2 круг</span>
                <span className="col-span-2 text-center">Итог Σ</span>
                <span className="col-span-1 text-right">Место</span>
              </div>

              {/* Строка примера с интерактивными кнопками */}
              <div className="grid grid-cols-12 items-center py-2.5 font-medium text-charcoal-900 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveCol('catalog')}
                  className={`col-span-1 text-left font-mono font-bold p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'catalog'
                      ? 'bg-camel-100 text-camel-950 ring-1 ring-camel-400'
                      : 'text-charcoal-500 hover:bg-old-money-50'
                  }`}
                >
                  12
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('dog')}
                  className={`col-span-4 min-w-0 pr-2 text-left p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'dog'
                      ? 'bg-camel-100 text-camel-950 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <div className="font-bold text-charcoal-900 truncate">ДИОНИС ДЕЛАНЖЕЛ</div>
                  <div className="text-[10px] text-charcoal-500 font-normal truncate">РКФ 5829104 · вл. Иванова А.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('heat1')}
                  className={`col-span-2 flex items-center justify-center gap-1.5 font-mono text-[11px] p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'heat1'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-900 text-[10px]">Красн.</span>
                  <span>89 б.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('heat2')}
                  className={`col-span-2 flex items-center justify-center gap-1.5 font-mono text-[11px] p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'heat2'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="rounded border border-old-money-300 bg-white px-1.5 py-0.5 font-bold text-charcoal-800 text-[10px]">Бел.</span>
                  <span>90 б.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('sum')}
                  className={`col-span-2 flex items-center justify-center gap-1 font-mono p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'sum'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="font-bold text-sm text-charcoal-900">179</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-2xs">ВС</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('placement')}
                  className={`col-span-1 text-right p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'placement'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="inline-flex items-center rounded-md bg-camel-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-camel-950 whitespace-nowrap">
                    1 [CACL]
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Интерактивная плашка-подсказка выбранной ячейки */}
          <div className="mt-3 rounded-lg border border-camel-200 bg-camel-50/70 p-3 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-camel-950">
              <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>{COL_EXPLANATIONS[activeCol].title}</span>
            </div>
            <p className="mt-1 text-xs text-charcoal-700 leading-relaxed">
              {COL_EXPLANATIONS[activeCol].desc}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Шкала квалификационных барьеров соревнований */}
      <SectionCard title="Шкала квалификационных барьеров соревнований">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Процент набранных баллов от максимальной суммы состязаний (по Правилам курсинга РКФ):
        </p>

        <div className="grid gap-2 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Барьер 1 круга
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">&lt; 50% баллов</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Сход со состязаний: собака не допускается ко 2-му забегу.
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Проходной зачёт
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">50 – 66,6%</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Оценки «Удовлетворительно» и «Хорошо». Норматив ВС не выполнен.
            </p>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Высшая квалификация
            </div>
            <div className="mt-1 text-sm font-bold text-amber-950">≥ 66,7% (Норма ВС)</div>
            <p className="mt-1 text-[11px] text-amber-900 leading-snug">
              Обязательное условие для получения титульных сертификатов CACL/CACIL.
            </p>
          </div>

          <div className="rounded-xl border border-camel-300 bg-camel-100/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-900">
              Высший эталон
            </div>
            <div className="mt-1 text-sm font-bold text-camel-950">≥ 75% («Отлично»)</div>
            <p className="mt-1 text-[11px] text-camel-900 leading-snug">
              Безупречная работа; норматив победы на Чемпионате России (ЧР РК).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Острый вопрос: почему 1 место без CACL? */}
      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-200 text-amber-900 shrink-0">
            <Lock className="h-3.5 w-3.5" aria-hidden />
          </span>
          <h3 className="font-serif text-sm font-bold text-amber-950 sm:text-base">
            Почему собака заняла 1-е место, но не получила сертификат CACL?
          </h3>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-charcoal-800">
          Для присуждения чемпионского сертификата CACL или CACIL победителю недостаточно просто опередить соперников. Регламент РКФ требует одновременного выполнения двух обязательных условий:
        </p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
              Условие 1 · Квалификационный балл ВС
            </div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Собака обязана набрать не менее 50% баллов в 1-м круге и не менее <strong>66,7% (⅔)</strong> от максимальной суммы по итогам двух кругов. Если балл ниже — CACL не выдаётся.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
              Условие 2 · Официальный кворум
            </div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              В породе на старт обязаны выйти <strong>не менее 3 собак</strong> (или 3 собак одного пола при раздельном забеге). При 1 или 2 участниках присуждается только место без CACL.
            </p>
          </div>
        </div>
      </div>

      {/* Статусы сходов и накопительные дисквалификации */}
      <SectionCard title="Статусы вне зачёта и накопительные дисквалификации">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Причины отсутствия баллов в протоколе и шкала санкций за агрессию или помеху напарнику:
        </p>

        <div className="grid gap-2 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-charcoal-800">DNS</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Did Not Start</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Неявка на старт забега к моменту пуска.</p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-amber-800">DNF</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Did Not Finish</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Сход с дистанции или прекращение преследования.</p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-sky-800">INJ</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Injured</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Снятие ветеринарным врачом из-за травмы.</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-rose-800">DISQ</span>
            <div className="mt-0.5 text-xs font-semibold text-rose-950">Дисквалификация</div>
            <p className="mt-1 text-[11px] text-rose-900">Агрессия или умышленная помеха напарнику.</p>
          </div>
        </div>

        <div className="mt-3.5 rounded-xl border border-rose-200 bg-white p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-charcoal-900">Накопительные санкции за дисквалификацию (РКФ):</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
            {DISQUALIFICATION_RULES.map((d) => (
              <div key={d.step} className="rounded-lg border border-old-money-200 bg-old-money-50/50 p-2.5">
                <div className="font-semibold text-charcoal-900">{d.step}:</div>
                <div className="font-medium text-rose-800 mt-0.5">{d.sanction}</div>
                <p className="mt-0.5 text-[11px] text-charcoal-600 leading-snug">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  )

  // 8. Словарь
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

        {/* Бесконечно движущаяся строка частых вопросов в 1 ряд */}
        <GuideTopicsTicker
          items={POPULAR_QUERIES}
          onSelect={(query) => setSearchQuery(query)}
        />
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
      {isSectionVisible('sec-protocol') && renderProtocol()}
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
