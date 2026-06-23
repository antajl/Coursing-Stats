import * as cheerio from "cheerio";
import { fetchWin1251 } from "./lib/fetch-win1251.mjs";

/**
 * Парсер результатов БЗМП (v1 - HTML version).
 * 
 * Структура аналогична курсингу (25 колонок, rowspan=2), но есть статусы:
 * - "Отстранение (Сход с трассы)"
 * - colspan=6 для текста статуса вместо судейских оценок
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
  return extractNumber(text);
}

function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
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

  // Общая сумма (ячейка 22, bold)
  const totalScore = extractBoldNumber($cells.eq(22));

  // ВС (ячейка 23)
  const vc = cleanText($cells.eq(23).text());

  // Титул (ячейка 24)
  const qualification = cleanText($cells.eq(24).text());

  // Определяем статус
  let status = "finished";
  if (!totalScore && !sum1 && !sum2) {
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
    heat1_scores: heat1Scores,
    sum1,
    heat2_scores: heat2Scores,
    sum2,
    total_score: totalScore,
    qualification,
    vc,
    status,
    raw_text: $row.html() || "",
  };
}

export function parseBZMPHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;

  $("table tr").each((_, row) => {
    const $row = $(row);
    const $firstCell = $row.find("td").first();

    // Заголовок группы породы
    if ($firstCell.attr("colspan") === "25" && $firstCell.attr("bgcolor") === "#c0c0c0") {
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

export async function parseBZMPResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseBZMPHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node parse-results-bzmp.mjs <url>
if (process.argv[2]) {
  const url = process.argv[2];
  parseBZMPResultsPage(url).then((res) => {
    console.log(JSON.stringify(res, null, 2));
    console.log(`\nВсего строк-результатов: ${res.length}`);
    console.log(
      `Из них с непонятным статусом (нужна ручная проверка raw_text): ${
        res.filter((r) => r.status === "unknown_status_check_raw_text").length
      }`
    );
  });
}
