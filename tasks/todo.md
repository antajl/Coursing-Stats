# Task List: Backend Duplication Elimination

## Phase 1: Shared Audit Utilities

- [ ] **Task 1:** Create shared walkJson utility
  - Create `backend/lib/audit-utils.ts` with walkJson function
  - Update 3 files to import from new utility
  - Verify TypeScript compilation
  - Size: S

- [ ] **Task 2:** Create shared normalizeKeyPart utility  
  - Create `backend/lib/key-normalization.ts` with normalizeKeyPart function
  - Update 6 files to import from new utility
  - Verify TypeScript compilation
  - Size: S

## Phase 2: Show Identity Normalization

- [ ] **Task 3:** Create unified normalizeShowIdentity utility
  - Create `backend/lib/show-normalization.ts` with robust implementation
  - Document behavioral differences from simple version
  - Update import scripts with migration checks
  - Size: M

## Phase 3: Unify Normalization Functions

- [ ] **Task 4:** Consolidate normalizeDogName and normalizeBreed
  - Extend `backend/lib/text-normalization.ts` with domain-specific functions
  - Create unified normalizeDogName using normalizeText base
  - Create unified normalizeBreed using normalizeText base
  - Document behavioral changes
  - Size: M

- [ ] **Task 5:** Update all imports to use consolidated utilities
  - Update import statements in all affected files
  - Remove local duplicate function definitions
  - Verify no circular dependencies
  - Check TypeScript compilation
  - Size: L

## Phase 4: Testing

- [ ] **Task 6:** Comprehensive testing and validation
  - Run `yarn test` - verify all tests pass
  - Run `yarn run build-all-data` - verify data pipeline
  - Run `yarn run test-parser-fixtures` - verify parser tests
  - Manual smoke test of affected scripts
  - Size: S

## Progress Tracking

**Completed:** 0/6 tasks  
**Current Phase:** Phase 1  
**Estimated Code Reduction:** ~150 lines  
**New Utility Modules:** 3  
**Files to Update:** 15+

## Blocking Issues

None identified yet.

## Notes

- Each task should be committed separately
- Use feature branches for each phase
- Run tests after each task completion
- Document any behavioral changes in commit messages
