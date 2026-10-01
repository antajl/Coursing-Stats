# ADR-012: Enable Strict TypeScript Checks and Implement Structured Logging

**Status:** Accepted  
**Date:** 2026-08-05  

## Context

The CoursingStats project had good TypeScript configuration but was missing:
- Strict unused variable/parameter checks (`noUnusedLocals`, `noUnusedParameters` disabled)
- Consistent structured logging across frontend and backend
- Integration between existing `structured-logging.ts` (backend) and frontend components

Current state:
- Frontend used mix of `console.log` and unstructured logging
- Backend had `structured-logging.ts` but it wasn't consistently used
- Error tracking used console.error for critical errors
- AuthContext and other critical components lacked proper observability

## Decision

**Enable strict TypeScript checks and implement consistent structured logging across the entire project.**

### TypeScript Strict Checks

**Changes to `frontend/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,      // was false
    "noUnusedParameters": true,  // was false
  }
}
```

**Rationale:**
- Catches dead code early
- Improves code quality and maintainability
- Forces cleaner function signatures
- Code already passed these checks (build successful)

### Structured Logging Implementation

**Created `frontend/src/lib/logging.ts`:**
- Simple structured logger for frontend
- Matches backend `structured-logging.ts` pattern
- Supports DEBUG, INFO, WARN, ERROR levels
- Context-aware logging with metadata

**Applied structured logging to:**
1. **AuthContext** - All auth operations (login, register, logout, deleteAccount)
2. **DogProfileHeader** - Favorite toggle operations
3. **ErrorBoundary** - Error catching with component stack
4. **Backend error-tracker** - Critical error logging integration

### Rationale

**Why strict TypeScript:**
- TypeScript already has `strict: true` - completing the strict mode
- Code was already clean (no unused variables/parameters)
- Prevents future accumulation of dead code
- Better IDE support and autocomplete

**Why structured logging:**
- Logs become queryable and filterable
- Consistent format across frontend/backend
- Better debugging in production
- Supports future observability requirements
- Matches project's existing backend pattern

**Rejected Alternatives:**
- **Keep as-is:** Would accumulate technical debt and poor observability
- **Use external logging service:** Overkill for current needs, adds complexity
- **Only fix critical paths:** Inconsistent approach leads to confusion

## Consequences

### Positive
- **Type Safety:** Catches unused code at compile time
- **Observability:** All critical operations now logged consistently
- **Debugging:** Easier to trace issues with structured logs
- **Maintainability:** Cleaner code, better IDE support
- **Consistency:** Frontend and backend use same logging pattern
- **Production Ready:** Better foundation for monitoring and alerting

### Negative
- **Minor noise:** May require prefixing variables with `_` for intentionally unused parameters
- **Learning curve:** Team needs to use structured logging consistently
- **Build time:** Negligible impact (already passing checks)

### Implementation Details

**Files Modified:**
- `frontend/tsconfig.json` - Enabled strict checks
- `frontend/src/lib/logging.ts` - New structured logging utility
- `frontend/src/contexts/AuthContext.tsx` - Structured logging for auth operations
- `frontend/src/pages/DogProfile/DogProfileHeader.tsx` - Structured logging for favorites
- `frontend/src/components/ErrorBoundary.tsx` - Structured error logging
- `backend/lib/error-tracker.ts` - Integrated structured logging for critical errors

**Code Quality Impact:**
- All TypeScript checks pass without errors
- Build successful with no type errors
- No breaking changes to existing functionality
- Logging is additive (doesn't change behavior)

## References

- Previous code quality improvements: Code review (2026-08-05)
- Backend structured logging: `backend/lib/structured-logging.ts`
- TypeScript documentation: https://www.typescriptlang.org/tsconfig
