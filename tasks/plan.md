# Implementation Plan: Code Optimization and Redundancy Removal

## Overview
Plan to eliminate code redundancy and optimize performance across frontend components and backend utilities. Focus on removing duplicate functions, simplifying complex components, and creating reusable utilities.

## Architecture Decisions
- **Shared utilities approach**: Create common functions for text normalization and click handling to eliminate duplication
- **Incremental refactoring**: Each task leaves the system in a working state with tests passing
- **Performance-first**: Remove unnecessary `useMemo` calls that add complexity without measurable benefit
- **Backward compatibility**: All refactoring maintains existing API contracts

## Task List

### Phase 1: Foundation Utilities

#### Task 1: Create useClickOutside Hook
**Description:** Extract duplicate click-outside logic from dropdown components into a reusable custom hook.

**Acceptance criteria:**
- [ ] New hook `useClickOutside` created in `frontend/src/hooks/useClickOutside.ts`
- [ ] Hook handles both mousedown and touchstart events
- [ ] Hook properly cleans up event listeners on unmount
- [ ] TypeScript types are properly defined for ref and callback

**Verification:**
- [ ] TypeScript compilation succeeds: `npx tsc --noEmit`
- [ ] Existing dropdown components work unchanged after refactoring

**Dependencies:** None

**Files likely touched:**
- `frontend/src/hooks/useClickOutside.ts` (new)
- `frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx`
- `frontend/src/components/toolbar/ToolbarSelectDropdown.tsx`

**Estimated scope:** Small (2-3 files)

---

#### Task 2: Unify Text Normalization Functions
**Description:** Create shared text normalization utility to eliminate duplication between `dog-identity-match.ts` and `dog-name-parts.ts`.

**Acceptance criteria:**
- [ ] New utility `backend/lib/text-normalization.ts` created with `normalizeText` function
- [ ] `dog-identity-match.ts` updated to use shared utility
- [ ] `dog-name-parts.ts` updated to use shared utility
- [ ] All existing tests continue to pass
- [ ] Function handles Cyrillic/Latin characters, accents, and whitespace consistently

**Verification:**
- [ ] Tests pass: `yarn test`
- [ ] Build succeeds: `yarn run build-all-data`
- [ ] Manual check: Dog identity matching still works correctly

**Dependencies:** None

**Files likely touched:**
- `backend/lib/text-normalization.ts` (new)
- `backend/lib/dog-identity-match.ts`
- `backend/lib/dog-name-parts.ts`

**Estimated scope:** Small (3 files)

---

### Checkpoint: Foundation
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] No regressions in existing functionality

---

### Phase 2: Component Optimization

#### Task 3: Refactor DogCard.tsx Performance
**Description:** Remove unnecessary `useMemo` calls and simplify formatting logic in DogCard component.

**Acceptance criteria:**
- [ ] Remove unnecessary `useMemo` for simple calculations (yearBadge, elo, isTop3)
- [ ] Consolidate duplicate formatting functions (formatJudgeScore, formatScore)
- [ ] Simplify conditional rendering logic where possible
- [ ] Component remains functionally identical (no behavior changes)
- [ ] Reduced cognitive complexity while maintaining readability

**Verification:**
- [ ] Tests pass: `yarn test`
- [ ] Manual check: Dog cards render correctly in all variants
- [ ] Performance check: No visible regressions in rendering

**Dependencies:** None

**Files likely touched:**
- `frontend/src/components/DogCard.tsx`

**Estimated scope:** Medium (1 file, but complex refactoring)

---

#### Task 4: Apply useClickOutside to Dropdown Components
**Description:** Refactor ToolbarFiltersDropdown and ToolbarSelectDropdown to use the new useClickOutside hook.

**Acceptance criteria:**
- [ ] `ToolbarFiltersDropdown.tsx` uses `useClickOutside` hook
- [ ] `ToolbarSelectDropdown.tsx` uses `useClickOutside` hook
- [ ] Duplicate click-outside logic removed from both components
- [ ] Components maintain identical behavior
- [ ] Code is more maintainable with single source of truth

**Verification:**
- [ ] Tests pass: `yarn test`
- [ ] Manual check: Dropdowns close correctly when clicking outside
- [ ] Manual check: Touch events work on mobile devices

**Dependencies:** Task 1

**Files likely touched:**
- `frontend/src/components/toolbar/ToolbarFiltersDropdown.tsx`
- `frontend/src/components/toolbar/ToolbarSelectDropdown.tsx`

**Estimated scope:** Small (2 files)

---

### Checkpoint: Component Optimization
- [ ] All tests pass
- [ ] Dropdowns work correctly
- [ ] DogCard renders without regressions

---

### Phase 3: Backend Parser Optimization

#### Task 5: Unify Extract Functions in Coursing Utils
**Description:** Consolidate extractNumber, extractBoldNumber, and extractItalicNumber into a more flexible single function.

**Acceptance criteria:**
- [ ] Create unified `extractNumberFromElement` function with selector support
- [ ] Update all call sites in coursing parsers to use new function
- [ ] Remove duplicate extract functions
- [ ] Parser tests continue to pass
- [ ] Function handles both element selection and text extraction

**Verification:**
- [ ] Parser tests pass: `yarn run test-parser-fixtures`
- [ ] Build succeeds: `yarn run build-all-data`
- [ ] Manual check: Coursing parsing still produces correct results

**Dependencies:** None

**Files likely touched:**
- `backend/parsers/coursing/utils.ts`
- `backend/parsers/coursing/row-parsers.ts`
- `backend/parsers/coursing/row-parsers-1judge.ts`
- `backend/parsers/coursing/row-parsers-2judges.ts`

**Estimated scope:** Medium (4 files)

---

#### Task 6: Simplify CDN Pack Shard Function
**Description:** Refactor cdnPackShardKey to use clearer logic with extracted hashString helper.

**Acceptance criteria:**
- [ ] Extract hashString into separate helper function
- [ ] Simplify main function logic with early return for numeric IDs
- [ ] Add ponytail comment for optimization ceiling
- [ ] Function produces identical results for all inputs
- [ ] Code is more readable and maintainable

**Verification:**
- [ ] Tests pass: `yarn test`
- [ ] Build succeeds: `yarn run build-all-data`
- [ ] Manual check: CDN pack paths remain consistent

**Dependencies:** None

**Files likely touched:**
- `backend/lib/cdn-packs.ts`

**Estimated scope:** Small (1 file)

---

### Checkpoint: Backend Optimization
- [ ] All tests pass
- [ ] Parser fixtures pass
- [ ] CDN functionality unchanged

---

### Phase 4: Final Cleanup

#### Task 7: Remove Unused Code and Imports
**Description:** Clean up any unused imports and dead code discovered during refactoring.

**Acceptance criteria:**
- [ ] All unused imports removed from refactored files
- [ ] No dead code remains
- [ ] ESLint passes without warnings
- [ ] TypeScript compilation succeeds

**Verification:**
- [ ] Linter passes: `yarn lint` (if available)
- [ ] TypeScript compilation: `npx tsc --noEmit`
- [ ] All tests still pass

**Dependencies:** Tasks 1-6

**Files likely touched:**
- All files modified in previous tasks

**Estimated scope:** Small (multiple files, minor changes)

---

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Code is more maintainable
- [ ] Ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Parser behavior changes | High | Comprehensive parser fixture testing before/after |
| Dropdown functionality regression | Medium | Manual testing of both dropdown components |
| DogCard rendering issues | Medium | Visual regression check in all card variants |
| CDN path inconsistency | High | Verify pack paths remain identical for all known IDs |

## Open Questions
- Should we add performance benchmarks for DogCard before/after optimization?
- Do we need to add specific tests for the new useClickOutside hook?

## Dependency Graph
```
Task 1 (useClickOutside) → Task 4 (Apply to dropdowns)
Task 2 (Text normalization) → Independent
Task 3 (DogCard refactor) → Independent  
Task 5 (Extract functions) → Independent
Task 6 (CDN simplification) → Independent
All previous tasks → Task 7 (Cleanup)
```

## Parallelization Opportunities
- Tasks 2, 3, 5, 6 can be done in parallel (independent utilities)
- Task 4 depends on Task 1 (must be sequential)
- Task 7 depends on all others (final cleanup)
