/**
 * Парсеры строк для результатов БЗМП
 */

import { extractNumber, extractItalicNumber, extractBoldNumber, extractBibColor, cleanText, normalizeDogName, normalizeBreed, detectStatusFromText, extractReasonText, extractDogNames } from '../coursing/utils';
import { extractJudgeCount } from '../coursing/header-parsers';
import { parseMultiJudgeCompact, isCompactMultiJudgeRow } from '../shared/multi-judge-compact';

export function parseNonArrivedRow($, $row, breedClass) {
  const $cells = $row.find("td");
  
  // Каталожный номер
  const catalogNo = extractItalicNumber($cells.eq(1));
  if (!catalogNo) return null;

  // Порода, класс, пол
  const breed = normalizeBreed($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка
  const name = normalizeDogName($cells.eq(5).text());

  // Статус (колонка 6 с colspan=19)
  const statusText = cleanText($cells.eq(6).text());

  return {
    breed_class: breedClass || "Неприбывшие участники",
    placement: null,
    catalog_no: catalogNo,
    breed,
    class: class_,
    sex,
    name,
    total_score: null,
    qualification: null,
    vc: null,
    status: statusText === "Неявка" ? "dns" : "unknown_status",
    raw_scores_json: JSON.stringify({ heats: [], grand_total: null, normalized_score: null }),
    raw_text: $row.html() || "",
  };
}

export function parseDogRow($, $row, breedClass, allRows, rowIndex, processedRows, judges) {
  const $cells = $row.find("td");
  
  const catalogNoCell = $cells.eq(1);
  const catalogNo = extractItalicNumber(catalogNoCell) ?? extractNumber(catalogNoCell.text());
  if (!catalogNo) return null;

  // Место (первая ячейка)
  const placementText = $cells.eq(0).text().trim();
  const placement = placementText ? extractNumber(placementText) : null;

  // Порода, класс, пол
  const breed = normalizeBreed($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка
  const name = normalizeDogName($cells.eq(5).text());

  // Filter out score/summary rows
  if (name && /^\d+$/.test(name)) {
    return null;
  }
  
  if (breed && /^\d+$/.test(breed)) {
    return null;
  }

  // БЗМП использует структуру с оценками судей (25 ячеек)
  // Структура: Место, №, Порода, Класс, Пол, Кличка, Забег1, Оценки1(5), Сумма1, Забег2, Оценки2(5), Сумма2, Итого, ВС, Титул
  // При 2 судьях: первая строка содержит оценки судьи 1, вторая строка содержит оценки судьи 2
  const cellCount = $cells.length;
  const judgeCount = extractJudgeCount(judges, $);
  const heat1Number = extractItalicNumber($cells.eq(6)) ?? extractNumber($cells.eq(6).text());
  const hasHeatData = heat1Number !== null;

  if (isCompactMultiJudgeRow(cellCount, hasHeatData)) {
    const scoresData = parseMultiJudgeCompact(
      $, $cells, cellCount, allRows, rowIndex, Math.max(judgeCount, 2), processedRows,
    );
    const statusResult = detectStatusFromText($row.text(), scoresData.total_score != null);
    let totalScore = scoresData.total_score;
    if (['disqualified', 'dns', 'withdrawn', 'dnf'].includes(statusResult.status)) {
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
      name_lat: name,
      total_score: totalScore,
      judge_count: scoresData.judge_count,
      qualification: scoresData.qualification,
      vc: scoresData.vc,
      status: statusResult.status,
      status_reason: statusResult.reason,
      raw_scores_json: scoresData.raw_scores_json,
      raw_text: $row.html() || "",
      judges: judges,
    };
  }

  let totalScore = null;
  let qualification = null;
  let vc = null;
  let disqualificationReason = null;

  // Определяем количество судей по наличию следующей строки с оценками (расширенный формат)
  let legacyJudgeCount = judgeCount;
  if (rowIndex + 1 < allRows.length) {
    const $row2 = $(allRows[rowIndex + 1]);
    const $cells2 = $row2.find("td");
    const cellCount2 = $cells2.length;
    
    if (cellCount2 === 12) {
      legacyJudgeCount = Math.max(legacyJudgeCount, 2);
    }
  }

  // Парсим забег 1
  let heat1Scores = [];
  let heat1Sum = null;
  let heat1Disqualified = false;
  let heat1DisqualificationReason = null;
  let heat1Judge2Scores = [];
  let heat1Judge2Sum = null;

  if (cellCount >= 13) {
    // Проверяем disqualified для heat1 (colspan в ячейке 7)
    const heat1FirstCell = $cells.eq(7);
    const heat1Colspan = heat1FirstCell.attr('colspan');
    
    if (heat1Colspan && parseInt(heat1Colspan) >= 6) {
      heat1Disqualified = true;
      heat1DisqualificationReason = heat1FirstCell.text().trim();
      heat1Scores = [null, null, null, null, null];
    } else {
      // Парсим оценки судьи 1 для забега 1 (ячейки 7-11)
      for (let i = 7; i <= 11; i++) {
        if (i < cellCount) {
          const score = extractNumber($cells.eq(i).text());
          heat1Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat1Scores.push(null);
        }
      }
      heat1Sum = (cellCount >= 13) ? extractNumber($cells.eq(12).text()) : null;
    }
  }

  // Парсим забег 2
  const heat2Number = extractNumber($cells.eq(14).text());
  let heat2Scores = [];
  let heat2Sum = null;
  let heat2Disqualified = false;
  let heat2DisqualificationReason = null;
  let heat2Judge2Scores = [];
  let heat2Judge2Sum = null;

  if (cellCount >= 22) {
    // Проверяем disqualified для heat2 (colspan в ячейке 15)
    const heat2FirstCell = $cells.eq(15);
    const heat2Colspan = heat2FirstCell.attr('colspan');
    
    if (heat2Colspan && parseInt(heat2Colspan) >= 6) {
      heat2Disqualified = true;
      heat2DisqualificationReason = heat2FirstCell.text().trim();
      heat2Scores = [null, null, null, null, null];
    } else {
      // Парсим оценки судьи 1 для забега 2 (ячейки 15-19)
      for (let i = 15; i <= 19; i++) {
        if (i < cellCount) {
          const score = extractNumber($cells.eq(i).text());
          heat2Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat2Scores.push(null);
        }
      }
      heat2Sum = (cellCount >= 22) ? extractNumber($cells.eq(20).text()) : null;
    }
  }

  // Если есть 2 судьи, парсим оценки судьи 2 из следующей строки
  if (legacyJudgeCount === 2 && rowIndex + 1 < allRows.length) {
    const $row2 = $(allRows[rowIndex + 1]);
    const $cells2 = $row2.find("td");
    const cellCount2 = $cells2.length;
    
    // Оценки судьи 2 для забега 1 (ячейки 0-4)
    if (cellCount2 >= 6) {
      for (let i = 0; i <= 4; i++) {
        const score = extractNumber($cells2.eq(i).text());
        heat1Judge2Scores.push((score !== null && score <= 20) ? score : null);
      }
      heat1Judge2Sum = extractNumber($cells2.eq(5).text());
    }
    
    // Оценки судьи 2 для забега 2 (ячейки 6-10)
    if (cellCount2 >= 12) {
      for (let i = 6; i <= 10; i++) {
        const score = extractNumber($cells2.eq(i).text());
        heat2Judge2Scores.push((score !== null && score <= 20) ? score : null);
      }
      heat2Judge2Sum = extractNumber($cells2.eq(11).text());
    }
    
    // Помечаем следующую строку как обработанную
    if (processedRows) {
      processedRows.add(rowIndex + 1);
    }
  }

  // Формируем heats
  const heats = [];
  if (heat1Number !== null || heat1Scores.length > 0) {
    const heat1Judges = [{
      judge_number: 1,
      scores: heat1Scores,
      sum: heat1Sum
    }];
    
    if (heat1Judge2Scores.length > 0) {
      heat1Judges.push({
        judge_number: 2,
        scores: heat1Judge2Scores,
        sum: heat1Judge2Sum
      });
    }
    
    heats.push({
      heat_number: heat1Number || 1,
      bib_number: heat1Number,
      judges: heat1Judges,
      total: heat1Sum,
      disqualified: heat1Disqualified,
      disqualification_reason: heat1DisqualificationReason
    });
  }
  
  if (heat2Number !== null || heat2Scores.length > 0) {
    const heat2Judges = [{
      judge_number: 1,
      scores: heat2Scores,
      sum: heat2Sum
    }];
    
    if (heat2Judge2Scores.length > 0) {
      heat2Judges.push({
        judge_number: 2,
        scores: heat2Judge2Scores,
        sum: heat2Judge2Sum
      });
    }
    
    heats.push({
      heat_number: heat2Number || 2,
      bib_number: heat2Number,
      judges: heat2Judges,
      total: heat2Sum,
      disqualified: heat2Disqualified,
      disqualification_reason: heat2DisqualificationReason
    });
  }

  // Общая сумма (ячейка 22, индекс 21)
  totalScore = (cellCount >= 23) ? extractNumber($cells.eq(22).text()) : null;

  // ВС и титул в последних ячейках
  vc = cleanText($cells.eq(cellCount - 2).text());
  qualification = cleanText($cells.eq(cellCount - 1).text());

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
    name_lat: name,
    total_score: totalScore,
    judge_count: legacyJudgeCount,
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: JSON.stringify({
      heats: heats,
      grand_total: totalScore,
      normalized_score: totalScore,
      format: "bzmp"
    }),
    raw_text: $row.html() || "",
    judges: null,
  };
}
