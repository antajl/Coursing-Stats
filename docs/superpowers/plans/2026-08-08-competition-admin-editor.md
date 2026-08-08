# Competition Admin Editor (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Local-only admin UI to edit one competition document at a time (header + results CRUD), save to `data/v1` files, ensure dogs without `dog_id`, mark verified — without rebuild-all-data in Save.

**Architecture:** Extend local Hono admin API (`:8787`) with document save + dog ensure + dog search. New React pages under `/admin` (DEV only). Public `/event/:id` gets a DEV link into the editor. Save writes competition JSON + dog files for that event only.

**Tech Stack:** Hono local API, Vite React, vitest (backend), existing `findEventFile` / `dogKey` / `normalizeDogName`.

## Global Constraints

- Competitions domain only; no shows/Donino; no reparse UI.
- Save = file + ensure-dogs for **this** event; never `build-all-data` on Save.
- Admin UI only when `import.meta.env.DEV` / `isLocalDev`.
- Verified flag: `event.admin_verified_at: string | null`.
- Match dogs by normalized name+breed / `dog_key`; do not invent duplicate dogs for same key.
- MVP: top-level result fields only (no heats editor yet).
- Do not commit unless the user asks.

---

## File map

| Path | Role |
|------|------|
| `backend/lib/local-data/ensure-event-dogs.ts` | Resolve/create dogs for orphan results |
| `backend/tests/ensure-event-dogs.test.ts` | Unit tests with temp dirs |
| `backend/src/routes/admin/dogs.ts` | `GET /api/admin/dogs/search` |
| `backend/src/routes/admin/events.ts` | Add verified to list; `PUT .../document` |
| `backend/src/routes/admin.ts` | Register dogs routes |
| `frontend/src/pages/Admin/adminApi.ts` | Fetch helpers → `/api/admin/*` |
| `frontend/src/pages/Admin/AdminEventsList.tsx` | `/admin` list |
| `frontend/src/pages/Admin/AdminEventEditor.tsx` | `/admin/event/:id` editor |
| `frontend/src/pages/Admin/index.tsx` | Re-exports / thin wrappers |
| `frontend/src/AppRoutes.tsx` | Wire `/admin`, `/admin/event/:id` (DEV) |
| `frontend/src/pages/Events/EventResults/index.tsx` | DEV «Редактировать» link |

---

### Task 1: `ensureEventDogs` library + tests

**Files:**
- Create: `backend/lib/local-data/ensure-event-dogs.ts`
- Test: `backend/tests/ensure-event-dogs.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type EnsureDogsResult = {
    results: any[];
    createdDogs: Array<{ id: number; dog_key: string; name_lat: string; breed: string }>;
    linkedExisting: number;
  };

  export async function ensureEventDogs(opts: {
    dogsByIdDir: string;
    dogsByKeyDir: string;
    eventId: number;
    competitionRelPath: string; // e.g. competitions/2025/05-май/1263-....json
    results: any[];
    exportedAt?: string;
  }): Promise<EnsureDogsResult>;
  ```

- [ ] **Step 1: Write failing tests** covering: create new dog when missing; link existing by dog_key; skip rows that already have dog_id; leave placement/total_score untouched; skip rows without name+breed.

- [ ] **Step 2: Run** `yarn vitest run backend/tests/ensure-event-dogs.test.ts` — expect FAIL (module missing).

- [ ] **Step 3: Implement** using `dogKey` from `backend/scripts/export/d1-export-utils.ts`, `normalizeDogName`/`normalizeBreed` from parsers utils. Allocate next id = max existing `by-id/*.json` id + 1. Write `by-id/{id}.json` and `by-key/{dog_key}.json` with schema `coursing-stats/dog-v1`. Append `eventId` / `competitionRelPath` to dog competition lists when creating or linking.

- [ ] **Step 4: Run tests — expect PASS.**

---

### Task 2: Admin API — document save + dog search + verified in list

**Files:**
- Modify: `backend/src/routes/admin/events.ts`
- Create: `backend/src/routes/admin/dogs.ts`
- Modify: `backend/src/routes/admin.ts`

**Interfaces:**
- `PUT /api/admin/events/:id/document` body `{ event: object, results: array }` → ensure dogs → write file → `{ success, data: { event, results, result_count, ... }, createdDogs }`
- `GET /api/admin/dogs/search?q=` → up to 20 `{ id, name_lat, name_ru, breed, dog_key }`
- List events includes `admin_verified_at` from `event.admin_verified_at`

- [ ] **Step 1: Implement dogs search** scanning `dogs/by-id` (or dogs-index if faster) with case-insensitive substring on name/breed.
- [ ] **Step 2: Implement PUT document** — find file, replace `event` (keep `id`), replace `results`, run `ensureEventDogs`, set `result_count`/`exported_at`, write JSON.
- [ ] **Step 3: Add `admin_verified_at` to GET list mapping.**
- [ ] **Step 4: Manual smoke** via curl against local server if running; otherwise unit-level trust from Task 1 + TypeScript compile.

---

### Task 3: Frontend `adminApi` + list + editor (MVP fields)

**Files:**
- Create: `frontend/src/pages/Admin/adminApi.ts`
- Create: `frontend/src/pages/Admin/AdminEventsList.tsx`
- Create: `frontend/src/pages/Admin/AdminEventEditor.tsx`

**UI requirements:**
- List: year filter, columns date/title/location/verified, row → editor.
- Editor: editable header fields (`date_start`, `date_end`, `title`, `rank_label`, `location`, `host_club`, `judges`, `catalog_url`, `results_url`, verified checkbox → `admin_verified_at`).
- Results table: dog name/breed (text + optional search pick), `breed_class`, `placement`, `total_score`, `status`, `status_reason`, `qualification`, `vc`; add row; delete with `confirm`.
- Sticky Save calls `putEventDocument`; on success replace local state with returned document; show createdDogs count if any.
- Dirty tracking: Save disabled when clean.

- [ ] **Step 1: `adminApi.ts`** — `fetch` `/api/admin/...` with optional `X-Admin-Token` from `localStorage` key `adminApiToken` (or empty for local open).
- [ ] **Step 2: List page.**
- [ ] **Step 3: Editor page with Save.**

---

### Task 4: Routes + DEV entry from `/event/:id`

**Files:**
- Modify: `frontend/src/AppRoutes.tsx` — replace `LegacyAdminEventRedirect` with real editor when `isLocalDev`; add `/admin` → list; keep `/admin/calendar` redirect.
- Modify: `frontend/src/pages/Events/EventResults/index.tsx` or `EventHeader.tsx` — DEV-only Link «Редактировать» → `/admin/event/:id`.

- [ ] **Step 5: Verify** `isLocalDev` gates; production Navigate away from `/admin*`.

---

### Task 5: Verification

- [ ] Run `yarn vitest run backend/tests/ensure-event-dogs.test.ts`
- [ ] Typecheck/frontend build if cheap, or at least ensure no obvious TS errors in new files
- [ ] Smoke checklist for user: `yarn run dev` → `/admin` → open event → edit → Save → refresh `/event/:id`

---

## Spec coverage (self-review)

| Spec item | Task |
|-----------|------|
| `/admin` list + verified | 3, 2 |
| `/admin/event/:id` header + results CRUD | 3 |
| Save file + ensure dogs | 1, 2, 3 |
| DEV button from `/event/:id` | 4 |
| No build-all-data on Save | 2 |
| No prod editor | 4 |
| Detail heats editor | out of MVP (phase 2) |
| Dog search | 2, 3 |
