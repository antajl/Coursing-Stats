/**
 * Парсер строки курсинга для формата с 1 судьей
 */

import { extractNumber, extractBoldNumber, extractBibColor, cleanText } from './utils';

export function parseDogRow1Judge($, $cells, cellCount, allRows, rowIndex, judges, processedRows) {
  // Парсинг для формата с 1 судьей
  // Структура: все оценки в одной строке
  // 0: место, 1: каталожный номер, 2: порода, 3: класс, 4: пол, 5: кличка
  // 6: номер забега 1 (с цветом фона)
  // 7-11: судья 1, забег 1 (5 категорий)
  // 12: сумма судьи 1, забег 1
  // 13: сумма забега 1
  // 14: номер забега 2 (с цветом фона)
  // 15-19: судья 1, забег 2 (5 категорий)
  // 20: сумма судьи 1, забег 2
  // 21: сумма забега 2
  // 22: общая сумма
  // 23: ВС
  // 24: титул
  
  const heats = [];
  
  // Номер забега 1 и цвет формы (ячейка 6)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Number = extractNumber(heat1Text);
  const heat1Color = extractBibColor(heat1Cell);
  
  // Проверяем disqualified для heat1 (colspan в ячейке 7)
  const heat1FirstCell = $cells.eq(7);
  const heat1Colspan = heat1FirstCell.attr('colspan');
  let heat1Disqualified = false;
  let heat1DisqualificationReason = null;
  let heat1Judge1Scores = [];
  
  if (heat1Colspan && parseInt(heat1Colspan) >= 7) {
    heat1Disqualified = true;
    heat1DisqualificationReason = heat1FirstCell.text().trim();
    heat1Judge1Scores = [null, null, null, null, null];
  } else {
    // Парсим оценки судьи 1 для забега 1
    for (let i = 7; i <= 11; i++) {
      if (i < cellCount) {
        const score = extractNumber($cells.eq(i).text());
        heat1Judge1Scores.push((score !== null && score <= 20) ? score : null);
      } else {
        heat1Judge1Scores.push(null);
      }
    }
  }
  
  const heat1Judge1Sum = (cellCount > 12) ? extractBoldNumber($cells.eq(12)) : null;
  const heat1Total = (cellCount > 13) ? extractBoldNumber($cells.eq(13)) : null;
  
  // Номер забега 2 и цвет формы (ячейка 14)
  let heat2Number = null;
  let heat2Color = null;
  if (cellCount > 14) {
    const heat2Cell = $cells.eq(14);
    const heat2Text = heat2Cell.text().trim();
    heat2Number = extractNumber(heat2Text);
    heat2Color = extractBibColor(heat2Cell);
  }
  
  // Проверяем disqualified для heat2 (colspan в ячейке 15)
  let heat2Disqualified = false;
  let heat2DisqualificationReason = null;
  let heat2Judge1Scores = [];
  let heat2Judge1Sum = null;
  let heat2Total = null;
  
  if (cellCount > 15) {
    const heat2FirstCell = $cells.eq(15);
    const heat2Colspan = heat2FirstCell.attr('colspan');
    
    if (heat2Colspan && parseInt(heat2Colspan) >= 6) {
      heat2Disqualified = true;
      heat2DisqualificationReason = heat2FirstCell.text().trim();
      heat2Judge1Scores = [null, null, null, null, null];
    } else {
      // Парсим оценки судьи 1 для забега 2
      for (let i = 15; i <= 19; i++) {
        if (i < cellCount) {
          const score = extractNumber($cells.eq(i).text());
          heat2Judge1Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat2Judge1Scores.push(null);
        }
      }
      heat2Judge1Sum = (cellCount > 20) ? extractBoldNumber($cells.eq(20)) : null;
      heat2Total = (cellCount > 21) ? extractBoldNumber($cells.eq(21)) : null;
    }
  }
  
  // Формируем heats
  if (heat1Number !== null) {
    const heat1Judges = [];
    if (heat1Judge1Scores.some(s => s !== null)) {
      heat1Judges.push({
        judge_number: 1,
        scores: heat1Judge1Scores,
        sum: heat1Judge1Sum
      });
    }
    
    heats.push({
      heat_number: 1,
      bib_number: heat1Number,
      bib_color: heat1Color,
      judges: heat1Judges,
      total: heat1Total,
      disqualified: heat1Disqualified,
      disqualification_reason: heat1DisqualificationReason
    });
  }
  
  if (heat2Number !== null) {
    const heat2Judges = [];
    if (heat2Judge1Scores.some(s => s !== null)) {
      heat2Judges.push({
        judge_number: 1,
        scores: heat2Judge1Scores,
        sum: heat2Judge1Sum
      });
    }
    
    heats.push({
      heat_number: 2,
      bib_number: heat2Number,
      bib_color: heat2Color,
      judges: heat2Judges,
      total: heat2Total,
      disqualified: heat2Disqualified,
      disqualification_reason: heat2DisqualificationReason
    });
  }
  
  // Общая сумма
  let grandTotal = null;
  if (cellCount > 22) {
    grandTotal = extractBoldNumber($cells.eq(22));
  } else if (cellCount > 13) {
    grandTotal = extractBoldNumber($cells.eq(cellCount - 3));
  }
  
  // Fallback: compute total from heat totals if direct extraction failed
  if (grandTotal === null && heats.length > 0) {
    const heatTotals = heats
      .map(h => h.total)
      .filter(t => t !== null && !isNaN(t));
    if (heatTotals.length > 0) {
      grandTotal = heatTotals.reduce((sum, t) => sum + t, 0);
    }
  }
  
  // Secondary fallback: compute from judge sums if heat totals not available
  if (grandTotal === null && heats.length > 0) {
    const judgeSums = heats
      .flatMap(h => h.judges || [])
      .map(j => j.sum)
      .filter(s => s !== null && !isNaN(s));
    if (judgeSums.length > 0) {
      grandTotal = judgeSums.reduce((sum, s) => sum + s, 0);
    }
  }
  
  // ВС и титул
  let vc = null;
  let qualification = null;
  if (cellCount > 23) {
    vc = cleanText($cells.eq(23).text());
  } else {
    vc = cleanText($cells.eq(cellCount - 2).text());
  }
  
  if (cellCount > 24) {
    qualification = cleanText($cells.eq(24).text());
  } else {
    qualification = cleanText($cells.eq(cellCount - 1).text());
  }
  
  const rawScoresJson = JSON.stringify({ heats });
  
  return {
    total_score: grandTotal,
    judge_count: 1,
    qualification,
    vc,
    raw_scores_json: rawScoresJson,
    heats
  };
}
