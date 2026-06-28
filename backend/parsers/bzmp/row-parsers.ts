/**
 * Парсеры строк для результатов БЗМП
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

export function parseDogRow($, $row, breedClass, allRows, rowIndex) {
  const $cells = $row.find("td");
  
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

  // БЗМП использует упрощенную структуру (23-25 ячеек)
  // Парсим оценки и статусы
  const cellCount = $cells.length;
  let totalScore = null;
  let qualification = null;
  let vc = null;
  let disqualificationReason = null;

  // Пытаемся извлечь общую сумму
  const totalScoreCell = $cells.eq(cellCount - 3);
  totalScore = extractNumber(totalScoreCell.text());

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
    judge_count: 1, // БЗМП обычно 1 судья
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: JSON.stringify({
      heats: [],
      grand_total: totalScore,
      normalized_score: totalScore,
      format: "bzmp"
    }),
    raw_text: $row.html() || "",
    judges: null,
  };
}
