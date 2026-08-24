/**
 * Утилиты для парсинга результатов курсинга
 */

import * as cheerio from "cheerio"

export function extractNumber(text: string | null | undefined): number | null {
  if (!text) return null
  const match = text.match(/\d+/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Извлекает число из элемента cheerio с опциональным селектором.
 * Если указан селектор, ищет внутри него, иначе использует сам элемент.
 */
export function extractNumberFromElement($el: cheerio.Cheerio<any>, selector?: string): number | null {
  const text = selector ? $el.find(selector).text() : $el.text()
  return extractNumber(text)
}

// ponytail: оставляем для обратной совместимости существующего кода
export function extractBoldNumber($el: cheerio.Cheerio<any>): number | null {
  return extractNumberFromElement($el, 'b')
}

export function extractItalicNumber($el: cheerio.Cheerio<any>): number | null {
  return extractNumberFromElement($el, 'i')
}

export function cleanText(text) {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

export function normalizeDogName(name) {
  if (!name) return "";
  return name
    .toUpperCase()
    .replace(/['"`''""']/g, "")
    .replace(/[-]/g, " ")
    .replace(/Ё/g, "Е")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractDogNames($cell) {
  const text = $cell.text().trim();
  const html = $cell.html() || "";
  
  // Проверяем наличие разделителя / или <br>
  if (text.includes('/') || html.includes('<br>')) {
    // Разделяем по / или <br>
    const parts = text.split(/\/|<br>/i).map(p => p.trim()).filter(p => p);
    
    if (parts.length >= 2) {
      // Определяем, какая часть русская, какая латинская
      const cyrillicPattern = /[а-яё]/i;
      const latinPattern = /[a-z]/i;
      
      let nameRu = "";
      let nameLat = "";
      
      parts.forEach(part => {
        if (cyrillicPattern.test(part)) {
          nameRu = part;
        } else if (latinPattern.test(part)) {
          nameLat = part;
        }
      });
      
      return {
        name_ru: normalizeDogName(nameRu),
        name_lat: normalizeDogName(nameLat)
      };
    }
  }
  
  // Если разделителя нет, определяем язык по содержимому
  const cyrillicPattern = /[а-яё]/i;
  const latinPattern = /[a-z]/i;
  
  if (cyrillicPattern.test(text) && latinPattern.test(text)) {
    // Если есть и кириллица, и латиница в одной строке - это проблема, возвращаем как есть
    return {
      name_ru: normalizeDogName(text),
      name_lat: normalizeDogName(text)
    };
  } else if (cyrillicPattern.test(text)) {
    // Только кириллица
    return {
      name_ru: normalizeDogName(text),
      name_lat: ""
    };
  } else if (latinPattern.test(text)) {
    // Только латиница
    return {
      name_ru: "",
      name_lat: normalizeDogName(text)
    };
  }
  
  // Не удалось определить
  return {
    name_ru: normalizeDogName(text),
    name_lat: ""
  };
}

export function normalizeBreed(breed) {
  if (!breed) return "";
  return breed
    .toUpperCase()
    .replace(/['"`''""']/g, "")
    .replace(/[-]/g, " ")
    .replace(/Ё/g, "Е")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractBibColor($cell) {
  const bgColor = $cell.attr('bgcolor');
  const style = $cell.attr('style');
  
  if (bgColor) {
    const lower = bgColor.toLowerCase();
    if (lower === '#ff0000' || lower === 'red') return 'red';
    if (lower === '#ffffff' || lower === 'white') return 'white';
    if (lower === '#0000ff' || lower === 'blue' || lower === '#00ccff' || lower === '#00ffff') return 'blue';
    if (lower === '#000000' || lower === 'black' || lower === '#000') return 'black';
    if (lower === '#00ff00' || lower === 'green' || lower === '#008000') return 'green';
    if (lower === '#efe4b0' || lower === '#fff8dc') return 'yellow';
    return bgColor;
  }

  if (style) {
    const colorMatch = style.match(/background-color:\s*([^;]+)/i);
    if (colorMatch) {
      const color = colorMatch[1].trim().toLowerCase();
      if (color === '#ff0000' || color === 'red') return 'red';
      if (color === '#ffffff' || color === 'white') return 'white';
      if (color === '#0000ff' || color === 'blue' || color === '#00ccff' || color === '#00ffff') return 'blue';
      if (color === '#000000' || color === 'black' || color === '#000') return 'black';
      if (color === '#00ff00' || color === 'green' || color === '#008000') return 'green';
      if (color === '#ffff00' || color === 'yellow') return 'yellow';
      return colorMatch[1].trim();
    }
  }
  
  return null;
}

export function detectStatusFromText(text, hasScore = true, hasValidJudgeData = false) {
  const normalized = cleanText(text).toLowerCase().replace(/ё/g, "е");

  // Неявка - не участвовал вообще
  if (/\bнеявк|не\s*явил|не\s*приб/.test(normalized)) {
    return { status: "dns", reason: extractReasonText(text, /неявк|не\s*явил|не\s*приб/) };
  }

  // Все остальные случаи дисквалификации/снятия/не финиша - один статус disqualified
  if (/дисквал|снят|снята|снятие|ветеринар|владельц|не\s*финиш|сош[еелла]*|сход\s+с\s+трасс|уход\s+с\s+трасс|отстран/.test(normalized)) {
    return { status: "disqualified", reason: extractReasonText(text, /дисквал|снят|снята|снятие|ветеринар|владельц|не\s*финиш|сош[еелла]*|сход|уход|отстран/) };
  }

  // Consider finished if either hasScore OR hasValidJudgeData
  // This handles cases where total_score extraction failed but judge data exists
  return { status: (hasScore || hasValidJudgeData) ? "finished" : "unknown_status_check_raw_text", reason: null };
}

export function extractReasonText(fullText, pattern) {
  if (!fullText) return null;

  const reasonKeyword =
    /(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|отстранена|снята|неявка)/i;

  const parenMatch = fullText.match(
    /(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход)[^(]*\(([^)]+)\)/i,
  );
  if (parenMatch) {
    return parenMatch[1].trim();
  }

  const lines = fullText.split(/\r?\n/).map((line) => cleanText(line)).filter(Boolean);

  // Отдельная ячейка/строка с причиной (часто последняя в строке протокола)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.length <= 80 && reasonKeyword.test(line)) {
      return line;
    }
  }

  const trimmed = cleanText(fullText);
  if (trimmed.length <= 80 && reasonKeyword.test(trimmed)) {
    return trimmed;
  }

  const keywordMatch = trimmed.match(reasonKeyword);
  if (keywordMatch) {
    const word = keywordMatch[0];
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return null;
}
