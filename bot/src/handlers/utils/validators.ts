/**
 * Функции валидации и санитайзинга пользовательского ввода
 * Защищают от инъекций и неправомерных данных
 */

/**
 * Санитайзит пользовательский ввод
 * Удаляет опасные символы и ограничивает длину
 * @param input - исходный пользовательский ввод
 * @returns санитайзированная строка
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[<>]/g, '') // Remove dangerous characters
    .replace(/[{}]/g, '') // Remove template literal characters
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Валидирует ID собаки
 * @param input - строка с ID собаки
 * @returns true если ID валиден (число от 1 до 9999999999)
 */
export function validateDogId(input: string): boolean {
  return /^\d+$/.test(input) && input.length <= 10 && parseInt(input, 10) > 0;
}

/**
 * Валидирует год
 * @param input - строка с годом
 * @returns true если год валиден (от 2015 до 2030)
 */
export function validateYear(input: string): boolean {
  const year = parseInt(input, 10);
  return !isNaN(year) && year >= 2015 && year <= 2030;
}

/**
 * Валидирует поисковый запрос
 * @param input - поисковый запрос
 * @returns true если запрос валиден (от 2 до 100 символов после санитайзинга)
 */
export function validateSearchQuery(input: string): boolean {
  const sanitized = sanitizeInput(input);
  return sanitized.length >= 2 && sanitized.length <= 100;
}
