/**
 * Парсер строки курсинга для формата с 2 судьями
 */

import { extractNumber, extractBoldNumber, extractBibColor, cleanText } from './utils';
import { parseMultiJudgeCompact } from '../shared/multi-judge-compact';

export function parseDogRow2Judges($, $cells, cellCount, allRows, rowIndex, judges, processedRows) {
  // Парсинг для формата с 2 судьями
  // Строка 1 содержит оценки судьи 1
  // Строка 2 содержит оценки судьи 2

  // Компактный формат 2023–2024: 23 ячейки, суммы забегов без столбцов «Сум.» у каждого судьи
  if (cellCount >= 20 && cellCount < 24) {
    return parseMultiJudgeCompact($, $cells, cellCount, allRows, rowIndex, 2, processedRows)
  }
  
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
  
  // Проверяем ячейку 7 для стандартного формата
  if (heat1Colspan && parseInt(heat1Colspan) >= 6) {
    heat1Disqualified = true;
    heat1DisqualificationReason = heat1FirstCell.text().trim();
    heat1Judge1Scores = [null, null, null, null, null];
  }
  
  if (!heat1Disqualified) {
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
  
  // Получаем оценки судьи 2 из следующей строки
  let heat1Judge2Scores = [];
  let heat1Judge2Sum = null;
  let heat2Judge2Scores = []; // Инициализируем пустым массивом
  let heat2Judge2Sum = null;
  
  if (rowIndex + 1 < allRows.length) {
    const $row2 = $(allRows[rowIndex + 1]);
    const $cells2 = $row2.find("td");
    const cellCount2 = $cells2.length;
    
    // Проверяем, что следующая строка содержит оценки (много чисел 0-20)
    // Для строки с оценками судьи 2 они находятся в ячейках 0-11
    let hasJudgeScores = false;
    for (let i = 0; i <= 11; i++) {
      if (i < cellCount2) {
        const score = extractNumber($cells2.eq(i).text());
        if (score !== null && score <= 20) {
          hasJudgeScores = true;
          break;
        }
      }
    }
    
    if (hasJudgeScores) {
      // Оценки судьи 2 для забега 1 (ячейки 0-4)
      for (let i = 0; i <= 4; i++) {
        if (i < cellCount2) {
          const score = extractNumber($cells2.eq(i).text());
          heat1Judge2Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat1Judge2Scores.push(null);
        }
      }
      heat1Judge2Sum = (cellCount2 > 5) ? extractNumber($cells2.eq(5).text()) : null;
      
      // Оценки судьи 2 для забега 2 (ячейки 6-10, только 5 элементов)
      if (cellCount2 >= 12) {
        heat2Judge2Scores = []; // Очищаем перед заполнением
        for (let i = 6; i <= 10; i++) {
          const score = extractNumber($cells2.eq(i).text());
          heat2Judge2Scores.push((score !== null && score <= 20) ? score : null);
        }
        heat2Judge2Sum = (cellCount2 >= 12) ? extractBoldNumber($cells2.eq(11)) : null;
      } else {
        // Если нет 12 ячеек, значит нет оценок судьи 2 для забега 2
        heat2Judge2Scores = [];
        heat2Judge2Sum = null;
      }
      
      // Помечаем следующую строку как обработанную
      if (processedRows) {
        processedRows.add(rowIndex + 1);
      }
    }
  }
  
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
    if (heat1Judge2Scores.some(s => s !== null)) {
      heat1Judges.push({
        judge_number: 2,
        scores: heat1Judge2Scores,
        sum: heat1Judge2Sum
      });
    }
    
    heats.push({
      heat_number: 1,
      bib_number: heat1Number,
      bib_color: heat1Color,
      judges: heat1Judges,
      total: heat1Total,
      disqualified: heat1Disqualified,
      disqualification_reason: null // Причина отстранения только на верхнем уровне
    });
  }
  
  // Всегда добавляем второй забег, если есть первый забег
  // Даже если собака отстранена, добавляем пустой второй забег для UI
  if (heat1Number !== null) {
    const heat2Judges = [];
    if (heat2Judge1Scores.some(s => s !== null)) {
      heat2Judges.push({
        judge_number: 1,
        scores: heat2Judge1Scores,
        sum: heat2Judge1Sum
      });
    }
    // Добавляем судью 2 если есть сумма или оценки
    if (heat2Judge2Sum !== null || (heat2Judge2Scores.length > 0 && heat2Judge2Scores.some(s => s !== null))) {
      heat2Judges.push({
        judge_number: 2,
        scores: heat2Judge2Scores.length > 0 ? heat2Judge2Scores.slice(0, 5) : [],
        sum: heat2Judge2Sum
      });
    }
    
    heats.push({
      heat_number: 2,
      bib_number: heat2Number || null,
      bib_color: heat2Color || null,
      judges: heat2Judges,
      total: heat2Total || null,
      disqualified: heat2Disqualified || false,
      disqualification_reason: null // Причина отстранения только на верхнем уровне
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
    judge_count: 2,
    qualification,
    vc,
    raw_scores_json: rawScoresJson,
    heats
  };
}
