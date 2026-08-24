---
name: sport-show-linkage
description: >
  Безопасная идентичность собак спорт↔выставка для CoursingStats. Используй при связывании
  competition_dog_id и show_dog_id, dog_links, объединении профилей /dog, или сопоставлении
  собак по имени между доменами.
  Safe sport↔show dog identity for CoursingStats. Use when linking competition_dog_id and show_dog_id,
  dog_links, unified /dog profile merge, or matching dogs by name across domains.
---

# Sport-Show Linkage

## When to use

- Unified dog profile changes: `/dog/:id`
- Show index generation or dedupe
- Any task mentioning `competition_dog_id`, `show_dog_id`, or `dog_links`
- Any request to "merge" dogs from competitions and shows

## Non-negotiable identity rules

1. `competition dog_id` and `show id` are different namespaces.
2. The same name can belong to different dogs.
3. Numeric equality between IDs is meaningless unless there is an explicit link.
4. Do not link dogs by name alone.
5. Donino is out of scope here unless a task explicitly mentions `dog_id` in Donino rows.

## Allowed linkage sources

Use only these signals, in this order:

1. Explicit `dog_links` table or equivalent canonical mapping
2. `competition_dog_id` already present in show indexes
3. Stable pre-existing project logic in show build scripts

If none of these exist, stop and keep identities separate.

## High-risk files

- `frontend/src/pages/DogProfile/`
- `frontend/src/pages/ShowDogProfile.tsx`
- `frontend/src/lib/staticData/dogs.ts`
- `frontend/src/lib/staticData/shows.ts`
- `backend/scripts/build-show-indexes*.ts`
- `backend/lib/show-dog-dedupe.ts`
- `data/v1/indexes/dog-profiles/`
- `data/v1/shows/indexes/`

## Safe workflow

1. Confirm which namespace the task starts from: sport or show.
2. Identify the canonical source of the link.
3. Verify the link path in code and data.
4. Make the smallest possible change.
5. Rebuild affected indexes.
6. Verify that unrelated dogs with identical names stay separate.

## Verification

```bash
yarn run build-all-data
npx vitest run backend/tests/static-indexes.test.ts
```

Then spot-check:

- A known linked dog shows both sport and show data
- A same-name different-breed case does not collapse incorrectly

## Current project gap

Primary backlog: sport ↔ show linkage via `dog_links`. See `docs/sheets/01-three-domains.md`.
