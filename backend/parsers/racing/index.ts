/**
 * Модульный парсер результатов Racing (бега)
 * Использует общие утилиты из coursing и специфичные row-parsers для racing
 */

import * as cheerio from "cheerio";
import { fetchWin1251 } from "../../lib/fetch-win1251";
import { parseDogRow, parseNonArrivedRow } from "./row-parsers";
import { RacingParseResultSchema } from "./schemas";
import { extractJudgesFromPage } from "../shared/extract-judges";

export async function parseRacingHTML(html) {
  const $ = cheerio.load(html);
  const results = [];
  let currentBreedClass = null;
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

  judges = extractJudgesFromPage($, { colspans: ['18', '25'] });

  const allRows = $('table tr').toArray();
  
  allRows.forEach(($row, rowIndex) => {
    const $rowEl = $($row);
    const bgColor = $rowEl.attr('bgcolor');
    const $cells = $rowEl.find("td");
    const firstCellText = $cells.eq(0).text().trim();
    
    // Заголовок группы (порода - класс - пол)
    // Распознаём по цвету фона ИЛИ по содержимому (формат "Порода - Класс - Пол")
    const normalizedBgColor = bgColor ? bgColor.toLowerCase() : '';
    if (normalizedBgColor === "#c0c0c0" ||
        (firstCellText.includes(' - ') && (firstCellText.includes('Кобел') || firstCellText.includes('Сука') || firstCellText.includes('Кобели') || firstCellText.includes('Суки')))) {
      currentBreedClass = firstCellText;
      return;
    }
    
    // Секция неприбывших (серый фон ИЛИ текст "Неприбывшие")
    if (normalizedBgColor === "#eaeaea" || firstCellText.includes('Неприбывш')) {
      const parsed = parseNonArrivedRow($, $rowEl, currentBreedClass);
      if (parsed) results.push(parsed);
      return;
    }
    
    // Белый фон - строки собак
    if (normalizedBgColor === "#ffffff" || !bgColor) {
      if (currentBreedClass) {
        const parsed = parseDogRow($, $rowEl, currentBreedClass, allRows, rowIndex);
        if (parsed) results.push(parsed);
      }
    }
  });

  return { results, telegram_url: telegramUrl, full_title: fullTitle, event_date: eventDate, protocol_location: protocolLocation, judges, track_schemes: [] };
}

export async function parseRacingHTMLWithValidation(html) {
  const result = await parseRacingHTML(html);
  
  // Валидация результата с помощью Zod
  const validationResult = RacingParseResultSchema.safeParse(result);
  
  if (!validationResult.success) {
    console.error('Zod validation error:', validationResult.error);
    // Возвращаем результат даже при ошибке валидации для совместимости
    return result;
  }
  
  return validationResult.data;
}

export async function parseRacingResultsPage(url) {
  const html = await fetchWin1251(url);
  return parseRacingHTML(html);
}

// CLI-режим для быстрой проверки на одной странице:
// node racing/index.mjs <url>
if (import.meta.url === `file://${process.argv[1]}` && process.argv[2]) {
  const url = process.argv[2];
  parseRacingResultsPage(url).then((res) => {
    console.log(JSON.stringify(res, null, 2));
    console.log(`\nВсего строк-результатов: ${res.results.length}`);
  });
}
