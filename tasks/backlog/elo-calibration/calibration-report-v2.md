# Elo Calibration Report (v2) - Corrected Data

## Overview
Калибровка Elo-параметров на исправленных данных (1,679 реальных пар вместо ошибочных 167,975). Методология подтверждена в предыдущих итерациях - результаты консистентны и ожидаемы.

## Data Summary
- **Total races:** 1,679 (реальные парные забеги)
- **Total dogs:** 571
- **Breeds:** 19
- **Date range:** 2025-03-08 to 2026-06-20
- **Grouping:** `(event_id, heat_number, bib_number)` - подтверждена как единственно правильная

## Scale Sensitivity Analysis

### Method
Анализ распределения S_A для разных значений scale на УИППЕТ (835 races).

### Results
| Scale | % < 0.10 | % < 0.20 | % < 0.30 | % 0.30-0.70 | % > 0.70 |
|-------|----------|----------|----------|-------------|----------|
| 1     | 5.7      | 8.9      | 14.0     | 8.0         | 78.0     |
| 2     | 1.4      | 5.7      | 8.9      | 24.7        | 66.5     |
| 3     | 0.8      | 1.4      | 5.7      | 40.5        | 53.8     |
| 5     | 0.1      | 0.8      | 1.4      | 64.3        | 34.3     |
| 8     | 0.1      | 0.1      | 0.8      | 78.1        | 21.1     |
| 10    | 0.1      | 0.1      | 0.4      | 88.1        | 11.5     |
| 15    | 0.1      | 0.1      | 0.1      | 94.0        | 5.9      |
| 20    | 0.1      | 0.1      | 0.1      | 96.2        | 3.7      |

### Diff Statistics
- Min: -46.00
- Max: 53.00
- Mean: 1.99
- Std: 3.95

### Conclusion
**Scale = 8** выбран как оптимальный:
- 78.1% значений в чувствительном диапазоне 0.30-0.70
- Минимизация вырождения в бинарный win/loss
- Согласуется с предыдущими итерациями

## 5-Fold Time-Series Cross-Validation

### Method
5-fold CV по времени для крупных пород (min 100 races).

### Results

#### УИППЕТ (835 races)
| Scale | K0 | Train LogLoss | Test LogLoss | Std Test |
|-------|----|---------------|-------------|----------|
| 8     | 50 | 0.6485        | 0.6641      | 0.0060   |

**Best:** scale=8, K0=50

#### РУССКАЯ ПСОВАЯ БОРЗАЯ (167 races)
| Scale | K0 | Train LogLoss | Test LogLoss | Std Test |
|-------|----|---------------|-------------|----------|
| 8     | 50 | 0.6204        | 0.6673      | 0.0169   |

**Best:** scale=8, K0=50

#### БАСЕНДЖИ (162 races)
| Scale | K0 | Train LogLoss | Test LogLoss | Std Test |
|-------|----|---------------|-------------|----------|
| 8     | 50 | 0.6445        | 0.6731      | 0.0190   |

**Best:** scale=8, K0=50

#### РОДЕЗИЙСКИЙ РИДЖБЕК (127 races)
| Scale | K0 | Train LogLoss | Test LogLoss | Std Test |
|-------|----|---------------|-------------|----------|
| 8     | 50 | 0.6181        | 0.6358      | 0.0060   |

**Best:** scale=8, K0=50

#### САЛЮКИ (104 races)
| Scale | K0 | Train LogLoss | Test LogLoss | Std Test |
|-------|----|---------------|-------------|----------|
| 8     | 50 | 0.6323        | 0.6551      | 0.0188   |

**Best:** scale=8, K0=50

### Conclusion
**Universal scale=8, K0=50** работает оптимально на всех 5 крупных породах.

## K0 Significance Testing

### Method
Сравнение K0=45 vs K0=50 для каждой породы с учётом std test logloss.

### Results
| Breed | K0=45 vs K0=50 diff | Average std | Significance |
|-------|---------------------|-------------|--------------|
| УИППЕТ | 0.00195 | 0.00575 | NOISE (diff < std) |
| РУССКАЯ ПСОВАЯ БОРЗАЯ | 0.00174 | 0.01627 | NOISE (diff < std) |
| БАСЕНДЖИ | 0.00150 | 0.01823 | NOISE (diff < std) |
| РОДЕЗИЙСКИЙ РИДЖБЕК | 0.00328 | 0.00563 | NOISE (diff < std) |
| САЛЮКИ | 0.00263 | 0.01810 | NOISE (diff < std) |

### Conclusion
Разница между K0=45 и K0=50 статистически незначима на всех породах (шум). Используем универсальный K0=50.

## Universal vs Per-Breed Comparison

### Conclusion
Universal `(scale=8, K0=50)` статистически не уступает per-breed оптимумам ни на одной из 5 крупных пород. Per-breed калибровка НЕ требуется.

## Bootstrap 95% CI Validation

### Method
Bootstrap-тест для средних/малых пулов (56+ races) для проверки значимости улучшения vs baseline.

### Results
| Breed | Races | Test LogLoss | Baseline | Improvement | 95% CI | Conclusion |
|-------|-------|--------------|----------|-------------|--------|------------|
| ЧИРНЕКО ДЕЛЬ ЭТНА | 56 | 0.5032 | 0.6931 | 0.1899 | [0.12, 0.26] | ✓ GOOD |

### Conclusion
ЧИРНЕКО ДЕЛЬ ЭТНА (56 races) показывает значимое улучшение vs baseline. Остальные породы <50 races требуют больше данных для валидации.

## Final Parameters

**Universal parameters (рекомендуется для всех пород):**
- **scale = 8**
- **K0 = 50**

## Data Quality Confirmation

### Status Handling
- **finished + heats:** ✅ Included in Elo
- **finished without heats:** ❌ Excluded
- **disqualified:** ❌ Excluded (even with heats)
- **dns:** ❌ Excluded
- **unknown_status:** ❌ Excluded

### Verification
- Full verification table for 20 dogs confirms all discrepancies explained by invalid statuses or multiple heats
- No data quality issues or incorrect grouping detected

## Next Steps

- Task 4: Comparison with old system (repeat on corrected data)
- Task 5: Transitivity check (repeat on corrected data)
- Task 6-8: Production implementation
