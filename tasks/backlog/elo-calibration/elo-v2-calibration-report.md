# Elo v2 Calibration Report

Generated: 2026-08-06T10:30:35.866Z
Corpus: 1874 scored same-breed pairs (coursing + bzmp), schema elo-races-v3

## Locked parameters

- **scale = 8**
- **K0 = 50**
- **initial_rating = 1500**
- **breedPools = true**
- Reason: Best (5/60) within noise of baseline 8/50 — keep baseline.

## Grid search (mean test logloss across large breeds, time-series CV)

| scale | K0 | mean test LL | std |
|------:|---:|-------------:|----:|
| 5 | 60 | 0.6773 (best raw) | 0.0143 |
| 5 | 55 | 0.6778 | 0.0134 |
| 5 | 50 | 0.6784 | 0.0125 |
| 5 | 45 | 0.6791 | 0.0116 |
| 5 | 40 | 0.6800 | 0.0106 |
| 8 | 60 | 0.6844 | 0.0093 |
| 8 | 55 | 0.6847 | 0.0087 |
| 8 | 50 | 0.6851 **← locked** | 0.0081 |
| 8 | 45 | 0.6855 | 0.0074 |
| 8 | 40 | 0.6859 | 0.0067 |
| 10 | 60 | 0.6868 | 0.0075 |
| 10 | 55 | 0.6870 | 0.0070 |
| 10 | 50 | 0.6872 | 0.0065 |
| 10 | 45 | 0.6875 | 0.0059 |
| 10 | 40 | 0.6879 | 0.0054 |
| 12 | 60 | 0.6882 | 0.0062 |
| 12 | 55 | 0.6884 | 0.0058 |
| 12 | 50 | 0.6886 | 0.0054 |
| 12 | 45 | 0.6888 | 0.0049 |
| 12 | 40 | 0.6891 | 0.0045 |

Baseline (8/50): mean=0.6851 ± 0.0081
Best raw: scale=5, K0=60, mean=0.6773

## Large breeds used for CV

- БАСЕНДЖИ: 173 scored races
- РОДЕЗИЙСКИЙ РИДЖБЕК: 131 scored races
- РУССКАЯ ПСОВАЯ БОРЗАЯ: 189 scored races
- САЛЮКИ: 106 scored races
- УИППЕТ: 855 scored races

## Breed reliability (bootstrap 95% CI of improvement vs E=0.5)

| Breed | Races | CI95 low | CI95 high | Conclusion |
|-------|------:|---------:|----------:|------------|
| УИППЕТ | 855 | 0.004 | 0.014 | GOOD |
| РУССКАЯ ПСОВАЯ БОРЗАЯ | 189 | -0.003 | 0.038 | INCONCLUSIVE |
| БАСЕНДЖИ | 173 | -0.014 | 0.010 | INCONCLUSIVE |
| РОДЕЗИЙСКИЙ РИДЖБЕК | 131 | 0.003 | 0.035 | GOOD |
| САЛЮКИ | 106 | -0.004 | 0.054 | INCONCLUSIVE |
| АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР | 60 | -0.005 | 0.051 | INCONCLUSIVE |
| ЧИРНЕКО ДЕЛЬ ЭТНА | 58 | 0.004 | 0.040 | GOOD |
| МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ | 51 | 0.005 | 0.047 | GOOD |
| ФАРАОНОВА СОБАКА | 47 | -0.002 | 0.039 | INCONCLUSIVE |

### Unreliable breeds (hide Elo or mark unreliable in UI)

- None with fully negative 95% CI at current thresholds.

## Display thresholds (product)

- Always show numeric Elo when present
- `elo_races < 8`: badge «мало данных» (career median ~4, p75 ~6; season max ~14–28)
- `≥ 8`: normal display
- Unreliable breeds list above: treat as hidden regardless of count

## Notes

- DQ outcomes use fixed S=0 and do not enter scale calibration.
- Bye-runs only affect K via starts_count.
- Version: elo-v2