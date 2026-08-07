/**
 * Парсеры строк для уникальных турниров
 * Гибкий парсер для нестандартных форматов
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

  // Статус
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
  
  // Гибкий парсинг для различных форматов
  const cellCount = $cells.length;
  if (cellCount < 6) return null;
  
  // Пытаемся найти каталожный номер в первых 5 ячейках
  let catalogNo = null;
  let catalogNoIndex = -1;
  
  for (let i = 1; i < Math.min(5, cellCount); i++) {
    const potentialCatalogNo = extractItalicNumber($cells.eq(i));
    if (potentialCatalogNo) {
      catalogNo = potentialCatalogNo;
      catalogNoIndex = i;
      break;
    }
  }
  
  if (!catalogNo) return null;

  // Место (обычно первая ячейка)
  const placementText = $cells.eq(0).text().trim();
  const placement = placementText ? extractNumber(placementText) : null;

  // Порода, класс, пол - пытаемся найти по контексту
  let breed = "";
  let class_ = "";
  let sex = "";
  let name = "";
  
  // Если нашли каталожный номер в ячейке 1, то структура: место, каталожный, порода, класс, пол, кличка
  if (catalogNoIndex === 1) {
    breed = normalizeBreed($cells.eq(2).text());
    class_ = cleanText($cells.eq(3).text());
    sex = cleanText($cells.eq(4).text());
    name = normalizeDogName($cells.eq(5).text());
  } else {
    // Иначе пытаемся определить по контексту
    for (let i = 0; i < cellCount; i++) {
      const text = $cells.eq(i).text().trim();
      if (text.length > 3 && !/^\d+$/.test(text)) {
        if (!name) {
          name = normalizeDogName(text);
        } else if (!breed) {
          breed = normalizeBreed(text);
        }
      }
    }
  }

  // Filter out score/summary rows
  if (name && /^\d+$/.test(name)) {
    return null;
  }
  
  if (breed && /^\d+$/.test(breed)) {
    return null;
  }

  // Гибкое извлечение оценки
  let totalScore = null;
  let qualification = null;
  let vc = null;
  let disqualificationReason = null;

  // Пытаемся найти числовое значение в последних ячейках
  for (let i = cellCount - 1; i >= Math.max(0, cellCount - 3); i--) {
    const score = extractNumber($cells.eq(i).text());
    if (score !== null && score > 0) {
      totalScore = score;
      break;
    }
  }

  // Пытаемся найти причину отстранения
  for (let i = 0; i < cellCount; i++) {
    const cell = $cells.eq(i);
    const colspan = cell.attr('colspan');
    const cellText = cell.text().trim();
    
    if ((colspan && parseInt(colspan) >= 4) || cellText.length > 20) {
      const reason = extractReasonText(cellText, /отстран|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход/);
      if (reason) {
        disqualificationReason = reason;
        break;
      }
    }
  }

  // ВС и титул
  if (cellCount >= 2) {
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
    name_lat: name,
    total_score: totalScore,
    judge_count: 1, // По умолчанию 1 судья для уникальных турниров
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: JSON.stringify({
      heats: [],
      grand_total: totalScore,
      normalized_score: totalScore,
      format: "unique"
    }),
    raw_text: $row.html() || "",
    judges: null,
  };
}
