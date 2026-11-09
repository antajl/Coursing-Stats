import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  Search,
  X,
} from 'lucide-react'
import {
  SHOW_ABBREVIATIONS,
  SHOW_CAREER_TITLES,
  SHOW_CLASSES,
  SHOW_GRADES,
  SHOW_OFFICIAL_SOURCES,
  SHOW_RANKS,
  SHOW_REQUIREMENTS,
  SHOW_RING_AWARDS,
} from '../showConstants'
import { GUIDE_SHOWS_FAQS } from '../guideFaqs'
import { executeSmartShowSearch } from '../smartShowSearch'
import {
  AbbreviationsDropdown,
  GuideTopicsTicker,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

const SHOW_POPULAR_QUERIES = [
  { label: 'С какого возраста бэби и щенки?', query: 'со скольки месяцев возраст бэби щенки' },
  { label: 'Разница между CAC и CACIB', query: 'разница cac и cacib отличие' },
  { label: 'Как закрыть Чемпиона России (ЧР)?', query: 'как закрыть чемпиона россии чр 4 cac 6 cac' },
  { label: 'Кто выходит в сравнение на BOB и BOS?', query: 'кто выходит в сравнение на bob и bos лпп' },
  { label: 'Главный ринг: Best in Show (BIS)', query: 'главный ринг best in show bis big финал' },
  { label: 'Цвета наградных лент РКФ', query: 'цвета лент красная синяя отлично оценки' },
  { label: 'Ранги выставок (CACIB / ЧРКФ ОС / ЧФ)', query: 'ранги выставок cacib чркф ос cac чф' },
  { label: 'Юный чемпион России (ЮЧР)', query: 'юный чемпион россии ючр jcac 3 jcac' },
  { label: 'Резервный R.CAC: когда переходит?', query: 'переход r.cac r.cacib второе место' },
] as const

export default function ShowsTab() {
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

  // Интеллектуальный поиск с раскладками, опечатками, стоп-словами и интентами
  const searchResult = useMemo(
    () => executeSmartShowSearch(searchQuery),
    [searchQuery]
  )

  const isSearching = searchQuery.trim().length > 0
  const isSectionVisible = (secId: string) =>
    !isSearching || searchResult.matchedSectionIds.has(secId)

  // 1. Пошаговый роадмап ринга одного дня
  const renderRoadmap = () => (
    <div id="sec-show-roadmap">
      <SectionCard title="Роадмап выставки: путь от класса до Best in Show">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Как устроена официальная последовательность сравнений на выставке РКФ одного дня:
        </p>

        <div className="grid gap-2 sm:grid-cols-5 pt-1">
          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Шаг 1 · Класс
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">CW (Победитель)</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              1-е место в своём классе с высшей оценкой «отлично».
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Шаг 2 · Сертификат
            </div>
            <div className="mt-1 text-sm font-bold text-camel-900">CAC / CACIB</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Сравнение победителей взрослых классов между кобелями и суками.
            </p>
          </div>

          <div className="rounded-xl border border-camel-200 bg-camel-50/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-800">
              Шаг 3 · Порода
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">BOB (ЛПП) / BOS</div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Сравнение лучшего юниора, кобеля, суки и ветерана за звание лучшего в породе.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Шаг 4 · Группа FCI
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">BIG (Best in Group)</div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Главный ринг: сравнение всех обладателей BOB 10-й группы борзых.
            </p>
          </div>

          <div className="rounded-xl border border-camel-300 bg-linear-to-b from-camel-100/70 to-cream-50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-900">
              Шаг 5 · Финал
            </div>
            <div className="mt-1 text-sm font-bold text-camel-950">BIS (Best in Show)</div>
            <p className="mt-1 text-[11px] text-camel-900 leading-snug">
              Суперфинал дня: выбор абсолютно лучшей собаки всей выставки.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )

  // 2. Награды ринга одного дня с очками сайта
  const renderRingAwards = () => (
    <div id="sec-show-ring-awards">
      <SectionCard title="Награды ринга одного дня (ценность и очки рейтинга)">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Иерархия наград на одной выставке и точные веса очков в рейтинге сайта Coursing Stats (клик раскроет подробности):
        </p>

        <TitleLadderList items={SHOW_RING_AWARDS} />
      </SectionCard>
    </div>
  )

  // 3. Выставочные классы собак по возрасту
  const renderClasses = () => (
    <div id="sec-show-classes">
      <SectionCard title="Выставочные классы и возрастные рамки">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Официальные половозрастные классы по Положению о сертификатных выставках РКФ:
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 pt-1">
          {SHOW_CLASSES.map((cls) => (
            <div
              key={cls.name}
              className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-1 border-b border-old-money-100 pb-1.5">
                <span className="text-xs font-bold text-charcoal-900">{cls.name}</span>
                <span className="rounded bg-camel-100 px-1.5 py-0.5 text-[10px] font-bold text-camel-900">
                  {cls.age}
                </span>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-camel-800">
                Награды: {cls.certs}
              </div>
              <p className="mt-1 text-[11px] leading-snug text-charcoal-600">{cls.note}</p>
            </div>
          ))}
        </div>
        <RefTag>Положение о сертификатных выставках РКФ, п. 8.2</RefTag>
      </SectionCard>
    </div>
  )

  // 4. Оценки и цвета наградных лент
  const renderGrades = () => (
    <div id="sec-show-grades">
      <SectionCard title="Шкала оценок в ринге и цвета наградных лент РКФ">
        <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
          {SHOW_GRADES.map((g) => (
            <div
              key={g.grade}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                <div>
                  <span className="text-xs font-bold text-charcoal-900">{g.grade}</span>{' '}
                  <span className="text-[11px] text-charcoal-500">({g.en})</span>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-2xs ${g.ribbonClass}`}>
                  {g.ribbonColor}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-charcoal-700">{g.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  // 5. Ранги выставок РКФ
  const renderRanks = () => (
    <div id="sec-show-ranks">
      <SectionCard title="Ранги сертификатных выставок в системе РКФ">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Ранг выставки определяет статус присуждаемых сертификатов и правила их распределения:
        </p>

        <div className="space-y-2.5 pt-1">
          {SHOW_RANKS.map((r) => (
            <div
              key={r.rank}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-camel-100 px-2 py-0.5 font-mono text-xs font-bold text-camel-900">
                    {r.rank}
                  </span>
                  <span className="text-xs font-bold text-charcoal-900">{r.scope}</span>
                </div>
                <p className="mt-1.5 text-xs text-charcoal-600">{r.certs}</p>
              </div>
              <span className="shrink-0 self-start sm:self-center rounded-md border border-old-money-200 bg-cream-50 px-2.5 py-1 text-[10px] font-semibold text-charcoal-700">
                {r.highlight}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  // 6. Карьерные чемпионские титулы в родословную
  const renderCareerTitles = () => (
    <div id="sec-show-career-titles">
      <SectionCard title="Пожизненные чемпионские титулы в родословную">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Титулы, которые официально регистрируются в РКФ и вносятся в родословные потомков по набору сертификатов:
        </p>

        <TitleLadderList items={SHOW_CAREER_TITLES} />
      </SectionCard>
    </div>
  )

  // 7. Ключевые регламенты (Памятка участника)
  const renderRequirements = () => (
    <div id="sec-show-requirements">
      <SectionCard title="Памятка участника: регламент и правила выставок">
        <div className="grid gap-3 sm:grid-cols-2">
          {SHOW_REQUIREMENTS.map((req) => (
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
    </div>
  )

  // 8. Словарь сокращений
  const renderAbbreviations = () => (
    <div id="sec-show-abbr">
      <SectionCard title="Словарь сокращений выставочных протоколов">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Выберите официальное сокращение титула или сертификата, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={SHOW_ABBREVIATIONS}
          refTag={
            <RefTag>
              Положение о сертификатных выставках РКФ · Список титулов и принятые сокращения в родословных РКФ
            </RefTag>
          }
        />
      </SectionCard>
    </div>
  )

  // 9. Официальные первоисточники
  const renderSources = () => (
    <div id="sec-show-sources">
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Нормативные документы РКФ и FCI, регламентирующие выставочные правила и присвоение титулов:
        </p>
        <OfficialSourcesList sources={SHOW_OFFICIAL_SOURCES} />
      </SectionCard>
    </div>
  )

  // 10. Частые вопросы
  const renderFaqs = () => (
    <div id="sec-show-faqs">
      <SectionCard title="Частые вопросы о выставках">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_SHOWS_FAQS.map((faq) => (
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
      <div className="rounded-2xl border border-old-money-200 bg-linear-to-b from-white to-cream-50/70 p-4 sm:p-5 shadow-2xs">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Задайте вопрос или введите слово (например: cacib, возраст щенка, bob, чр, ленты, bis)..."
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
          items={SHOW_POPULAR_QUERIES}
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
      {isSectionVisible('sec-show-roadmap') && renderRoadmap()}
      {isSectionVisible('sec-show-ring-awards') && renderRingAwards()}
      {isSectionVisible('sec-show-classes') && renderClasses()}
      {isSectionVisible('sec-show-grades') && renderGrades()}
      {isSectionVisible('sec-show-ranks') && renderRanks()}
      {isSectionVisible('sec-show-career-titles') && renderCareerTitles()}
      {isSectionVisible('sec-show-requirements') && renderRequirements()}
      {isSectionVisible('sec-show-abbr') && renderAbbreviations()}
      {isSectionVisible('sec-show-sources') && renderSources()}
      {isSectionVisible('sec-show-faqs') && renderFaqs()}

      {/* ЕСЛИ СОВСЕМ НИЧЕГО НЕ НАЙДЕНО */}
      {isSearching && searchResult.matchedSectionIds.size === 0 && !searchResult.matchedDirectAnswer && (
        <div className="rounded-2xl border border-dashed border-old-money-200 bg-cream-50/50 p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-charcoal-400 mb-2" aria-hidden />
          <h3 className="text-sm font-bold text-charcoal-800">
            Ничего не найдено по запросу «{searchQuery}»
          </h3>
          <p className="mt-1 text-xs text-charcoal-600 max-w-md mx-auto">
            Попробуйте задать вопрос иначе или выберите одну из популярных тем: CAC, CACIB, возраст щенка, BOB, Best in Show, наградные ленты.
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
