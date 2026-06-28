import * as cheerio from "cheerio";
import { fetchWin1251 } from "../lib/fetch-win1251";

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

function extractJudgeCount(judgesText, $) {
  // Сначала проверяем текст судей - это самый надежный способ
  if (judgesText) {
    // Формат: "Главный судья - Карелина Н.В." (1 судья)
    // Формат: "Главный судья - Лукина Д.М., судья - Гродинская Т.Л." (2 судьи)
    // Считаем количество имен (разделенных запятыми)
    const names = judgesText.split(',').filter(name => name.trim().length > 0);
    const countFromNames = Math.max(1, names.length);
    
    // Если есть явное указание на количество судей в тексте
    if (judgesText.includes('Главный судья') && !judgesText.includes('судья -')) {
      return 1; // Только главный судья
    }
    
    return countFromNames;
  }
  
  // Если текст судей недоступен, пробуем определить из структуры заголовков таблицы
  if ($) {
    const headerRows = $('table tr').slice(7, 9);
    let judgeBlocks = 0;
    
    headerRows.each((i, row) => {
      const $row = $(row);
      const $cells = $row.find('td');
      $cells.each((j, cell) => {
        const $cell = $(cell);
        const text = $cell.text().trim();
        const colspan = $cell.attr('colspan');
        
        // Считаем блоки "Главный судья" или просто "Судья"
        if ((text.includes('Главный судья') || text.includes('Судья')) && colspan === '6') {
          judgeBlocks++;
        }
      });
    });
    
    // Если есть 2 блока "Главный судья", это может быть 1 судья (для 2 забегов) или 2 судьи
    // Нужно проверить количество строк заголовков
    if (judgeBlocks === 2) {
      // Проверяем, есть ли отдельные строки для второго судьи
      // Если в заголовках только 2 строки, то это 1 судья (забег 1 и забег 2)
      // Если в заголовках 3+ строки, то это 2 судьи
      const totalHeaderRows = headerRows.length;
      if (totalHeaderRows <= 2) {
        return 1; // 1 судья для 2 забегов
      }
    }
    
    if (judgeBlocks > 0) {
      return judgeBlocks;
    }
  }
  
  return 2; // По умолчанию 2 судьи
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

function parseDogRow1Judge($, $cells, cellCount, allRows, rowIndex, judgesText) {
  // Парсинг для формата с 1 судьей
  // Структура: все оценки в одной строке
  // 0: место, 1: каталожный номер, 2: порода, 3: класс, 4: пол, 5: кличка
  // 6: номер забега 1 (с цветом фона)
  // 7-11: судья 1, забег 1 (5 категорий)
  // 12: сумма судьи 1, забег 1
  // 13: сумма забега 1
  // 14: номер забега 2 (с цветом фона)
  // 15-19: судья 1, забег 2 (5 категорий)
  // 20: сумма судьи 1, забег 2
  // 21: сумма забега 2
  // 22: общая сумма
  // 23: ВС
  // 24: титул
  
  const heats = [];
  
  // Номер забега 1 и цвет формы (ячейка 6)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Number = extractNumber(heat1Text);
  const heat1Color = extractBibColor(heat1Cell);
  
  // Проверяем disqualified для heat1 (colspan в ячейке 7)
  const heat1FirstCell = $cells.eq(7);
  const heat1Colspan = heat1FirstCell.attr('colspan');
  let heat1Disqualified = false;
  let heat1DisqualificationReason = null;
  let heat1Judge1Scores = [];
  
  if (heat1Colspan && parseInt(heat1Colspan) >= 7) {
    heat1Disqualified = true;
    heat1DisqualificationReason = heat1FirstCell.text().trim();
    heat1Judge1Scores = [null, null, null, null, null];
  } else {
    // Парсим оценки судьи 1 для забега 1
    for (let i = 7; i <= 11; i++) {
      if (i < cellCount) {
        const score = extractNumber($cells.eq(i).text());
        heat1Judge1Scores.push((score !== null && score <= 20) ? score : null);
      } else {
        heat1Judge1Scores.push(null);
      }
    }
  }
  
  const heat1Judge1Sum = (cellCount > 12) ? extractBoldNumber($cells.eq(12)) : null;
  const heat1Total = (cellCount > 13) ? extractBoldNumber($cells.eq(13)) : null;
  
  // Номер забега 2 и цвет формы (ячейка 14)
  let heat2Number = null;
  let heat2Color = null;
  if (cellCount > 14) {
    const heat2Cell = $cells.eq(14);
    const heat2Text = heat2Cell.text().trim();
    heat2Number = extractNumber(heat2Text);
    heat2Color = extractBibColor(heat2Cell);
  }
  
  // Проверяем disqualified для heat2 (colspan в ячейке 15)
  let heat2Disqualified = false;
  let heat2DisqualificationReason = null;
  let heat2Judge1Scores = [];
  let heat2Judge1Sum = null;
  let heat2Total = null;
  
  if (cellCount > 15) {
    const heat2FirstCell = $cells.eq(15);
    const heat2Colspan = heat2FirstCell.attr('colspan');
    
    if (heat2Colspan && parseInt(heat2Colspan) >= 7) {
      heat2Disqualified = true;
      heat2DisqualificationReason = heat2FirstCell.text().trim();
      heat2Judge1Scores = [null, null, null, null, null];
    } else {
      // Парсим оценки судьи 1 для забега 2
      for (let i = 15; i <= 19; i++) {
        if (i < cellCount) {
          const score = extractNumber($cells.eq(i).text());
          heat2Judge1Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat2Judge1Scores.push(null);
        }
      }
      heat2Judge1Sum = (cellCount > 20) ? extractBoldNumber($cells.eq(20)) : null;
      heat2Total = (cellCount > 21) ? extractBoldNumber($cells.eq(21)) : null;
    }
  }
  
  // Формируем heats
  if (heat1Number !== null) {
    const heat1Judges = [];
    if (heat1Judge1Scores.some(s => s !== null)) {
      heat1Judges.push({
        judge_number: 1,
        scores: heat1Judge1Scores,
        sum: heat1Judge1Sum
      });
    }
    
    heats.push({
      heat_number: 1,
      bib_number: heat1Number,
      bib_color: heat1Color,
      judges: heat1Judges,
      total: heat1Total,
      disqualified: heat1Disqualified,
      disqualification_reason: heat1DisqualificationReason
    });
  }
  
  if (heat2Number !== null) {
    const heat2Judges = [];
    if (heat2Judge1Scores.some(s => s !== null)) {
      heat2Judges.push({
        judge_number: 1,
        scores: heat2Judge1Scores,
        sum: heat2Judge1Sum
      });
    }
    
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
  
  // Общая сумма
  let grandTotal = null;
  if (cellCount > 22) {
    grandTotal = extractBoldNumber($cells.eq(22));
  } else if (cellCount > 13) {
    grandTotal = extractBoldNumber($cells.eq(cellCount - 3));
  }
  
  // ВС и титул
  let vc = null;
  let qualification = null;
  if (cellCount > 23) {
    vc = cleanText($cells.eq(23).text());
  } else {
    vc = cleanText($cells.eq(cellCount - 2).text());
  }
  
  if (cellCount > 24) {
    qualification = cleanText($cells.eq(24).text());
  } else {
    qualification = cleanText($cells.eq(cellCount - 1).text());
  }
  
  const rawScoresJson = JSON.stringify({ heats });
  
  return {
    total_score: grandTotal,
    judge_count: 1,
    qualification,
    vc,
    raw_scores_json: rawScoresJson,
    heats
  };
}

function parseDogRow2Judges($, $cells, cellCount, allRows, rowIndex, judgesText) {
  // Парсинг для формата с 2 судьями
  // Строка 1 содержит оценки судьи 1
  // Строка 2 содержит оценки судьи 2
  
  const heats = [];
  
  // Номер забега 1 и цвет формы (ячейка 6)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Number = extractNumber(heat1Text);
  const heat1Color = extractBibColor(heat1Cell);
  
  // Проверяем disqualified для heat1 (colspan в ячейке 7)
  const heat1FirstCell = $cells.eq(7);
  const heat1Colspan = heat1FirstCell.attr('colspan');
  let heat1Disqualified = false;
  let heat1DisqualificationReason = null;
  let heat1Judge1Scores = [];
  
  if (heat1Colspan && parseInt(heat1Colspan) >= 7) {
    heat1Disqualified = true;
    heat1DisqualificationReason = heat1FirstCell.text().trim();
    heat1Judge1Scores = [null, null, null, null, null];
  } else {
    // Парсим оценки судьи 1 для забега 1
    for (let i = 7; i <= 11; i++) {
      if (i < cellCount) {
        const score = extractNumber($cells.eq(i).text());
        heat1Judge1Scores.push((score !== null && score <= 20) ? score : null);
      } else {
        heat1Judge1Scores.push(null);
      }
    }
  }
  
  const heat1Judge1Sum = (cellCount > 12) ? extractBoldNumber($cells.eq(12)) : null;
  const heat1Total = (cellCount > 13) ? extractBoldNumber($cells.eq(13)) : null;
  
  // Получаем оценки судьи 2 из следующей строки
  let heat1Judge2Scores = [];
  let heat1Judge2Sum = null;
  
  if (rowIndex + 1 < allRows.length) {
    const $row2 = $(allRows[rowIndex + 1]);
    const $cells2 = $row2.find("td");
    const cellCount2 = $cells2.length;
    
    // Проверяем, что следующая строка содержит оценки (много чисел 0-20)
    let hasJudgeScores = false;
    for (let i = 7; i <= 19; i++) {
      if (i < cellCount2) {
        const score = extractNumber($cells2.eq(i).text());
        if (score !== null && score <= 20) {
          hasJudgeScores = true;
          break;
        }
      }
    }
    
    if (hasJudgeScores) {
      // Оценки судьи 2 для забега 1 (ячейки 7-11)
      for (let i = 7; i <= 11; i++) {
        if (i < cellCount2) {
          const score = extractNumber($cells2.eq(i).text());
          heat1Judge2Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat1Judge2Scores.push(null);
        }
      }
      heat1Judge2Sum = (cellCount2 > 12) ? extractBoldNumber($cells2.eq(12)) : null;
    }
  }
  
  // Номер забега 2 и цвет формы (ячейка 14)
  let heat2Number = null;
  let heat2Color = null;
  if (cellCount > 14) {
    const heat2Cell = $cells.eq(14);
    const heat2Text = heat2Cell.text().trim();
    heat2Number = extractNumber(heat2Text);
    heat2Color = extractBibColor(heat2Cell);
  }
  
  // Проверяем disqualified для heat2 (colspan в ячейке 15)
  let heat2Disqualified = false;
  let heat2DisqualificationReason = null;
  let heat2Judge1Scores = [];
  let heat2Judge1Sum = null;
  let heat2Total = null;
  let heat2Judge2Scores = [];
  let heat2Judge2Sum = null;
  
  if (cellCount > 15) {
    const heat2FirstCell = $cells.eq(15);
    const heat2Colspan = heat2FirstCell.attr('colspan');
    
    if (heat2Colspan && parseInt(heat2Colspan) >= 7) {
      heat2Disqualified = true;
      heat2DisqualificationReason = heat2FirstCell.text().trim();
      heat2Judge1Scores = [null, null, null, null, null];
    } else {
      // Парсим оценки судьи 1 для забега 2
      for (let i = 15; i <= 19; i++) {
        if (i < cellCount) {
          const score = extractNumber($cells.eq(i).text());
          heat2Judge1Scores.push((score !== null && score <= 20) ? score : null);
        } else {
          heat2Judge1Scores.push(null);
        }
      }
      heat2Judge1Sum = (cellCount > 20) ? extractBoldNumber($cells.eq(20)) : null;
      heat2Total = (cellCount > 21) ? extractBoldNumber($cells.eq(21)) : null;
      
      // Получаем оценки судьи 2 для забега 2 из следующей строки
      if (rowIndex + 1 < allRows.length) {
        const $row2 = $(allRows[rowIndex + 1]);
        const $cells2 = $row2.find("td");
        const cellCount2 = $cells2.length;
        
        for (let i = 15; i <= 19; i++) {
          if (i < cellCount2) {
            const score = extractNumber($cells2.eq(i).text());
            heat2Judge2Scores.push((score !== null && score <= 20) ? score : null);
          } else {
            heat2Judge2Scores.push(null);
          }
        }
        heat2Judge2Sum = (cellCount2 > 20) ? extractBoldNumber($cells2.eq(20)) : null;
      }
    }
  }
  
  // Формируем heats
  if (heat1Number !== null) {
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
    
    heats.push({
      heat_number: 1,
      bib_number: heat1Number,
      bib_color: heat1Color,
      judges: heat1Judges,
      total: heat1Total,
      disqualified: heat1Disqualified,
      disqualification_reason: heat1DisqualificationReason
    });
  }
  
  if (heat2Number !== null) {
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
  
  // Общая сумма
  let grandTotal = null;
  if (cellCount > 22) {
    grandTotal = extractBoldNumber($cells.eq(22));
  } else if (cellCount > 13) {
    grandTotal = extractBoldNumber($cells.eq(cellCount - 3));
  }
  
  // ВС и титул
  let vc = null;
  let qualification = null;
  if (cellCount > 23) {
    vc = cleanText($cells.eq(23).text());
  } else {
    vc = cleanText($cells.eq(cellCount - 2).text());
  }
  
  if (cellCount > 24) {
    qualification = cleanText($cells.eq(24).text());
  } else {
    qualification = cleanText($cells.eq(cellCount - 1).text());
  }
  
  const rawScoresJson = JSON.stringify({ heats });
  
  return {
    total_score: grandTotal,
    judge_count: 2,
    qualification,
    vc,
    raw_scores_json: rawScoresJson,
    heats
  };
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
  const judgeCount = extractJudgeCount(judgesText, $); // Определяем количество судей из структуры
  let disqualificationReason = null;
  
  // Проверяем, есть ли данные о забегах (ячейка 6 с номером забега)
  const heat1Cell = $cells.eq(6);
  const heat1Text = heat1Cell.text().trim();
  const heat1Number = extractNumber(heat1Text);
  const hasHeatData = heat1Number !== null;
  
  if (cellCount >= 25 || (hasHeatData && cellCount >= 13)) {
    // Формат с данными о забегах - используем соответствующую функцию в зависимости от количества судей
    let scoresData;
    
    if (judgeCount === 1) {
      scoresData = parseDogRow1Judge($, $cells, cellCount, allRows, rowIndex, judgesText);
    } else {
      scoresData = parseDogRow2Judges($, $cells, cellCount, allRows, rowIndex, judgesText);
    }
    
    totalScore = scoresData.total_score;
    qualification = scoresData.qualification;
    vc = scoresData.vc;
    rawScoresJson = scoresData.raw_scores_json;
    const heats = scoresData.heats;
    
    // Определяем disqualified из heats
    if (heats.length > 0) {
      const disqualifiedHeat = heats.find(h => h.disqualified);
      if (disqualifiedHeat) {
        disqualificationReason = disqualifiedHeat.disqualification_reason;
      }
    }
  } else {
    // Формат 2024 (23 ячеек) - упрощенная структура
    const rawTotalScore = extractBoldNumber($cells.eq(cellCount - 3));
    
    // Сохраняем исходную сумму без нормализации
    totalScore = rawTotalScore;

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
    name_lat: name, // Добавляем name_lat для совместимости
    total_score: totalScore,
    judge_count: judgeCount,
    qualification,
    vc,
    status,
    status_reason: statusReason,
    raw_scores_json: rawScoresJson,
    raw_text: $row.html() || "",
    judges: judgesText, // Судьи из заголовка страницы
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
      // console.log(`Track scheme URL not accessible: ${scheme.url}`);
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
  
  // Сначала ищем в строках таблицы с colspan=25 (это заголовочные строки)
  $('table tr').each((_, row) => {
    const $row = $(row);
    const $firstCell = $row.find('td').first();
    const colspan = $firstCell.attr('colspan');
    
    // Ищем строку с colspan=25, которая содержит "Судьи:"
    if (colspan === '25') {
      const cellText = $firstCell.text();
      if (cellText.includes('Судьи:') || cellText.includes('Судьи')) {
        // Пробуем многострочный формат внутри ячейки
        const lines = cellText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line === 'Судьи:' || line === 'Судьи') {
            // Берем следующую строку
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              // Ищем паттерн с главным судьей и вторым судьей (и третьим если есть)
              const judgeMatch = nextLine.match(/Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))?/i);
              if (judgeMatch) {
                if (judgeMatch[1] && judgeMatch[2] && judgeMatch[3]) {
                  judges = `${judgeMatch[1].trim()}, ${judgeMatch[2].trim()}, ${judgeMatch[3].trim()}`;
                } else if (judgeMatch[1] && judgeMatch[2]) {
                  judges = `${judgeMatch[1].trim()}, ${judgeMatch[2].trim()}`;
                } else if (judgeMatch[1]) {
                  judges = judgeMatch[1].trim();
                }
                if (judges && judges.length > 3) {
                  return false; // Прерываем each
                }
              } else {
                // Если строгий паттерн не сработал, пробуем очень гибкий - любые русские слова
                const veryFlexibleMatch = nextLine.match(/Главный\s+судья\s*[:\s-]+\s*([А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+)*)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+)*))?/i);
                if (veryFlexibleMatch) {
                  if (veryFlexibleMatch[1] && veryFlexibleMatch[2]) {
                    judges = `${veryFlexibleMatch[1].trim()}, ${veryFlexibleMatch[2].trim()}`;
                  } else if (veryFlexibleMatch[1]) {
                    judges = veryFlexibleMatch[1].trim();
                  }
                  if (judges && judges.length > 3) {
                    return false; // Прерываем each
                  }
                } else {
                  // Если и это не сработало, пробуем извлечь всю строку и разбить по запятым
                  const fullMatch = nextLine.match(/Главный\s+судья\s*[:\s-]+\s*(.+)/i);
                  if (fullMatch) {
                    const judgesText = fullMatch[1].trim();
                    // Разбиваем по запятым и ищем части похожие на имена
                    const parts = judgesText.split(',').map(p => p.trim());
                    // Самый гибкий паттерн - любые русские слова
                    const namePattern = /^[А-ЯЁа-яё]+(?:\s+[А-ЯЁа-яё]+)*$/;
                    const validNames = parts.filter(p => namePattern.test(p) && p.length > 2);
                    if (validNames.length > 0) {
                      judges = validNames.join(', ');
                      if (judges && judges.length > 3) {
                        return false; // Прерываем each
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        // Если не нашли многострочный формат, пробуем однострочный в той же ячейке
        if (!judges) {
          // Проверяем однострочный формат: "Судьи:Главный судья - Серова Т.Г., судья - Козлова И.В."
          // Извлекаем всех судей из строки
          const judgesList = [];
          
          // Ищем главного судью
          const mainJudgeMatch = cellText.match(/Главный\s+судья\s*[:\s-]+\s*([^,]+)/i);
          if (mainJudgeMatch && mainJudgeMatch[1]) {
            judgesList.push(mainJudgeMatch[1].trim());
          }
          
          // Ищем всех остальных судей (паттерн "судья -" но не "Главный судья -")
          const otherJudgesMatches = cellText.matchAll(/(?:,\s*)?(?!Главный)судья\s*[:\s-]+\s*([^,]+)/gi);
          for (const match of otherJudgesMatches) {
            if (match[1]) {
              const judge = match[1].trim();
              // Проверяем на дубликаты
              if (!judgesList.includes(judge)) {
                judgesList.push(judge);
              }
            }
          }
          
          if (judgesList.length > 0) {
            judges = judgesList.join(', ');
            if (judges && judges.length > 3) {
              return false; // Прерываем each
            }
          }
        }
        
        // Если все еще не нашли, пробуем другие паттерны
        if (!judges) {
          const judgePatterns = [
            /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))/i,
            /Главный\s+судья\s*[:\s-]+\s*([^.]+?)(?:\s*,\s*судья\s*[:\s-]+\s*([^.]+))/i,
            /Главный\s+судья\s*[:\s-]+\s*([^.]+)/i,
            /Судьи[:\s]+([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?(?:\s*,\s*[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)*)/i,
            /Судьи[:\s]+([^.]+)/i,
          ];
          for (const pattern of judgePatterns) {
            const match = cellText.match(pattern);
            if (match) {
              // Если паттерн с двумя группами (главный и второй судья)
              if (match[1] && match[2]) {
                judges = `${match[1].trim()}, ${match[2].trim()}`;
              } else if (match[1]) {
                judges = match[1].trim();
                judges = judges.replace(/\s+/g, ' ').replace(/[,;]$/, '').trim();
              }
              
              // Исключаем заголовки таблицы
              if (judges && !judges.includes('Сумма') && !judges.includes('Забег') && 
                  judges.length > 3 && !judges.match(/^\d+$/)) {
                if (judges.startsWith('-')) {
                  judges = judges.substring(1).trim();
                }
                return false; // Прерываем each
              } else {
                judges = null;
              }
            }
          }
        }
      }
    }
  });
  
  // Если не нашли в таблице, ищем в тексте до таблицы
  const $tables = $('table');
  if ($tables.length > 0) {
    // Получаем текст до первой таблицы
    const firstTable = $tables.first();
    const textBeforeTable = firstTable.prevAll().text();
    
    // Пробуем многострочный формат: "Судьи:" на одной строке, имена на следующей
    const lines = textBeforeTable.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === 'Судьи:' || line === 'Судьи') {
        // Берем следующую строку
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          // Ищем паттерн с главным судьей и вторым судьей
          const judgeMatch = nextLine.match(/Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.[А-ЯЁ]\.)?))?/i);
          if (judgeMatch) {
            if (judgeMatch[1] && judgeMatch[2]) {
              judges = `${judgeMatch[1].trim()}, ${judgeMatch[2].trim()}`;
            } else if (judgeMatch[1]) {
              judges = judgeMatch[1].trim();
            }
            if (judges && judges.length > 3) {
              break;
            }
          }
        }
      }
    }
    
    // Если не нашли многострочный формат, пробуем однострочный
    if (!judges) {
      const beforeTablePatterns = [
        /Главный\s+судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.?[А-ЯЁ]\.?)?)(?:\s*,\s*судья\s*[:\s-]+\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]\.?[А-ЯЁ]\.?)?))?/i,
        /Судьи[:\s]+([^.]+?)(?:\n|$)/i,
        /Судьи[:\s]+([^.]+?)(?:Клуб|Организация|Место|Дата|Время|Таблица)/i,
        /(?:Судья|Судьи)[:\s]+([^.]+?)(?:\n|$)/i,
        /(?:Судья|Судьи)[:\s]+([^.]+?)(?:Клуб|Организация|Место|Дата|Время|Таблица)/i,
      ];
      
      for (const pattern of beforeTablePatterns) {
        const match = textBeforeTable.match(pattern);
        if (match) {
          // Если паттерн с двумя группами (главный и второй судья)
          if (match[1] && match[2]) {
            judges = `${match[1].trim()}, ${match[2].trim()}`;
          } else if (match[1]) {
            judges = match[1].trim();
            judges = judges.replace(/\s+/g, ' ').replace(/[,;]$/, '').trim();
          }
          
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
      // Более строгое условие: текст должен содержать дефис и не быть заголовком страницы
      if (text.includes('-') && !text.includes('Организатор') && !text.includes('Полные результаты') && !text.includes('Судья') && !text.includes('Состязания')) {
        currentBreedClass = cleanText(text);
        inNonArrivedSection = text.includes("Неприбывшие");
      }
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
    } else if (bgColor === "#eaeaea") {
      // Строка неприбывших (серый фон) - только если не в белом фоне
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
