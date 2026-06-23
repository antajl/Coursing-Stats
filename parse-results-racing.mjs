import * as cheerio from "cheerio";
import { fetchWin1251 } from "./lib/fetch-win1251.mjs";

/**
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

function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function parseTimeSpeed(html) {
  // Формат: "21.88 с<br>16.45 м/с<br>59.232 км/ч"
  if (!html) return null;
  
  const $ = cheerio.load(html);
  const text = $.text();
  
  // Извлекаем все числа из текста
  const numbers = text.match(/[\d.]+/g) || [];
  
  // Первое число — время в секундах
  const time = numbers[0] ? parseFloat(numbers[0]) : null;
  
  // Второе число — скорость в м/с
  const speed = numbers[1] ? parseFloat(numbers[1]) : null;
  
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
  const breed = cleanText($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка
  const name = cleanText($cells.eq(5).text());

  // Дистанция (ячейка 6)
  const distance = extractNumber($cells.eq(6).text());

  // Забег 1: номер, попона, время/скорость (ячейки 7-9)
  const heat1Num = extractItalicNumber($cells.eq(7));
  const heat1Bib = cleanText($cells.eq(8).text());
  const heat1TimeSpeed = parseTimeSpeed($cells.eq(9).html());

  // Забег 2: номер, попона, время/скорость (ячейки 10-12)
  const heat2Num = extractItalicNumber($cells.eq(10));
  const heat2Bib = cleanText($cells.eq(11).text());
  const heat2TimeSpeed = parseTimeSpeed($cells.eq(12).html());

  // Забег 3: номер, попона, время/скорость (ячейки 13-15)
  const heat3Num = extractItalicNumber($cells.eq(13));
  const heat3Bib = cleanText($cells.eq(14).text());
  const heat3TimeSpeed = parseTimeSpeed($cells.eq(15).html());

  // ВС (ячейка 16)
  const vc = cleanText($cells.eq(16).text());

  // Титул (ячейка 17)
  const qualification = cleanText($cells.eq(17).text());

  // Определяем статус
  let status = "finished";
  if (!heat1TimeSpeed?.time && !heat2TimeSpeed?.time && !heat3TimeSpeed?.time) {
    status = "unknown_status_check_raw_text";
  }

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
    raw_text: $row.html() || "",
  };
}

export function parseRacingHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;

  $("table tr").each((_, row) => {
    const $row = $(row);
    const $firstCell = $row.find("td").first();

    // Заголовок группы породы
    if ($firstCell.attr("colspan") === "18" && $firstCell.attr("bgcolor") === "#c0c0c0") {
      const text = $firstCell.find("b").text();
      currentBreedClass = cleanText(text);
      return;
    }

    // Строка собаки (белый фон)
    if ($row.attr("bgcolor") === "#ffffff" && currentBreedClass) {
      const parsed = parseDogRow($row, currentBreedClass);
      if (parsed) results.push(parsed);
    }
  });

  return results;
}

export async function parseRacingResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseRacingHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node parse-results-racing.mjs <url>
if (process.argv[2]) {
  const url = process.argv[2];
  parseRacingResultsPage(url).then((res) => {
    console.log(JSON.stringify(res, null, 2));
    console.log(`\nВсего строк-результатов: ${res.length}`);
    console.log(
      `Из них с непонятным статусом (нужна ручная проверка raw_text): ${
        res.filter((r) => r.status === "unknown_status_check_raw_text").length
      }`
    );
  });
}
