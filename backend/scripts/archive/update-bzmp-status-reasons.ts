import fs from "node:fs/promises";

// Скрипт для обновления status_reason в БЗМП турнирах
// Извлекает причины из raw_text для записей с unknown_status_check_raw_text

function extractReasonFromRawText(rawText) {
  if (!rawText) return null;
  
  // Сначала ищем текст в скобках после ключевых слов
  const match = rawText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|сош[её]л|сошла|сошло)[^(]*\(([^)]+)\)/i);
  if (match) {
    return match[1].trim();
  }
  
  // Если не нашли в скобках, ищем просто текст статуса
  const statusMatch = rawText.match(/(?:отстранение|неявка|снят|снята|снятие|ветеринар|владелец|дисквал|не\s*финиш|сош[еелла]*|сход|уход|сош[её]л|сошла|сошло)/i);
  if (statusMatch) {
    return statusMatch[0].trim();
  }
  
  return null;
}

function detectStatusFromReason(reason) {
  if (!reason) return null;
  
  const normalized = reason.toLowerCase().replace(/ё/g, "е");
  
  if (/неявка|неприбыв/.test(normalized)) {
    return 'dns';
  }
  
  if (/отстран/.test(normalized)) {
    return 'disqualified';
  }
  
  if (/снят|снята|снятие/.test(normalized)) {
    return 'withdrawn';
  }
  
  if (/сход|возврат|потеря|агрессия|жестокое|нарушение/.test(normalized)) {
    return 'disqualified';
  }
  
  return null;
}

async function main() {
  console.log('Генерация SQL для обновления status_reason в БЗМП турнирах...');
  
  const { execSync } = await import('child_process');
  
  try {
    // Получаем все ID записей с unknown_status_check_raw_text в БЗМП турнирах
    const idsOutput = execSync('wrangler d1 execute pc-db --local --command="SELECT r.id FROM results r JOIN events e ON r.event_id = e.id WHERE e.results_url LIKE \'%BZMP%\' AND r.status = \'unknown_status_check_raw_text\'" --json', { encoding: 'utf8' });
    
    const jsonData = JSON.parse(idsOutput);
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
        const status = detectStatusFromReason(reason);
        
        if (reason && status) {
          updates.push(`UPDATE results SET status = '${status}', status_reason = '${reason.replace(/'/g, "''")}' WHERE id = ${row.id};`);
          console.log(`Найдена причина для ID ${row.id}: ${reason}, статус: ${status}`);
        }
      }
      
      console.log(`Обработано ${Math.min(i + batchSize, ids.length)} из ${ids.length}`);
    }
    
    console.log(`Всего найдено ${updates.length} записей для обновления`);
    
    const sqlContent = updates.join('\n');
    await fs.writeFile('data/update-bzmp-status-reasons.sql', sqlContent);
    console.log('SQL сохранен в data/update-bzmp-status-reasons.sql');
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

main().catch(console.error);
