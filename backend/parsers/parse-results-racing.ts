import * as cheerio from "cheerio";
import { fetchWin1251 } from "../lib/fetch-win1251";
import { normalizeDogName, normalizeBreed } from "./parse-results-coursing";
import { extractJudgesFromPage } from "./shared/extract-judges";

/**
 * АКТИВНО ИСПОЛЬЗУЕТСЯ скриптами перепарсинга:
 *   - backend/scripts/reparse/reparse-racing-events.ts
 *   - backend/scripts/reparse/reparse-by-year.ts
 *
 * Новая модульная версия (пока не переключена в продакшен):
 *   - backend/parsers/racing/index.ts
 *
 * Парсер результатов Racing (бега) (v1 - HTML version).
 * 
 * Структура отличается от курсинга/БЗМП:
 * - 18 колонок (не 25)
 * - Нет rowspan=2 — каждая строка самодостаточна
 * - Метрики: время и скорость (не судейские оценки)
 * - До 3 забегов
 * - Дистанция в метрах
 * - Попоны (цвета)
 * 
 * Формат времени: "21.88 с<br>16.45 м/с<br>59.232 км/ч"
 * 
 * raw_text сохраняется ВСЕГДА для отладки и ручной проверки.
 */

function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function extractItalicNumber($el) {
  const text = $el.find("i").text();
  return extractNumber(text);
}

function extractCellNumber($el) {
  const text = $el.text();
  return extractNumber(text);
}

function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function detectStatusFromText(text, hasScore = true) {
  if (!text) return { status: hasScore ? "finished" : "unknown_status_check_raw_text", reason: null };
  
  const normalized = text.toLowerCase().replace(/ё/g, "е");
  
  if (/неявка|неприбыв/.test(normalized)) {
    return { status: "dns", reason: "Неявка" };
  }
  
  if (/отстран/.test(normalized)) {
    return { status: "disqualified", reason: extractReasonText(text) };
  }
  
  if (/снят|снята|снятие/.test(normalized)) {
    return { status: "withdrawn", reason: extractReasonText(text) };
  }
  
  if (/не\s*финиш|dnf/.test(normalized)) {
    return { status: "dnf", reason: extractReasonText(text) };
  }
  
  // Если есть явный текст о статусе, но не совпал с паттернами выше
  if (/сход|возврат|потеря|агрессия|жестокое|нарушение|уход/.test(normalized)) {
    return { status: "disqualified", reason: extractReasonText(text) };
  }
  
  return { status: hasScore ? "finished" : "unknown_status_check_raw_text", reason: null };
}

function extractReasonText(fullText) {
  if (!fullText) return null;
  
  // Сначала ищем текст, содержащий причину, обычно в скобках или отдельной ячейке
  const match = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход)[^(]*\(([^)]+)\)/i);
  if (match) {
    return match[1].trim();
  }
  
  // Если не нашли в скобках, ищем просто слово "Отстранение" или "Неявка" как причину
  const keywordMatch = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|отстранена|снята)/i);
  if (keywordMatch) {
    return keywordMatch[0].trim();
  }
  
  return null;
}

function parseTimeSpeed(html) {
  // Формат: "21.88 с<br>16.45 м/с<br>59.232 км/ч"
  if (!html) return null;
  
  const $ = cheerio.load(html);
  const text = $.text();
  
  // Извлекаем время (число перед "с")
  const timeMatch = text.match(/(\d+\.?\d*)\s*с/);
  const time = timeMatch ? parseFloat(timeMatch[1]) : null;
  
  // Извлекаем скорость в км/ч (число перед "км/ч")
  const speedMatch = text.match(/(\d+\.?\d*)\s*км\/ч/);
  const speed = speedMatch ? parseFloat(speedMatch[1]) : null;
  
  return { time, speed };
}

function parseDogRow($row, breedClass) {
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

  // Дистанция (ячейка 6)
  const distance = extractNumber($cells.eq(6).text());

  // Определяем формат таблицы по количеству ячеек
  const cellCount = $cells.length;
  const isCCFormat = cellCount === 18; // CC формат (2025)
  const isVSFormat = cellCount === 21; // ВС формат (2026)

  let heat1Num, heat1Bib, heat1TimeSpeed;
  let heat2Num, heat2Bib, heat2TimeSpeed;
  let heat3Num, heat3Bib, heat3TimeSpeed;

  if (isCCFormat) {
    // CC формат (2025): данные забегов в одной ячейке с временем/скоростью
    // Забег 1: номер (7), попона (8), время/скорость (9)
    heat1Num = extractCellNumber($cells.eq(7));
    heat1Bib = cleanText($cells.eq(8).text());
    heat1TimeSpeed = parseTimeSpeed($cells.eq(9).html());

    // Забег 2: номер (10), попона (11), время/скорость (12)
    heat2Num = extractCellNumber($cells.eq(10));
    heat2Bib = cleanText($cells.eq(11).text());
    heat2TimeSpeed = parseTimeSpeed($cells.eq(12).html());

    // Забег 3: номер (13), попона (14), время/скорость (15)
    heat3Num = extractCellNumber($cells.eq(13));
    heat3Bib = cleanText($cells.eq(14).text());
    heat3TimeSpeed = parseTimeSpeed($cells.eq(15).html());

    // CC (ячейка 16), Титул (ячейка 17)
    const vc = cleanText($cells.eq(16).text());
    const qualification = cleanText($cells.eq(17).text());

    // Определяем статус
    const statusResult = detectStatusFromText($row.text(), heat1TimeSpeed?.time || heat2TimeSpeed?.time || heat3TimeSpeed?.time);
    const status = statusResult.status;
    const statusReason = statusResult.reason;

    return {
      breed_class: breedClass,
      placement,
      catalog_no: catalogNo,
      breed,
      class: class_,
      sex,
      name,
      distance,
      heat1: { num: heat1Num, bib: heat1Bib, time: heat1TimeSpeed?.time, speed: heat1TimeSpeed?.speed },
      heat2: { num: heat2Num, bib: heat2Bib, time: heat2TimeSpeed?.time, speed: heat2TimeSpeed?.speed },
      heat3: { num: heat3Num, bib: heat3Bib, time: heat3TimeSpeed?.time, speed: heat3TimeSpeed?.speed },
      qualification,
      vc,
      status,
      status_reason: statusReason,
      raw_text: $row.html() || "",
      judges: null, // Will be set by the parent function
    };
  } else if (isVSFormat) {
    // ВС формат (2026): время и скорость в отдельных ячейках
    // Забег 1: номер (7), попона (8), время (9), скорость (10)
    heat1Num = extractItalicNumber($cells.eq(7));
    heat1Bib = cleanText($cells.eq(8).text());
    const heat1Time = parseTime($cells.eq(9).text());
    const heat1Speed = parseSpeed($cells.eq(10).html());
    heat1TimeSpeed = { time: heat1Time, speed: heat1Speed };

    // Забег 2: номер (11), попона (12), время (13), скорость (14)
    heat2Num = extractItalicNumber($cells.eq(11));
    heat2Bib = cleanText($cells.eq(12).text());
    const heat2Time = parseTime($cells.eq(13).text());
    const heat2Speed = parseSpeed($cells.eq(14).html());
    heat2TimeSpeed = { time: heat2Time, speed: heat2Speed };

    // Забег 3: номер (15), попона (16), время (17), скорость (18)
    heat3Num = extractItalicNumber($cells.eq(15));
    heat3Bib = cleanText($cells.eq(16).text());
    const heat3Time = parseTime($cells.eq(17).text());
    const heat3Speed = parseSpeed($cells.eq(18).html());
    heat3TimeSpeed = { time: heat3Time, speed: heat3Speed };

    // ВС (ячейка 19), Титул (ячейка 20)
    const vc = cleanText($cells.eq(19).text());
    const qualification = cleanText($cells.eq(20).text());

    // Определяем статус
    const statusResult = detectStatusFromText($row.text(), heat1TimeSpeed?.time || heat2TimeSpeed?.time || heat3TimeSpeed?.time);
    const status = statusResult.status;
    const statusReason = statusResult.reason;

    return {
      breed_class: breedClass,
      placement,
      catalog_no: catalogNo,
      breed,
      class: class_,
      sex,
      name,
      distance,
      heat1: { num: heat1Num, bib: heat1Bib, time: heat1TimeSpeed?.time, speed: heat1TimeSpeed?.speed },
      heat2: { num: heat2Num, bib: heat2Bib, time: heat2TimeSpeed?.time, speed: heat2TimeSpeed?.speed },
      heat3: { num: heat3Num, bib: heat3Bib, time: heat3TimeSpeed?.time, speed: heat3TimeSpeed?.speed },
      qualification,
      vc,
      status,
      status_reason: statusReason,
      raw_text: $row.html() || "",
      judges: null, // Will be set by the parent function
    };
  } else {
    // Неизвестный формат
    console.warn(`Неизвестный формат таблицы: ${cellCount} ячеек`);
    return null;
  }
}

function parseTime(text) {
  if (!text) return null;
  const match = text.match(/(\d+\.?\d*)\s*с/);
  return match ? parseFloat(match[1]) : null;
}

function parseSpeed(html) {
  if (!html) return null;
  const $ = cheerio.load(html);
  const text = $.text();
  const match = text.match(/(\d+\.?\d*)\s*км\/ч/);
  return match ? parseFloat(match[1]) : null;
}

export function parseRacingHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;
  let judges = extractJudgesFromPage($, { colspans: ['18', '25'] });

  $("table tr").each((_, row) => {
    const $row = $(row);
    const $firstCell = $row.find("td").first();

    // Заголовок группы породы (colspan=25 для racing)
    const colspan = $firstCell.attr("colspan");
    const normalizedColspan = colspan ? String(colspan) : '';
    const hasBoldText = $firstCell.find("b").length > 0;
    
    if (normalizedColspan === "25" || normalizedColspan === "18") && hasBoldText) {
      const text = $firstCell.find("b").text();
      // Текст должен содержать дефис и не быть заголовком страницы
      if (text.includes('-') && !text.includes('Организатор') && !text.includes('Полные результаты') && !text.includes('Судья') && !text.includes('Состязания') && !text.includes('Схема трассы')) {
        currentBreedClass = cleanText(text);
      }
      return;
    }

    // Строка собаки (белый фон)
    const rowBgColor = $row.attr("bgcolor");
    const normalizedRowBgColor = rowBgColor ? rowBgColor.toLowerCase() : '';
    if (normalizedRowBgColor === "#ffffff" && currentBreedClass) {
      const parsed = parseDogRow($row, currentBreedClass);
      if (parsed) {
        parsed.judges = judges;
        results.push(parsed);
      }
    }
  });

  return { results, judges };
}

export async function parseRacingResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseRacingHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node parse-results-racing.mjs <url>
if (import.meta.url === `file://${process.argv[1]}` && process.argv[2]) {
  const url = process.argv[2];
  parseRacingResultsPage(url).then((res) => {
    console.log(JSON.stringify(res, null, 2));
    console.log(`\nВсего строк-результатов: ${res.results.length}`);
    console.log(
      `Из них с непонятным статусом (нужна ручная проверка raw_text): ${
        res.results.filter((r) => r.status === "unknown_status_check_raw_text").length
      }`
    );
  });
}
