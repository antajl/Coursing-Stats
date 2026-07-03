import * as cheerio from "cheerio";
import { fetchWin1251 } from "../lib/fetch-win1251";
import { normalizeDogName, normalizeBreed } from "./parse-results-coursing";
import { extractJudgesFromPage } from "./shared/extract-judges";

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

function extractBibColor($cell) {
  const bgColor = $cell.attr('bgcolor');
  const style = $cell.attr('style');
  
  if (bgColor) {
    if (bgColor === '#FF0000' || bgColor === 'red' || bgColor === '#ff0000') return 'red';
    if (bgColor === '#FFFFFF' || bgColor === 'white' || bgColor === '#ffffff') return 'white';
    if (bgColor === '#0000FF' || bgColor === 'blue' || bgColor === '#0000ff') return 'blue';
    return bgColor;
  }
  
  if (style) {
    const colorMatch = style.match(/background-color:\s*([^;]+)/i);
    if (colorMatch) {
      const color = colorMatch[1].trim();
      if (color === '#FF0000' || color === 'red' || color === '#ff0000') return 'red';
      if (color === '#FFFFFF' || color === 'white' || color === '#ffffff') return 'white';
      if (color === '#0000FF' || color === 'blue' || color === '#0000ff') return 'blue';
      return color;
    }
  }
  
  return null;
}

function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function parseNonArrivedRow($, $row, breedClass) {
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
  
  // Если не нашли в скобках, возвращаем весь текст как причину
  const keywordMatch = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|отстранена|снята)/i);
  if (keywordMatch) {
    return fullText.trim();
  }
  
  return null;
}

function parseDogRow($, $row, breedClass, allRows, rowIndex) {
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

  // Номер забега 1 и VC (ячейка 6)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Color = extractBibColor(heat1Cell);
  
  // Жесткая привязка: если есть цвет, то это номер забега
  const heat1Number = heat1Color ? extractNumber(heat1Text) : extractNumber(heat1Text);

  // Проверяем, есть ли отстранение в забеге 1 (colspan=6 в ячейке 7)
  let heat1Disqualified = false;
  let heat1DisqualificationReason = null;
  const heat1FirstCell = $cells.eq(7);
  const heat1Colspan = heat1FirstCell.attr('colspan');
  
  if (heat1Colspan && parseInt(heat1Colspan) >= 6) {
    heat1Disqualified = true;
    heat1DisqualificationReason = heat1FirstCell.text().trim();
  }

  // Судейские оценки забега 1 (ячейки 7-12: 5 категорий + сумма)
  const heat1Judge1Scores = [];
  if (!heat1Disqualified) {
    for (let i = 7; i <= 11; i++) {
      const score = extractNumber($cells.eq(i).text());
      heat1Judge1Scores.push((score !== null && score < 100) ? score : null);
    }
  } else {
    heat1Judge1Scores.push(null, null, null, null, null);
  }
  const heat1Judge1Sum = heat1Disqualified ? null : extractBoldNumber($cells.eq(12));

  // Сумма 1 (ячейка 13, bold) - итог за забег 1
  const sum1 = extractBoldNumber($cells.eq(13));

  // Номер забега 2 и VC (ячейка 14)
  const heat2Cell = $cells.eq(14);
  const heat2Text = heat2Cell.text().trim();
  const heat2Color = extractBibColor(heat2Cell);
  
  // Жесткая привязка: если есть цвет, то это номер забега
  const heat2Number = heat2Color ? extractNumber(heat2Text) : extractNumber(heat2Text);

  // Проверяем, есть ли отстранение в забеге 2 (colspan=6 в ячейке 15)
  let heat2Disqualified = false;
  let heat2DisqualificationReason = null;
  const heat2FirstCell = $cells.eq(15);
  const heat2Colspan = heat2FirstCell.attr('colspan');
  
  if (heat2Colspan && parseInt(heat2Colspan) >= 6) {
    heat2Disqualified = true;
    heat2DisqualificationReason = heat2FirstCell.text().trim();
  }

  // Судейские оценки забега 2 (ячейки 15-20: 5 категорий + сумма)
  const heat2Judge1Scores = [];
  let heat2Judge1Sum = null;
  if (!heat2Disqualified) {
    for (let i = 15; i <= 19; i++) {
      const score = extractNumber($cells.eq(i).text());
      heat2Judge1Scores.push((score !== null && score < 100) ? score : null);
    }
    heat2Judge1Sum = extractBoldNumber($cells.eq(20));
  }

  // Сумма 2 (ячейка 21, bold)
  const sum2 = extractBoldNumber($cells.eq(21));

  // Общая сумма (ячейка 22, bold)
  let grandTotal = extractBoldNumber($cells.eq(22));

  // ВС (ячейка 23)
  const vc = cleanText($cells.eq(23).text());

  // Титул (ячейка 24)
  const qualification = cleanText($cells.eq(24).text());

  // Получаем строку 2 (оценки судьи 2) - только если это действительно строка с оценками
  let heat1Judge2Scores = [];
  let heat1Judge2Sum = null;
  let heat2Judge2Scores = [];
  let heat2Judge2Sum = null;
  
  if (rowIndex + 1 < allRows.length) {
    const $row2 = $(allRows[rowIndex + 1]);
    const $cells2 = $row2.find("td");
    const cellCount2 = $cells2.length;
    
    // Проверяем, что это строка с оценками судьи 2 (не строка с другой собакой)
    // Строка с оценками судьи 2 обычно не имеет каталожного номера в ячейке 1
    const catalogNoCell2 = $cells2.eq(1);
    const catalogNo2 = extractItalicNumber(catalogNoCell2);
    
    // Если нет каталожного номера, это может быть строка с оценками судьи 2
    if (!catalogNo2 && cellCount2 >= 6) {
      // Собираем все числовые значения из строки 2
      const allNumericValues = [];
      for (let i = 0; i < cellCount2; i++) {
        const cellText = $cells2.eq(i).text().trim();
        const num = extractNumber(cellText);
        if (num !== null && num < 100) {
          allNumericValues.push(num);
        }
      }
      
      // Если есть ровно 12 числовых значений, делим их 6+6
      if (allNumericValues.length >= 12) {
        heat1Judge2Scores = allNumericValues.slice(0, 5);
        heat1Judge2Sum = allNumericValues[5];
        heat2Judge2Scores = allNumericValues.slice(6, 11);
        heat2Judge2Sum = allNumericValues[11];
      } else if (allNumericValues.length >= 6) {
        heat1Judge2Scores = allNumericValues.slice(0, 5);
        heat1Judge2Sum = allNumericValues[5];
      }
    }
  }

  // Формируем структуру забегов для raw_scores_json
  const heats = [];
  
  const heat1Judges = [];
  if (heat1Judge1Scores.some(s => s !== null)) {
    heat1Judges.push({
      judge_number: 1,
      scores: heat1Judge1Scores,
      sum: heat1Judge1Sum
    });
  }
  if (heat1Judge2Scores.some(s => s !== null)) {
    heat1Judges.push({
      judge_number: 2,
      scores: heat1Judge2Scores,
      sum: heat1Judge2Sum
    });
  }
  
  if (heat1Judges.length > 0 || heat1Disqualified) {
    heats.push({
      heat_number: 1,
      bib_number: heat1Number,
      bib_color: heat1Color,
      judges: heat1Judges,
      total: sum1,
      disqualified: heat1Disqualified,
      disqualification_reason: heat1DisqualificationReason
    });
  }
  
  const heat2Judges = [];
  if (!heat2Disqualified && heat2Judge1Scores.some(s => s !== null)) {
    heat2Judges.push({
      judge_number: 1,
      scores: heat2Judge1Scores,
      sum: heat2Judge1Sum
    });
  }
  if (!heat2Disqualified && heat2Judge2Scores.some(s => s !== null)) {
    heat2Judges.push({
      judge_number: 2,
      scores: heat2Judge2Scores,
      sum: heat2Judge2Sum
    });
  }
  
  if (heat2Judges.length > 0 || heat2Disqualified) {
    heats.push({
      heat_number: 2,
      bib_number: heat2Number,
      bib_color: heat2Color,
      judges: heat2Judges,
      total: sum2,
      disqualified: heat2Disqualified,
      disqualification_reason: heat2DisqualificationReason
    });
  }

  // Сохраняем исходную сумму без нормализации
  const judgeCount = heat1Judges.length + heat2Judges.length > 0 ? 
    Math.max(heat1Judges.length, heat2Judges.length) : 1;
  let totalScore = grandTotal;

  // Определяем статус
  const statusResult = detectStatusFromText($row.text(), totalScore !== null && totalScore !== undefined);
  const status = statusResult.status;
  const statusReason = statusResult.reason;

  // Для disqualified и неявки не сохраняем total_score
  if (status === 'disqualified' || status === 'dns' || status === 'withdrawn' || status === 'dnf') {
    totalScore = null;
  }

  // Формируем raw_scores_json в той же структуре что и курсинг
  const rawScoresJson = JSON.stringify({
    heats: heats,
    grand_total: grandTotal,
    raw_total: grandTotal,
    normalized_score: totalScore
  });

  return {
    breed_class: breedClass,
    placement,
    catalog_no: catalogNo,
    breed,
    class: class_,
    sex,
    name,
    total_score: totalScore,
    judge_count: judgeCount,
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: rawScoresJson,
    raw_text: $row.html() || "",
    judges: null, // Судьи будут добавлены из заголовка страницы
  };
}

export async function parseBZMPHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;
  const allRows = $("table tr").toArray();
  const bodyText = $('body').text();
  let judges = extractJudgesFromPage($);
  const trackSchemes = [];
  $('a').each((_, a) => {
    const href = $(a).attr('href');
    const text = $(a).text();
    
    if (href && (href.includes('Map') || href.includes('map') ||
                 href.includes('_M1.png') || href.includes('_M2.png') ||
                 href.includes('_m1.png') || href.includes('_m2.png') ||
                 href.includes('_M1.jpg') || href.includes('_M2.jpg') ||
                 href.includes('_m1.jpg') || href.includes('_m2.jpg') ||
                 href.includes('_M1.jpeg') || href.includes('_M2.jpeg') ||
                 href.includes('_m1.jpeg') || href.includes('_m2.jpeg') ||
                 text.includes('Схема трассы') || text.includes('схема') ||
                 text.includes('трасса'))) {
      const fullUrl = href.startsWith('http') ? href : `http://procoursing.ru/2026/${href}`;
      const schemeNumber = href.includes('_M1') || href.includes('_m1') ? 1 : 
                           href.includes('_M2') || href.includes('_m2') ? 2 : 
                           text.includes('№1') ? 1 : text.includes('№2') ? 2 : 1;
      
      trackSchemes.push({
        number: schemeNumber,
        url: fullUrl,
        name: `Схема трассы №${schemeNumber}`,
        length: null
      });
    }
  });
  
  // Если не нашли в ссылках, ищем в тегах img
  if (trackSchemes.length === 0) {
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || '';
      const title = $(img).attr('title') || '';
      
      if (src && (src.includes('Map') || src.includes('map') || alt.includes('Схема трассы') || title.includes('Схема трассы'))) {
        const lengthMatch = (alt + title).match(/(\d+)\s*м/i);
        const length = lengthMatch ? `${lengthMatch[1]} м` : null;
        
        const fullUrl = src.startsWith('http') ? src : `http://procoursing.ru/2026/${src}`;
        
        trackSchemes.push({
          number: 1,
          url: fullUrl,
          name: 'Схема трассы',
          length: length
        });
      }
    });
  }
  
  // Проверяем, что URL изображений существуют
  const validTrackSchemes = [];
  for (const scheme of trackSchemes) {
    try {
      const response = await fetch(scheme.url, { method: 'HEAD' });
      if (response.ok) {
        validTrackSchemes.push(scheme);
      }
    } catch (err) {
      console.log(`Track scheme URL not accessible: ${scheme.url}`);
    }
  }
  
  const finalTrackSchemes = validTrackSchemes.length > 0 ? validTrackSchemes : [];
  
  // Извлекаем длины трасс из текста
  const lengthPatterns = [
    /Схема трассы №1[^0-9]*(\d+)\s*м/i,
    /Схема трассы №2[^0-9]*(\d+)\s*м/i,
    /длина\s*(\d+)\s*м/i,
  ];
  
  for (const pattern of lengthPatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      const schemeNumber = pattern.toString().includes('№1') ? 1 : pattern.toString().includes('№2') ? 2 : 1;
      const scheme = finalTrackSchemes.find(s => s.number === schemeNumber);
      if (scheme && !scheme.length) {
        scheme.length = `${match[1]} м`;
      }
    }
  }
  
  // Дефолтная длина 700 м
  finalTrackSchemes.forEach(scheme => {
    if (!scheme.length) {
      scheme.length = '700 м';
    }
  });

  allRows.forEach((row, rowIndex) => {
    const $row = $(row);
    const $firstCell = $row.find("td").first();

    // Заголовок группы породы
    const colspan = $firstCell.attr("colspan");
    const normalizedColspan = colspan ? String(colspan) : '';
    const hasBoldText = $firstCell.find("b").length > 0;
    
    if (normalizedColspan === "25" && hasBoldText) {
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
      const parsed = parseDogRow($, $row, currentBreedClass, allRows, rowIndex);
      if (parsed) {
        // Добавляем информацию о судьях из заголовка страницы
        parsed.judges = judges;
        results.push(parsed);
      }
    }

    // Строка неприбывших (серый фон)
    const nonArrivedBgColor = $row.attr("bgcolor");
    const normalizedNonArrivedBgColor = nonArrivedBgColor ? nonArrivedBgColor.toLowerCase() : '';
    if (normalizedNonArrivedBgColor === "#eaeaea") {
      const parsed = parseNonArrivedRow($, $row, currentBreedClass);
      if (parsed) {
        parsed.judges = judges;
        results.push(parsed);
      }
    }
  });

  return { results, track_schemes: finalTrackSchemes, judges };
}

export async function parseBZMPResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseBZMPHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node parse-results-bzmp.mjs <url>
if (import.meta.url === `file://${process.argv[1]}` && process.argv[2]) {
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
