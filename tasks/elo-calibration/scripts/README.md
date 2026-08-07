# Elo Calibration Archive

This directory stores one-off Elo calibration, analysis, debug, and verification scripts.

## Retained production-side scripts

The active Elo runtime pipeline remains in `backend/scripts/elo/`:

- `extract-races.ts` - build canonical `races-data.json` from competition data
- `generate-elo-index.ts` - calculate Elo with production params and write both `top-elo-*.json` and `dog-profiles/*.json`
- `verify-three-levels.ts` - verify `(a) direct calc == (b) top-elo == (c) dog-profiles`

## Why these files were archived

Most archived scripts were created during Task 3-4 calibration work:

- parameter search and cross-validation
- bootstrap significance checks
- pair/heat anomaly investigation
- one-off dog-specific debugging
- temporary prod comparison tables

They are intentionally kept out of the regular data pipeline to reduce maintenance risk and avoid reintroducing stale calculation paths.
