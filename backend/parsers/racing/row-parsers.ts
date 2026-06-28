/**
 * Парсеры строк для результатов Racing (бега)
 */

import { extractNumber, extractItalicNumber, cleanText, normalizeDogName, normalizeBreed, detectStatusFromText, extractReasonText } from '../coursing/utils';

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

  // Статус (колонка 6 с colspan=12 для racing)
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

export function parseDogRow($, $row, breedClass, allRows, rowIndex) {
  const $cells = $row.find("td");
  
  // Racing использует 18 колонок
  const cellCount = $cells.length;
  if (cellCount < 10) return null;
  
  // Проверяем, что это строка с собакой (должна быть каталожный номер в <i>)
  const catalogNoCell = $cells.eq(1);
  const catalogNo = extractItalicNumber(catalogNoCell);
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

  // Racing использует метрики времени и скорости
  // Парсим забеги (обычно до 3 забегов)
  const heats = [];
  let totalScore = null;
  let qualification = null;
  let vc = null;
  let disqualificationReason = null;

  // Парсим забеги из ячеек 6-17
  // Формат: "21.88 с<br>16.45 м/с<br>59.232 км/ч"
  for (let heatIndex = 0; heatIndex < 3; heatIndex++) {
    const heatCellIndex = 6 + (heatIndex * 4);
    if (heatCellIndex + 3 >= cellCount) break;
    
    const timeCell = $cells.eq(heatCellIndex);
    const timeText = timeCell.text().trim();
    
    // Проверяем disqualified (colspan)
    const colspan = timeCell.attr('colspan');
    if (colspan && parseInt(colspan) >= 4) {
      disqualificationReason = timeText;
      continue;
    }
    
    // Парсим время, скорость
    const timeMatch = timeText.match(/(\d+\.?\d*)\s*с/);
    const speedMatch = timeText.match(/(\d+\.?\d*)\s*км\/ч/);
    
    if (timeMatch || speedMatch) {
      heats.push({
        heat_number: heatIndex + 1,
        time: timeMatch ? parseFloat(timeMatch[1]) : null,
        speed_kmh: speedMatch ? parseFloat(speedMatch[1]) : null,
      });
    }
  }

  // Общая сумма (обычно лучшее время или среднее)
  const totalScoreCell = $cells.eq(cellCount - 3);
  totalScore = extractNumber(totalScoreCell.text());

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
    judge_count: 0, // Racing не использует судей
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: JSON.stringify({
      heats,
      grand_total: totalScore,
      normalized_score: totalScore,
      format: "racing"
    }),
    raw_text: $row.html() || "",
    judges: null,
  };
}
