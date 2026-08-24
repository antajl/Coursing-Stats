# Code Optimization Task List

## Phase 1: Foundation Utilities

- [ ] **Task 1:** Create useClickOutside Hook
  - Create `frontend/src/hooks/useClickOutside.ts`
  - Handle mousedown and touchstart events
  - Proper cleanup on unmount
  - TypeScript types defined
  - Verify: TypeScript compilation, dropdown components work

- [ ] **Task 2:** Unify Text Normalization Functions
  - Create `backend/lib/text-normalization.ts`
  - Update `dog-identity-match.ts` to use shared utility
  - Update `dog-name-parts.ts` to use shared utility
  - Verify: Tests pass, build-all-data succeeds, manual dog identity check

## Checkpoint: Foundation
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] No regressions in existing functionality

## Phase 2: Component Optimization

- [ ] **Task 3:** Refactor DogCard.tsx Performance
  - Remove unnecessary `useMemo` calls
  - Consolidate duplicate formatting functions
  - Simplify conditional rendering logic
  - Verify: Tests pass, manual DogCard rendering check, performance check

- [ ] **Task 4:** Apply useClickOutside to Dropdown Components
  - Update `ToolbarFiltersDropdown.tsx` to use new hook
  - Update `ToolbarSelectDropdown.tsx` to use new hook
  - Remove duplicate click-outside logic
  - Verify: Tests pass, manual dropdown functionality check

## Checkpoint: Component Optimization
- [ ] All tests pass
- [ ] Dropdowns work correctly
- [ ] DogCard renders without regressions

## Phase 3: Backend Parser Optimization

- [ ] **Task 5:** Unify Extract Functions in Coursing Utils
  - Create unified `extractNumberFromElement` function
  - Update all coursing parser call sites
  - Remove duplicate extract functions
  - Verify: Parser fixtures pass, build-all-data succeeds, manual parsing check

- [ ] **Task 6:** Simplify CDN Pack Shard Function
  - Extract `hashString` helper function
  - Simplify `cdnPackShardKey` logic
  - Add ponytail comment for optimization ceiling
  - Verify: Tests pass, build-all-data succeeds, CDN path consistency check

## Checkpoint: Backend Optimization
- [ ] All tests pass
- [ ] Parser fixtures pass
- [ ] CDN functionality unchanged

## Phase 4: Final Cleanup

- [ ] **Task 7:** Remove Unused Code and Imports
  - Remove unused imports from refactored files
  - Remove dead code
  - Verify: Linter passes, TypeScript compilation, all tests pass

## Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Code is more maintainable
- [ ] Ready for review
