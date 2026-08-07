/**
 * Парсеры строк для результатов курсинга
 */

import { extractNumber, extractBoldNumber, extractItalicNumber, extractBibColor, cleanText, normalizeBreed, detectStatusFromText, extractReasonText, extractDogNames } from './utils';
import { parseMultiJudgeCompact, isCompactMultiJudgeRow } from '../shared/multi-judge-compact';
import { parseDogRow1Judge } from './row-parsers-1judge';
import { parseDogRow2Judges } from './row-parsers-2judges';

export { parseDogRow1Judge } from './row-parsers-1judge';
export { parseDogRow2Judges } from './row-parsers-2judges';

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

  // Check if we have valid judge data (fallback for status detection)
  // heats might not be defined in all code paths
  const hasValidJudgeData = typeof heats !== 'undefined' && heats && heats.length > 0 && 
    heats.some(h => h.judges && h.judges.length > 0 && 
      h.judges.some(j => j.scores && j.scores.some(s => s !== null)));
  
  const statusResult = detectStatusFromText($row.text(), totalScore !== null && totalScore !== undefined, hasValidJudgeData);
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
