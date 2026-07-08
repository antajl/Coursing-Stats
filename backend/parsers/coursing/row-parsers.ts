/**
 * Парсеры строк для результатов курсинга
 */

import { extractNumber, extractBoldNumber, extractItalicNumber, extractBibColor, cleanText, normalizeDogName, normalizeBreed, detectStatusFromText, extractReasonText, extractDogNames } from './utils';
import { parseMultiJudgeCompact, isCompactMultiJudgeRow } from '../shared/multi-judge-compact';
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

export function parseDogRow($, $row, breedClass, allRows, rowIndex, judges, extractJudgeCount, processedRows) {
  const $cells = $row.find("td");
  
  // Проверяем количество ячеек
  const cellCount = $cells.length;
  if (cellCount < 10) return null; // Не строка собаки
  
  // Проверяем, что это строка с собакой (должна быть каталожный номер в <i> или просто число)
  const catalogNoCell = $cells.eq(1);
  const catalogNo = extractItalicNumber(catalogNoCell);
  
  if (!catalogNo) return null; // Не строка собаки

  // Место (первая ячейка)
  const placementText = $cells.eq(0).text().trim();
  const placement = placementText ? extractNumber(placementText) : null;

  // Порода, класс, пол
  const breed = normalizeBreed($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка (с <br> между рус/лат)
  const nameCell = $cells.eq(5);
  const { name_ru: nameRu, name_lat: nameLat } = extractDogNames(nameCell);
  const name = nameRu || nameLat; // Для совместимости со старым кодом
  
  // Filter out score/summary rows - if name is just a number, it's not a dog
  if (name && /^\d+$/.test(name)) {
    return null; // Это строка с оценками, не собака
  }
  
  // Filter out rows where breed is just a number
  if (breed && /^\d+$/.test(breed)) {
    return null; // Это строка с оценками, не собака
  }

  // Определяем формат по количеству ячеек
  let totalScore, qualification, vc, rawScoresJson;
  const judgeCount = extractJudgeCount(judges, $);
  let disqualificationReason = null;
  
  // Проверяем, есть ли данные о забегах (ячейка 6 с номером забега)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Number = extractNumber(heat1Text);
  const hasHeatData = heat1Number !== null;
  
  if (cellCount >= 25 || (hasHeatData && cellCount >= 13)) {
    // Формат с данными о забегах - используем соответствующую функцию в зависимости от количества судей
    let scoresData;
    
    if (judgeCount === 1) {
      scoresData = parseDogRow1Judge($, $cells, cellCount, allRows, rowIndex, judges, processedRows);
    } else if (isCompactMultiJudgeRow(cellCount, hasHeatData)) {
      scoresData = parseMultiJudgeCompact($, $cells, cellCount, allRows, rowIndex, judgeCount, processedRows);
    } else {
      scoresData = parseDogRow2Judges($, $cells, cellCount, allRows, rowIndex, judges, processedRows);
    }
    
    totalScore = scoresData.total_score;
    qualification = scoresData.qualification;
    vc = scoresData.vc;
    rawScoresJson = scoresData.raw_scores_json;
    const heats = scoresData.heats;
    
    // Определяем disqualified из heats
    if (heats.length > 0) {
      const disqualifiedHeat = heats.find(h => h.disqualified);
      if (disqualifiedHeat) {
        disqualificationReason = disqualifiedHeat.disqualification_reason;
      }
    }
  } else {
    // Формат 2024 (23 ячеек) - упрощенная структура
    const rawTotalScore = extractBoldNumber($cells.eq(cellCount - 3));
    
    // Сохраняем исходную сумму без нормализации
    totalScore = rawTotalScore;

    // Пытаемся извлечь номер забега и цвет попоны из ячейки 6
    const heatCell = $cells.eq(6);
    const heatText = heatCell.text().trim();
    const heatNumber = extractItalicNumber(heatCell);
    const heatColor = extractBibColor(heatCell);

    // Пытаемся извлечь причину отстранения из ячейки с colspan=6
    for (let i = 6; i < cellCount; i++) {
      const cell = $cells.eq(i);
      const colspan = cell.attr('colspan');
      if (colspan && parseInt(colspan) >= 6) {
        const cellText = cell.text().trim();
        if (cellText && cellText.length < 100 && cellText.length > 2) {
          const reason = extractReasonText(cellText, /отстран|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход/);
          if (reason) {
            disqualificationReason = reason;
            break;
          }
        }
      }
    }

    // Сохраняем базовую структуру в raw_scores_json с информацией о забеге
    // Всегда добавляем второй пустой забег для UI
    const heats = heatNumber ? [{
      heat_number: 1,
      bib_number: heatNumber,
      bib_color: heatColor,
      judges: [],
      total: null,
      disqualified: disqualificationReason ? true : false,
      disqualification_reason: null // Причина отстранения только на верхнем уровне
    }, {
      heat_number: 2,
      bib_number: null,
      bib_color: null,
      judges: [],
      total: null,
      disqualified: false,
      disqualification_reason: null
    }] : [];
    
    rawScoresJson = JSON.stringify({
      heats,
      raw_total: rawTotalScore,
      judge_count: judgeCount,
      normalized_score: totalScore,
      format: "simplified_2024"
    });
    
    // ВС и титул в последних ячейках
    vc = cleanText($cells.eq(cellCount - 2).text());
    qualification = cleanText($cells.eq(cellCount - 1).text());
  }

  const statusResult = detectStatusFromText($row.text(), totalScore !== null && totalScore !== undefined);
  const status = statusResult.status;
  const statusReason = disqualificationReason || statusResult.reason;

  // Для disqualified и неявки не нормализуем total_score
  if (status === 'disqualified' || status === 'dns' || status === 'withdrawn' || status === 'dnf') {
    totalScore = null;
  }

  return {
    breed_class: breedClass,
    placement,
    catalog_no: catalogNo,
    breed,
    class: class_,
    sex,
    name,
    name_ru: nameRu,
    name_lat: nameLat,
    total_score: totalScore,
    judge_count: judgeCount,
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: rawScoresJson,
    raw_text: $row.html() || "",
    judges: judges,
  };
}

export function parseNonArrivedRow($row) {
  const $cells = $row.find("td");
  
  // Каталожный номер
  const catalogNo = extractItalicNumber($cells.eq(1)) ?? extractNumber($cells.eq(1).text());
  if (!catalogNo) return null;

  // Порода, класс, пол
  const breed = normalizeBreed($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка
  const { name_ru: nameRu, name_lat: nameLat } = extractDogNames($cells.eq(5));
  const name = nameRu || nameLat;

  // Статус (колонка 6 с colspan=19)
  const statusText = cleanText($cells.eq(6).text());

  return {
    breed_class: "Неприбывшие участники",
    placement: null,
    catalog_no: catalogNo,
    breed,
    class: class_,
    sex,
    name,
    name_ru: nameRu,
    name_lat: nameLat,
    total_score: null,
    qualification: null,
    vc: null,
    status: /неявка/i.test(statusText) ? "dns" : "unknown_status",
    raw_text: $row.html() || "",
  };
}
