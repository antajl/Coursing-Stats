# ADR-008: Unified Event Structure

**Status:** Proposed  
**Date:** 2026-08-03  
**Decision:** Unify competitions and exhibitions into single event structure

## Context

Currently data is stored in separate directories with different schemas:
- `data/v1/competitions/` - racing/coursing events (schema: competition-v1)
- `data/v1/shows/exhibitions/` - RKF exhibitions (custom schema)

This creates complexity:
- Different data structures for similar concepts
- Separate indexing pipelines
- Confusing navigation in codebase
- Duplication of event metadata

## Decision

Unify all events into single structure under `data/v1/events/` with common schema:

### Unified Event Schema

```typescript
interface Event {
  id: number                    // Unique event ID
  event_type: 'exhibition' | 'racing' | 'coursing'
  year: number
  date_start: string
  date_end: string | null
  title: string
  location: string
  rank_label: string | null
  judges: string[] | null

  // Exhibition-specific
  breed_catalog?: ExhibitionBreedCatalog[]
  exhibition_results?: ExhibitionResult[]

  // Racing/coursing-specific
  competition_kind?: string
  competition_type?: string
  heats?: Heat[]
  results?: RacingResult[]
  raw_scores?: RawScores
}
```

### Directory Structure

```
data/v1/events/
├── 2026/
│   ├── 08-август/
│   │   ├── 1550-чркф-бега-борзых.json      // racing
│   │   └── 112-национальный-чемпионат.json // exhibition
├── 2025/
└── ...
```

### Migration Steps

1. Create unified schema definition
2. Migrate competitions/ to events/ with new schema
3. Migrate exhibitions/ to events/ with new schema
4. Update build-show-indexes.ts to read from events/
5. Update frontend to read from events/
6. Remove old directories (competitions/, exhibitions/)
7. Update CI/CD pipeline

## Benefits

- Single data structure for all events
- Unified indexing pipeline
- Simpler frontend code
- Better data consistency
- Easier to add new event types

## Trade-offs

- Breaking change for existing code
- Requires migration of all event data
- Frontend needs to handle unified structure

## Alternatives Considered

1. **Keep separate** - rejected due to complexity
2. **Merge only metadata** - rejected as partial solution
3. **Virtual union layer** - rejected as adds complexity

## Implementation Notes

- Start with competitions/ migration (simpler structure)
- Then exhibitions/ migration (more complex data)
- Maintain backward compatibility during transition
- Update all consumer scripts
- Test thoroughly before deploying

## References

- Current competitions schema: `data/v1/competitions/*/*.json`
- Current exhibitions schema: `data/v1/shows/exhibitions/*.json`
- Build script: `backend/scripts/build-show-indexes.ts`
