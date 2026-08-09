---
title: "ADR-014: CDN packs vs Turso data layers"
date: 2026-08-09
status: accepted
---

# ADR-014 — CDN packs vs Turso (data layers)

## Context

Cloudflare Pages soft-limits ~20 000 files per deploy. Thousands of tiny JSON profiles burned slots without helping UX. Heavy RKF exhibition protocols already live in Turso (ADR-009). We need one clear rule for where each kind of data lives.

## Decision

Two publish layers, one build pipeline:

| Layer | What | Where in prod |
|-------|------|----------------|
| **Canon** | Source of truth for rebuilds | `data/v1/` in git (+ local SQLite for sport indexes); RKF protocols also in Turso |
| **Hot CDN** | Calendars, rankings, Donino, list indexes, **packed** sport dog profiles, **packed** show judge-details, LC allowlist exhibitions | `/data/v1/*.json` on Pages |
| **Cold Turso** | Full RKF exhibition protocol blobs | `exhibitions_rkf` |

### Packing rules (by category only)

- Sport `indexes/dog-profiles` → `pack-000.json`…`pack-255.json` (`byId`)
- Show `shows/indexes/judge-details` → same pack layout (`byKey`)
- Show `dog-details` / `show-dog-lookup` already sharded — leave
- Sport `indexes/judge-details` (~50 files) — leave as single files
- `shows/indexes/search` — already sharded; do not merge further unless file budget forces it
- Do **not** pack competitions or dump all exhibitions onto CDN

Shard function: `backend/lib/cdn-packs.ts` (`cdnPackShardKey`, 256 shards).

### Explicit non-goals

- Not “everything in Turso”
- Not paid R2 / second Cloudflare account for this
- Not deleting `dogs/by-id` from git (build/import still need it); it is excluded from Pages copy

## Consequences

- Fewer CDN files, same URL UX (one GET per pack containing the entity)
- Readers must resolve pack + key (frontend `dogs.ts`, show `judges.ts`, bot, admin routes)
- Rebuild writers emit packs; one-shot `pack-cdn-profiles.ts` migrates legacy trees
- SEO prerender still expands packs into `/dog/:id` HTML pages

## See also

- Plan: `docs/superpowers/plans/2026-08-09-cdn-publish-slim.md`
- Sheet: `docs/sheets/02-data-pipeline.md`
- ADR-009 Turso exhibitions
