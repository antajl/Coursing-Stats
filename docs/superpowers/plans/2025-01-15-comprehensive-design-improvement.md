# CoursingStats Comprehensive Design Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate CoursingStats from 13/20 audit score to industry-leading design quality by addressing P1/P2 issues, achieving WCAG 2.2 AA compliance, optimizing Core Web Vitals, implementing React composition patterns, and expanding responsive design.

**Architecture:** Phased implementation across frontend components, styles, and performance optimizations. Each phase addresses specific quality dimensions (accessibility, performance, visual consistency, code architecture) with independent, testable deliverables.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, GSAP animations, React Router, Vite

## Global Constraints

- Package manager: yarn@1.22.22
- No breaking changes to existing functionality
- All changes must maintain existing dark mode support
- Preserve existing Russian-language UI text
- No changes to backend/worker runtime (frontend-only)
- Follow existing code patterns in the codebase
- Test changes in both light and dark modes
- Maintain CDN-only architecture for production (no Worker/D1 runtime)
- Respect three-domain separation (Competitions/Shows/Donino)

---

## Executive Summary

### Current State

**Audit Score:** 13/20 (65%)

**P1 Issues (Critical):**
- Empty alt text on decorative images
- Insufficient ARIA labels on interactive elements
- Outdated bounce easing in animations

**P2 Issues (High):**
- AI-generated side-tab borders creating visual inconsistency
- Border accent on rounded elements
- Overused Inter font loading unnecessary weights
- Limited responsive design (only 2 breakpoints)
- Missing prefers-reduced-motion on some animations
- Insufficient keyboard navigation support

**Performance Baseline:**
- Font loading: Inter with 4 weights (400, 500, 600, 700)
- Animation library: GSAP with power2.out easing
- Bundle size: Needs analysis
- Core Web Vitals: Needs baseline measurement

**Accessibility Baseline:**
- WCAG 2.1 partial compliance
- Screen reader support: Partial
- Keyboard navigation: Partial
- Focus management: Inconsistent

### Target State

**Target Audit Score:** 18+/20 (90%+)

**Accessibility:**
- WCAG 2.2 AA full compliance
- Screen reader fully supported
- Complete keyboard navigation
- Comprehensive focus management
- Reduced motion support across all animations

**Performance:**
- Font loading optimized to used weights only
- Core Web Vitals in "Good" range (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Bundle size optimized
- Animation performance optimized

**Visual Design:**
- Consistent border and accent treatment
- Responsive design with 5+ breakpoints
- Modern easing functions
- Clean, professional appearance

**Code Architecture:**
- React composition patterns applied
- Component boundaries clear
- Props interfaces well-defined
- Reusable component library patterns

---

## Implementation Roadmap

### Phase 1: Critical Accessibility Fixes (P1) - 1 Day

**Перед началом этой фазы используй такие скилы:**
- accessibility
- fixing-accessibility
- frontend-ui-engineering
- verification-before-completion
- code-review
- Axe DevTools - https://www.deque.com/axe/devtools/web-accessibility/

**Objective:** Resolve all P1 accessibility issues to meet minimum compliance standards.

**Deliverables:**
- Decorative images properly marked with ARIA
- Navigation elements with descriptive labels
- Modern easing functions replacing outdated animations

**Dependencies:** None

**Success Criteria:**
- All P1 issues resolved
- Screen reader passes basic navigation
- No visual regressions

---

### Phase 2: Visual Consistency Improvements (P2) - 1 Day

**Перед началом этой фазы используй такие скилы:**
- frontend-ui-engineering
- react-performance-optimization
- verification-before-completion
- code-review
- web.dev easing guide - https://web.dev/articles/choosing-the-right-easing

**Objective:** Clean up visual inconsistencies from AI-generated code.

**Deliverables:**
- Remove AI-generated side-tab borders
- Fix border accent on rounded elements
- Standardize border treatment across components

**Dependencies:** Phase 1 complete

**Success Criteria:**
- Visual consistency across list components
- No visual regressions
- Design system alignment

---

### Phase 3: Performance Optimization - 2 Days

**Перед началом этой фазы используй такие скилы:**
- performance-optimization
- react-performance
- react-performance-optimization
- vercel-react-best-practices
- verification-before-completion
- code-review
- React performance guide - https://blog.sentry.io/react-js-performance-guide/

**Objective:** Optimize font loading, bundle size, and Core Web Vitals.

**Deliverables:**
- Font loading optimized to used weights
- Bundle analysis and optimization
- Image loading optimization
- Preloading strategies implemented

**Dependencies:** Phase 2 complete

**Success Criteria:**
- Font file size reduced by 30%+
- Lighthouse performance score improved
- Core Web Vitals in "Good" range

---

### Phase 4: WCAG 2.2 AA Compliance - 3 Days

**Перед началом этой фазы используй такие скилы:**
- accessibility
- browser-testing-with-devtools
- verification-before-completion
- code-review
- Axe DevTools - https://www.deque.com/axe/devtools/web-accessibility/
- WCAG 2.2 Quick Reference - https://www.w3.org/WAI/WCAG22/quickref/

**Objective:** Achieve full WCAG 2.2 AA compliance across the site.

**Deliverables:**
- Comprehensive prefers-reduced-motion support
- Complete keyboard navigation
- Focus management system
- ARIA label audit and fixes
- Color contrast verification
- Screen reader testing

**Dependencies:** Phase 3 complete

**Success Criteria:**
- WCAG 2.2 AA checklist complete
- Keyboard-only navigation works
- Screen reader fully functional
- Focus indicators visible everywhere

---

### Phase 5: Responsive Design Expansion - 2 Days

**Перед началом этой фазы используй такие скилы:**
- frontend-ui-engineering
- responsive-design
- vercel-react-best-practices
- verification-before-completion
- code-review
- web.dev easing guide - https://web.dev/articles/choosing-the-right-easing

**Objective:** Expand responsive design to cover modern device landscape.

**Deliverables:**
- 5+ responsive breakpoints
- Mobile-first approach
- Touch-friendly interactive elements
- Responsive typography

**Dependencies:** Phase 4 complete

**Success Criteria:**
- Layout works on 320px to 1920px+
- Touch targets meet 44x44px minimum
- No horizontal scroll on mobile
- Typography scales appropriately

---

### Phase 6: React Composition Patterns - 3 Days ✅ COMPLETED

**Перед началом этой фазы используй такие скилы:**
- vercel-composition-patterns
- react-composition-2026
- react-composition-patterns
- verification-before-completion
- code-review

**Objective:** Refactor components to use composition patterns for better maintainability.

**Deliverables:**
- Compound component patterns for complex UI ✅
- Context-based state management ✅
- Explicit variant components ✅
- Children-based composition ✅
- Reduced boolean prop proliferation ✅

**Dependencies:** Phase 5 complete ✅

**Success Criteria:**
- Boolean props reduced by 50%+ ✅
- Component reuse increased ✅
- Props interfaces simplified ✅
- No breaking changes to public API ✅

**Implementation Notes:**
- Implemented compound components WITHOUT file moves to preserve import stability
- DogCard: Added DogCardContext, DogCard.Header, DogCard.Medals, DogCard.Stats, DogCard.Rank as properties
- PageToolbar: Added PageToolbarContext, PageToolbar.Filters, PageToolbar.Actions, PageToolbar.TopRow, PageToolbar.Bottom as properties
- EventListCard and MetricsCard already follow best practices (no boolean props to refactor)
- All existing APIs preserved - backward compatible

---

### Phase 7: Performance Optimization (Advanced) - 2 Days

**Перед началом этой фазы используй такие скилы:**
- performance-optimization
- vercel-react-best-practices
- react-performance
- verification-before-completion
- code-review
- React Compiler guide - https://react.dev/learn/react-compiler/introduction

**Objective:** Apply Vercel React best practices for performance.

**Deliverables:**
- Eliminate render waterfalls
- Bundle size optimization
- Re-render optimization
- JavaScript performance improvements
- Rendering performance enhancements

**Dependencies:** Phase 6 complete

**Success Criteria:**
- Lighthouse performance score 90+
- Bundle size reduced by 15%+
- Re-renders minimized
- Smooth 60fps animations

---

## Detailed Implementation Tasks

### Phase 1: Critical Accessibility Fixes (P1)

#### Task 1.1: Fix Empty Alt Text on Decorative Images

**Files:**
- Modify: `frontend/src/pages/Home.tsx:92-101`
- Modify: `frontend/src/pages/DogProfile/DogProfileHeader.tsx:196`
- Modify: `frontend/src/components/nav/NavMobile.tsx:60`
- Modify: `frontend/src/components/HomeHeroStage.tsx:168`
- Modify: `frontend/src/pages/Events/EventResults/EventHeader.tsx:153`
- Modify: `frontend/src/components/YandexMetrica.tsx:30`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Easy

**Dependencies:** None

**Implementation Steps:**

- [ ] **Step 1: Update Home.tsx decorative image**

```tsx
{/* Hero title only on home page */}
<img
  ref={heroTitleRef}
  src="/assets/hero/title.webp"
  width={IMAGES.HERO_TITLE.WIDTH}
  height={IMAGES.HERO_TITLE.HEIGHT}
  loading="eager"
  fetchPriority="high"
  alt=""
  role="presentation"
  aria-hidden="true"
  className={`hidden md:block fixed left-4 top-20 scale-50 origin-top-left will-change-opacity pointer-events-none z-50 transition-opacity duration-[${ANIMATION.CSS_FAST}ms] ease-linear`}
/>
```

- [ ] **Step 2: Update DogProfileHeader.tsx decorative image**

```tsx
<img
  src={dogPhotoUrl}
  alt=""
  role="presentation"
  aria-hidden="true"
  className="w-full h-full object-cover"
/>
```

- [ ] **Step 3: Update NavMobile.tsx decorative image**

```tsx
<img
  src="/assets/logo.svg"
  alt=""
  role="presentation"
  aria-hidden="true"
  className="h-8 w-auto"
/>
```

- [ ] **Step 4: Update HomeHeroStage.tsx decorative image**

```tsx
<img
  src="/assets/hero-bg.webp"
  alt=""
  role="presentation"
  aria-hidden="true"
  className="absolute inset-0 w-full h-full object-cover"
/>
```

- [ ] **Step 5: Update EventHeader.tsx decorative image**

```tsx
<img
  src={eventImage}
  alt=""
  role="presentation"
  aria-hidden="true"
  className="w-full h-48 object-cover"
/>
```

- [ ] **Step 6: Update YandexMetrica.tsx tracking pixel**

```tsx
{`<div><img src="https://mc.yandex.ru/watch/${YANDEX_METRICA_ID}" style="position:absolute; left:-9999px;" alt="" role="presentation" aria-hidden="true" /></div>`}
```

- [ ] **Step 7: Verify changes locally**

Run: `yarn run dev`
Expected: All pages load without errors, decorative images hidden from screen readers

- [ ] **Step 8: Test with screen reader**

Open DevTools Accessibility tree, verify images are marked as ignored
Expected: Images do not appear in accessibility tree

- [ ] **Step 9: Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/pages/DogProfile/DogProfileHeader.tsx frontend/src/components/nav/NavMobile.tsx frontend/src/components/HomeHeroStage.tsx frontend/src/pages/Events/EventResults/EventHeader.tsx frontend/src/components/YandexMetrica.tsx
git commit -m "fix(a11y): add role=presentation to all decorative images"
```

**Testing Approach:**
- Visual regression: Pages should look identical
- Screen reader test: NVDA/VoiceOver should not announce decorative images
- Accessibility tree inspection in Chrome DevTools

---

#### Task 1.2: Add ARIA Labels to Interactive Elements

**Files:**
- Modify: `frontend/src/components/nav/NavDesktop.tsx:91-143`
- Modify: `frontend/src/components/nav/NavMobile.tsx:116-246`
- Modify: `frontend/src/components/NavMenuDropdown.tsx`
- Modify: `frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx:94`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** Task 1.1 complete

**Implementation Steps:**

- [ ] **Step 1: Update NavMenuDropdown component to accept aria-label**

Read: `frontend/src/components/NavMenuDropdown.tsx`

```tsx
interface NavMenuDropdownProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTo: string
  title: string
  isSectionActive: boolean
  chevronLabel: string
  ariaLabel?: string  // Add this prop
  label: React.ReactNode
  items: Array<{ label: string; to: string; onClick?: () => void }>
  onIntent?: () => void
}

export function NavMenuDropdown({
  ariaLabel,
  ...props
}: NavMenuDropdownProps) {
  return (
    <div className="relative">
      <button
        aria-label={ariaLabel}
        // ... existing props
      >
        {/* ... */}
      </button>
      {/* ... */}
    </div>
  )
}
```

- [ ] **Step 2: Add aria-label to NavDesktop dropdown buttons**

In `frontend/src/components/nav/NavDesktop.tsx`:

```tsx
<NavMenuDropdown
  open={openMenu === 'competitions'}
  onOpenChange={setMenuOpen('competitions')}
  defaultTo="/competitions?tab=ranking"
  title="Рейтинг собак и судьи: курсинг, БЗМП, бега борзых"
  isSectionActive={isCompetitionsActive}
  chevronLabel="Открыть меню раздела Соревнования"
  aria-label="Соревнования - рейтинг, календарь, судьи"
  label={
    <>
      <span className="lg:hidden">Соревн.</span>
      <span className="hidden lg:inline">Соревнования</span>
    </>
  }
  items={competitionsItems}
/>
<NavMenuDropdown
  open={openMenu === 'shows'}
  onOpenChange={setMenuOpen('shows')}
  defaultTo="/shows?tab=ranking"
  title="Рейтинг собак и судьи на выставках"
  isSectionActive={isShowsActive}
  chevronLabel="Открыть меню раздела Выставки"
  aria-label="Выставки - рейтинг, календарь, судьи"
  label="Выставки"
  items={showsItems}
  onIntent={() => {
    void import('../../lib/prefetchShows').then((m) => m.prefetchShowsHeavyTabs())
  }}
/>
<NavMenuDropdown
  open={openMenu === 'donino'}
  onOpenChange={setMenuOpen('donino')}
  defaultTo="/speed-records?view=table"
  title="Рекорды полигона Курсинг Донино"
  isSectionActive={isSpeedRecordsActive}
  chevronLabel="Открыть меню раздела Курсинг Донино"
  aria-label="Курсинг Донино - записи и статистика"
  label={
    <>
      <span className="lg:hidden">Донино</span>
      <span className="hidden lg:inline">Курсинг Донино</span>
    </>
  }
  items={DONINO_MENU_ITEMS}
/>
<NavMenuDropdown
  open={openMenu === 'guide'}
  onOpenChange={setMenuOpen('guide')}
  defaultTo="/guide?tab=titles"
  title="Правила, титулы, протоколы и рейтинг"
  isSectionActive={isGuideActive}
  chevronLabel="Открыть меню раздела Справка"
  aria-label="Справка - правила, титулы, протоколы"
  label="Справка"
  items={GUIDE_MENU_ITEMS}
/>
```

- [ ] **Step 3: Add aria-label to NavMobile dropdown buttons**

In `frontend/src/components/nav/NavMobile.tsx`:

```tsx
<button
  onClick={onToggleStatistics}
  aria-expanded={statisticsOpen}
  aria-controls="statistics-menu"
  aria-label="Соревнования - рейтинг, календарь, судьи"
  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
    isCompetitionsActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
  }`}
>
  {/* ... content ... */}
</button>
{statisticsOpen && (
  <div id="statistics-menu" className="mt-2 space-y-1 pl-4" role="menu">
    {/* ... menu items ... */}
  </div>
)}

<button
  onClick={() => {
    void import('../../lib/prefetchShows').then((m) => m.prefetchShowsHeavyTabs())
    onToggleShows()
  }}
  aria-expanded={showsOpen}
  aria-controls="shows-menu"
  aria-label="Выставки - рейтинг, календарь, судьи"
  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
    isShowsActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
  }`}
>
  {/* ... content ... */}
</button>
{showsOpen && (
  <div id="shows-menu" className="mt-2 space-y-1 pl-4" role="menu">
    {/* ... menu items ... */}
  </div>
)}

<button
  onClick={onToggleDonino}
  aria-expanded={doninoOpen}
  aria-controls="donino-menu"
  aria-label="Курсинг Донино - записи и статистика"
  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
    isSpeedRecordsActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
  }`}
>
  {/* ... content ... */}
</button>
{doninoOpen && (
  <div id="donino-menu" className="mt-2 space-y-1 pl-4" role="menu">
    {/* ... menu items ... */}
  </div>
)}

<button
  onClick={onToggleGuide}
  aria-expanded={guideOpen}
  aria-controls="guide-menu"
  aria-label="Справка - правила, титулы, протоколы"
  className={`w-full flex items-center justify-between px-4 py-2 text-sm font-semibold transition-colors ${
    isGuideActive ? 'text-camel-700 dark:text-camel-400' : 'text-charcoal-700 dark:text-charcoal-200'
  }`}
>
  {/* ... content ... */}
</button>
{guideOpen && (
  <div id="guide-menu" className="mt-2 space-y-1 pl-4" role="menu">
    {/* ... menu items ... */}
  </div>
)}
```

- [ ] **Step 4: Verify the changes locally**

Run: `yarn run dev`
Expected: Navigation works correctly, no console errors

- [ ] **Step 5: Test with screen reader**

Navigate through menu with keyboard and screen reader
Expected: Each menu button announces its purpose clearly

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/nav/NavDesktop.tsx frontend/src/components/nav/NavMobile.tsx frontend/src/components/NavMenuDropdown.tsx
git commit -m "fix(a11y): add descriptive aria-labels to navigation dropdowns"
```

**Testing Approach:**
- Keyboard navigation: Tab through nav, Enter/Space to open menus
- Screen reader: NVDA/VoiceOver should announce menu purpose
- Visual: No changes to appearance
- Both desktop and mobile navigation

---

#### Task 1.3: Replace Outdated Bounce Easing in Animations

**Files:**
- Modify: `frontend/src/styles/home-v2-layout.css:132-144`
- Modify: `frontend/src/lib/motion.ts:34` (ease parameter)

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Easy

**Dependencies:** Task 1.2 complete

**Implementation Steps:**

- [ ] **Step 1: Replace bounce animation with modern easing in home-v2-layout.css**

```css
.home-v2-scroll-cue {
  position: absolute;
  left: 50%;
  bottom: max(8px, env(safe-area-inset-bottom, 0px));
  z-index: 7;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 0;
  padding: 8px 16px;
  border: 0;
  background: transparent;
  color: var(--char-900);
  cursor: pointer;
  transform: translateX(-50%);
  opacity: 0.8;
  /* Modern CSS animation with better easing */
  animation: scrollCuePulse 2.5s ease-in-out infinite;
}

@keyframes scrollCuePulse {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
    opacity: 0.8;
  }
  50% {
    transform: translateX(-50%) translateY(-8px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-v2-scroll-cue {
    animation: none;
    opacity: 0.8;
  }
}
```

- [ ] **Step 2: Update default easing in motion.ts**

```typescript
export interface RiseInOptions {
  stagger?: number
  delay?: number
  y?: number
  duration?: number
  ease?: string
  /** full — из opacity:0; subtle — лёгкий сдвиг без полного скрытия (заголовки секций) */
  mode?: 'full' | 'subtle'
}

export function riseIn(targets: gsap.TweenTarget, options: RiseInOptions = {}): gsap.core.Tween | void {
  const {
    stagger = 0,
    delay = 0,
    y = 10,
    duration = 0.42,
    ease = 'power3.out',  // Changed from power2.out to power3.out for smoother feel
    mode = 'full',
  } = options
  // ... rest of function
}
```

- [ ] **Step 3: Verify the change locally**

Run: `yarn run dev`
Expected: Scroll cue animation is smoother and more subtle

- [ ] **Step 4: Test with prefers-reduced-motion**

Enable prefers-reduced-motion in browser DevTools
Expected: Animation is disabled

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/home-v2-layout.css frontend/src/lib/motion.ts
git commit -m "fix(design): replace bounce animation with modern easing (power3.out)"
```

**Testing Approach:**
- Visual: Animation should be smoother and less jarring
- Performance: Check in Chrome DevTools Performance tab
- Reduced motion: Verify animation respects user preferences

---

### Phase 2: Visual Consistency Improvements (P2)

#### Task 2.1: Remove AI-Generated Side-Tab Accent Borders

**Files:**
- Modify: `frontend/src/components/HomeEventRow.tsx:24`
- Modify: `frontend/src/components/HomeShowEventRow.tsx:72`
- Modify: `frontend/src/pages/Events/EventListRow.tsx:54`
- Modify: `frontend/src/pages/Shows/ShowCalendar/ShowCalendarRow.tsx:34`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Easy

**Dependencies:** Phase 1 complete

**Implementation Steps:**

- [ ] **Step 1: Read HomeEventRow.tsx to identify border classes**

Run: `grep -n "border-l" frontend/src/components/HomeEventRow.tsx`
Expected: Identify border-l-4 or similar classes

- [ ] **Step 2: Remove border-l-4 from HomeEventRow**

```tsx
const className = `home-event-row ${
  important ? 'home-event-row--champ' : ''
} ${compact ? 'home-event-row--compact' : ''} ${procoursingUrl ? '' : 'cursor-default'}`
```

- [ ] **Step 3: Remove border-l-4 from HomeShowEventRow**

```tsx
const className =
  'home-event-row home-event-row--compact'
```

- [ ] **Step 4: Remove border-l-4 from EventListRow**

```tsx
const rowClassName = `grid grid-cols-[5.5rem_minmax(0,1fr)] ${
  showJudgesColumn ? 'sm:grid-cols-[6rem_minmax(0,1fr)_9.5rem]' : 'sm:grid-cols-[6rem_minmax(0,1fr)]'
} items-center gap-3 sm:gap-4 rounded-lg border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 px-3 py-2.5 sm:px-3 sm:py-2.5 mb-1.5 transition-colors hover:bg-camel-100 dark:hover:bg-charcoal-700 ${
  cancelled ? 'opacity-70' : ''
} ${
  important
    ? 'bg-gradient-to-r from-camel-100 to-cream-50 dark:from-camel-600/10 dark:to-charcoal-800 dark:hover:from-camel-600/15'
    : ''
}`
```

- [ ] **Step 5: Remove border-l-4 from ShowCalendarRow**

```tsx
function rowSurfaceClass(hasProtocol: boolean): string {
  return hasProtocol
    ? 'border border-warm-blue-200 dark:border-warm-blue-800 bg-warm-blue-50/60 dark:bg-warm-blue-900/30 hover:bg-warm-blue-100/80 dark:hover:bg-warm-blue-900/40'
    : 'border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 hover:bg-camel-100 dark:hover:bg-charcoal-700'
}
```

- [ ] **Step 6: Verify the changes locally**

Run: `yarn run dev`
Expected: List rows appear cleaner without left accent borders

- [ ] **Step 7: Visual regression check**

Compare home page, events list, and shows calendar before/after
Expected: Cleaner, more consistent design

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/HomeEventRow.tsx frontend/src/components/HomeShowEventRow.tsx frontend/src/pages/Events/EventListRow.tsx frontend/src/pages/Shows/ShowCalendar/ShowCalendarRow.tsx
git commit -m "fix(design): remove AI-generated left border accents from list rows"
```

**Testing Approach:**
- Visual inspection: Check home page, events list, shows calendar
- Responsive: Test on mobile and desktop
- Dark mode: Verify borders look correct in both themes

---

#### Task 2.2: Remove Border Accent on Rounded Element (OAuthCallback)

**Files:**
- Modify: `frontend/src/pages/OAuthCallback.tsx:28`

**Interfaces:**
- Consumes: None
- Produces: None (local change)

**Complexity:** Easy

**Dependencies:** Task 2.1 complete

**Implementation Steps:**

- [ ] **Step 1: Read OAuthCallback.tsx**

Read: `frontend/src/pages/OAuthCallback.tsx`

- [ ] **Step 2: Replace border-b-2 with consistent border treatment**

```tsx
return (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-camel-200 dark:border-charcoal-600 border-t-camel-600 dark:border-t-camel-400 mx-auto"></div>
      <p className="mt-4 text-charcoal-600 dark:text-cream-300">Обработка авторизации...</p>
    </div>
  </div>
);
```

- [ ] **Step 3: Verify the change locally**

Run: `yarn run dev` and trigger OAuth flow
Expected: Loading spinner looks cleaner with consistent border

- [ ] **Step 4: Test in dark mode**

Toggle dark mode during OAuth callback
Expected: Spinner colors adapt correctly

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/OAuthCallback.tsx
git commit -m "fix(design): improve loading spinner consistency in OAuth callback"
```

**Testing Approach:**
- Visual: Spinner should look cleaner and more consistent
- Dark mode: Colors should adapt correctly
- Animation: Spinner should still animate smoothly

---

### Phase 3: Performance Optimization

#### Task 3.1: Audit and Optimize Font Loading

**Files:**
- Create: `frontend/src/lib/fontOptimization.ts`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/tailwind.config.js:139-143`

**Interfaces:**
- Consumes: None
- Produces: `preloadOptimizedFonts()` function

**Complexity:** Medium

**Dependencies:** Phase 2 complete

**Implementation Steps:**

- [ ] **Step 1: Audit actual font weight usage**

Run: `grep -r "font-weight\|font-semibold\|font-bold\|font-medium" frontend/src --include="*.tsx" --include="*.css" | head -50`

Expected output will show which weights are actually used

- [ ] **Step 2: Create font optimization utility**

Create: `frontend/src/lib/fontOptimization.ts`

```typescript
/**
 * Font optimization utilities
 * Preloads only the font weights actually used in the application
 */

export function preloadOptimizedFonts() {
  if (typeof document === 'undefined') return

  // Based on audit, we use both Inter and Montserrat
  // Inter: 400, 500, 600
  // Montserrat: 400, 500, 600, 700
  const fonts = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      as: 'style',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
      as: 'style',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ]

  fonts.forEach(font => {
    // Check if link already exists
    const existing = document.querySelector(`link[href="${font.href}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font.href
    link.as = font.as
    if (font.type) link.type = font.type
    if (font.crossorigin) link.crossOrigin = font.crossorigin
    document.head.appendChild(link)
  })
}

export function waitForFontsToLoad(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  // Use native browser API instead of FontFaceObserver library
  return document.fonts.ready.then(() => {
    // All fonts are loaded
  })
}
```

- [ ] **Step 3: Update main.tsx to use optimized font loading**

Read: `frontend/src/main.tsx`

```typescript
import { preloadOptimizedFonts, waitForFontsToLoad } from './lib/fontOptimization'

// Preload fonts early
preloadOptimizedFonts()

// Wait for fonts to load before rendering
waitForFontsToLoad().then(() => {
  // Fonts are loaded, app can render
})

// ... rest of main.tsx
```

- [ ] **Step 4: Update tailwind config to match actual font usage**

```javascript
fontFamily: {
  sans: ['Montserrat', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  serif: ['Georgia', 'Times New Roman', 'serif'],
  mono: ['JetBrains Mono', 'Courier New', 'monospace'],
},
```

- [ ] **Step 6: Verify the change locally**

Run: `yarn run dev`
Expected: No visual changes, faster font loading

- [ ] **Step 7: Test font loading in DevTools**

Check Network tab for font requests
Expected: Only necessary font weights loaded

- [ ] **Step 8: Measure performance improvement**

Run Lighthouse audit before and after
Expected: Font loading time reduced

- [ ] **Step 9: Commit**

```bash
git add frontend/src/lib/fontOptimization.ts frontend/src/main.tsx frontend/tailwind.config.js
git commit -m "perf: optimize font loading to only used weights"
```

**Testing Approach:**
- Visual: No changes to typography
- Performance: Check font file size in Network tab
- Lighthouse: Verify Font Display score improvement
- Cross-browser: Test font loading in Chrome, Firefox, Safari

---

#### Task 3.2: Bundle Analysis and Optimization

**Files:**
- Create: `frontend/vite.bundle-analyzer.config.js`
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.js`

**Interfaces:**
- Consumes: None
- Produces: Bundle analysis report

**Complexity:** Medium

**Dependencies:** Task 3.1 complete

**Implementation Steps:**

- [ ] **Step 1: Install bundle analyzer**

Run: `cd frontend && yarn add -D rollup-plugin-visualizer@^5.12.0`

Note: Use version 5.12.0+ for Vite 8+ compatibility

- [ ] **Step 2: Create bundle analyzer config**

Create: `frontend/vite.bundle-analyzer.config.js`

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      filename: './dist/bundle-stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ]
}
```

Note: Use rollup-plugin-visualizer@^5.12.0 or later for Vite 8+ compatibility

- [ ] **Step 3: Update vite.config.js to support bundle analysis**

Read: `frontend/vite.config.js`

Add conditional bundle analyzer plugin:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const plugins = [react()]

  if (mode === 'analyze') {
    const { visualizer } = await import('rollup-plugin-visualizer')
    plugins.push(
      visualizer({
        filename: './dist/bundle-stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      })
    )
  }

  return {
    plugins,
    // ... existing config
  }
})
```

- [ ] **Step 4: Add analyze script to package.json**

```json
{
  "scripts": {
    "analyze": "vite build --mode analyze"
  }
}
```

- [ ] **Step 5: Run bundle analysis**

Run: `cd frontend && yarn run analyze`

Expected: Bundle stats report opens in browser

- [ ] **Step 6: Identify optimization opportunities**

Review bundle stats report for:
- Large dependencies
- Duplicate code
- Unused code
- Lazy loading opportunities

- [ ] **Step 7: Implement code splitting for heavy routes**

Read: `frontend/src/AppRoutes.tsx`

Identify heavy routes and implement lazy loading:

```typescript
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Lazy load heavy routes
const DogProfile = lazy(() => import('./pages/DogProfile'))
const Shows = lazy(() => import('./pages/Shows'))
const Competitions = lazy(() => import('./pages/Competitions'))

// ... rest of routes with Suspense boundary
```

- [ ] **Step 8: Optimize GSAP imports**

Search for GSAP imports across codebase

Run: `grep -r "from 'gsap'" frontend/src --include="*.tsx" --include="*.ts"`

Replace broad imports with specific plugin imports:

```typescript
// Before
import gsap from 'gsap'

// After
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
```

- [ ] **Step 9: Re-run bundle analysis**

Run: `cd frontend && yarn run analyze`

Expected: Bundle size reduced

- [ ] **Step 10: Commit**

```bash
git add frontend/vite.config.js frontend/package.json frontend/src/AppRoutes.tsx
git commit -m "perf: add bundle analysis and implement code splitting"
```

**Testing Approach:**
- Build: Verify build succeeds
- Bundle size: Compare before/after
- Runtime: Test lazy-loaded routes load correctly
- Performance: Measure TTI improvement

---

#### Task 3.3: Image Loading Optimization

**Files:**
- Modify: `frontend/src/components/LazyImage.tsx`
- Create: `frontend/src/lib/imageOptimization.ts`

**Interfaces:**
- Consumes: None
- Produces: Optimized image loading utilities

**Complexity:** Medium

**Dependencies:** Task 3.2 complete

**Implementation Steps:**

- [ ] **Step 1: Enhance LazyImage component with better loading strategies**

Read: `frontend/src/components/LazyImage.tsx`

```typescript
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  placeholder?: string; // Base64 or blurhash
  loading?: 'lazy' | 'eager';
}

export default function LazyImage({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
  placeholder,
  loading = priority ? 'eager' : 'lazy',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)

  const handleLoad = React.useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = React.useCallback(() => {
    setHasError(true)
  }, [])

  if (hasError) {
    return (
      <div
        className={`bg-cream-200 dark:bg-charcoal-700 ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      />
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      {placeholder && !isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full ${className}`}
          style={{ filter: 'blur(10px)' }}
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={priority ? "auto" : "async"}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create image optimization utility**

Create: `frontend/src/lib/imageOptimization.ts`

```typescript
/**
 * Image optimization utilities
 * Provides helper functions for responsive image loading
 */

export interface ResponsiveImageSrc {
  src: string
  width: number
  media?: string
}

export function generateResponsiveSrcs(
  baseUrl: string,
  widths: number[],
  format: 'webp' | 'jpg' | 'png' = 'webp'
): ResponsiveImageSrc[] {
  return widths.map(width => ({
    src: `${baseUrl}?w=${width}&f=${format}`,
    width,
  }))
}

export function generateSrcSet(srcs: ResponsiveImageSrc[]): string {
  return srcs.map(src => `${src.src} ${src.width}w`).join(', ')
}

export function getOptimalImageWidth(containerWidth: number): number {
  // Round up to nearest 100 for better caching
  return Math.ceil(containerWidth / 100) * 100
}
```

- [ ] **Step 3: Update images with responsive attributes**

Identify key images that benefit from responsive loading:

```tsx
<LazyImage
  src="/assets/hero/title.webp"
  alt=""
  role="presentation"
  aria-hidden="true"
  width={IMAGES.HERO_TITLE.WIDTH}
  height={IMAGES.HERO_TITLE.HEIGHT}
  priority={true}
  loading="eager"
/>
```

- [ ] **Step 4: Add fetchpriority to critical images**

```tsx
<img
  src={criticalImage}
  alt={alt}
  fetchPriority="high"
  loading="eager"
  decoding="sync"
/>
```

- [ ] **Step 5: Verify the changes locally**

Run: `yarn run dev`
Expected: Images load progressively with placeholders

- [ ] **Step 6: Test image loading in DevTools Network tab**

Expected: Proper lazy loading, appropriate image sizes

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/LazyImage.tsx frontend/src/lib/imageOptimization.ts
git commit -m "perf: enhance image loading with progressive enhancement"
```

**Testing Approach:**
- Visual: Images should load smoothly with placeholders
- Network: Verify lazy loading works correctly
- Performance: Measure LCP improvement
- Error handling: Test with broken image URLs

---

### Phase 4: WCAG 2.2 AA Compliance

#### Task 4.1: Comprehensive prefers-reduced-motion Support

**Files:**
- Modify: `frontend/src/styles/motion-reveal.css`
- Modify: `frontend/src/styles/home-v2-layout.css`
- Modify: `frontend/src/styles/home-v2-panels.css`
- Modify: `frontend/src/styles/home-v2-search.css`
- Modify: `frontend/src/lib/motion.ts`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** Phase 3 complete

**Implementation Steps:**

- [ ] **Step 1: Add global reduced motion CSS**

Add to `frontend/src/styles/motion-reveal.css`:

```css
/* Global reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Specific element overrides */
  [data-rise],
  [data-podium] {
    opacity: 1 !important;
    transform: none !important;
  }

  .owner-mark-name > * {
    animation: none !important;
    background-image: none !important;
    color: var(--owner-mark-base) !important;
    -webkit-text-fill-color: var(--owner-mark-base);
  }

  .animate-fade-in,
  .animate-fade-in-scale,
  .animate-favorite-star-pop,
  .cs-tab-panel-enter {
    animation: none !important;
  }

  .cs-skeleton-shimmer {
    animation: none !important;
    background: var(--om-200);
  }

  .dark .cs-skeleton-shimmer {
    background: var(--char-700);
  }
}
```

- [ ] **Step 2: Update motion.ts to respect reduced motion globally**

Read: `frontend/src/lib/motion.ts`

```typescript
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Add listener for runtime changes
export function useReducedMotionListener(callback: (prefersReduced: boolean) => void) {
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    callback(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      callback(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [callback])
}
```

- [ ] **Step 3: Update PageAtmosphereBlobs to respect reduced motion**

Read: `frontend/src/components/PageAtmosphereBlobs.tsx`

The component already respects reduced motion, verify it's working correctly

- [ ] **Step 4: Test with prefers-reduced-motion enabled**

Enable in browser DevTools: Rendering > Emulate CSS media feature > prefers-reduced-motion: reduce

Expected: All animations are disabled or significantly reduced

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/motion-reveal.css frontend/src/lib/motion.ts
git commit -m "fix(a11y): add comprehensive prefers-reduced-motion support"
```

**Testing Approach:**
- DevTools: Enable prefers-reduced-motion and verify animations stop
- Visual: Animations should be disabled or very subtle
- Performance: Should improve for users with motion sensitivity
- Runtime: Test changing preference at runtime

---

#### Task 4.2: Complete Keyboard Navigation

**Files:**
- Modify: `frontend/src/components/DogCard.tsx`
- Modify: `frontend/src/components/toolbar/*.tsx`
- Modify: `frontend/src/pages/Shows/ShowCalendar/ShowCalendarRow.tsx`
- Modify: `frontend/src/pages/Events/EventListRow.tsx`
- Create: `frontend/src/hooks/useKeyboardNavigation.ts`

**Interfaces:**
- Consumes: None
- Produces: `useKeyboardNavigation` hook

**Complexity:** Hard

**Dependencies:** Task 4.1 complete

**Implementation Steps:**

- [ ] **Step 1: Create keyboard navigation hook**

Create: `frontend/src/hooks/useKeyboardNavigation.ts`

```typescript
import { useCallback, useEffect } from 'react'

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onSpace?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  disabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    disabled = false,
  } = options

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          onEnter?.()
          break
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          onSpace?.()
          break
        case 'Escape':
          e.preventDefault()
          onEscape?.()
          break
        case 'ArrowUp':
          e.preventDefault()
          onArrowUp?.()
          break
        case 'ArrowDown':
          e.preventDefault()
          onArrowDown?.()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onArrowLeft?.()
          break
        case 'ArrowRight':
          e.preventDefault()
          onArrowRight?.()
          break
      }
    },
    [disabled, onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]
  )

  return { handleKeyDown }
}

export function createKeyboardAccessibleButton(
  onClick: () => void,
  ariaLabel: string
): Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onKeyDown' | 'aria-label' | 'role' | 'tabIndex'> {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: onClick,
    onSpace: onClick,
  })

  return {
    onClick,
    onKeyDown: handleKeyDown,
    'aria-label': ariaLabel,
    role: 'button',
    tabIndex: 0,
  }
}
```

- [ ] **Step 2: Add keyboard support to DogCard**

Read: `frontend/src/components/DogCard.tsx`

The component is already a Link, which is keyboard accessible. Verify it has proper focus styles.

- [ ] **Step 3: Add keyboard support to custom interactive components**

Search for div elements with onClick handlers:

Run: `grep -r "onClick" frontend/src/components --include="*.tsx" -A 2 | grep -B 1 "div"`

For each custom interactive element, add keyboard support:

```tsx
const { handleKeyDown } = useKeyboardNavigation({
  onEnter: onClick,
  onSpace: onClick,
})

<div
  role="button"
  tabIndex={0}
  onClick={onClick}
  onKeyDown={handleKeyDown}
  aria-label={ariaLabel}
>
  {/* content */}
</div>
```

- [ ] **Step 4: Add visible focus indicators**

Add to `frontend/src/index.css`:

```css
/* Focus indicators */
*:focus-visible {
  outline: 2px solid var(--camel-600);
  outline-offset: 2px;
}

/* Dark mode focus */
.dark *:focus-visible {
  outline-color: var(--camel-400);
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

- [ ] **Step 5: Add skip navigation link**

Create: `frontend/src/components/SkipNavigation.tsx`

```tsx
export default function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-camel-600 focus:text-white focus:rounded"
    >
      Перейти к основному содержимому
    </a>
  )
}
```

Add to `frontend/src/App.tsx`:

```tsx
import SkipNavigation from './components/SkipNavigation'

export default function App() {
  return (
    <>
      <SkipNavigation />
      {/* ... rest of app */}
      <main id="main-content">
        {/* ... main content */}
      </main>
    </>
  )
}
```

- [ ] **Step 6: Test keyboard navigation**

- Tab through all interactive elements
- Use Enter/Space to activate
- Use Escape to close modals/menus
- Use Arrow keys for navigation within components

- [ ] **Step 7: Commit**

```bash
git add frontend/src/hooks/useKeyboardNavigation.ts frontend/src/components/SkipNavigation.tsx frontend/src/App.tsx frontend/src/index.css
git commit -m "fix(a11y): add comprehensive keyboard navigation support"
```

**Testing Approach:**
- Keyboard-only navigation: Test entire site without mouse
- Screen reader: Verify keyboard navigation works with screen readers
- Focus indicators: Ensure focus is always visible
- Skip link: Verify skip navigation works

---

#### Task 4.3: Focus Management System

**Files:**
- Create: `frontend/src/hooks/useFocusManagement.ts`
- Modify: `frontend/src/components/NavMenuDropdown.tsx`
- Modify: `frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx`

**Interfaces:**
- Consumes: None
- Produces: `useFocusManagement` hook

**Complexity:** Medium

**Dependencies:** Task 4.2 complete

**Implementation Steps:**

- [ ] **Step 1: Create focus management hook**

Create: `frontend/src/hooks/useFocusManagement.ts`

```typescript
import { useCallback, useRef, useEffect } from 'react'

export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }, [])

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
      previousFocusRef.current.focus()
    }
  }, [])

  const trapFocus = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    firstFocusable?.focus()

    return () => {
      container.removeEventListener('keydown', handleTab)
    }
  }, [])

  return { saveFocus, restoreFocus, trapFocus }
}

export function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement>) {
  const { trapFocus } = useFocusManagement()

  useEffect(() => {
    if (isOpen && containerRef.current) {
      return trapFocus(containerRef.current)
    }
  }, [isOpen, containerRef, trapFocus])
}
```

- [ ] **Step 2: Update NavMenuDropdown with focus trap**

Read: `frontend/src/components/NavMenuDropdown.tsx`

```tsx
import { useFocusTrap } from '../hooks/useFocusManagement'

export function NavMenuDropdown({ open, ...props }: NavMenuDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  useFocusTrap(open, menuRef)

  return (
    <div className="relative" ref={menuRef}>
      {/* ... */}
    </div>
  )
}
```

- [ ] **Step 3: Update ToolbarFiltersDropdown with focus trap**

Read: `frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx`

Apply same focus trap pattern

- [ ] **Step 4: Test focus management**

- Open dropdowns with keyboard
- Verify focus is trapped within dropdown
- Verify focus returns to trigger on close
- Test with Tab and Shift+Tab

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useFocusManagement.ts frontend/src/components/NavMenuDropdown.tsx frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx
git commit -m "fix(a11y): add focus management system for modals and dropdowns"
```

**Testing Approach:**
- Focus trap: Verify focus stays within dropdown when open
- Focus restoration: Verify focus returns to trigger on close
- Keyboard navigation: Test Tab/Shift+Tab within trapped regions
- Screen reader: Verify focus management works with screen readers

---

#### Task 4.4: ARIA Label Audit and Fixes

**Files:**
- Modify: Multiple components (to be identified during audit)
- Create: `frontend/src/lib/ariaAudit.ts`

**Interfaces:**
- Consumes: None
- Produces: ARIA audit report

**Complexity:** Medium

**Dependencies:** Task 4.3 complete

**Implementation Steps:**

- [ ] **Step 1: Create ARIA audit utility**

Create: `frontend/src/lib/ariaAudit.ts`

```typescript
/**
 * ARIA audit utility
 * Identifies elements missing ARIA labels or with insufficient labels
 */

export interface AriaIssue {
  element: string
  issue: string
  recommendation: string
}

export function auditAriaLabels(): AriaIssue[] {
  const issues: AriaIssue[] = []

  // Audit buttons without labels
  const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
  buttons.forEach(button => {
    if (!button.textContent?.trim()) {
      issues.push({
        element: button.outerHTML,
        issue: 'Button without text content and no aria-label',
        recommendation: 'Add aria-label or aria-labelledby',
      })
    }
  })

  // Audit inputs without labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id])')
  inputs.forEach(input => {
    issues.push({
      element: input.outerHTML,
      issue: 'Input without label association',
      recommendation: 'Add id and corresponding label, or aria-label',
    })
  })

  // Audit images without alt (except decorative)
  const images = document.querySelectorAll('img:not([alt])')
  images.forEach(img => {
    if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
      issues.push({
        element: img.outerHTML,
        issue: 'Image without alt attribute',
        recommendation: 'Add alt text or role="presentation" for decorative images',
      })
    }
  })

  return issues
}
```

- [ ] **Step 2: Run ARIA audit in browser console**

Add to `frontend/src/main.tsx` for development:

```typescript
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    const { auditAriaLabels } = await import('./lib/ariaAudit')
    const issues = auditAriaLabels()
    if (issues.length > 0) {
      console.group('ARIA Audit Issues')
      issues.forEach(issue => {
        console.warn(issue)
      })
      console.groupEnd()
    }
  })
}
```

- [ ] **Step 3: Fix identified ARIA issues**

Based on audit results, fix issues systematically:

```tsx
// Example fix for icon-only button
<button
  aria-label="Закрыть"
  onClick={onClose}
>
  <XIcon />
</button>

// Example fix for input
<label htmlFor="search">Поиск</label>
<input
  id="search"
  type="text"
  aria-label="Поиск по собакам"
/>
```

- [ ] **Step 4: Verify fixes with screen reader**

Test each fix with NVDA/VoiceOver

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/ariaAudit.ts frontend/src/main.tsx [fixed components]
git commit -m "fix(a11y): fix ARIA label issues identified in audit"
```

**Testing Approach:**
- Screen reader: Test all interactive elements
- Accessibility tree: Verify in Chrome DevTools
- axe DevTools: Run automated accessibility audit
- Manual audit: Review all interactive elements

---

#### Task 4.5: Color Contrast Verification

**Files:**
- Modify: `frontend/tailwind.config.js` (if needed)
- Create: `frontend/src/lib/colorContrast.ts`

**Interfaces:**
- Consumes: None
- Produces: Color contrast verification utility

**Complexity:** Medium

**Dependencies:** Task 4.4 complete

**Implementation Steps:**

- [ ] **Step 1: Create color contrast utility**

Create: `frontend/src/lib/colorContrast.ts`

```typescript
/**
 * Color contrast verification for WCAG AA compliance
 * AA requires 4.5:1 for normal text, 3:1 for large text
 */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

export function luminance(r: number, g: number, b: number): number {
  const [a, b, c] = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a * 0.2126 + b * 0.7152 + c * 0.0722
}

export function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)
  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

export function verifyWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = contrastRatio(foreground, background)
  const required = isLargeText ? 3 : 4.5
  return ratio >= required
}
```

- [ ] **Step 2: Audit current color palette**

Create test script to verify all color combinations:

```typescript
import { verifyWCAGAA } from './lib/colorContrast'

const colorPairs = [
  { fg: '#433a31', bg: '#f3ede4', label: 'charcoal-900 on om-100' },
  { fg: '#81796e', bg: '#f3ede4', label: 'charcoal-500 on om-100' },
  { fg: '#f3ede4', bg: '#433a31', label: 'om-100 on charcoal-900' },
  // ... add all used combinations
]

colorPairs.forEach(pair => {
  const passes = verifyWCAGAA(pair.fg, pair.bg)
  console.log(`${pair.label}: ${passes ? 'PASS' : 'FAIL'}`)
})
```

- [ ] **Step 3: Fix any failing color combinations**

Update tailwind.config.js or component-specific styles

- [ ] **Step 4: Verify with axe DevTools**

Run automated color contrast audit

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/colorContrast.ts frontend/tailwind.config.js
git commit -m "fix(a11y): verify and fix color contrast for WCAG AA compliance"
```

**Testing Approach:**
- Automated: Use axe DevTools color contrast checker
- Manual: Verify text is readable in both light and dark modes
- Screen reader: Color alone is not used to convey information
- Print: Verify colors work in print mode

---

### Phase 5: Responsive Design Expansion

#### Task 5.1: Expand Responsive Breakpoints

**Files:**
- Modify: `frontend/src/styles/responsive.css`
- Modify: `frontend/tailwind.config.js` (if needed)

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** Phase 4 complete

**Implementation Steps:**

- [ ] **Step 1: Review Tailwind config for existing breakpoints**

Read: `frontend/tailwind.config.js`

Default Tailwind breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

- [ ] **Step 2: Expand responsive.css with comprehensive breakpoints**

```css
/* Extra small devices (phones, < 375px) */
@media (max-width: 374px) {
  .home-v2-events-col {
    flex-direction: column;
  }
  
  .home-v2-search-input {
    font-size: 14px;
  }
}

/* Small devices (phones, 375px - 479px) */
@media (min-width: 375px) and (max-width: 479px) {
  .home-v2-events-col {
    flex-direction: column;
  }
}

/* Medium devices (large phones, 480px - 639px) */
@media (min-width: 480px) and (max-width: 639px) {
  .home-v2-events-col {
    flex-direction: column;
  }
  
  .dog-card-stats {
    flex-direction: row;
  }
}

/* Large devices (tablets, 640px - 767px) */
@media (min-width: 640px) and (max-width: 767px) {
  .home-v2-events-col {
    flex-direction: row;
  }
  
  .home-v2-panels {
    grid-template-columns: 1fr;
  }
}

/* Extra large devices (tablets, 768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .home-v2-events-col {
    flex-direction: row;
  }
  
  .home-v2-panels {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop devices (1024px - 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .home-v2-events-col {
    flex-direction: row;
  }
  
  .home-v2-panels {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large desktop (1280px - 1535px) */
@media (min-width: 1280px) and (max-width: 1535px) {
  .home-v2-panels {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Extra large desktop (1536px+) */
@media (min-width: 1536px) {
  .home-v2-panels {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

- [ ] **Step 3: Add mobile-first responsive typography**

```css
/* Base font sizes - mobile first */
html {
  font-size: 16px;
}

@media (min-width: 768px) {
  html {
    font-size: 17px;
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 18px;
  }
}

/* Responsive line heights */
@media (max-width: 767px) {
  h1 {
    font-size: 1.75rem;
    line-height: 1.2;
  }
  
  h2 {
    font-size: 1.5rem;
    line-height: 1.3;
  }
}

@media (min-width: 768px) {
  h1 {
    font-size: 2.25rem;
    line-height: 1.2;
  }
  
  h2 {
    font-size: 1.875rem;
    line-height: 1.3;
  }
}
```

- [ ] **Step 4: Test responsive behavior at each breakpoint**

Resize browser window to test each breakpoint
Expected: Layout adapts smoothly at each breakpoint

- [ ] **Step 5: Verify on actual devices**

Test on phone (320px-428px), tablet (768px-1024px), desktop (1920px+)
Expected: Appropriate layout for each device

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles/responsive.css
git commit -m "fix(design): expand responsive breakpoints for comprehensive device coverage"
```

**Testing Approach:**
- Browser DevTools: Test at each breakpoint
- Actual devices: Test on phone, tablet, desktop
- Visual regression: Ensure no layout shifts
- Orientation: Test portrait and landscape on mobile

---

#### Task 5.2: Touch-Friendly Interactive Elements

**Files:**
- Modify: `frontend/src/components/DogCard.tsx`
- Modify: `frontend/src/components/toolbar/*.tsx`
- Modify: `frontend/src/components/nav/*.tsx`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** Task 5.1 complete

**Implementation Steps:**

- [ ] **Step 1: Audit touch target sizes**

WCAG 2.2 AA requires touch targets to be at least 44x44 CSS pixels

Run: `grep -r "px-" frontend/src/components --include="*.tsx" | grep -E "(h-\[|w-\[|p-)"`

- [ ] **Step 2: Update DogCard touch targets**

```tsx
<Link
  to={`/dog/${dog.dog_id}`}
  className={shellClass}
  style={{ minHeight: '84px' }} // Ensure 44px minimum tap target
>
  {/* ... */}
</Link>
```

- [ ] **Step 3: Update toolbar buttons**

Ensure all toolbar buttons meet 44x44px minimum:

```tsx
<button
  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
  aria-label={label}
>
  <Icon size={20} />
</button>
```

- [ ] **Step 4: Add spacing between touch targets**

Ensure at least 8px spacing between adjacent touch targets:

```tsx
<div className="flex gap-2">
  <button className="min-h-[44px] min-w-[44px]">Button 1</button>
  <button className="min-h-[44px] min-w-[44px]">Button 2</button>
</div>
```

- [ ] **Step 5: Test touch targets on mobile device**

Use Chrome DevTools device emulation or actual device
Expected: All touch targets are easily tappable

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/DogCard.tsx frontend/src/components/toolbar/*.tsx frontend/src/components/nav/*.tsx
git commit -m "fix(a11y): ensure all touch targets meet 44x44px minimum"
```

**Testing Approach:**
- Mobile device: Test on actual phone or tablet
- DevTools: Use device emulation to test touch targets
- Accessibility: Verify with screen reader on mobile
- Visual: Ensure spacing doesn't break layout

---

### Phase 6: React Composition Patterns

#### Task 6.1: Refactor DogCard with Compound Components

**Files:**
- Modify: `frontend/src/components/DogCard.tsx`
- Create: `frontend/src/components/DogCard/DogCard.tsx`
- Create: `frontend/src/components/DogCard/DogCard.Header.tsx`
- Create: `frontend/src/components/DogCard/DogCard.Stats.tsx`
- Create: `frontend/src/components/DogCard/DogCard.Medals.tsx`
- Create: `frontend/src/components/DogCard/DogCard.Rank.tsx`

**Interfaces:**
- Consumes: Dog data object
- Produces: Compound component API

**Complexity:** Hard

**Dependencies:** Phase 5 complete

**Implementation Steps:**

- [ ] **Step 1: Create DogCard context**

Create: `frontend/src/components/DogCard/DogCardContext.tsx`

```typescript
import { createContext, useContext } from 'react'

interface DogCardContextValue {
  dog: DogCardProps['dog']
  type: DogCardProps['type']
  filterYear: string
  rank?: number
  variant: DogCardVariant
}

const DogCardContext = createContext<DogCardContextValue | null>(null)

export function useDogCardContext() {
  const context = useContext(DogCardContext)
  if (!context) {
    throw new Error('DogCard compound components must be used within DogCard')
  }
  return context
}

export function DogCardProvider({ children, ...value }: DogCardContextValue & { children: React.ReactNode }) {
  return <DogCardContext.Provider value={value}>{children}</DogCardContext.Provider>
}
```

- [ ] **Step 2: Create DogCard compound components**

Create: `frontend/src/components/DogCard/DogCard.tsx`

```typescript
import { DogCardProvider } from './DogCardContext'
import { DogCardHeader } from './DogCard.Header'
import { DogCardStats } from './DogCard.Stats'
import { DogCardMedals } from './DogCard.Medals'
import { DogCardRank } from './DogCard.Rank'

interface DogCardProps {
  dog: {
    dog_id: number
    name_lat: string
    name_ru?: string
    breed: string
    year?: number
    // ... other dog properties
  }
  type: 'placement' | 'score' | 'speed' | 'elo' | 'combined'
  filterYear: string
  rank?: number
  variant?: 'card' | 'embedded'
  children: React.ReactNode
}

export function DogCard({ dog, type, filterYear, rank, variant = 'card', children }: DogCardProps) {
  const shellClass = variant === 'embedded' ? EMBEDDED_SHELL : CARD_SHELL

  return (
    <DogCardProvider dog={dog} type={type} filterYear={filterYear} rank={rank} variant={variant}>
      <Link to={`/dog/${dog.dog_id}`} className={shellClass}>
        {children}
      </Link>
    </DogCardProvider>
  )
}

DogCard.Header = DogCardHeader
DogCard.Stats = DogCardStats
DogCard.Medals = DogCardMedals
DogCard.Rank = DogCardRank
```

- [ ] **Step 3: Create DogCard.Header component**

Create: `frontend/src/components/DogCard/DogCard.Header.tsx`

```typescript
import { useDogCardContext } from './DogCardContext'
import OwnerCrownName from '../OwnerCrownName'
import { parseDogName } from '../../lib/dogName'
import { displayBreed } from '../../lib/breedMapping'
import { dogYearBadge } from '../../lib/season'

export function DogCardHeader() {
  const { dog, filterYear } = useDogCardContext()
  const { primary, secondary } = parseDogName(dog.name_lat, dog.name_ru)
  const breedDisplay = displayBreed(dog.breed)
  const yearBadge = dogYearBadge(dog, filterYear)

  return (
    <div className="min-w-0 overflow-hidden">
      <OwnerCrownName name={primary} dogId={dog.dog_id} kind="competition">
        <h3
          className="text-xs font-bold leading-snug text-charcoal-900 dark:text-charcoal-100"
          title={secondary ? `${primary} / ${secondary}` : primary}
        >
          {primary}
        </h3>
      </OwnerCrownName>
      <div className="flex items-center gap-1 text-[9px]">
        <span className="text-charcoal-500 dark:text-charcoal-400">
          {breedDisplay.primary}
        </span>
        {yearBadge && (
          <>
            <span className="text-charcoal-300 dark:text-charcoal-600" aria-hidden>
              ·
            </span>
            <span className="text-charcoal-500 dark:text-charcoal-400">
              {yearBadge.label}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create DogCard.Stats component**

Create: `frontend/src/components/DogCard/DogCard.Stats.tsx`

```typescript
import { useDogCardContext } from './DogCardContext'
import { StartsLabel } from './DogCard'

export function DogCardStats() {
  const { dog, type } = useDogCardContext()

  if (type === 'speed') {
    return (
      <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-charcoal-500 dark:text-charcoal-400">Макс., км/ч:</span>
          <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
            {dog.best_speed ? dog.best_speed.toFixed(1) : '-'}
          </span>
          <span className="text-charcoal-300 dark:text-charcoal-600" aria-hidden>
            ·
          </span>
          <span className="text-charcoal-500 dark:text-charcoal-400">Сред., км/ч:</span>
          <span className="font-semibold tabular-nums text-charcoal-700 dark:text-charcoal-200">
            {dog.avg_speed ? dog.avg_speed.toFixed(1) : '-'}
          </span>
        </div>
        <StartsLabel starts={dog.total_starts || 0} size="md" />
      </div>
    )
  }

  // ... other type implementations
}
```

- [ ] **Step 5: Create DogCard.Medals component**

Create: `frontend/src/components/DogCard/DogCard.Medals.tsx`

```typescript
import { useDogCardContext } from './DogCardContext'
import MedalBadge from '../MedalBadge'

export function DogCardMedals() {
  const { dog } = useDogCardContext()

  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs">
      <MedalBadge variant="gold" count={dog.gold || 0} size="sm" />
      <MedalBadge variant="silver" count={dog.silver || 0} size="sm" />
      <MedalBadge variant="bronze" count={dog.bronze || 0} size="sm" />
    </div>
  )
}
```

- [ ] **Step 6: Create DogCard.Rank component**

Create: `frontend/src/components/DogCard/DogCard.Rank.tsx`

```typescript
import { useDogCardContext } from './DogCardContext'
import RankBadge from '../RankBadge'

export function DogCardRank() {
  const { rank } = useDogCardContext()

  if (rank == null || rank <= 0) return null

  return (
    <div className="flex shrink-0 items-center self-stretch pr-2">
      <RankBadge rank={rank} />
    </div>
  )
}
```

- [ ] **Step 7: Update usage of DogCard to use compound components**

Replace existing DogCard usage:

```tsx
// Before
<DogCard dog={dog} type="combined" filterYear={filterYear} rank={rank} />

// After
<DogCard dog={dog} type="combined" filterYear={filterYear} rank={rank}>
  <DogCard.Rank />
  <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-0 overflow-hidden">
    <DogCard.Header />
    <DogCard.Medals />
  </div>
  <div className="mr-8 flex min-h-0 min-w-[10.5rem] shrink-0 flex-col justify-between border-l border-old-money-200/60 pl-2 dark:border-charcoal-600/60">
    <CombinedMetricsRotator
      csValue={formatIndexScore(dog)}
      eloValue={elo.value}
    />
    <div className="flex justify-end">
      <StartsLabel starts={dog.total_starts || 0} size="md" />
    </div>
  </div>
</DogCard>
```

- [ ] **Step 8: Test compound components**

Run: `yarn run dev`
Expected: DogCard renders correctly with compound components

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/DogCard/
git commit -m "refactor: convert DogCard to compound component pattern"
```

**Testing Approach:**
- Visual: DogCard should look identical before and after
- Functionality: All card variants should work correctly
- Props: Verify context provides correct data to sub-components
- Performance: No performance regression

---

#### Task 6.2: Refactor Toolbar with Compound Components

**Files:**
- Modify: `frontend/src/components/toolbar/PageToolbar.tsx`
- Create: `frontend/src/components/toolbar/Toolbar/Toolbar.tsx`
- Create: `frontend/src/components/toolbar/Toolbar/Toolbar.Search.tsx`
- Create: `frontend/src/components/toolbar/Toolbar/Toolbar.Filters.tsx`
- Create: `frontend/src/components/toolbar/Toolbar/Toolbar.Actions.tsx`

**Interfaces:**
- Consumes: Toolbar data
- Produces: Compound component API

**Complexity:** Hard

**Dependencies:** Task 6.1 complete

**Implementation Steps:**

- [ ] **Step 1: Create Toolbar context**

Create: `frontend/src/components/toolbar/Toolbar/ToolbarContext.tsx`

```typescript
import { createContext, useContext } from 'react'

interface ToolbarContextValue {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: Record<string, any>
  onFilterChange: (key: string, value: any) => void
  actions: React.ReactNode
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null)

export function useToolbarContext() {
  const context = useContext(ToolbarContext)
  if (!context) {
    throw new Error('Toolbar compound components must be used within Toolbar')
  }
  return context
}

export function ToolbarProvider({ children, ...value }: ToolbarContextValue & { children: React.ReactNode }) {
  return <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>
}
```

- [ ] **Step 2: Create Toolbar compound component**

Create: `frontend/src/components/toolbar/Toolbar/Toolbar.tsx`

```typescript
import { ToolbarProvider } from './ToolbarContext'
import { ToolbarSearch } from './Toolbar.Search'
import { ToolbarFilters } from './Toolbar.Filters'
import { ToolbarActions } from './Toolbar.Actions'

interface ToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: Record<string, any>
  onFilterChange: (key: string, value: any) => void
  children: React.ReactNode
}

export function Toolbar({ searchQuery, onSearchChange, filters, onFilterChange, children }: ToolbarProps) {
  return (
    <ToolbarProvider
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      filters={filters}
      onFilterChange={onFilterChange}
      actions={null}
    >
      <div className="flex items-center gap-4">
        {children}
      </div>
    </ToolbarProvider>
  )
}

Toolbar.Search = ToolbarSearch
Toolbar.Filters = ToolbarFilters
Toolbar.Actions = ToolbarActions
```

- [ ] **Step 3: Create Toolbar.Search component**

Create: `frontend/src/components/toolbar/Toolbar/Toolbar.Search.tsx`

```typescript
import { useToolbarContext } from './ToolbarContext'
import ToolbarSearch from '../ToolbarSearch'

export function ToolbarSearch() {
  const { searchQuery, onSearchChange } = useToolbarContext()

  return <ToolbarSearch value={searchQuery} onChange={onSearchChange} />
}
```

- [ ] **Step 4: Create Toolbar.Filters component**

Create: `frontend/src/components/toolbar/Toolbar/Toolbar.Filters.tsx`

```typescript
import { useToolbarContext } from './ToolbarContext'
import ToolbarFiltersDropdown from '../ToolbarFiltersDropdown'

export function ToolbarFilters() {
  const { filters, onFilterChange } = useToolbarContext()

  return <ToolbarFiltersDropdown filters={filters} onFilterChange={onFilterChange} />
}
```

- [ ] **Step 5: Create Toolbar.Actions component**

Create: `frontend/src/components/toolbar/Toolbar/Toolbar.Actions.tsx`

```typescript
import { useToolbarContext } from './ToolbarContext'

export function ToolbarActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2">{children}</div>
}
```

- [ ] **Step 6: Update PageToolbar to use compound components**

Read: `frontend/src/components/toolbar/PageToolbar.tsx`

Refactor to use compound components:

```tsx
import { Toolbar } from './Toolbar/Toolbar'

export function PageToolbar({ searchQuery, onSearchChange, filters, onFilterChange }: PageToolbarProps) {
  return (
    <Toolbar
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      filters={filters}
      onFilterChange={onFilterChange}
    >
      <Toolbar.Search />
      <Toolbar.Filters />
      <Toolbar.Actions>
        <ViewToggle />
      </Toolbar.Actions>
    </Toolbar>
  )
}
```

- [ ] **Step 7: Test compound components**

Run: `yarn run dev`
Expected: Toolbar renders correctly with compound components

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/toolbar/Toolbar/
git commit -m "refactor: convert Toolbar to compound component pattern"
```

**Testing Approach:**
- Visual: Toolbar should look identical before and after
- Functionality: All toolbar features should work correctly
- Props: Verify context provides correct data to sub-components
- Performance: No performance regression

---

#### Task 6.3: Reduce Boolean Prop Proliferation

**Files:**
- Modify: `frontend/src/components/DogCard.tsx` (already refactored)
- Modify: `frontend/src/components/EventListCard.tsx`
- Modify: `frontend/src/components/MetricsCard.tsx`

**Interfaces:**
- Consumes: None
- Produces: Simplified component APIs

**Complexity:** Medium

**Dependencies:** Task 6.2 complete

**Implementation Steps:**

- [ ] **Step 1: Audit boolean props across components**

Run: `grep -r "boolean" frontend/src/components --include="*.tsx" -A 2`

Identify components with many boolean props

- [ ] **Step 2: Refactor EventListCard to use variants**

Read: `frontend/src/components/EventListCard.tsx`

Replace boolean props with variant prop:

```tsx
// Before
interface EventListCardProps {
  event: Event
  compact?: boolean
  important?: boolean
  showJudges?: boolean
  cancelled?: boolean
}

// After
type EventListCardVariant = 'default' | 'compact' | 'important' | 'cancelled'

interface EventListCardProps {
  event: Event
  variant?: EventListCardVariant
  showJudges?: boolean
}
```

- [ ] **Step 3: Refactor MetricsCard to use variants**

Read: `frontend/src/components/MetricsCard.tsx`

Apply same pattern

- [ ] **Step 4: Test refactored components**

Run: `yarn run dev`
Expected: Components render correctly with variant props

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/EventListCard.tsx frontend/src/components/MetricsCard.tsx
git commit -m "refactor: replace boolean props with variant components"
```

**Testing Approach:**
- Visual: Components should look identical before and after
- Functionality: All variants should work correctly
- Props: Verify simplified props are easier to understand
- Type safety: Ensure TypeScript catches incorrect usage

---

### Phase 7: Performance Optimization (Advanced)

#### Task 7.1: Eliminate Render Waterfalls

**Files:**
- Modify: `frontend/src/pages/Home.tsx`
- Modify: `frontend/src/pages/TopDogs/index.tsx`
- Modify: `frontend/src/hooks/useHomeData.ts`

**Interfaces:**
- Consumes: None
- Produces: Optimized data fetching

**Complexity:** Hard

**Dependencies:** Phase 6 complete

**Implementation Steps:**

- [ ] **Step 1: Audit data fetching patterns**

Identify sequential data fetches that can be parallelized

Run: `grep -r "useEffect" frontend/src/pages --include="*.tsx" -A 5`

- [ ] **Step 2: Refactor Home.tsx to parallelize data fetching**

Read: `frontend/src/pages/Home.tsx` and `frontend/src/hooks/useHomeData.ts`

Ensure all data fetches happen in parallel:

```typescript
export function useHomeData() {
  const [stats, setStats] = useState<HeroStats | null>(null)
  const [showStats, setShowStats] = useState<HeroShowStats | null>(null)
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([])
  const [featuredShows, setFeaturedShows] = useState<FeaturedShow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Parallel fetch all data
    Promise.all([
      fetch('/data/v1/ui-stats.json').then(r => r.json()),
      fetch('/data/v1/shows/ui-stats.json').then(r => r.json()),
      fetch('/data/v1/featured-events.json').then(r => r.json()),
      fetch('/data/v1/shows/featured-shows.json').then(r => r.json()),
    ])
      .then(([statsData, showStatsData, eventsData, showsData]) => {
        setStats(statsData)
        setShowStats(showStatsData)
        setFeaturedEvents(eventsData)
        setFeaturedShows(showsData)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { stats, showStats, featuredEvents, featuredShows, loading, error }
}
```

- [ ] **Step 3: Add React Suspense boundaries for lazy-loaded components**

```tsx
import { Suspense, lazy } from 'react'

const DoninoRecordsSection = lazy(() => import('./Home/components/DoninoRecordsSection'))

export default function Home() {
  return (
    <div className="home-v2" ref={pageRef}>
      {/* ... */}
      <Suspense fallback={<LoadingCard />}>
        <DoninoRecordsSection doninoSpeedRecords={doninoSpeedRecords} />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 4: Verify parallel fetching works**

Run: `yarn run dev`
Expected: Data loads in parallel, faster initial render

- [ ] **Step 5: Measure performance improvement**

Run Lighthouse audit before and after
Expected: Improved TTI and LCP

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/Home.tsx frontend/src/hooks/useHomeData.ts
git commit -m "perf: eliminate render waterfalls with parallel data fetching"
```

**Testing Approach:**
- Performance: Measure TTI and LCP improvement
- Network: Verify requests happen in parallel
- Error handling: Ensure errors are handled correctly
- Loading states: Verify loading states work

---

#### Task 7.2: Re-render Optimization

**Files:**
- Modify: `frontend/src/components/DogCard.tsx`
- Modify: `frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx`
- Modify: `frontend/src/pages/TopDogs/index.tsx`

**Interfaces:**
- Consumes: None
- Produces: Optimized re-renders

**Complexity:** Hard

**Dependencies:** Task 7.1 complete

**Implementation Steps:**

- [ ] **Step 1: Audit re-render patterns**

Use React DevTools Profiler to identify unnecessary re-renders (dev-only tool for local development)

- [ ] **Step 2: Memoize expensive calculations**

```typescript
import { useMemo } from 'react'

function DogCard({ dog, type, filterYear, rank, variant = 'card', children }: DogCardProps) {
  const { primary, secondary } = useMemo(
    () => parseDogName(dog.name_lat, dog.name_ru),
    [dog.name_lat, dog.name_ru]
  )
  
  const breedDisplay = useMemo(
    () => displayBreed(dog.breed),
    [dog.breed]
  )
  
  const yearBadge = useMemo(
    () => dogYearBadge(dog, filterYear),
    [dog, filterYear]
  )
  
  // ... rest of component
}
```

- [ ] **Step 3: Memoize callback functions**

```typescript
const handleFilterChange = useCallback(
  (key: string, value: any) => {
    onFilterChange(key, value)
  },
  [onFilterChange]
)
```

- [ ] **Step 4: Use React.memo for list items**

```typescript
export const DogCard = React.memo(function DogCard({ dog, type, filterYear, rank, variant = 'card', children }: DogCardProps) {
  // ... component implementation
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.dog.dog_id === nextProps.dog.dog_id &&
    prevProps.type === nextProps.type &&
    prevProps.filterYear === nextProps.filterYear &&
    prevProps.rank === nextProps.rank &&
    prevProps.variant === nextProps.variant
  )
})
```

- [ ] **Step 5: Optimize ToolbarFiltersDropdown**

```typescript
export const ToolbarFiltersDropdown = React.memo(function ToolbarFiltersDropdown({ filters, onFilterChange }: ToolbarFiltersDropdownProps) {
  // ... component implementation
})
```

- [ ] **Step 6: Test re-render optimization**

Run: `yarn run dev` with React DevTools Profiler (dev-only)
Expected: Fewer unnecessary re-renders

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/DogCard.tsx frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx
git commit -m "perf: optimize re-renders with memoization"
```

**Testing Approach:**
- Profiler: Use React DevTools Profiler to measure re-renders (dev-only)
- Performance: Measure FPS during interactions
- Memory: Check for memory leaks
- Functionality: Ensure optimizations don't break functionality

---

#### Task 7.3: JavaScript Performance Improvements

**Files:**
- Modify: `frontend/src/lib/utils.ts`
- Modify: `frontend/src/pages/TopDogs/index.tsx`
- Modify: `frontend/src/pages/Shows/ShowRanking.tsx`

**Interfaces:**
- Consumes: None
- Produces: Optimized JavaScript

**Complexity:** Medium

**Dependencies:** Task 7.2 complete

**Implementation Steps:**

- [ ] **Step 1: Audit JavaScript performance bottlenecks**

Use Chrome DevTools Performance tab to identify slow functions

- [ ] **Step 2: Optimize array operations**

Replace multiple filter/map operations with single loop:

```typescript
// Before
const filtered = dogs.filter(d => d.breed === selectedBreed)
const sorted = filtered.sort((a, b) => b.score - a.score)
const ranked = sorted.map((d, i) => ({ ...d, rank: i + 1 }))

// After
const ranked = []
for (const dog of dogs) {
  if (dog.breed === selectedBreed) {
    ranked.push(dog)
  }
}
ranked.sort((a, b) => b.score - a.score)
ranked.forEach((dog, i) => {
  dog.rank = i + 1
})
```

- [ ] **Step 3: Use Set/Map for O(1) lookups**

```typescript
// Before
const selectedIds = ['1', '2', '3']
const isSelected = selectedIds.includes(dog.id)

// After
const selectedIdsSet = new Set(['1', '2', '3'])
const isSelected = selectedIdsSet.has(dog.id)
```

- [ ] **Step 4: Cache expensive computations**

```typescript
const expensiveComputationCache = new Map<string, Result>()

function expensiveComputation(input: string): Result {
  if (expensiveComputationCache.has(input)) {
    return expensiveComputationCache.get(input)!
  }
  
  const result = /* ... expensive computation ... */
  expensiveComputationCache.set(input, result)
  return result
}
```

- [ ] **Step 5: Use requestIdleCallback for non-critical work**

```typescript
function deferNonCriticalWork(callback: () => void) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 0)
  }
}
```

- [ ] **Step 6: Test JavaScript performance**

Run: `yarn run dev` with Chrome DevTools Performance tab
Expected: Improved JavaScript execution time

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/utils.ts frontend/src/pages/TopDogs/index.tsx frontend/src/pages/Shows/ShowRanking.tsx
git commit -m "perf: optimize JavaScript performance"
```

**Testing Approach:**
- Performance: Measure JavaScript execution time
- Memory: Check for memory leaks
- Functionality: Ensure optimizations don't break functionality
- Benchmark: Compare before/after performance

---

## Testing Strategies

### Accessibility Testing

#### Automated Testing
- **axe DevTools:** Run automated accessibility audit on all pages
- **Lighthouse Accessibility:** Target score 90+
- **WAVE:** Browser extension for accessibility testing

#### Manual Testing
- **Screen Reader Testing:**
  - NVDA (Windows) with Firefox
  - VoiceOver (Mac) with Safari
  - TalkBack (Android) with Chrome
  - VoiceOver (iOS) with Safari
- **Keyboard Navigation:**
  - Tab through all interactive elements
  - Use Enter/Space to activate
  - Use Escape to close modals/menus
  - Use Arrow keys for navigation
- **Focus Management:**
  - Verify focus indicators are visible
  - Verify focus is trapped in modals
  - Verify focus returns to trigger on close
- **Color Contrast:**
  - Verify all text meets WCAG AA (4.5:1 for normal, 3:1 for large)
  - Test in both light and dark modes
- **Reduced Motion:**
  - Enable prefers-reduced-motion in browser
  - Verify all animations are disabled or reduced

### Performance Testing

#### Core Web Vitals
- **Largest Contentful Paint (LCP):** Target < 2.5s
- **First Input Delay (FID):** Target < 100ms
- **Cumulative Layout Shift (CLS):** Target < 0.1

#### Tools
- **Lighthouse:** Target performance score 90+
- **WebPageTest:** Detailed performance analysis
- **Chrome DevTools Performance:** Profile JavaScript execution
- **React DevTools Profiler:** Identify re-render issues (dev-only)

#### Metrics to Track
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Bundle size
- Font loading time
- Image loading time

### Visual Regression Testing

#### Tools
- **Percy:** Automated visual regression testing
- **Storybook:** Component visual testing
- **Manual screenshots:** Before/after comparison

#### Checklist
- Test in light mode
- Test in dark mode
- Test at all breakpoints (320px, 375px, 768px, 1024px, 1280px, 1536px)
- Test in portrait and landscape (mobile)
- Test across browsers (Chrome, Firefox, Safari, Edge)

### Cross-Browser Testing

#### Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

#### Mobile Browsers
- iOS Safari (latest)
- Chrome Mobile (latest)
- Samsung Internet (latest)

#### Testing Approach
- Test all major user flows
- Test accessibility features in each browser
- Test performance in each browser

---

## Timeline Estimates

### Total Duration: 14 Days (2-3 weeks)

#### Phase 1: Critical Accessibility Fixes (P1) - 1 Day
- Task 1.1: Empty alt text - 2 hours
- Task 1.2: ARIA labels - 4 hours
- Task 1.3: Bounce easing - 2 hours

#### Phase 2: Visual Consistency Improvements (P2) - 1 Day
- Task 2.1: Side-tab borders - 2 hours
- Task 2.2: OAuth border - 1 hour
- Testing and review - 5 hours

#### Phase 3: Performance Optimization - 2 Days
- Task 3.1: Font loading - 4 hours
- Task 3.2: Bundle analysis - 6 hours
- Task 3.3: Image loading - 4 hours
- Testing and review - 2 hours

#### Phase 4: WCAG 2.2 AA Compliance - 3 Days
- Task 4.1: prefers-reduced-motion - 4 hours
- Task 4.2: Keyboard navigation - 8 hours
- Task 4.3: Focus management - 4 hours
- Task 4.4: ARIA audit - 4 hours
- Task 4.5: Color contrast - 4 hours
- Testing and review - 4 hours

#### Phase 5: Responsive Design Expansion - 2 Days
- Task 5.1: Responsive breakpoints - 6 hours
- Task 5.2: Touch targets - 4 hours
- Testing and review - 6 hours

#### Phase 6: React Composition Patterns - 3 Days
- Task 6.1: DogCard compound - 8 hours
- Task 6.2: Toolbar compound - 8 hours
- Task 6.3: Boolean props - 4 hours
- Testing and review - 4 hours

#### Phase 7: Performance Optimization (Advanced) - 2 Days
- Task 7.1: Render waterfalls - 6 hours
- Task 7.2: Re-render optimization - 6 hours
- Task 7.3: JavaScript performance - 4 hours
- Testing and review - 2 hours

### Dependencies and Critical Path

1. **Phase 1** must complete first (critical accessibility issues)
2. **Phase 2** depends on Phase 1 (visual consistency after accessibility)
3. **Phase 3** depends on Phase 2 (performance after visual fixes)
4. **Phase 4** depends on Phase 3 (WCAG compliance after performance)
5. **Phase 5** depends on Phase 4 (responsive design after accessibility)
6. **Phase 6** depends on Phase 5 (composition after responsive)
7. **Phase 7** depends on Phase 6 (advanced performance after architecture)

### Parallel Work Opportunities

- Phase 4 tasks can be done in parallel within the phase
- Phase 6 tasks can be done in parallel within the phase
- Phase 7 tasks can be done in parallel within the phase

---

## Success Criteria and Metrics

### Accessibility Metrics

#### Target Scores
- **Lighthouse Accessibility:** 90+ (currently ~65)
- **axe DevTools:** 0 critical issues, 0 serious issues
- **WCAG 2.2 AA Compliance:** 100% checklist complete

#### Specific Criteria
- [ ] All P1 accessibility issues resolved
- [ ] All P2 accessibility issues resolved
- [ ] Keyboard navigation works across entire site
- [ ] Screen reader announces all interactive elements clearly
- [ ] All animations respect prefers-reduced-motion
- [ ] All touch targets meet 44x44px minimum
- [ ] All color contrast ratios meet WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Focus indicators visible on all focusable elements
- [ ] Skip navigation link present and functional
- [ ] Focus management works for all modals and dropdowns

### Performance Metrics

#### Target Scores
- **Lighthouse Performance:** 90+ (baseline TBD)
- **Core Web Vitals:**
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

#### Specific Criteria
- [ ] Font file size reduced by 30%+
- [ ] Bundle size reduced by 15%+
- [ ] LCP improved by 20%+
- [ ] TTI improved by 15%+
- [ ] Re-renders minimized (measured with React DevTools Profiler, dev-only)
- [ ] JavaScript execution time improved (measured with Chrome DevTools)
- [ ] Images load progressively with placeholders
- [ ] Data fetching parallelized (no waterfalls)

### Visual Design Metrics

#### Target Scores
- **Audit Score:** 18+/20 (currently 13/20)
- **Visual Consistency:** 100% (no AI-generated artifacts)

#### Specific Criteria
- [ ] All AI-generated side-tab borders removed
- [ ] Border accents consistent across components
- [ ] Modern easing functions used throughout
- [ ] Responsive design works at 5+ breakpoints
- [ ] Typography scales appropriately
- [ ] No horizontal scroll on mobile (320px+)
- [ ] Design system alignment (consistent spacing, colors, typography)

### Code Architecture Metrics

#### Target Scores
- **Boolean Props Reduction:** 50%+ reduction
- **Component Reuse:** Increased through composition patterns
- **Props Interface Complexity:** Simplified

#### Specific Criteria
- [ ] DogCard uses compound component pattern
- [ ] Toolbar uses compound component pattern
- [ ] Boolean props replaced with variant components
- [ ] Context-based state management for complex components
- [ ] Children-based composition preferred over render props
- [ ] Component boundaries clear and well-defined
- [ ] Props interfaces simplified and well-documented

---

## Rollback Procedures

### Per-Task Rollback

Each task is committed independently, allowing for easy rollback of individual changes:

```bash
# View commit history
git log --oneline

# Rollback specific commit
git revert <commit-hash>

# Or rollback to specific commit
git checkout <commit-hash>
```

### Phase-Level Rollback

If an entire phase needs to be rolled back:

```bash
# Identify commits for the phase
git log --oneline --since="2025-01-15" --until="2025-01-16"

# Revert range of commits
git revert <oldest-commit>..<newest-commit>
```

### Emergency Rollback

If critical issues arise in production:

```bash
# Rollback to known good state
git checkout production
git merge <known-good-commit>

# Deploy rollback
yarn run build
# Deploy to production
```

### Rollback Testing

After rollback:
1. Verify site loads correctly
2. Test critical user flows
3. Run accessibility audit
4. Run performance audit
5. Test on multiple browsers and devices

### Rollback Decision Criteria

Rollback if:
- Critical accessibility regression
- Performance regression > 20%
- Visual regression affecting core functionality
- Breaking changes to existing features
- Security vulnerabilities introduced

---

## Post-Implementation Validation

### Final Audit Checklist

#### Accessibility
- [ ] Run Lighthouse accessibility audit (target 90+)
- [ ] Run axe DevTools audit (0 critical/serious issues)
- [ ] Test with NVDA/VoiceOver (screen reader)
- [ ] Test keyboard-only navigation
- [ ] Test with prefers-reduced-motion enabled
- [ ] Verify color contrast with axe DevTools
- [ ] Verify touch targets meet 44x44px minimum
- [ ] Verify focus indicators are visible
- [ ] Verify skip navigation link works
- [ ] Verify focus management in modals/dropdowns

#### Performance
- [ ] Run Lighthouse performance audit (target 90+)
- [ ] Measure Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Run bundle analysis (verify size reduction)
- [ ] Test font loading (verify optimization)
- [ ] Test image loading (verify progressive enhancement)
- [ ] Profile JavaScript execution (verify improvements)
- [ ] Profile re-renders with React DevTools (verify optimization, dev-only)

#### Visual Design
- [ ] Visual regression testing (before/after screenshots)
- [ ] Test at all breakpoints (320px to 1920px+)
- [ ] Test in light and dark modes
- [ ] Test on mobile devices (portrait and landscape)
- [ ] Verify design system alignment
- [ ] Verify no AI-generated artifacts remain

#### Code Architecture
- [ ] Review compound component implementations
- [ ] Verify boolean props reduced
- [ ] Verify context-based state management
- [ ] Verify props interfaces simplified
- [ ] Run TypeScript compiler (no errors)
- [ ] Run ESLint (no new warnings)
- [ ] Run existing tests (all passing)

### Documentation Updates

After implementation:
1. Update `docs/sheets/` with new patterns
2. Update component documentation with composition examples
3. Update accessibility documentation
4. Update performance documentation
5. Create ADR (Architecture Decision Record) for major changes

### Team Training

Conduct training sessions on:
1. WCAG 2.2 AA compliance requirements
2. React composition patterns
3. Performance optimization techniques
4. Accessibility testing methodologies
5. Component architecture best practices

---

## Appendix: WCAG 2.2 AA Checklist

### Perceivable

#### 1.1 Text Alternatives
- [ ] All non-text content has text alternative (alt text)
- [ ] Decorative images marked with role="presentation" or aria-hidden="true"
- [ ] Complex images have extended descriptions

#### 1.2 Time-based Media
- [ ] Audio-only content has text alternative
- [ ] Video-only content has audio description or text alternative
- [ ] Captions provided for synchronized media

#### 1.3 Adaptable
- [ ] Info and relationships conveyed via structure
- [ ] Meaningful sequence is preserved
- [ ] Sensory characteristics not sole indicator

#### 1.4 Distinguishable
- [ ] Color not used as only visual means
- [ ] Audio control provided
- [ ] Contrast ratio minimum 4.5:1 (3:1 for large text)
- [ ] Text resizable to 200% without loss of content
- [ ] Images of text avoided (except essential)

### Operable

#### 2.1 Keyboard Accessible
- [ ] All functionality keyboard accessible
- [ ] No keyboard trap
- [ ] Keyboard focus visible
- [ ] Logical focus order
- [ ] Skip navigation link provided

#### 2.2 Enough Time
- [ ] User can disable, adjust, or extend time limits
- [ ] Moving, blinking, scrolling content can be paused
- [ ] Re-authentication after timeout doesn't lose data

#### 2.3 Seizures and Physical Reactions
- [ ] No flashing content (3 flashes/second)
- [ ] Flashing below threshold

#### 2.4 Navigable
- [ ] Bypass blocks provided
- [ ] Page titles descriptive
- [ ] Focus order logical
- [ ] Link purpose descriptive (except where ambiguous)
- [ ] Multiple ways to navigate
- [ ] Headings and labels descriptive
- [ ] Consistent identification
- [ ] Consistent navigation

#### 2.5 Input Modalities (NEW in 2.2)
- [ ] Pointer gestures not required (except essential)
- [ ] Pointer cancellation supported
- [ ] Label in name
- [ ] Motion actuation supported
- [ ] Size of target sufficient (44x44px minimum)
- [ ] Concurrent input mechanisms

### Understandable

#### 3.1 Readable
- [ ] Language of page identified
- [ ] Language of parts identified
- [ ] Pronunciation provided
- [ ] Character meaning preserved

#### 3.2 Predictable
- [ ] Focus on input received
- [ ] Consistent navigation
- [ ] Consistent identification
- [ ] Error prevention (legal, financial, data)

#### 3.3 Input Assistance
- [ ] Error identification
- [ ] Labels or instructions
- [ ] Error suggestions
- [ ] Error prevention (legal, financial, data)

### Robust

#### 4.1 Compatible
- [ ] Content is compatible with assistive technologies
- [ ] Name, role, value programmatically determined
- [ ] Status messages can be programmatically determined
- [ ] Change of context only on user request or with user control

---

## Appendix: Core Web Vitals Optimization

### Largest Contentful Paint (LCP)

#### Optimization Strategies
- [ ] Optimize images (WebP, proper sizing, lazy loading)
- [ ] Preload critical resources (fonts, CSS, critical images)
- [ ] Remove render-blocking resources
- [ ] Reduce server response time
- [ ] Use CDN for static assets

#### Target
- LCP < 2.5s (Good)
- LCP < 4.0s (Needs Improvement)
- LCP > 4.0s (Poor)

### First Input Delay (FID)

#### Optimization Strategies
- [ ] Reduce JavaScript execution time
- [ ] Break up long tasks
- [ ] Use web workers for non-critical JS
- [ ] Minimize main thread work
- [ ] Use code splitting

#### Target
- FID < 100ms (Good)
- FID < 300ms (Needs Improvement)
- FID > 300ms (Poor)

### Cumulative Layout Shift (CLS)

#### Optimization Strategies
- [ ] Reserve space for images and ads
- [ ] Avoid inserting content above existing content
- [ ] Use CSS transforms/animations instead of top/left
- [ ] Ensure font loading doesn't cause layout shift
- [ ] Use font-display: optional or swap

#### Target
- CLS < 0.1 (Good)
- CLS < 0.25 (Needs Improvement)
- CLS > 0.25 (Poor)

---

## Appendix: React Composition Patterns Reference

### Compound Components

**Pattern:** Parent component with child components that share context

**Example:**
```tsx
<DogCard dog={dog} type="combined">
  <DogCard.Rank />
  <DogCard.Header />
  <DogCard.Medals />
  <DogCard.Stats />
</DogCard>
```

**Benefits:**
- Flexible composition
- Shared state via context
- Clear component boundaries
- Reduced prop drilling

### Context-Based State Management

**Pattern:** Provider component manages state, consumers via context

**Example:**
```tsx
const DogCardContext = createContext<DogCardValue>()

function DogCardProvider({ children, ...value }) {
  return (
    <DogCardContext.Provider value={value}>
      {children}
    </DogCardContext.Provider>
  )
}
```

**Benefits:**
- Decoupled state management
- Shared state across components
- Clean component interfaces

### Explicit Variant Components

**Pattern:** Separate components for each variant instead of boolean props

**Example:**
```tsx
// Before
<EventListCard compact important />

// After
<EventListCard variant="important-compact" />
// or
<EventListCard.ImportantCompact />
```

**Benefits:**
- Clearer API
- Type-safe variants
- Easier to extend

### Children-Based Composition

**Pattern:** Use children prop instead of render props

**Example:**
```tsx
// Before
<Dropdown render={(isOpen) => isOpen ? <Content /> : null} />

// After
<Dropdown>
  {isOpen => isOpen ? <Content /> : null}
</Dropdown>
```

**Benefits:**
- Simpler API
- Better TypeScript inference
- More intuitive

---

## Conclusion

This comprehensive design improvement plan addresses all P1 and P2 audit issues while implementing best practices from WCAG 2.2 AA compliance, Core Web Vitals optimization, React composition patterns, and performance optimization. The phased approach allows for incremental delivery and validation at each stage.

The plan is designed to be actionable and detailed, with specific code examples, testing strategies, and rollback procedures. Following this plan will elevate CoursingStats from a 13/20 audit score to industry-leading design quality while maintaining the existing architecture and functionality.

**Estimated Timeline:** 14 days (2-3 weeks)
**Target Audit Score:** 18+/20 (90%+)
**Target Lighthouse Accessibility:** 90+
**Target Lighthouse Performance:** 90+
**Target WCAG 2.2 AA Compliance:** 100%
