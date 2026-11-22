import { useState, useEffect, memo } from 'react'
import { Trophy, Award, Crown, HelpCircle } from 'lucide-react'

interface JumpSection {
  id: string
  label: string
  icon: typeof Trophy
}

interface BreedHubJumpBarProps {
  hasSport: boolean
  hasShows: boolean
  hasHallOfFame: boolean
  hasFaq: boolean
}

export const BreedHubJumpBar = memo(function BreedHubJumpBar({
  hasSport,
  hasShows,
  hasHallOfFame,
  hasFaq,
}: BreedHubJumpBarProps) {
  const [activeSection, setActiveSection] = useState<string>('sport')

  const sections: JumpSection[] = []
  if (hasSport) {
    sections.push({ id: 'sport', label: 'Спорт и рекорды', icon: Trophy })
  }
  if (hasShows) {
    sections.push({ id: 'shows', label: 'Выставки и НКП', icon: Award })
  }
  if (hasHallOfFame) {
    sections.push({ id: 'hall-of-fame', label: 'Зал славы', icon: Crown })
  }
  if (hasFaq) {
    sections.push({ id: 'faq', label: 'Вопросы', icon: HelpCircle })
  }

  // Наблюдатель за активной секцией при скролле (ScrollSpy)
  useEffect(() => {
    if (typeof window === 'undefined' || sections.length === 0) return

    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      let current = sections[0].id

      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el && el.offsetTop <= scrollPos) {
          current = section.id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  if (sections.length <= 1) {
    return null
  }

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }

  return (
    <nav
      aria-label="Быстрая навигация по породе"
      className="sticky top-14 md:top-16 z-25 py-1 -mx-2 px-2 sm:mx-0 sm:px-0 bg-[#fbf7f0]/90 backdrop-blur-md transition-all select-none"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Разделы:
        </span>
        {sections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleScrollTo(section.id)}
              className={`inline-flex items-center gap-1 sm:gap-1.5 h-8 min-h-[32px] px-2.5 sm:px-3 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all active:scale-95 ${
                isActive
                  ? 'bg-white text-camel-950 font-bold shadow-2xs border border-camel-300/80 ring-1 ring-camel-200/50'
                  : 'bg-cream-100/70 text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/60 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-camel-800' : 'text-charcoal-400'}`} aria-hidden />
              <span>{section.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
})
