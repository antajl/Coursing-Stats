/**
 * Парсеры заголовков для результатов курсинга
 */

export function extractJudgeCount(judgesText, $) {
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
