import * as cheerio from "cheerio";
import { fetchWin1251 } from "../lib/fetch-win1251.mjs";

/**
 * Парсер результатов курсинга (v1 - HTML version).
 * 
 * Страница результатов — HTML-таблица со структурой:
 * - Заголовки групп: <tr><td colspan=25 bgcolor="#c0c0c0"><b>Порода - Класс - Пол</b></td></tr>
 * - Строки собак: <tr align=center bgcolor=#ffffff> с rowspan=2 для двух забегов
 * - Каталожные номера: <i> теги
 * - Жирные итоги: <b> теги
 * - Неприбывшие: <tr align=center bgcolor="#eaeaea"> с colspan=19
 * 
 * raw_text сохраняется ВСЕГДА для отладки и ручной проверки.
 */

function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function extractBoldNumber($el) {
  const text = $el.find("b").text();
  return extractNumber(text);
}

function extractItalicNumber($el) {
  const text = $el.find("i").text();
  if (text) {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }
  // Если нет <i>, пробуем просто текст
  const plainText = $el.text();
  const match = plainText.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function parseDogRow($row, breedClass) {
  const $cells = $row.find("td");
  
  // Проверяем количество ячеек - формат 2025 имеет 25, формат 2024 имеет 23
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
  const breed = cleanText($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка (с <br> между рус/лат)
  const name = cleanText($cells.eq(5).text());
  
  // Filter out score/summary rows - if name is just a number, it's not a dog
  if (name && /^\d+$/.test(name)) {
    return null; // Это строка с оценками, не собака
  }
  
  // Filter out rows where breed is just a number
  if (breed && /^\d+$/.test(breed)) {
    return null; // Это строка с оценками, не собака
  }

  // Определяем формат по количеству ячеек
  let totalScore, qualification, vc;
  
  if (cellCount >= 25) {
    // Формат 2025 (25 ячеек)
    // Судейские оценки забега 1 (ячейки 7-12)
    const heat1Scores = [];
    for (let i = 7; i <= 12; i++) {
      const score = extractNumber($cells.eq(i).text());
      heat1Scores.push(score);
    }

    // Сумма 1 (ячейка 13, bold)
    const sum1 = extractBoldNumber($cells.eq(13));

    // Судейские оценки забега 2 (ячейки 15-20)
    const heat2Scores = [];
    for (let i = 15; i <= 20; i++) {
      const score = extractNumber($cells.eq(i).text());
      heat2Scores.push(score);
    }

    // Сумма 2 (ячейка 21, bold)
    const sum2 = extractBoldNumber($cells.eq(21));

    // Общая сумма (ячейка 22, bold, крупный шрифт)
    totalScore = extractBoldNumber($cells.eq(22));

    // ВС (ячейка 23)
    vc = cleanText($cells.eq(23).text());

    // Титул (ячейка 24)
    qualification = cleanText($cells.eq(24).text());
  } else {
    // Формат 2024 (23 ячеек) - упрощенная структура
    // Общая сумма обычно в предпоследней ячейке
    totalScore = extractBoldNumber($cells.eq(cellCount - 3));
    
    // ВС и титул в последних ячейках
    vc = cleanText($cells.eq(cellCount - 2).text());
    qualification = cleanText($cells.eq(cellCount - 1).text());
  }

  // Определяем статус
  let status = "finished";
  if (!totalScore) {
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
    total_score: totalScore,
    qualification,
    vc,
    status,
    raw_text: $row.html() || "",
  };
}

function parseNonArrivedRow($row) {
  const $cells = $row.find("td");
  
  // Каталожный номер
  const catalogNo = extractItalicNumber($cells.eq(1));
  if (!catalogNo) return null;

  // Порода, класс, пол
  const breed = cleanText($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка
  const name = cleanText($cells.eq(5).text());

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
    total_score: null,
    qualification: null,
    vc: null,
    status: statusText === "Неявка" ? "dns" : "unknown_status",
    raw_text: $row.html() || "",
  };
}

export function parseCoursingHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;
  let inNonArrivedSection = false;

  // Ищем строки таблицы
  $("table tr").each((_, row) => {
    const $row = $(row);
    const $firstCell = $row.find("td").first();

    // Заголовок группы породы (формат с colspan=25 и жирным текстом)
    const colspan = $firstCell.attr("colspan");
    const hasColspan25 = colspan === "25" || colspan === 25;
    const hasBoldText = $firstCell.find("b").length > 0;
    
    if (hasColspan25 && hasBoldText) {
      const text = $firstCell.find("b").text();
      currentBreedClass = cleanText(text);
      inNonArrivedSection = text.includes("Неприбывшие");
      return;
    }

    // Строка собаки (белый фон или без фона)
    const bgColor = $row.attr("bgcolor");
    const isWhiteBg = bgColor === "#ffffff" || bgColor === "#ffffff" || bgColor === "#ffffff" || !bgColor;
    
    if (isWhiteBg) {
      if (inNonArrivedSection) {
        const parsed = parseNonArrivedRow($row);
        if (parsed) results.push(parsed);
      } else if (currentBreedClass) {
        const parsed = parseDogRow($row, currentBreedClass);
        if (parsed) results.push(parsed);
      }
    }

    // Строка неприбывших (серый фон)
    if (bgColor === "#eaeaea") {
      const parsed = parseNonArrivedRow($row);
      if (parsed) results.push(parsed);
    }
  });

  return results;
}

export async function parseCoursingResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseCoursingHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node parse-results-coursing.mjs <url>
if (import.meta.url === `file://${process.argv[1]}` && process.argv[2]) {
  const url = process.argv[2];
  parseCoursingResultsPage(url).then((res) => {
    console.log(JSON.stringify(res, null, 2));
    console.log(`\nВсего строк-результатов: ${res.length}`);
    console.log(
      `Из них с непонятным статусом (нужна ручная проверка raw_text): ${
        res.filter((r) => r.status === "unknown_status_check_raw_text" || r.status === "unknown_status").length
      }`
    );
  });
}
