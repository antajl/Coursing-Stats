import fs from "node:fs/promises";

// Скрипт для обновления raw_scores_json с номерами забегов и цветами попон
// для записей с disqualified/withdrawn/dnf статусом в формате simplified_2024

function extractBibNumberFromRawText(rawText) {
  if (!rawText) return null;
  
  // Ищем номер в ячейке с bgcolor (обычно после клички)
  const match = rawText.match(/bgcolor="[^"]*">\s*<font[^>]*>\s*<i>(\d+)<\/i>/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

function extractBibColorFromRawText(rawText) {
  if (!rawText) return null;
  
  // Ищем bgcolor в ячейке с номером забега
  const match = rawText.match(/bgcolor="([^"]+)">\s*<font[^>]*>\s*<i>\d+<\/i>/);
  if (match) {
    const color = match[1];
    // Конвертируем hex в стандартные названия
    if (color === '#ff0000' || color === '#FF0000') return 'red';
    if (color === '#f0ffff' || color === '#F0FFFF') return '#f0ffff';
    if (color === '#ffffff' || color === '#FFFFFF') return 'white';
    if (color === '#0000ff' || color === '#0000FF') return 'blue';
    return color;
  }
  
  return null;
}

function extractDisqualificationReasonFromRawText(rawText) {
  if (!rawText) return null;
  
  // Ищем текст в ячейке с colspan=6
  const match = rawText.match(/colspan="6"[^>]*>\s*<font[^>]*>\s*([^<]+)\s*<\/font>/);
  if (match) {
    return match[1].trim();
  }
  
  return null;
}

async function main() {
  console.log('Генерация SQL для обновления bib_number и bib_color...');
  
  const { execSync } = await import('child_process');
  
  try {
    // Получаем все записи с disqualified/withdrawn/dnf статусом в формате simplified_2024 без bib_number
    const output = execSync('wrangler d1 execute pc-db --local --command="SELECT id, raw_text FROM results WHERE status IN (\'disqualified\', \'withdrawn\', \'dnf\') AND raw_scores_json LIKE \'%simplified_2024%\' AND raw_scores_json NOT LIKE \'%bib_number%\'" --json', { encoding: 'utf8' });
    
    const jsonData = JSON.parse(output);
    const results = Array.isArray(jsonData) ? jsonData[0]?.results || [] : jsonData.results || [];
    
    console.log(`Найдено ${results.length} записей для обработки`);
    
    if (results.length === 0) {
      console.log('Не найдено записей для обработки.');
      return;
    }
    
    const updates = [];
    
    for (const row of results) {
      const bibNumber = extractBibNumberFromRawText(row.raw_text);
      const bibColor = extractBibColorFromRawText(row.raw_text);
      const disqualificationReason = extractDisqualificationReasonFromRawText(row.raw_text);
      
      if (bibNumber) {
        // Создаем новый raw_scores_json с информацией о забеге
        const newRawScores = {
          heats: [{
            heat_number: 1,
            bib_number: bibNumber,
            bib_color: bibColor,
            judges: [],
            total: null,
            disqualified: disqualificationReason ? true : false,
            disqualification_reason: disqualificationReason
          }],
          raw_total: null,
          judge_count: 2,
          normalized_score: null,
          format: "simplified_2024"
        };
        
        const escapedJson = JSON.stringify(newRawScores).replace(/'/g, "''");
        updates.push(`UPDATE results SET raw_scores_json = '${escapedJson}' WHERE id = ${row.id};`);
        console.log(`ID ${row.id}: bib=${bibNumber}, color=${bibColor}, reason=${disqualificationReason}`);
      }
    }
    
    console.log(`Всего найдено ${updates.length} записей для обновления`);
    
    const sqlContent = updates.join('\n');
    await fs.writeFile('data/update-missing-bib-numbers.sql', sqlContent);
    console.log('SQL сохранен в data/update-missing-bib-numbers.sql');
    
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

main().catch(console.error);
