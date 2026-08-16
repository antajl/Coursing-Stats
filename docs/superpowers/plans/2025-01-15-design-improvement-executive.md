# CoursingStats Design Improvement - Executive Summary

**Goal:** Elevate from 13/20 audit score to 18+/20 (90%+) with WCAG 2.2 AA compliance, optimized performance, and modern React patterns.

**Timeline:** 7 phases, 14 days total

---

## Executive Summary

### Current State
- **Audit Score:** 13/20 (65%)
- **P1 Issues (Critical):** Empty alt text, insufficient ARIA labels, outdated bounce easing
- **P2 Issues (High):** AI-generated borders, font overloading, limited responsive design
- **Performance:** Inter font with 4 weights, Core Web Vitals unmeasured
- **Accessibility:** WCAG 2.1 partial, screen reader partial, keyboard navigation partial

### Target State
- **Audit Score:** 18+/20 (90%+)
- **Accessibility:** WCAG 2.2 AA full compliance, complete keyboard/screen reader support
- **Performance:** Font optimized, Core Web Vitals "Good" (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- **Visual Design:** Consistent borders, 5+ breakpoints, modern easing
- **Code Architecture:** React composition patterns, clear component boundaries

---

## Priority Breakdown

### P1 Issues (Critical - Phase 1)
1. Empty alt text on decorative images (6 files)
2. Insufficient ARIA labels on navigation dropdowns (4 files)
3. Outdated bounce easing in animations (2 files)

### P2 Issues (High - Phase 2+)
1. AI-generated side-tab borders (4 files)
2. Border accent on rounded elements (1 file)
3. Font loading unnecessary weights
4. Limited responsive design (2 breakpoints → 5+)
5. Missing prefers-reduced-motion on some animations
6. Insufficient keyboard navigation support

---

## Phased Roadmap (14 Days)

### Phase 1: Critical Accessibility Fixes (P1) - Day 1

**Перед началом этой фазы используй такие скилы:**
- accessibility
- fixing-accessibility
- frontend-ui-engineering
- verification-before-completion
- code-review
- Axe DevTools - https://www.deque.com/axe/devtools/web-accessibility/

**Objective:** Resolve all P1 accessibility issues

**Tasks:**
- Fix empty alt text on 6 decorative images
- Add descriptive aria-labels to navigation dropdowns
- Replace bounce animation with power3.out easing

**Success Criteria:**
- All P1 issues resolved
- Screen reader passes basic navigation
- No visual regressions

**Files:** Home.tsx, DogProfileHeader.tsx, NavMobile.tsx, HomeHeroStage.tsx, EventHeader.tsx, YandexMetrica.tsx, NavDesktop.tsx, NavMenuDropdown.tsx, home-v2-layout.css, motion.ts

---

### Phase 2: Visual Consistency (P2) - Day 2

**Перед началом этой фазы используй такие скилы:**
- frontend-ui-engineering
- react-performance-optimization
- verification-before-completion
- code-review
- web.dev easing guide - https://web.dev/articles/choosing-the-right-easing

**Objective:** Clean up AI-generated visual inconsistencies

**Tasks:**
- Remove AI-generated side-tab borders from list rows
- Fix border accent on rounded elements
- Standardize border treatment across components

**Success Criteria:**
- Visual consistency across list components
- Design system alignment
- No visual regressions

**Files:** HomeEventRow.tsx, HomeShowEventRow.tsx, EventListRow.tsx, ShowCalendarRow.tsx, OAuthCallback.tsx

---

### Phase 3: Performance Optimization - Days 3-4

**Перед началом этой фазы используй такие скилы:**
- performance-optimization
- react-performance
- react-performance-optimization
- vercel-react-best-practices
- verification-before-completion
- code-review
- React performance guide - https://blog.sentry.io/react-js-performance-guide/

**Objective:** Optimize font loading, bundle size, and Core Web Vitals

**Tasks:**
- Audit and optimize font loading (reduce to used weights only)
- Bundle analysis and code splitting
- Image loading optimization with progressive enhancement

**Success Criteria:**
- Font file size reduced by 30%+
- Lighthouse performance score improved
- Core Web Vitals in "Good" range

**Files:** fontOptimization.ts (new), main.tsx, tailwind.config.js, vite.config.js, LazyImage.tsx, imageOptimization.ts (new)

---

### Phase 4: WCAG 2.2 AA Compliance - Days 5-7

**Перед началом этой фазы используй такие скилы:**
- accessibility
- browser-testing-with-devtools
- verification-before-completion
- code-review
- Axe DevTools - https://www.deque.com/axe/devtools/web-accessibility/
- WCAG 2.2 Quick Reference - https://www.w3.org/WAI/WCAG22/quickref/

**Objective:** Achieve full WCAG 2.2 AA compliance

**Tasks:**
- Comprehensive prefers-reduced-motion support
- Complete keyboard navigation with visible focus indicators
- Focus management system for modals/dropdowns
- ARIA label audit and fixes
- Color contrast verification

**Success Criteria:**
- WCAG 2.2 AA checklist complete
- Keyboard-only navigation works
- Screen reader fully functional
- Focus indicators visible everywhere

**Files:** motion-reveal.css, home-v2-layout.css, home-v2-panels.css, home-v2-search.css, motion.ts, useKeyboardNavigation.ts (new), SkipNavigation.tsx (new), App.tsx, index.css, useFocusManagement.ts (new), NavMenuDropdown.tsx, ToolbarFiltersDropdown.tsx, ariaAudit.ts (new), colorContrast.ts (new)

---

### Phase 5: Responsive Design Expansion - Days 8-9

**Перед началом этой фазы используй такие скилы:**
- frontend-ui-engineering
- responsive-design
- vercel-react-best-practices
- verification-before-completion
- code-review
- web.dev easing guide - https://web.dev/articles/choosing-the-right-easing

**Objective:** Expand responsive design to 5+ breakpoints

**Tasks:**
- Implement 5+ responsive breakpoints (320px to 1920px+)
- Mobile-first approach
- Touch-friendly interactive elements (44x44px minimum)
- Responsive typography

**Success Criteria:**
- Layout works on 320px to 1920px+
- Touch targets meet minimum size
- No horizontal scroll on mobile
- Typography scales appropriately

**Files:** responsive.css, tailwind.config.js, mobile-optimized components

---

### Phase 6: React Composition Patterns - Days 10-12

**Перед началом этой фазы используй такие скилы:**
- vercel-composition-patterns
- react-composition-2026
- react-composition-patterns
- verification-before-completion
- code-review

**Objective:** Refactor components to use composition patterns

**Tasks:**
- Compound component patterns for complex UI
- Context-based state management
- Explicit variant components
- Children-based composition
- Reduce boolean prop proliferation by 50%+

**Success Criteria:**
- Boolean props reduced by 50%+
- Component reuse increased
- Props interfaces simplified
- No breaking changes to public API

**Files:** Complex UI components identified during refactoring

---

### Phase 7: Advanced Performance Optimization - Days 13-14

**Перед началом этой фазы используй такие скилы:**
- performance-optimization
- vercel-react-best-practices
- react-performance
- verification-before-completion
- code-review
- React Compiler guide - https://react.dev/learn/react-compiler/introduction

**Objective:** Apply Vercel React best practices

**Tasks:**
- Eliminate render waterfalls
- Bundle size optimization (target 15%+ reduction)
- Re-render optimization
- JavaScript performance improvements
- Rendering performance enhancements

**Success Criteria:**
- Lighthouse performance score 90+
- Bundle size reduced by 15%+
- Re-renders minimized
- Smooth 60fps animations

**Files:** AppRoutes.tsx, performance-critical components

---

## Quick-Start Implementation Guide

### Day 1 Morning: P1 Alt Text Fixes (1 hour)
```bash
# Fix decorative images with role=presentation
# Files: Home.tsx:92-101, DogProfileHeader.tsx:196, NavMobile.tsx:60,
#        HomeHeroStage.tsx:168, EventHeader.tsx:153, YandexMetrica.tsx:30

# Pattern:
<img
  src="/path/to/image.ext"
  alt=""
  role="presentation"
  aria-hidden="true"
  className="..."
/>
```

### Day 1 Afternoon: ARIA Labels (2 hours)
```bash
# Add aria-label to NavMenuDropdown component
# Files: NavMenuDropdown.tsx, NavDesktop.tsx, NavMobile.tsx

# Pattern:
<NavMenuDropdown
  aria-label="Соревнования - рейтинг, календарь, судьи"
  // ... other props
/>
```

### Day 1 Evening: Animation Easing (1 hour)
```bash
# Replace bounce with power3.out
# Files: home-v2-layout.css:132-144, motion.ts:34

# CSS:
animation: scrollCuePulse 2.5s ease-in-out infinite;

# TS:
ease = 'power3.out'  // Changed from power2.out
```

---

## Success Criteria & Metrics

### Accessibility Metrics
- [ ] All P1 issues resolved (Day 1)
- [ ] WCAG 2.2 AA checklist complete (Day 7)
- [ ] Keyboard-only navigation functional (Day 7)
- [ ] Screen reader fully supported (Day 7)
- [ ] Color contrast 4.5:1 minimum (Day 7)

### Performance Metrics
- [ ] Font file size reduced 30%+ (Day 4)
- [ ] Lighthouse performance score 90+ (Day 14)
- [ ] LCP < 2.5s (Day 14)
- [ ] FID < 100ms (Day 14)
- [ ] CLS < 0.1 (Day 14)
- [ ] Bundle size reduced 15%+ (Day 14)

### Design Metrics
- [ ] Visual consistency across components (Day 2)
- [ ] 5+ responsive breakpoints (Day 9)
- [ ] Touch targets 44x44px minimum (Day 9)
- [ ] Boolean props reduced 50%+ (Day 12)

### Code Quality Metrics
- [ ] React composition patterns applied (Day 12)
- [ ] Component boundaries clear (Day 12)
- [ ] Props interfaces well-defined (Day 12)
- [ ] No breaking changes (Day 14)

---

## Testing Strategies

### Accessibility Testing
- **Automated:** axe DevTools, Lighthouse accessibility audit
- **Screen Reader:** NVDA (Windows), VoiceOver (macOS)
- **Keyboard:** Tab through all interactive elements, Enter/Space to activate
- **Reduced Motion:** Enable in DevTools Rendering > Emulate CSS media feature
- **Color Contrast:** axe DevTools color contrast checker

### Performance Testing
- **Lighthouse:** Run before/after each phase
- **Bundle Analysis:** `yarn run analyze` (Phase 3+)
- **Network Tab:** Monitor font/image loading
- **Performance Tab:** Chrome DevTools for animation performance

### Visual Testing
- **Manual Regression:** Compare before/after screenshots
- **Responsive Testing:** Chrome DevTools device emulation (320px to 1920px+)
- **Dark Mode:** Test all changes in both themes
- **Cross-Browser:** Chrome, Firefox, Safari

### Integration Testing
- **Build:** `yarn run build` after each phase
- **Unit Tests:** `yarn test` after each phase
- **E2E:** Critical user flows (navigation, search, dog profiles)

---

## Risk Assessment & Mitigation

### High Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking keyboard navigation | High | Test keyboard-only after each change, use git revert if needed |
| Performance regression | High | Measure before/after with Lighthouse, implement incrementally |
| Visual regressions | Medium | Screenshot comparison, test in both light/dark modes |

### Medium Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Font loading breakage | Medium | Test cross-browser, have fallback ready |
| React composition breaking changes | Medium | Maintain public API, test component usage |
| Bundle size increase | Medium | Run bundle analysis after each change |

### Low Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| Animation timing changes | Low | Test with prefers-reduced-motion |
| Color contrast fixes | Low | Verify with automated tools |

---

## Global Constraints

- Package manager: yarn@1.22.22
- No breaking changes to existing functionality
- Maintain existing dark mode support
- Preserve Russian-language UI text
- No changes to backend/worker runtime (frontend-only)
- Follow existing code patterns in the codebase
- CDN-only architecture for production (no Worker/D1 runtime)
- Respect three-domain separation (Competitions/Shows/Donino)

---

## Implementation Commands

```bash
# Start development
yarn run dev

# Build for production
yarn run build

# Run tests
yarn test

# Bundle analysis (after Phase 3)
cd frontend && yarn run analyze

# Commit pattern
git add [files]
git commit -m "fix(a11y): [description]"  # for accessibility
git commit -m "fix(design): [description]"  # for visual fixes
git commit -m "perf: [description]"  # for performance
git commit -m "refactor: [description]"  # for code architecture
```

---

## Next Steps

1. **Start Phase 1 (Day 1):** Fix P1 accessibility issues
2. **Measure Baseline:** Run Lighthouse audit before starting
3. **Track Progress:** Use checkbox syntax in this document
4. **Test Continuously:** Run tests after each phase
5. **Document Issues:** Log any blockers in project tracking

**Reference:** See `2025-01-15-comprehensive-design-improvement.md` for detailed implementation steps with code examples.
