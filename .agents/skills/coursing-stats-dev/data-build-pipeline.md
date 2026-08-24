# Data Build Pipeline

## Chain

```
data/v1/competitions/*.json  (results[] inside files)
        │
        ▼  build-data-snapshot  →  load-sqlite.ts  →  pc-db.sqlite (in-memory)
        │
        ▼  build-derived-indexes.ts
        │
        ▼  data/v1/indexes/*.json (+ dog-profiles/pack-*.json)
        │
        ▼  copy-data.js (publish-exclude: no dogs/by-id, no bulk exhibitions)
        │
        ▼  CI  →  coursing-stats.ru/data/v1/
```

**Critical:** `backend/lib/local-data/load-sqlite.ts` → `loadCompetitions()` MUST load `results[]` from each competition JSON (with `dog_id`, `event_id`, nested `dog`).

**Layers:** hot CDN JSON (incl. packs) vs cold Turso RKF protocols — [ADR-014](../../../docs/decisions/014-cdn-packs-vs-turso.md).

## Commands

```bash
yarn run build-data-snapshot    # Log must show results > 0 (~3000+)
yarn run build-all-data         # Full rebuild + publish-gates
yarn run publish-gates          # Standalone gate check
npx vitest run backend/tests/static-indexes.test.ts backend/tests/publish-gates.test.ts
```

## Pre-push checklist

1. `build-data-snapshot` → results count > 0
2. `build-all-data` → no fatal errors
3. `static-indexes.test.ts` + `publish-gates.test.ts` pass
4. Spot-check CDN indexes have `"count" > 0` (not just HTTP 200)

## Empty ranking on prod (diagnostics)

**Symptom:** Calendar works, ranking/judges empty on prod but fine locally.

```bash
curl -s https://coursing-stats.ru/data/v1/indexes/judges-summary.json | head -c 200
curl -s https://coursing-stats.ru/data/v1/indexes/top-placement-2026.json | head -c 200
```

Expect `"count" > 0` and non-empty arrays.

**Donino** reads `donino/*.json` separately — check those files if Donino is empty.

## Editable vs generated

| Edit manually | Generated (never edit) |
|---------------|------------------------|
| `competitions/*.json` | `indexes/*` |
| `dogs/by-id/`, `dogs/by-key/` | `manifest.json` |
| `calendar/{year}.json` | `shows/indexes/*` |
| `donino/*.json` | |

After editing canonical data → always `yarn run build-all-data`.

## Publish gates

- `top-placement-all` and `judges-summary` must be non-empty
- Max file size ≤ 24.5 MB
- No duplicate protocols
- `results > 0` in snapshot

Docs: `docs/sheets/02-data-pipeline.md`, `docs/sheets/09-ops-deploy.md`
