---
name: donino-domain
description: >
  Донино CoursingStats — speed_records км/ч и coursing_records 350m секунды, профили /speed-records и /donino-dog.
  Используй для Донино, замеров скорости, гонок 350м; никогда не смешивай со спортом или выставками.
  CoursingStats Donino — speed_records km/h and coursing_records 350m seconds, /speed-records and /donino-dog profiles.
  Use for Donino, speed measurement, 350m racing; never mix with sport or shows.
---

# Donino Domain

## Scope

Speed measurement records and 350m flat-track coursing records from Donino. **Fully separate dog identity** from competitions and shows.

## Routes & pages

| Route | Component |
|-------|-----------|
| `/speed-records?view=table` | `SpeedRecords/index.tsx` |
| `/speed-records?view=stats` | Stats panels |
| `/donino-dog/:name/:breed` | `DoninoDogProfile.tsx` |
| `/dog/:id` | Donino columns when `dog_id` linked |

## Two disciplines — never mix

| Discipline | File | Unit | Meaning |
|------------|------|------|---------|
| Speed measurement | `donino/speed_records.json` | km/h | Personal speed record on coursing |
| 350m coursing | `donino/coursing_records.json` | seconds | Fixed 350m flat track |

Do NOT convert between them. Do NOT merge datasets.

## Data (CDN only)

```
data/v1/donino/speed_records.json      (~224 records)
data/v1/donino/coursing_records.json   (~124 records)
```

Frontend: `frontend/src/lib/staticData/donino.ts`

Lookup: `getDoninoDog(name, breed)` — by name+breed slug, not dog_id.

## Update pipeline

```bash
yarn run export-donino-speed      # Google Sheets → JSON
yarn run export-donino-coursing
yarn run export-donino            # both
yarn run build-all-data
```

CI: `.github/workflows/update-speed-records.yml` (4×/day)

## Identity

- Donino dogs identified by **name + breed**, not competition `dog_id`
- Optional `dog_id` in records links to sport profile columns on `/dog/:id`
- No link to show dogs by design
- Bot handlers: `bot/src/handlers/donino/`

## Docs

- `docs/sheets/05-donino.md`
