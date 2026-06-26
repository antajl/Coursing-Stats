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

function extractBibColor($cell) {
  const bgColor = $cell.attr('bgcolor');
  const style = $cell.attr('style');
  
  if (bgColor) {
    // Convert hex or named colors to standard names
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

function extractJudgeCount(judgesText) {
  if (!judgesText) return 2; // По умолчанию 2 судьи
  
  // Формат: "Главный судья - Лукина Д.М., судья - Гродинская Т.Л."
  // Считаем количество имен (разделенных запятыми)
  const names = judgesText.split(',').filter(name => name.trim().length > 0);
  return Math.max(1, names.length); // Минимум 1 судья
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

export function normalizeDogName(name) {
  if (!name) return "";
  return name
    .toUpperCase()
    .replace(/['"`‘’“”]/g, "")
    .replace(/[-]/g, " ")
    .replace(/Ё/g, "Е")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeBreed(breed) {
  if (!breed) return "";
  return breed
    .toUpperCase()
    .replace(/['"`‘’“”]/g, "")
    .replace(/[-]/g, " ")
    .replace(/Ё/g, "Е")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectStatusFromText(text, hasScore = true) {
  const normalized = cleanText(text).toLowerCase().replace(/ё/g, "е");

  // Неявка - не участвовал вообще
  if (/\bнеявк|не\s*явил|не\s*приб/.test(normalized)) {
    return { status: "dns", reason: extractReasonText(text, /неявк|не\s*явил|не\s*приб/) };
  }

  // Все остальные случаи дисквалификации/снятия/не финиша - один статус disqualified
  if (/дисквал|снят|снята|снятие|ветеринар|владельц|не\s*финиш|сош[еелла]*|сход\s+с\s+трасс|уход\s+с\s+трасс|отстран/.test(normalized)) {
    return { status: "disqualified", reason: extractReasonText(text, /дисквал|снят|снята|снятие|ветеринар|владельц|не\s*финиш|сош[еелла]*|сход|уход|отстран/) };
  }

  return { status: hasScore ? "finished" : "unknown_status_check_raw_text", reason: null };
}

function extractReasonText(fullText, pattern) {
  if (!fullText) return null;
  
  // Сначала ищем текст, содержащий причину, обычно в скобках или отдельной ячейке
  const match = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход)[^(]*\(([^)]+)\)/i);
  if (match) {
    return match[1].trim();
  }
  
  // Если не нашли в скобках, возвращаем весь текст как причину
  // Это для случаев типа "Отстранена ветеринаром", "Неявка" и т.д.
  const keywordMatch = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|отстранена|снята|неявка)/i);
  if (keywordMatch) {
    return fullText.trim();
  }
  
  return null;
}

function parseDogRow($, $row, breedClass, allRows, rowIndex, judgesText) {
  const $cells = $row.find("td");
  
  // Проверяем количество ячеек
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
  const breed = normalizeBreed($cells.eq(2).text());
  const class_ = cleanText($cells.eq(3).text());
  const sex = cleanText($cells.eq(4).text());

  // Кличка (с <br> между рус/лат)
  const name = normalizeDogName($cells.eq(5).text());
  
  // Filter out score/summary rows - if name is just a number, it's not a dog
  if (name && /^\d+$/.test(name)) {
    return null; // Это строка с оценками, не собака
  }
  
  // Filter out rows where breed is just a number
  if (breed && /^\d+$/.test(breed)) {
    return null; // Это строка с оценками, не собака
  }

  // Определяем формат по количеству ячеек
  let totalScore, qualification, vc, rawScoresJson;
  const judgeCount = extractJudgeCount(judgesText); // Определяем количество судей из текста
  let disqualificationReason = null;
  
  // Проверяем, есть ли данные о забегах (ячейка 6 с номером забега)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Number = extractNumber(heat1Text);
  const hasHeatData = heat1Number !== null;
  
  if (cellCount >= 25 || (hasHeatData && cellCount >= 20)) {
    // Формат с двумя строками на собаку (25+ ячеек) или с данными о забегах (20+ ячеек для disqualified)
    // Строка 1 содержит:
    // 0: место, 1: каталожный номер, 2: порода, 3: класс, 4: пол, 5: кличка
    // 6: номер забега 1 (с цветом фона)
    // 7-12: судья 1, забег 1 (5 категорий + сумма)
    // 13: сумма 1 (rowspan=2)
    // 14: номер забега 2 (с цветом фона) - может отсутствовать для disqualified
    // 15-20: судья 1, забег 2 (5 категорий + сумма) - может отсутствовать
    // 21: сумма 2 (rowspan=2) - может отсутствовать
    // 22: общая сумма (rowspan=2)
    // 23: ВС
    // 24: титул
    
    // Строка 2 содержит:
    // 7-12: судья 2, забег 1 (5 категорий + сумма)
    // 15-20: судья 2, забег 2 (5 категорий + сумма) - может отсутствовать
    
    const heats = [];
    
    // Номер забега 1 и цвет формы (ячейка 6)
    const heat1Cell = $cells.eq(6);
    const heat1Text = heat1Cell.text().trim();
    const heat1Number = extractNumber(heat1Text);
    const heat1Color = extractBibColor(heat1Cell);
    
    // Номер забега 2 и цвет формы (ячейка 14) - может отсутствовать для disqualified
    let heat2Number = null;
    let heat2Color = null;
    if (cellCount > 14) {
      const heat2Cell = $cells.eq(14);
      const heat2Text = heat2Cell.text().trim();
      heat2Number = extractNumber(heat2Text);
      heat2Color = extractBibColor(heat2Cell);
    }
    
    // Судья 1, забег 1 (ячейки 7-11: 5 категорий, ячейка 12: сумма)
    const heat1Judge1Scores = [];
    for (let i = 7; i <= 11; i++) {
      if (i < cellCount) {
        const score = extractNumber($cells.eq(i).text());
        // Исключаем слишком большие значения (общие суммы) из оценок
        heat1Judge1Scores.push((score !== null && score < 100) ? score : null);
      } else {
        heat1Judge1Scores.push(null);
      }
    }
    const heat1Judge1Sum = (cellCount > 12) ? extractBoldNumber($cells.eq(12)) : null;
    
    // Сумма 1 (ячейка 13) - итог за забег 1
    const heat1Total = (cellCount > 13) ? extractBoldNumber($cells.eq(13)) : null;
    
    // Судья 1, забег 2 (ячейки 15-19: 5 категорий, ячейка 20: сумма) - может отсутствовать или содержать текст отстранения
    let heat2Judge1Scores = [];
    let heat2Judge1Sum = null;
    let heat2Total = null;
    let heat2Disqualified = false;
    let heat2DisqualificationReason = null;
    
    if (cellCount > 15) {
      // Проверяем, есть ли текст отстранения в ячейках 15-20
      const heat2CellsText = [];
      for (let i = 15; i <= 20; i++) {
        if (i < cellCount) {
          heat2CellsText.push($cells.eq(i).text().trim());
        }
      }
      const disqualificationText = heat2CellsText.find(text => 
        text.toLowerCase().includes('отстранение') || 
        text.toLowerCase().includes('покинул')
      );
      
      if (disqualificationText) {
        heat2Disqualified = true;
        heat2DisqualificationReason = disqualificationText;
        heat2Judge1Scores = [null, null, null, null, null];
      } else {
        for (let i = 15; i <= 19; i++) {
          if (i < cellCount) {
            const score = extractNumber($cells.eq(i).text());
            // Исключаем слишком большие значения (общие суммы) из оценок
            heat2Judge1Scores.push((score !== null && score < 100) ? score : null);
          } else {
            heat2Judge1Scores.push(null);
          }
        }
        heat2Judge1Sum = (cellCount > 20) ? extractBoldNumber($cells.eq(20)) : null;
        heat2Total = (cellCount > 21) ? extractBoldNumber($cells.eq(21)) : null;
      }
    }
    
    // Общая сумма (ячейка 22 или последняя доступная)
    let grandTotal = null;
    if (cellCount > 22) {
      grandTotal = extractBoldNumber($cells.eq(22));
    } else if (cellCount > 13) {
      // Для disqualified с одним забегом, общая сумма может быть в другой позиции
      grandTotal = extractBoldNumber($cells.eq(cellCount - 3));
    }
    
    // ВС (ячейка 23 или предпоследняя)
    if (cellCount > 23) {
      vc = cleanText($cells.eq(23).text());
    } else {
      vc = cleanText($cells.eq(cellCount - 2).text());
    }
    
    // Титул (ячейка 24 или последняя)
    if (cellCount > 24) {
      qualification = cleanText($cells.eq(24).text());
    } else {
      qualification = cleanText($cells.eq(cellCount - 1).text());
    }
    
    // Получаем строку 2 (оценки судьи 2)
    let heat1Judge2Scores = [];
    let heat1Judge2Sum = null;
    let heat2Judge2Scores = [];
    let heat2Judge2Sum = null;
    
    if (rowIndex + 1 < allRows.length) {
      const $row2 = $(allRows[rowIndex + 1]);
      const $cells2 = $row2.find("td");
      const cellCount2 = $cells2.length;
      
      // Собираем все числовые значения из строки 2, игнорируя пустые ячейки
      const allNumericValues = [];
      for (let i = 0; i < cellCount2; i++) {
        const cellText = $cells2.eq(i).text().trim();
        const num = extractNumber(cellText);
        // Исключаем слишком большие значения (общие суммы) из оценок
        if (num !== null && num < 100) {
          allNumericValues.push(num);
        }
      }
      
      // Если есть ровно 12 числовых значений, делим их 6+6
      if (allNumericValues.length >= 12) {
        // Первые 6: Судья 2, Забег 1 (5 категорий + сумма)
        heat1Judge2Scores = allNumericValues.slice(0, 5);
        heat1Judge2Sum = allNumericValues[5];
        
        // Следующие 6: Судья 2, Забег 2 (5 категорий + сумма)
        heat2Judge2Scores = allNumericValues.slice(6, 11);
        heat2Judge2Sum = allNumericValues[11];
      } else if (allNumericValues.length >= 6) {
        // Если меньше 12, но есть хотя бы 6, берем первые 6 для забега 1
        heat1Judge2Scores = allNumericValues.slice(0, 5);
        heat1Judge2Sum = allNumericValues[5];
      }
    }
    
    // Формируем структуру забегов
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
    
    const heat2Judges = [];
    if (heat2Judge1Scores.some(s => s !== null)) {
      heat2Judges.push({
        judge_number: 1,
        scores: heat2Judge1Scores,
        sum: heat2Judge1Sum
      });
    }
    if (heat2Judge2Scores.some(s => s !== null)) {
      heat2Judges.push({
        judge_number: 2,
        scores: heat2Judge2Scores,
        sum: heat2Judge2Sum
      });
    }
    
    if (heat1Judges.length > 0) {
      heats.push({
        heat_number: 1,
        bib_number: heat1Number,
        bib_color: heat1Color,
        judges: heat1Judges,
        total: heat1Total
      });
    }
    
    if (heat2Judges.length > 0 || heat2Disqualified) {
      heats.push({
        heat_number: 2,
        bib_number: heat2Number,
        bib_color: heat2Color,
        judges: heat2Judges,
        total: heat2Total,
        disqualified: heat2Disqualified,
        disqualification_reason: heat2DisqualificationReason
      });
    }
    
    // Нормализуем total_score - делим на количество судей для сравнимости
    totalScore = judgeCount > 0 ? Math.round((grandTotal / judgeCount) * 100) / 100 : grandTotal;

    // Сохраняем детальные оценки в raw_scores_json
    rawScoresJson = JSON.stringify({
      heats: heats,
      grand_total: grandTotal,
      raw_total: grandTotal,
      normalized_score: totalScore
    });
  } else {
    // Формат 2024 (23 ячеек) - упрощенная структура
    const rawTotalScore = extractBoldNumber($cells.eq(cellCount - 3));
    
    // Нормализуем total_score по количеству судей
    totalScore = rawTotalScore ? Math.round((rawTotalScore / judgeCount) * 100) / 100 : null;

    // Пытаемся извлечь номер забега и цвет попоны из ячейки 6
    const heatCell = $cells.eq(6);
    const heatText = heatCell.text().trim();
    const heatNumber = extractItalicNumber(heatCell);
    const heatColor = extractBibColor(heatCell);

    // Пытаемся извлечь причину отстранения из ячейки с colspan=6
    // Обычно это ячейка сразу после ячейки с номером забега
    for (let i = 6; i < cellCount; i++) {
      const cell = $cells.eq(i);
      const colspan = cell.attr('colspan');
      if (colspan && parseInt(colspan) >= 6) {
        const cellText = cell.text().trim();
        if (cellText && cellText.length < 100 && cellText.length > 2) {
          const reason = extractReasonText(cellText, /отстран|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход/);
          if (reason) {
            disqualificationReason = reason;
            break;
          }
        }
      }
    }

    // Сохраняем базовую структуру в raw_scores_json с информацией о забеге
    rawScoresJson = JSON.stringify({
      heats: heatNumber ? [{
        heat_number: 1,
        bib_number: heatNumber,
        bib_color: heatColor,
        judges: [],
        total: null,
        disqualified: disqualificationReason ? true : false,
        disqualification_reason: disqualificationReason
      }] : [],
      raw_total: rawTotalScore,
      judge_count: judgeCount,
      normalized_score: totalScore,
      format: "simplified_2024"
    });
    
    // ВС и титул в последних ячейках
    vc = cleanText($cells.eq(cellCount - 2).text());
    qualification = cleanText($cells.eq(cellCount - 1).text());
  }

  const statusResult = detectStatusFromText($row.text(), totalScore !== null && totalScore !== undefined);
  const status = statusResult.status;
  // Используем извлеченную причину отстранения из ячейки, если есть
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
    total_score: totalScore,
    judge_count: judgeCount,
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: rawScoresJson,
    raw_text: $row.html() || "",
  };
}

function parseNonArrivedRow($row) {
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
    // Формат: "Чемпионат РКФ-CACL по курсингу борзых, 04.04.2026 (Ярославская область, Большесельский район): Полные результаты состязания"
    // Извлекаем часть до запятой с датой
    const match = pageTitle.match(/^([^,]+),\s*(\d{2}\.\d{2}\.\d{4})\s*\(([^)]+)\)/);
    if (match) {
      fullTitle = match[1].trim();
      eventDate = match[2];
      protocolLocation = match[3].trim();
    }
  }

  // Извлекаем информацию о судьях из тексте страницы
  // Судьи обычно находятся над таблицей результатов
  const bodyText = $('body').text();
  
  // Извлекаем ссылки на схемы трасс
  const trackSchemes = [];
  $('a').each((_, a) => {
    const href = $(a).attr('href');
    const text = $(a).text();
    // Ищем ссылки на схемы по названию или по URL паттерну
    if (href && (href.includes('_M1.png') || href.includes('_M2.png') || 
                 href.includes('_m1.png') || href.includes('_m2.png') ||
                 href.includes('_M1.jpg') || href.includes('_M2.jpg') ||
                 href.includes('_m1.jpg') || href.includes('_m2.jpg') ||
                 href.includes('_M1.jpeg') || href.includes('_M2.jpeg') ||
                 href.includes('_m1.jpeg') || href.includes('_m2.jpeg') ||
                 text.includes('Схема трассы') || text.includes('схема') ||
                 text.includes('трасса'))) {
      // Получаем полный URL если относительный
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
  
  // Если не нашли в ссылках, ищем в тегах img (для BZMP)
  if (trackSchemes.length === 0) {
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      const alt = $(img).attr('alt') || '';
      const title = $(img).attr('title') || '';
      
      if (src && (src.includes('Map') || src.includes('map') || alt.includes('Схема трассы') || title.includes('Схема трассы'))) {
        // Извлекаем длину из alt или title
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
  
  // Проверяем, что URL изображений действительно существуют (404 check)
  const validTrackSchemes = [];
  for (const scheme of trackSchemes) {
    try {
      const response = await fetch(scheme.url, { method: 'HEAD' });
      if (response.ok) {
        validTrackSchemes.push(scheme);
      }
    } catch (err) {
      // Если URL недоступен, пропускаем его
      console.log(`Track scheme URL not accessible: ${scheme.url}`);
    }
  }
  
  // Если не нашли действительные схемы, оставляем массив пустым
  const finalTrackSchemes = validTrackSchemes.length > 0 ? validTrackSchemes : [];
  
  // Извлекаем длины трасс из всего текста страницы
  const lengthPatterns = [
    /Схема трассы №1[^0-9]*(\d+)\s*м/i,
    /Схема трассы №2[^0-9]*(\d+)\s*м/i,
    /Схема трассы.*?№1[^0-9]*(\d+)\s*м/i,
    /Схема трассы.*?№2[^0-9]*(\d+)\s*м/i,
    /длина\s*(\d+)\s*м/i,
  ];
  
  for (const pattern of lengthPatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      const schemeNumber = pattern.toString().includes('№1') ? 1 : pattern.toString().includes('№2') ? 2 : 1;
      const scheme = trackSchemes.find(s => s.number === schemeNumber);
      if (scheme && !scheme.length) {
        scheme.length = `${match[1]} м`;
      }
    }
  }
  
  // Если длина не найдена, ставим дефолтную 700 м
  trackSchemes.forEach(scheme => {
    if (!scheme.length) {
      scheme.length = '700 м';
    }
  });
  
  // Убрано: автоматическая генерация URL по дате события
  // Это создавало схемы с несуществующими изображениями
  
  // Устанавливаем дефолтную длину 700 м для схем без длины
  finalTrackSchemes.forEach(scheme => {
    if (!scheme.length) {
      scheme.length = '700 м';
    }
  });
  
  // Сортируем по номеру схемы
  finalTrackSchemes.sort((a, b) => a.number - b.number);
  
  // Сначала ищем в тексте до таблицы
  const $tables = $('table');
  if ($tables.length > 0) {
    // Получаем текст до первой таблицы
    const firstTable = $tables.first();
    const textBeforeTable = firstTable.prevAll().text();
    
    // Пробуем паттерны для текста до таблицы - ищем полные данные о судьях
    const beforeTablePatterns = [
      /Судьи[:\s]+([^.]+?)(?:\n|$)/i,
      /Судьи[:\s]+([^.]+?)(?:Клуб|Организация|Место|Дата|Время|Таблица)/i,
      /(?:Судья|Судьи)[:\s]+([^.]+?)(?:\n|$)/i,
      /(?:Судья|Судьи)[:\s]+([^.]+?)(?:Клуб|Организация|Место|Дата|Время|Таблица)/i,
      /Главный\s+судья[:\s]+([^.]+?)(?:\n|судья)/i,
    ];
    
    for (const pattern of beforeTablePatterns) {
      const match = textBeforeTable.match(pattern);
      if (match) {
        judges = match[1].trim();
        judges = judges.replace(/\s+/g, ' ').replace(/[,;]$/, '').trim();
        // Проверяем, что это не просто число или короткая строка
        if (judges && judges.length > 5 && !judges.match(/^\d+$/)) {
          // Если начинается с дефиса, убираем его
          if (judges.startsWith('-')) {
            judges = judges.substring(1).trim();
          }
          break;
        }
      }
    }
  }
  
  // Если не нашли до таблицы, пробуем во всем тексте с более строгими паттернами
  if (!judges) {
    const strictPatterns = [
      /Судьи[:\s]+([А-Яа-яЁёA-Za-z\s\.,-]+?)(?:\n|Клуб|Организация|Место|Дата|Время|Таблица)/i,
      /(?:Судья|Судьи)[:\s]+([А-Яа-яЁёA-Za-z\s\.,-]+?)(?:\n|Клуб|Организация|Место|Дата|Время|Таблица)/i,
      /Главный\s+судья[:\s]+([А-Яа-яЁёA-Za-z\s\.,-]+?)(?:\n|судья|Клуб|Организация)/i,
    ];
    
    for (const pattern of strictPatterns) {
      const match = bodyText.match(pattern);
      if (match) {
        judges = match[1].trim();
        judges = judges.replace(/\s+/g, ' ').replace(/[,;]$/, '').trim();
        if (judges && judges.length > 5 && !judges.match(/^\d+$/)) {
          // Если начинается с дефиса, убираем его
          if (judges.startsWith('-')) {
            judges = judges.substring(1).trim();
          }
          break;
        }
      }
    }
  }

  // Извлекаем Telegram ссылку из шапки страницы
  $('a').each((_, a) => {
    const href = $(a).attr('href');
    if (href && href.includes('t.me/')) {
      telegramUrl = href;
    }
  });

  // Собираем все строки таблицы
  const allRows = [];
  $("table tr").each((_, row) => {
    allRows.push($(row));
  });

  // Ищем строки таблицы
  allRows.forEach(($row, rowIndex) => {
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
        const parsed = parseDogRow($, $row, currentBreedClass, allRows, rowIndex, judges);
        if (parsed) results.push(parsed);
      }
    }

    // Строка неприбывших (серый фон)
    if (bgColor === "#eaeaea") {
      const parsed = parseNonArrivedRow($row);
      if (parsed) results.push(parsed);
    }
  });

  // Не фильтруем собак со статусом "Неявка" - сохраняем всех участников
  const filteredResults = results;

  return { results: filteredResults, telegram_url: telegramUrl, full_title: fullTitle, event_date: eventDate, protocol_location: protocolLocation, judges: judges, track_schemes: finalTrackSchemes };
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
