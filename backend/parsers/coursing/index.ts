/**
 * Модульный парсер результатов курсинга
 * Использует разбитые на модули функции для лучшей читаемости и поддержки
 */

import * as cheerio from "cheerio";
import { fetchWin1251 } from "../../lib/fetch-win1251";
import { normalizeDogName, normalizeBreed } from "./utils";
import { parseDogRow, parseNonArrivedRow } from "./row-parsers";
import { extractJudgeCount } from "./header-parsers";
import { CoursingParseResultSchema } from "./schemas";

export async function parseCoursingHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;
  let inNonArrivedSection = null;
  let telegramUrl = null;
  let fullTitle = null;
  let eventDate = null;
  let protocolLocation = null;
  let judges = null;

  // Извлекаем полный заголовок из title тега
  const pageTitle = $('title').text();
  if (pageTitle) {
    fullTitle = pageTitle.trim();
  }

  // Извлекаем дату события из заголовка
  const dateMatch = fullTitle?.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    eventDate = `${year.length === 2 ? '20' + year : year}-${month}-${day}`;
  }

  // Извлекаем URL Telegram
  const telegramLink = $('a[href*="t.me"]').first();
  if (telegramLink.length > 0) {
    telegramUrl = telegramLink.attr('href');
  }

  // Извлекаем местоположение протокола
  const locationMatch = fullTitle?.match(/(?:в|г\.|город)\s+([А-Яа-я\s]+)/i);
  if (locationMatch) {
    protocolLocation = locationMatch[1].trim();
  }

  // Извлекаем судей из ячейки с текстом "Судьи:"
  const judgesCell = $('table tr').find('td').filter(function() {
    return $(this).text().trim().startsWith('Судьи:');
  });
  
  if (judgesCell.length > 0) {
    const text = judgesCell.text().trim();
    judges = text.replace(/^Судьи[:\s]+/i, '').trim();
    
    // Фильтруем примечания (например, "Номера забегов не отражены...")
    if (judges.includes('Номера забегов') || judges.includes('не отражены') || judges.includes('не получена')) {
      judges = null;
    }
  }

  const allRows = $('table tr').toArray();
  const processedRows = new Set(); // Отслеживаем обработанные строки
  
  allRows.forEach(($row, rowIndex) => {
    const $rowEl = $($row);
    const bgColor = $rowEl.attr('bgcolor');
    const $cells = $rowEl.find("td");
    const firstCellText = $cells.eq(0).text().trim();
    
    // Пропускаем уже обработанные строки (например, строки с оценками судьи 2)
    if (processedRows.has(rowIndex)) {
      return;
    }
    
    // Заголовок группы (порода - класс - пол)
    // Распознаём по цвету фона ИЛИ по содержимому (формат "Порода - Класс - Пол")
    if (bgColor === "#c0c0c0" || bgColor === "#C0C0C0" || 
        (firstCellText.includes(' - ') && (firstCellText.includes('Кобел') || firstCellText.includes('Сука') || firstCellText.includes('Кобели') || firstCellText.includes('Суки') || firstCellText.includes('Микс')))) {
      currentBreedClass = firstCellText;
      inNonArrivedSection = false;
      return;
    }
    
    // Секция неприбывших (серый фон ИЛИ текст "Неприбывшие")
    if (bgColor === "#eaeaea" || bgColor === "#EAEAEA" || firstCellText.includes('Неприбывш')) {
      inNonArrivedSection = true;
      const parsed = parseNonArrivedRow($rowEl);
      if (parsed) results.push(parsed);
      return;
    }
    
    // Белый фон - строки собак
    if (bgColor === "#ffffff" || bgColor === "#FFFFFF" || !bgColor) {
      if (currentBreedClass) {
        const parsed = parseDogRow($, $rowEl, currentBreedClass, allRows, rowIndex, judges, extractJudgeCount, processedRows);
        if (parsed) {
          results.push(parsed);
          processedRows.add(rowIndex); // Помечаем текущую строку как обработанную
        }
      }
    }
  });

  return { results, telegram_url: telegramUrl, full_title: fullTitle, event_date: eventDate, protocol_location: protocolLocation, judges, track_schemes: [] };
}

export async function parseCoursingHTMLWithValidation(html) {
  const result = await parseCoursingHTML(html);
  
  // Валидация результата с помощью Zod
  const validationResult = CoursingParseResultSchema.safeParse(result);
  
  if (!validationResult.success) {
    console.error('Zod validation error:', validationResult.error);
    // Возвращаем результат даже при ошибке валидации для совместимости
    return result;
  }
  
  return validationResult.data;
}

export async function parseCoursingResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseCoursingHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node coursing/index.mjs <url>
if (import.meta.url === `file://${process.argv[1]}` && process.argv[2]) {
  const url = process.argv[2];
  parseCoursingResultsPage(url).then((res) => {
    console.log(JSON.stringify(res, null, 2));
    console.log(`\nВсего строк-результатов: ${res.results.length}`);
    console.log(
      `Из них с непонятным статусом (нужна ручная проверка raw_text): ${
        res.results.filter((r) => r.status === "unknown_status_check_raw_text" || r.status === "unknown_status").length
      }`
    );
  });
}
