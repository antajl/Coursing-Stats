import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronRight, ChevronUp, Lightbulb } from 'lucide-react'
import { executeSmartGuideSearch } from '../../smartSearch'
import { GuideSearchHeader } from '../GuideUi'
import { POPULAR_QUERIES } from './types'
import { DisciplinesOverviewSection } from './sections/DisciplinesOverviewSection'
import { CareerRoadmapSection } from './sections/CareerRoadmapSection'
import {
  TitlesHierarchySection,
  TitleSchemesSection,
} from './sections/TitlesHierarchySection'
import { JudgingCriteriaSection } from './sections/JudgingCriteriaSection'
import { ParticipantMemoSection } from './sections/ParticipantMemoSection'
import { ProtocolAnatomySection } from './sections/ProtocolAnatomySection'
import { BarriersAndRulesSection } from './sections/BarriersAndRulesSection'
import {
  AbbreviationsSection,
  OfficialSourcesSection,
  FaqSection,
} from './sections/GlossaryAndFaqSection'

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
  const isSectionVisible = (secId: string) => {
    if (!isSearching) return true
    return searchResult.matchedSectionIds.has(secId)
  }

  return (
    <div className="space-y-6">
      {/* ЕДИНЫЙ ПОИСК И ЧАСТЫЕ ТЕМЫ */}
      <GuideSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Задайте вопрос или введите слово (например: возраст, кворум, переход CACL, намордник, ничья)..."
        popularQueries={POPULAR_QUERIES}
      />

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
      {isSectionVisible('sec-disciplines') && <DisciplinesOverviewSection />}
      {isSectionVisible('sec-roadmap') && <CareerRoadmapSection />}
      {isSectionVisible('sec-hierarchy') && <TitlesHierarchySection />}
      {isSectionVisible('sec-schemes') && <TitleSchemesSection />}
      {isSectionVisible('sec-judging') && <JudgingCriteriaSection />}
      {isSectionVisible('sec-requirements') && <ParticipantMemoSection />}
      {isSectionVisible('sec-protocol') && (
        <div id="sec-protocol" className="space-y-6">
          <ProtocolAnatomySection />
          <BarriersAndRulesSection />
        </div>
      )}
      {isSectionVisible('sec-abbr') && <AbbreviationsSection />}
      {isSectionVisible('sec-sources') && <OfficialSourcesSection />}
      {isSectionVisible('sec-faqs') && <FaqSection />}

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
