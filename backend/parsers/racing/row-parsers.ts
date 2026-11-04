/**
 * Парсеры строк для результатов Racing (бега)
 */

import { extractNumber, extractItalicNumber, cleanText, normalizeDogName, normalizeBreed, detectStatusFromText, extractReasonText } from '../coursing/utils';
import { parseRacingHeatsFromRow, racingHeatsToRawScores } from './parse-heats';

export function parseNonArrivedRow($, $row, breedClass) {
  const $cells = $row.find("td");
  if ($cells.length < 5) return null;

  let catalogNo: number | null = null;
  let breed: string | null = null;
  let class_: string | null = null;
  let sex: string | null = null;
  let nameText = '';
  let statusText = '';

  const c0Num = extractNumber($cells.eq(0).text());
  if (c0Num !== null && $cells.length === 6) {
    catalogNo = c0Num;
    breed = normalizeBreed($cells.eq(1).text());
    class_ = cleanText($cells.eq(2).text());
    sex = cleanText($cells.eq(3).text());
    nameText = $cells.eq(4).text();
    statusText = cleanText($cells.eq(5).text());
  } else {
    catalogNo = extractItalicNumber($cells.eq(1)) ?? extractNumber($cells.eq(1).text());
    breed = normalizeBreed($cells.eq(2).text());
    class_ = cleanText($cells.eq(3).text());
    sex = cleanText($cells.eq(4).text());
    nameText = $cells.eq(5).text();
    statusText = cleanText($cells.eq(6).text());
  }

  if (!catalogNo) return null;
  const name = normalizeDogName(nameText);

  return {
    breed_class: breedClass || "Неприбывшие участники",
    placement: null,
    catalog_no: catalogNo,
    breed,
    class: class_,
    sex,
    name,
    name_lat: name,
    total_score: null,
    qualification: null,
    vc: null,
    status: /неявка/i.test(statusText) ? "dns" : "unknown_status",
    raw_scores_json: JSON.stringify({ heats: [], grand_total: null, normalized_score: null, format: "racing" }),
    raw_text: $row.html() || "",
  };
}

export function parseDogRow($, $row, breedClass, allRows, rowIndex) {
  const $cells = $row.find("td");
  
  // Racing использует 18 колонок
  const cellCount = $cells.length;
  if (cellCount < 10) return null;
  
  // Проверяем, что это строка с собакой (должна быть каталожный номер в <i> или просто число)
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
