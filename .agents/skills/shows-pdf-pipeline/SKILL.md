---
name: shows-pdf-pipeline
description: >
  Пайплайн PDF РКФ для выставок CoursingStats — парсинг type1/type3, пакетный репарс,
  rebuild-show-year. Используй при редактировании parse-rkf-certificate-pdf, отсутствующей
  главной арены/BIS, или рейтинга выставок после изменений PDF.
  RKF PDF pipeline for CoursingStats shows — type1/type3 parse, batch reparse, rebuild-show-year.
  Use when editing parse-rkf-certificate-pdf, missing main ring/BIS, or show ranking after PDF changes.
---

# Shows PDF Pipeline

## When to use

- Editing `parse-rkf-certificate-pdf.ts`
- Working on type1/type3 PDF parsing
- Batch reparsing RKF reports
- Debugging missing judges, breeds, awards, or main ring data

## Pipeline overview

```text
download-rkf-reports
  → parse-rkf-reports
  → rebuild-show-year / rebuild-show-snapshot
  → build-all-data
```

## Critical facts

- RKF PDF parsing is separate from procoursing parsers.
- Type1 and type3 are different inputs with different extraction logic.
- Type3 main ring parsing is only in scope for 2025–2026.
- Yearly show ranking is sharded because Cloudflare Pages has a 25 MB file limit.
- Turso is for exhibition protocols; ranking and judges are still CDN indexes.

## Key files

- `backend/scripts/shows/parse-rkf-certificate-pdf.ts`
- `backend/scripts/shows/parse-rkf-reports.ts`
- `backend/scripts/build-show-indexes.ts`
- `backend/scripts/build-show-indexes-by-year.ts`
- `backend/tests/parse-rkf-certificate-pdf.test.ts`
- `backend/tests/show-grades.test.ts`
- `docs/sheets/04-shows.md`

## Safe workflow

1. Read `docs/sheets/04-shows.md`.
2. Identify whether the bug is type1, type3, wrapping, grade normalization, or linkage.
3. Reproduce with the smallest known fixture or PDF case.
4. Change parser logic narrowly.
5. Run focused tests first.
6. Reparse only the necessary year or subset.
7. Rebuild show indexes and verify output sizes.

## Commands

```bash
yarn run parse-rkf-reports
yarn run rebuild-show-year
yarn run rebuild-show-snapshot
yarn run build-all-data
yarn test
```

## Verification checklist

- Judges count is sane
- Breeds are not merged across wrapped rows
- `Неявка` and split grades render correctly
- Type3 badges appear only when supported
- Output shards stay under size limits

## Do not do

- Do not infer dog linkage by name
- Do not assume old JSON will self-heal without reparse
- Do not rebuild unrelated domains unless needed
