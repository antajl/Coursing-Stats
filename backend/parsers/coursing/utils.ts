/**
 * Утилиты для парсинга результатов курсинга
 */

export function extractNumber(text) {
  if (!text) return null;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

export function extractBoldNumber($el) {
  const text = $el.find("b").text();
  return extractNumber(text);
}

export function extractItalicNumber($el) {
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

export function extractReasonText(fullText, pattern) {
  if (!fullText) return null;
  
  // Сначала ищем текст, содержащий причину, обычно в скобках или отдельной ячейке
  const match = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход)[^(]*\(([^)]+)\)/i);
  if (match) {
    return match[1].trim();
  }
  
  // Если не нашли в скобках, возвращаем весь текст как причину
  const keywordMatch = fullText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|отстранена|снята|неявка)/i);
  if (keywordMatch) {
    return fullText.trim();
  }
  
  return null;
}
