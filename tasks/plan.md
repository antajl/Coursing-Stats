# Plan: Backend Duplication Elimination

**Generated:** 2026-08-24  
**Goal:** Eliminate duplicate utility functions across backend scripts and libraries  
**Approach:** Incremental consolidation with testing between phases  

## Dependency Graph

```
Task 1 (walkJson) → Task 2 (normalizeKeyPart) → Task 3 (normalizeShowIdentity) → Task 4 (unify normalize) → Task 5 (update imports) → Task 6 (testing)
```

All tasks are sequential to ensure we can verify each consolidation step before proceeding.

---

## Phase 1: Shared Audit Utilities

### Task 1: Create shared walkJson utility

**Description:** Extract the duplicated `walkJson` function from 3 files into a shared utility module. This function recursively walks directories to find JSON files and is used across audit scripts.

**Acceptance criteria:**
- [ ] Create `backend/lib/audit-utils.ts` with exported `walkJson` function
- [ ] Function signature matches existing implementations: `function walkJson(dir: string, base = ''): string[]`
- [ ] Function behavior is identical to original (recursive directory walk, JSON filter)
- [ ] Add JSDoc comment explaining purpose and usage
- [ ] Export function for use in other modules

**Verification:**
- [ ] TypeScript compilation succeeds
- [ ] Manual test: call function on test directory, verify output matches original
- [ ] No breaking changes to existing code (old functions still work)

**Dependencies:** None

**Files likely touched:**
- `backend/lib/audit-utils.ts` (new file)
- `backend/lib/competition-fingerprint.ts` (will import new utility)
- `backend/scripts/audit/audit-duplicate-events.ts` (will import new utility)
- `backend/scripts/audit/merge-confirmed-duplicate-dogs.ts` (will import new utility)

**Size:** S (1 new file, 3 import updates)

---

### Task 2: Create shared normalizeKeyPart utility

**Description:** Extract the duplicated `normalizeKeyPart` function from 6 files into a shared utility module. This function normalizes key parts for identity matching (Unicode normalization, space handling, uppercase).

**Acceptance criteria:**
- [ ] Create `backend/lib/key-normalization.ts` with exported `normalizeKeyPart` function
- [ ] Function signature: `function normalizeKeyPart(value: string): string`
- [ ] Function implementation: NFKC normalization, space collapse, trim, uppercase
- [ ] Add JSDoc comment explaining the normalization algorithm
- [ ] Export function for use across audit scripts and libraries

**Verification:**
- [ ] TypeScript compilation succeeds
- [ ] Unit test: verify function output matches original for sample inputs
- [ ] Import in `backend/lib/show-dog-profile-id.ts` and verify existing tests pass
- [ ] No breaking changes to existing code

**Dependencies:** None (can be done in parallel with Task 1)

**Files likely touched:**
- `backend/lib/key-normalization.ts` (new file)
- `backend/lib/show-dog-profile-id.ts` (source of truth, will export from new module)
- `backend/scripts/audit/analyze-other-collision.ts` (will import new utility)
- `backend/scripts/audit/check-id-collisions.ts` (will import new utility)
- `backend/scripts/audit/diagnose-id-collisions.ts` (will import new utility)
- `backend/scripts/repair/fix-collisions-emergency.ts` (will import new utility)
- `backend/scripts/fix-collisions-emergency.ts` (will import new utility)

**Size:** S (1 new file, 6 import updates)

---

## Phase 2: Show Identity Normalization

### Task 3: Create unified normalizeShowIdentity utility

**Description:** Create a shared utility for show identity normalization that resolves the inconsistency between simple and complex implementations. Choose the more robust implementation from `turso-ids.ts` and make it available to all import scripts.

**Acceptance criteria:**
- [ ] Create `backend/lib/show-normalization.ts` with exported `normalizeShowIdentity` function
- [ ] Use the robust implementation from `turso-ids.ts` (NFKC, Ё→Е, Unicode regex, trim)
- [ ] Add JSDoc explaining the normalization algorithm and rationale
- [ ] Export function for use in import scripts
- [ ] Add comment about migration path for simple implementation users

**Verification:**
- [ ] TypeScript compilation succeeds
- [ ] Manual test: compare output of both implementations on sample show names
- [ ] Document any behavioral differences in migration notes
- [ ] Ensure `stableTursoId` function in `turso-ids.ts` continues to work correctly

**Dependencies:** None (can be done in parallel with Tasks 1-2)

**Files likely touched:**
- `backend/lib/show-normalization.ts` (new file)
- `backend/lib/shows/turso-ids.ts` (source of truth, will export from new module)
- `backend/scripts/import-to-local-sqlite.ts` (will import new utility, needs migration check)
- `backend/scripts/import-archive/import-to-local-sqlite.ts` (will import new utility, needs migration check)

**Size:** M (requires analysis of implementation differences, potential data impact)

---

## Phase 3: Unify Normalization Functions

### Task 4: Consolidate normalizeDogName and normalizeBreed

**Description:** Unify the various `normalizeDogName` and `normalizeBreed` implementations across the codebase into a single coherent module using the existing `normalizeText` from `text-normalization.ts` as the base.

**Acceptance criteria:**
- [ ] Extend `backend/lib/text-normalization.ts` with domain-specific normalizers
- [ ] Create `normalizeDogName` function that uses `normalizeText` as base
- [ ] Create `normalizeBreed` function that uses `normalizeText` as base
- [ ] Add JSDoc comments explaining when to use each function
- [ ] Maintain backward compatibility for existing behavior where needed
- [ ] Document any behavioral changes from consolidation

**Verification:**
- [ ] TypeScript compilation succeeds
- [ ] Run existing parser tests to ensure no regression
- [ ] Compare output of old vs new implementations on sample data
- [ ] Check that `dog-name-parts.ts` continues to work correctly with new implementation

**Dependencies:** Task 2 (for consistency in normalization approach)

**Files likely touched:**
- `backend/lib/text-normalization.ts` (extend with new functions)
- `backend/lib/dog-name-parts.ts` (will use new normalizeBreed)
- `backend/scripts/audit/audit-duplicate-dogs.ts` (will use new normalizeBreed)
- `backend/parsers/coursing/utils.ts` (will use new normalizeDogName/normalizeBreed)
- `backend/lib/breedarchive.ts` (will use new normalizeDogName)

**Size:** M (multiple domains affected, requires careful compatibility testing)

---

### Task 5: Update all imports to use consolidated utilities

**Description:** Update all files that import the old normalization functions to use the new consolidated utilities from the shared modules. This is a mechanical refactoring step.

**Acceptance criteria:**
- [ ] Update import statements in all affected files
- [ ] Remove local duplicate function definitions
- [ ] Ensure all imports point to the new shared modules
- [ ] Verify no circular dependencies are introduced
- [ ] Check that all files still compile without errors

**Verification:**
- [ ] TypeScript compilation succeeds for all affected files
- [ ] No import errors or missing module errors
- [ ] Manual check of import paths in updated files
- [ ] Verify that all old local function definitions are removed

**Dependencies:** Task 4 (consolidated utilities must exist first)

**Files likely touched:**
- All files identified in Tasks 1-4 that contain local duplicates
- Any additional files discovered during import analysis
- Package.json if any new dependencies are needed (unlikely)

**Size:** L (many files affected, mechanical but requires careful verification)

---

## Phase 4: Testing

### Task 6: Comprehensive testing and validation

**Description:** Run the full test suite and build process to ensure that all consolidations have not introduced any regressions. This is the final verification step before considering the refactoring complete.

**Acceptance criteria:**
- [ ] Run `yarn test` - all tests pass
- [ ] Run `yarn run build-all-data` - data pipeline succeeds
- [ ] Run `yarn run test-parser-fixtures` - parser tests pass
- [ ] Manual smoke test of affected audit scripts
- [ ] Verify no console errors or warnings in test output
- [ ] Check that all TypeScript compilation succeeds

**Verification:**
- [ ] All test suites pass with no failures
- [ ] Build process completes successfully
- [ ] No new linting errors introduced
- [ ] Performance degradation check (if applicable)
- [ ] Manual verification of key functionality (dog identity matching, show imports)

**Dependencies:** Tasks 1-5 (all consolidations must be complete)

**Files likely touched:**
- No new files, only running existing test infrastructure
- Test configuration files if any new tests are added
- CI configuration if testing approach changes

**Size:** S (verification only, no new code)

---

## Rollback Plan

If any task introduces breaking changes:

1. **Immediate rollback:** Revert the specific task's changes
2. **Data validation:** Run `yarn run build-all-data` to ensure data integrity
3. **Incremental retry:** Address the specific issue before retrying the task
4. **Documentation:** Update plan with lessons learned

## Success Metrics

- **Code reduction:** Target ~150 lines of duplicate code eliminated
- **File count:** +3 new utility modules, -10+ local duplicate functions
- **Test coverage:** All existing tests continue to pass
- **Build time:** No significant increase in build time
- **Data integrity:** No changes to data pipeline output

## Notes

- Each task should be committed separately for easy rollback
- Use git branches for each phase to enable parallel work if needed
- Document any behavioral changes in migration comments
- Consider adding integration tests for the new shared utilities
