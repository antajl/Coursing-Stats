# ADR-002: React Query for Data Fetching

**Status:** Accepted  
**Date:** 2025-02-15  
**Context:** Frontend data architecture decision

## Context

Coursing Stats frontend needed a robust data fetching solution for:
- Caching API responses
- Optimistic updates
- Loading and error states
- Automatic refetching
- Background data synchronization

## Decision

**Chose React Query (@tanstack/react-query)** for data fetching and state management.

### Rationale

**React Query Advantages:**
- Built-in caching and deduplication
- Automatic refetching strategies
- Optimistic updates support
- DevTools for debugging
- TypeScript support
- Small bundle size
- Battle-tested in production

**Rejected Alternatives:**
- **Redux + RTK Query:** Too complex for our needs
- **SWR:** Good but less feature-rich than React Query
- **Apollo Client:** Overkill (not using GraphQL)
- **Custom fetch hooks:** Would require implementing caching, loading states, etc.

## Consequences

### Positive
- Reduced boilerplate code
- Better user experience (cached data)
- Automatic background refetching
- Optimistic UI updates
- Easy debugging with DevTools

### Negative
- Additional dependency (but small: ~13KB)
- Learning curve for team members
- Requires understanding of React Query patterns

### Implementation
- Installed `@tanstack/react-query` in frontend
- Created query client configuration
- Wrapped app with QueryClientProvider
- Used useQuery/useMutation hooks throughout app
- Configured stale time and cache strategies

## References

- React Query documentation: https://tanstack.com/query/latest
- Frontend docs: docs/sheets/07-frontend.md
