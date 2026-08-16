# CoursingStats Audit Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address all P1 and P2 accessibility and design issues identified in the CoursingStats audit (13/20 score) to improve accessibility, performance, and visual consistency.

**Architecture:** Systematic fixes across frontend components and styles, focusing on accessibility (ARIA, alt text, keyboard navigation), modern animation practices, responsive design, and visual consistency. Each fix is independent and can be deployed incrementally.

**Tech Stack:** React, TypeScript, Tailwind CSS, GSAP animations, React Router

## Global Constraints

- Package manager: yarn@1.22.22
- No breaking changes to existing functionality
- All changes must maintain existing dark mode support
- Preserve existing Russian-language UI text
- No changes to backend/worker runtime (frontend-only)
- Follow existing code patterns in the codebase
- Test changes in both light and dark modes

---

## P1 Issues (Priority 1)

### Task 1: Fix Empty Alt Text on Decorative Image (Home.tsx:99)

**Files:**
- Modify: `frontend/src/pages/Home.tsx:92-101`

**Interfaces:**
- Consumes: None
- Produces: None (local change)

**Complexity:** Easy

**Dependencies:** None

**Issue:** The hero title image has `alt=""` which is correct for decorative images, but should also have `role="presentation"` or `aria-hidden="true"` to be fully compliant with WCAG.

**Implementation Steps:**

- [ ] **Step 1: Update the decorative image with proper ARIA attributes**

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

- [ ] **Step 2: Verify the change locally**

Run: `yarn run dev`
Expected: Home page loads without errors, decorative image still hidden from screen readers

- [ ] **Step 3: Test with screen reader**

Open DevTools Accessibility tree, verify the image is marked as ignored
Expected: Image does not appear in accessibility tree

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "fix(a11y): add role=presentation to decorative hero image"
```

**Testing Approach:**
- Visual regression: Home page should look identical
- Screen reader test: NVDA/VoiceOver should not announce the image
- Accessibility tree inspection in Chrome DevTools

---

### Task 2: Add ARIA Labels to Interactive Elements in Nav Components

**Files:**
- Modify: `frontend/src/components/Nav.tsx` (no changes needed, already has aria-labels)
- Modify: `frontend/src/components/nav/NavDesktop.tsx:91-143`
- Modify: `frontend/src/components/nav/NavMobile.tsx:116-246`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** None

**Issue:** NavMenuDropdown components in NavDesktop and NavMobile buttons lack descriptive aria-labels for better screen reader announcements.

**Implementation Steps:**

- [ ] **Step 1: Add aria-label to NavDesktop dropdown buttons**

In `frontend/src/components/nav/NavDesktop.tsx`, update the NavMenuDropdown calls:

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

- [ ] **Step 2: Add aria-label to NavMobile dropdown buttons**

In `frontend/src/components/nav/NavMobile.tsx`, update the buttons:

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

- [ ] **Step 3: Check NavMenuDropdown component for aria-label support**

Read: `frontend/src/components/NavMenuDropdown.tsx`
Expected: Verify component accepts and applies aria-label prop

- [ ] **Step 4: Update NavMenuDropdown if needed**

If the component doesn't support aria-label, add it:

```tsx
interface NavMenuDropdownProps {
  // ... existing props
  ariaLabel?: string
}

export function NavMenuDropdown({ ariaLabel, ...props }: NavMenuDropdownProps) {
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

- [ ] **Step 5: Verify the changes locally**

Run: `yarn run dev`
Expected: Navigation works correctly, no console errors

- [ ] **Step 6: Test with screen reader**

Navigate through menu with keyboard and screen reader
Expected: Each menu button announces its purpose clearly

- [ ] **Step 7: Commit**

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

### Task 3: Replace Outdated Bounce Easing in Animations

**Files:**
- Modify: `frontend/src/styles/home-v2-layout.css:132-144`

**Interfaces:**
- Consumes: None
- Produces: None (local change)

**Complexity:** Easy

**Dependencies:** None

**Issue:** The bounce animation on line 132 uses an outdated custom keyframe animation. Modern practice prefers CSS transitions with better easing functions or GSAP animations.

**Implementation Steps:**

- [ ] **Step 1: Replace bounce animation with modern easing**

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
```

- [ ] **Step 2: Verify the change locally**

Run: `yarn run dev`
Expected: Scroll cue animation is smoother and more subtle

- [ ] **Step 3: Test with prefers-reduced-motion**

Enable prefers-reduced-motion in browser DevTools
Expected: Animation is disabled (already handled by existing media query)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/home-v2-layout.css
git commit -m "fix(design): replace bounce animation with modern easing"
```

**Testing Approach:**
- Visual: Animation should be smoother and less jarring
- Performance: Check in Chrome DevTools Performance tab
- Reduced motion: Verify animation respects user preferences

---

## P2 Issues (Priority 2)

### Task 4: Remove AI-Generated Side-Tab Accent Borders

**Files:**
- Modify: `frontend/src/components/HomeEventRow.tsx:24`
- Modify: `frontend/src/components/HomeShowEventRow.tsx:72`
- Modify: `frontend/src/pages/Events/EventListRow.tsx:54`
- Modify: `frontend/src/pages/Shows/ShowCalendar/ShowCalendarRow.tsx:34`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Easy

**Dependencies:** None

**Issue:** AI-generated left border accents (`border-l-4`) on list rows create visual inconsistency. These should be removed for a cleaner design.

**Implementation Steps:**

- [ ] **Step 1: Remove border-l-4 from HomeEventRow**

In `frontend/src/components/HomeEventRow.tsx`:

```tsx
const className = `home-event-row ${
  important ? 'home-event-row--champ' : ''
} ${compact ? 'home-event-row--compact' : ''} ${procoursingUrl ? '' : 'cursor-default'}`
```

- [ ] **Step 2: Remove border-l-4 from HomeShowEventRow**

In `frontend/src/components/HomeShowEventRow.tsx`:

```tsx
const className =
  'home-event-row home-event-row--compact'
```

- [ ] **Step 3: Remove border-l-4 from EventListRow**

In `frontend/src/pages/Events/EventListRow.tsx`:

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

- [ ] **Step 4: Remove border-l-4 from ShowCalendarRow**

In `frontend/src/pages/Shows/ShowCalendar/ShowCalendarRow.tsx`:

```css
function rowSurfaceClass(hasProtocol: boolean): string {
  return hasProtocol
    ? 'border border-warm-blue-200 dark:border-warm-blue-800 bg-warm-blue-50/60 dark:bg-warm-blue-900/30 hover:bg-warm-blue-100/80 dark:hover:bg-warm-blue-900/40'
    : 'border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 hover:bg-camel-100 dark:hover:bg-charcoal-700'
}
```

- [ ] **Step 5: Verify the changes locally**

Run: `yarn run dev`
Expected: List rows appear cleaner without left accent borders

- [ ] **Step 6: Visual regression check**

Compare home page, events list, and shows calendar before/after
Expected: Cleaner, more consistent design

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/HomeEventRow.tsx frontend/src/components/HomeShowEventRow.tsx frontend/src/pages/Events/EventListRow.tsx frontend/src/pages/Shows/ShowCalendar/ShowCalendarRow.tsx
git commit -m "fix(design): remove AI-generated left border accents from list rows"
```

**Testing Approach:**
- Visual inspection: Check home page, events list, shows calendar
- Responsive: Test on mobile and desktop
- Dark mode: Verify borders look correct in both themes

---

### Task 5: Remove Border Accent on Rounded Element (OAuthCallback.tsx)

**Files:**
- Modify: `frontend/src/pages/OAuthCallback.tsx:28`

**Interfaces:**
- Consumes: None
- Produces: None (local change)

**Complexity:** Easy

**Dependencies:** None

**Issue:** The loading spinner has a border accent (`border-b-2`) on a rounded element, which creates visual inconsistency.

**Implementation Steps:**

- [ ] **Step 1: Replace border-b-2 with ring or shadow**

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

- [ ] **Step 2: Verify the change locally**

Run: `yarn run dev` and trigger OAuth flow
Expected: Loading spinner looks cleaner with consistent border

- [ ] **Step 3: Test in dark mode**

Toggle dark mode during OAuth callback
Expected: Spinner colors adapt correctly

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/OAuthCallback.tsx
git commit -m "fix(design): improve loading spinner consistency in OAuth callback"
```

**Testing Approach:**
- Visual: Spinner should look cleaner and more consistent
- Dark mode: Colors should adapt correctly
- Animation: Spinner should still animate smoothly

---

### Task 6: Optimize Inter Font Usage

**Files:**
- Modify: `frontend/src/lib/performanceOptimization.ts:14-20`

**Interfaces:**
- Consumes: None
- Produces: None (local change)

**Complexity:** Medium

**Dependencies:** None

**Issue:** Inter font is being preloaded with all weights (400, 500, 600, 700). This is overkill for the site's actual usage and impacts performance.

**Implementation Steps:**

- [ ] **Step 1: Audit actual font weight usage in the codebase**

Run: `grep -r "font-weight\|font-semibold\|font-bold" frontend/src --include="*.tsx" --include="*.css"`
Expected: Identify which weights are actually used

- [ ] **Step 2: Update font preload to only include used weights**

Based on audit findings, update `frontend/src/lib/performanceOptimization.ts`:

```typescript
export function preloadCriticalFonts() {
  if (typeof document === 'undefined') return

  const fonts = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      as: 'style',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font.href
    link.as = font.as
    if (font.type) link.type = font.type
    if (font.crossorigin) link.crossOrigin = font.crossorigin
    document.head.appendChild(link)
  })
}
```

- [ ] **Step 3: Check global CSS for font declarations**

Read: `frontend/src/index.css` or similar
Expected: Verify font-family declarations

- [ ] **Step 4: Consider using font-display: swap**

Update font loading for better performance:

```typescript
const fonts = [
  {
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    as: 'style',
    type: 'text/css',
    crossorigin: 'anonymous',
  },
]
```

The `display=swap` parameter is already included in the URL.

- [ ] **Step 5: Verify the change locally**

Run: `yarn run dev`
Expected: No visual changes, faster font loading

- [ ] **Step 6: Test font loading in DevTools**

Check Network tab for font requests
Expected: Smaller font file loaded

- [ ] **Step 7: Commit**

```bash
git add frontend/src/lib/performanceOptimization.ts
git commit -m "perf: optimize Inter font loading to only used weights"
```

**Testing Approach:**
- Visual: No changes to typography
- Performance: Check font file size in Network tab
- Lighthouse: Verify Font Display score improvement

---

### Task 7: Expand Responsive Design Breakpoints

**Files:**
- Modify: `frontend/src/styles/responsive.css`
- Modify: `frontend/tailwind.config.js` (if needed)

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** None

**Issue:** The responsive.css file only has 2 breakpoints (479px and 768px-1023px). Modern responsive design should include more breakpoints for better device coverage.

**Implementation Steps:**

- [ ] **Step 1: Review Tailwind config for existing breakpoints**

Read: `frontend/tailwind.config.js`
Expected: Check what breakpoints Tailwind already provides

- [ ] **Step 2: Expand responsive.css with additional breakpoints**

```css
/* Extra small devices (phones, < 375px) */
@media (max-width: 374px) {
  .home-v2-events-col {
    flex-direction: column;
  }
}

/* Small devices (phones, 375px and up) */
@media (min-width: 375px) and (max-width: 479px) {
  .home-v2-events-col {
    flex-direction: column;
  }
}

/* Medium devices (large phones, 480px and up) */
@media (min-width: 480px) and (max-width: 639px) {
  .home-v2-events-col {
    flex-direction: column;
  }
}

/* Large devices (tablets, 640px and up) */
@media (min-width: 640px) and (max-width: 767px) {
  .home-v2-events-col {
    flex-direction: row;
  }
}

/* Extra large devices (tablets, 768px and up) */
@media (min-width: 768px) and (max-width: 1023px) {
  .home-v2-events-col {
    flex-direction: row;
  }
}

/* Desktop devices (1024px and up) */
@media (min-width: 1024px) {
  .home-v2-events-col {
    flex-direction: row;
  }
}
```

- [ ] **Step 3: Test responsive behavior at each breakpoint**

Resize browser window to test each breakpoint
Expected: Layout adapts smoothly at each breakpoint

- [ ] **Step 4: Verify on actual devices**

Test on phone, tablet, desktop if possible
Expected: Appropriate layout for each device

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles/responsive.css
git commit -m "fix(design): expand responsive breakpoints for better device coverage"
```

**Testing Approach:**
- Browser DevTools: Test at each breakpoint
- Actual devices: Test on phone, tablet, desktop
- Visual regression: Ensure no layout shifts

---

### Task 8: Add prefers-reduced-motion to Remaining Animations

**Files:**
- Modify: `frontend/src/styles/home-v2-layout.css` (already has it for scroll cue)
- Search for other CSS animations in the codebase

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Medium

**Dependencies:** None

**Issue:** Some animations may not respect the `prefers-reduced-motion` media query, causing issues for users with motion sensitivity.

**Implementation Steps:**

- [ ] **Step 1: Search for all CSS animations in the codebase**

Run: `grep -r "animation\|@keyframes\|transition" frontend/src/styles --include="*.css"`
Expected: Identify all animations and transitions

- [ ] **Step 2: Add prefers-reduced-motion media query to animations**

For each animation found, add:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Or, for specific animations:

```css
@media (prefers-reduced-motion: reduce) {
  .element-with-animation {
    animation: none;
    transition: none;
  }
}
```

- [ ] **Step 3: Check GSAP animations in components**

Search for `useGSAP` or `gsap` usage
Expected: Verify they respect the `prefersReducedMotion` hook

- [ ] **Step 4: Ensure motion.ts hook is used correctly**

Read: `frontend/src/lib/motion.ts`
Expected: Verify `prefersReducedMotion` is properly implemented

- [ ] **Step 5: Test with prefers-reduced-motion enabled**

Enable in browser DevTools: Rendering > Emulate CSS media feature > prefers-reduced-motion: reduce
Expected: All animations are disabled or significantly reduced

- [ ] **Step 6: Commit**

```bash
git add frontend/src/styles/*.css
git commit -m "fix(a11y): add prefers-reduced-motion support to all animations"
```

**Testing Approach:**
- DevTools: Enable prefers-reduced-motion and verify animations stop
- Visual: Animations should be disabled or very subtle
- Performance: Should improve for users with motion sensitivity

---

### Task 9: Improve Keyboard Navigation

**Files:**
- Modify: Multiple components (to be identified during implementation)
- Focus on: `frontend/src/components/nav/`, `frontend/src/pages/Events/`, `frontend/src/pages/Shows/`

**Interfaces:**
- Consumes: None
- Produces: None (local changes)

**Complexity:** Hard

**Dependencies:** May require refactoring some interactive elements

**Issue:** Some interactive elements may not be fully keyboard accessible, particularly custom interactive components that aren't native buttons/links.

**Implementation Steps:**

- [ ] **Step 1: Audit keyboard navigation across the site**

Test navigation with Tab, Enter, Space, Escape keys
Expected: Identify all interactive elements and their keyboard behavior

- [ ] **Step 2: Ensure all interactive elements have proper semantic HTML**

- Buttons should be `<button>` elements
- Links should be `<a>` elements
- Custom interactive elements need `role="button"` or `role="link"`, `tabIndex={0}`, and keyboard event handlers

- [ ] **Step 3: Add keyboard support to ShowCalendarRow**

Already has keyboard support (lines 112-120), verify it works correctly

- [ ] **Step 4: Add keyboard support to any custom interactive components**

For each custom interactive element:

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick()
  }
}

<div
  role="button"
  tabIndex={0}
  onClick={onClick}
  onKeyDown={handleKeyDown}
  aria-label="Descriptive label"
>
  {/* content */}
</div>
```

- [ ] **Step 5: Add focus indicators**

Ensure all focusable elements have visible focus styles:

```css
*:focus-visible {
  outline: 2px solid var(--camel-600);
  outline-offset: 2px;
}
```

- [ ] **Step 6: Test keyboard navigation thoroughly**

- Tab through all interactive elements
- Use Enter/Space to activate
- Use Escape to close modals/menus
- Use Arrow keys for navigation within components

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/* frontend/src/pages/*
git commit -m "fix(a11y): improve keyboard navigation across the site"
```

**Testing Approach:**
- Keyboard-only navigation: Test entire site without mouse
- Screen reader: Verify keyboard navigation works with screen readers
- Focus indicators: Ensure focus is always visible

---

## Timeline Estimate

**Total Estimated Time:** 2-3 days (assuming focused work)

**Breakdown by Priority:**

**P1 Issues (1 day):**
- Task 1: Empty alt text - 30 minutes
- Task 2: ARIA labels - 2 hours
- Task 3: Bounce easing - 30 minutes

**P2 Issues (1-2 days):**
- Task 4: Side-tab borders - 1 hour
- Task 5: OAuth border - 30 minutes
- Task 6: Font optimization - 1 hour
- Task 7: Responsive breakpoints - 2 hours
- Task 8: prefers-reduced-motion - 2 hours
- Task 9: Keyboard navigation - 4-6 hours

**Testing & Review:** 2-4 hours

**Order of Implementation:**
1. P1 issues first (accessibility critical)
2. P2 issues in order of complexity (easy to hard)
3. Final comprehensive testing

---

## Testing Strategy

### Unit Testing
- No new unit tests needed for these changes
- Existing tests should continue to pass

### Integration Testing
- Test each change in isolation
- Verify no breaking changes to existing functionality

### Accessibility Testing
- Use Chrome DevTools Accessibility panel
- Test with NVDA (Windows) or VoiceOver (Mac)
- Keyboard navigation testing
- Screen reader testing

### Visual Regression Testing
- Compare before/after screenshots for visual changes
- Test in both light and dark modes
- Test at multiple breakpoints

### Performance Testing
- Lighthouse audit before and after
- Check font loading performance
- Verify animation performance

### Cross-Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Rollback Plan

Each task is committed independently, allowing for easy rollback of individual changes if issues arise:

```bash
# To rollback a specific task
git revert <commit-hash>
```

Or rollback to a known good state:

```bash
git checkout <branch-name>
```

---

## Success Criteria

- All P1 issues resolved
- All P2 issues resolved
- Lighthouse accessibility score improved
- No visual regressions
- No performance regressions
- All keyboard navigation works correctly
- All screen reader announcements are clear
- All animations respect prefers-reduced-motion
- Responsive design works across all breakpoints
