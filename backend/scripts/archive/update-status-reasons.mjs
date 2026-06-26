import fs from "node:fs/promises";

// Скрипт для обновления status_reason на основе raw_text
// Извлекает причину из текста в скобках после ключевых слов

function extractReasonFromRawText(rawText) {
  if (!rawText) return null;
  
  // Сначала ищем текст в скобках после ключевых слов
  const match = rawText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход)[^(]*\(([^)]+)\)/i);
  if (match) {
    return match[1].trim();
  }
  
  // Если не нашли в скобках, ищем просто текст статуса
  const statusMatch = rawText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход)/i);
  if (statusMatch) {
    return statusMatch[0].trim();
  }
  
  return null;
}

async function main() {
  console.log('Генерация SQL для обновления status_reason...');
  
  // Читаем данные из базы через wrangler постранично
  const { execSync } = await import('child_process');
  
  try {
    // Получаем все ID записей без status_reason в JSON формате
    const idsOutput = execSync('wrangler d1 execute pc-db --local --command="SELECT id FROM results WHERE status IN (\'disqualified\', \'dns\', \'withdrawn\', \'dnf\') AND status_reason IS NULL" --json', { encoding: 'utf8' });
    
    const jsonData = JSON.parse(idsOutput);
    // wrangler возвращает массив с одним элементом, содержащим results
    const results = Array.isArray(jsonData) ? jsonData[0]?.results || [] : jsonData.results || [];
    const ids = results.map(row => row.id);
    
    console.log(`Найдено ${ids.length} записей для обработки`);
    
    if (ids.length === 0) {
      console.log('Не найдено записей для обработки.');
      return;
    }
    
    const updates = [];
    const batchSize = 10;
    
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const idsList = batch.join(',');
      
      const rawTextOutput = execSync(`wrangler d1 execute pc-db --local --command="SELECT id, raw_text FROM results WHERE id IN (${idsList})" --json`, { encoding: 'utf8' });
      
      const rawData = JSON.parse(rawTextOutput);
      const rawResults = Array.isArray(rawData) ? rawData[0]?.results || [] : rawData.results || [];
      
      for (const row of rawResults) {
        const reason = extractReasonFromRawText(row.raw_text);
        if (reason) {
          updates.push(`UPDATE results SET status_reason = '${reason.replace(/'/g, "''")}' WHERE id = ${row.id};`);
          console.log(`Найдена причина для ID ${row.id}: ${reason}`);
        }
      }
      
      console.log(`Обработано ${Math.min(i + batchSize, ids.length)} из ${ids.length}`);
    }
    
    console.log(`Всего найдено ${updates.length} записей для обновления`);
    
    const sqlContent = updates.join('\n');
    await fs.writeFile('data/update-status-reasons.sql', sqlContent);
    console.log('SQL сохранен в data/update-status-reasons.sql');
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

main().catch(console.error);
