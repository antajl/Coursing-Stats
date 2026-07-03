/**
 * Парсеры строк для результатов Racing (бега)
 */

import { extractNumber, extractItalicNumber, cleanText, normalizeDogName, normalizeBreed, detectStatusFromText, extractReasonText } from '../coursing/utils';
import { parseRacingHeatsFromRow, racingHeatsToRawScores } from './parse-heats';

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

  // Racing: 18 колонок (CC, 2025) или 21 (ВС, 2026)
  const heats = parseRacingHeatsFromRow($, $cells, cellCount);
  const rawScores = racingHeatsToRawScores(heats.filter((h) => !h.disqualified));

  // ВС и титул — последние 2 ячейки
  const vc = cleanText($cells.eq(cellCount - 2).text());
  const qualification = cleanText($cells.eq(cellCount - 1).text());

  const disqualificationReason = heats.find((h) => h.disqualified)?.disqualification_reason ?? null;
  const hasTime = heats.some((h) => h.time !== null && !h.disqualified);
  const statusResult = detectStatusFromText($row.text(), hasTime);
  const status = statusResult.status;
  const statusReason = disqualificationReason || statusResult.reason;

  let totalScore = rawScores.grand_total;
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
    judge_count: 0,
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: JSON.stringify({
      ...rawScores,
      heats: heats.filter((h) => !h.disqualified),
    }),
    raw_text: $row.html() || "",
    judges: null,
  };
}
