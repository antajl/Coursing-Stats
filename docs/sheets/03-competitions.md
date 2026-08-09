---
title: Competitions
verified: 2026-08-09
---

# 03 вЂ” Competitions (СЃРїРѕСЂС‚)

## Purpose

РљСѓСЂСЃРёРЅРі / Р‘Р—РњРџ / Р±РµРіР° СЃ procoursing.ru: СЂРµР№С‚РёРЅРіРё, РєР°Р»РµРЅРґР°СЂСЊ, РїСЂРѕС‚РѕРєРѕР»С‹, СЃСѓРґСЊРё, РїСЂРѕС„РёР»Рё.

## Truth table

| Р¤Р°РєС‚ | |
|------|--|
| UI СЃРїРёСЃРѕРє РєСѓСЂСЃРёРЅРі/Р‘Р—РњРџ | **Р—Р°С‡С‘С‚ СЃРµР·РѕРЅР°** (`standingScore`) вЂ” РЅРµ Elo-sort |
| РњРµРґР°Р»Рё (РґР°РЅРЅС‹Рµ) | `indexes/top-placement-*.json` |
| РћС‡РєРё CS (РґР°РЅРЅС‹Рµ) | `indexes/top-score-*.json` (`rating_score`, version **cs-v1**) |
| Elo (РґР°РЅРЅС‹Рµ) | `indexes/top-elo-*.json` вЂ” РЅР° РєР°СЂС‚РѕС‡РєРµ, **РЅРµ** РІ sort |
| РњРµСЂРґР¶РёС‚СЊ РІ РѕРґРЅРѕ С‡РёСЃР»Рѕ | **Р—Р°РїСЂРµС‰РµРЅРѕ** (РєР°СЃРєР°Рґ: standing в†’ CS в†’ starts) |
| `standingScore` | `(3Г—рџҐ‡+1Г—рџҐ€+0.5Г—рџҐ‰) / (starts+4)` вЂ” РїСЂРё СЂР°РІРЅС‹С… РјРµРґР°Р»СЏС… РІС‹С€Рµ РјРµРЅСЊС€Рµ СѓС‡Р°СЃС‚РёР№ |
| `total_starts` | finished **Рё** disqualified (СѓС‡Р°СЃС‚РІРѕРІР°Р»Рё); **РЅРµ** dns/РЅРµСЏРІРєР° |
| `total_score` | = grand_total РїСЂРѕС‚РѕРєРѕР»Р°; **РЅРµ** РґРµР»РёС‚СЊ РЅР° СЃСѓРґРµР№; РІ С„РѕСЂРјСѓР»Сѓ CS **РЅРµ** РІС…РѕРґРёС‚ РЅР°РїСЂСЏРјСѓСЋ |
| CS formula | `backend/lib/rating/coursing-rating-score.ts` (Bayesian avg + peak + starts) |
| CS / Elo copy (UI) | CS вЂ” СЃСЂ. РѕС†РµРЅРєРё + РїРёРє + РѕРїС‹С‚, С‚Р°Р№-Р±СЂРµР№Рє; Elo вЂ” СЃРёР»Р° С‡РµСЂРµР· СЃРѕРїРµСЂРЅРёРєРѕРІ, РЅРµ РјРµСЃС‚Рѕ |
| Calendar prod | `ui-flags.publicCalendars.competitions: true` |
| РЎСѓРґСЊРё | `indexes/judges-summary.json`, `judge-details/{key}.json` вЂ” **РЅРµ** show judges |
| API local | `/api/competitions` (РЅРµ `/api/events`) |

## Key files / routes

| Route | |
|-------|--|
| `/competitions` | Hub СЂРµР№С‚РёРЅРі + СЃСѓРґСЊРё + РєР°Р»РµРЅРґР°СЂСЊ |
| `/event/:id` | РџСЂРѕС‚РѕРєРѕР» |
| `/dog/:id` | Unified profile |
| `/judges/:judgeId` | РЎСѓРґСЊСЏ СЃРїРѕСЂС‚Р° |
| Legacy `/top` | в†’ competitions ranking |

- `frontend/src/pages/` (Competitions, TopDogs, Judges, EventвЂ¦)
- `frontend/src/pages/Admin/` вЂ” Р»РѕРєР°Р»СЊРЅС‹Р№ СЂРµРґР°РєС‚РѕСЂ СЃРѕСЂРµРІРЅРѕРІР°РЅРёР№ (`/admin`, `/admin/event/:id`); Save РїРёС€РµС‚ `data/v1/competitions/*.json` + ensure-dogs; `build-all-data` вЂ” РІСЂСѓС‡РЅСѓСЋ РІ РєРѕРЅСЃРѕР»Рё
- Spec: `docs/superpowers/specs/2026-08-08-competition-admin-editor-design.md`
- `frontend/src/lib/eloRank.ts` вЂ” `medalStrength` / `standingScore`
- `frontend/src/pages/TopDogs/mergeCombinedRanking.ts` вЂ” merge + sort
- `frontend/src/pages/TopDogs/CoursingRatingHint.tsx` вЂ” в“ С‚РµРєСЃС‚
- `frontend/src/pages/Guide/components/RatingTab.tsx` вЂ” РЎРїСЂР°РІРѕС‡РЅРёРє
- `data/v1/calendar/` + `indexes/events-by-id.json` вЂ” СЃРїРёСЃРѕРє РєР°Р»РµРЅРґР°СЂСЏ; `/event/:calendarId` С‡РµСЂРµР· `results_file`
- `data/v1/competitions/`, `data/v1/indexes/`
- Procoursing links: `ProcoursingEventLink`, attribution components

## Workflows

РџРѕСЃР»Рµ РїР°СЂСЃР°/РїСЂР°РІРєРё СЂРµР·СѓР»СЊС‚Р°С‚РѕРІ в†’ РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё `sync-archive-comps-to-calendar` в†’ `yarn run build-all-data`.  
Reparse РїРѕ id РёР· URL `/event/:id`: `npx tsx backend/scripts/import/reparse-calendar-event-ids.ts [--archive] <id>вЂ¦`  
РџР°СЂСЃРµСЂС‹: СЃРј. [06-parsers](06-parsers.md).  
Р›РѕРєР°Р»СЊРЅР°СЏ РїСЂР°РІРєР°: `yarn run dev` в†’ `/admin/event/:id` в†’ Save в†’ `build-all-data` РїРµСЂРµРґ РїСЂРѕРґРѕРј.

## Pitfalls

- РќРµ СЃРѕСЂС‚РёСЂРѕРІР°С‚СЊ Р·Р°С‡С‘С‚ РїРѕ Elo; РЅРµ СЃРјРµС€РёРІР°С‚СЊ РјРµРґР°Р»Рё Рё CS РІ РѕРґРЅРѕ РІР·РІРµС€РµРЅРЅРѕРµ С‡РёСЃР»Рѕ.
- В«Р§Р°С‰Рµ РІ РїСЂРёР·Р°С…В» = РІС‹С€Рµ РљРџР” (РјРµРЅСЊС€Рµ СѓС‡Р°СЃС‚РёР№ РїСЂРё С‚РѕРј Р¶Рµ РЅР°Р±РѕСЂРµ РјРµРґР°Р»РµР№), РЅРµ В«Р±РѕР»СЊС€Рµ СѓС‡Р°СЃС‚РёР№В».
- РџСѓСЃС‚РѕР№ С‚РѕРї РЅР° CDN в†’ [02-data-pipeline](02-data-pipeline.md) diagnostics.
- РќРµ РїСѓС‚Р°С‚СЊ СЃ РІС‹СЃС‚Р°РІРѕС‡РЅС‹Рј СЂРµР№С‚РёРЅРіРѕРј РЅР° `/shows`.
- Id РєР°Р»РµРЅРґР°СЂСЏ (`20150314`) в‰  id С„Р°Р№Р»Р° СЃРѕСЂРµРІРЅРѕРІР°РЅРёСЏ (`1552`); РєР»РёРє РІ UI РёРґС‘С‚ РїРѕ calendar id.
- РРјРїРѕСЂС‚ С‚РѕР»СЊРєРѕ РІ `competitions/` Р±РµР· sync РІ `calendar/` в†’ РІ С‚Р°Р±Рµ РєР°Р»РµРЅРґР°СЂСЏ РїСЂРѕС‚РѕРєРѕР» В«РЅРµ РІРёРґРµРЅВ».
- РљРѕР»РѕРЅРєР° СЃСѓРґРµР№ РІ СЃРїРёСЃРєРµ РєР°Р»РµРЅРґР°СЂСЏ С‡РёС‚Р°РµС‚ `calendar.*.judges` (РЅРµ РїСЂРѕС‚РѕРєРѕР»). Р•СЃР»Рё РІ РїСЂРѕС‚РѕРєРѕР»Рµ СЃСѓРґСЊРё РµСЃС‚СЊ, Р° СЃРїСЂР°РІР° РїСѓСЃС‚Рѕ вЂ” РїРѕР»Рµ РІ calendar null; РїРѕСЃР»Рµ reparse РјРѕР¶РЅРѕ РґРѕРїРёСЃР°С‚СЊ РёР· `competition.event.judges`.
- РћРґРёРЅ numeric id РјРѕР¶РµС‚ Р±С‹С‚СЊ Рё Сѓ Р°СЂС…РёРІРЅРѕРіРѕ РїСЂРѕС‚РѕРєРѕР»Р°, Рё Сѓ Р±СѓРґСѓС‰РµРіРѕ СЃРѕР±С‹С‚РёСЏ 2026. `rebuild-calendar-index` РїСЂРµРґРїРѕС‡РёС‚Р°РµС‚ Р·Р°РїРёСЃСЊ СЃ `has_results` / `results_file` Рё РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ Р°Р»РёР°СЃРёС‚ id РёР· РёРјРµРЅРё С„Р°Р№Р»Р° `competitions/вЂ¦/{id}-вЂ¦.json`, С‡С‚РѕР±С‹ `/event/1567` РѕС‚РєСЂС‹РІР°Р» РїСЂРѕС‚РѕРєРѕР», Р° РЅРµ РїСѓСЃС‚РѕР№ РєР°Р»РµРЅРґР°СЂРЅС‹Р№ СЃР»РѕС‚.
- РЎС‚СЂР°РЅРёС†С‹ `procoursing.ru/results/вЂ¦` СЃ РѕРґРЅРёРј JPG (РґСЂСѓР¶РµСЃС‚РІРµРЅРЅС‹Рµ, В«РўСЂРѕР№РєР°В», С‡Р°СЃС‚СЊ В«РїРѕ Р±Р°Р»Р»Р°РјВ») вЂ” **РЅРµ** HTML-РїСЂРѕС‚РѕРєРѕР»С‹; С‚РµРєСѓС‰РёРµ РїР°СЂСЃРµСЂС‹ РёС… РЅРµ С‡РёС‚Р°СЋС‚ (РЅСѓР¶РµРЅ OCR РёР»Рё СЂСѓС‡РЅРѕР№ РІРІРѕРґ).

## See also

[01-three-domains](01-three-domains.md) В· [06-parsers](06-parsers.md) В· [07-frontend](07-frontend.md)
В· РїР»Р°РЅ: `docs/superpowers/plans/2026-08-06-season-standing-ranking-b.md`
