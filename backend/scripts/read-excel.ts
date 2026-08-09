import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';

const filePath = 'D:\\Downloads\\Новая таблица.xlsx';
const backupPath = 'D:\\Downloads\\Новая таблица backup.xlsx';

// Варианты для замены
const variants = [
  'Московская обл., Раменский р-н, д. Донино',
  'Московская обл., г. Раменское, д. Донино',
  'Московская обл., Раменский городской округ, д. Донино',
  'Московская область, д. Донино',
];

const target = 'Московская область, Раменский городской округ, д. Донино';

try {
  console.log('Чтение файла...');
  const buffer = readFileSync(filePath);
  const workbook = XLSX.read(buffer);
  
  // Создаём бэкап
  console.log('Создание бэкапа...');
  writeFileSync(backupPath, buffer);
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  console.log(`\nОбработка листа "${firstSheetName}"...`);
  
  let replacements = 0;
  
  // Проходим по всем ячейкам напрямую, не трогая структуру
  for (const cellAddress in worksheet) {
    if (cellAddress.startsWith('!')) continue; // Пропускаем метаданные
    
    const cell = worksheet[cellAddress];
    if (!cell || !cell.v) continue;
    
    const cellValue = String(cell.v).trim();
    if (variants.includes(cellValue)) {
      console.log(`Замена в ячейке ${cellAddress}:`);
      console.log(`  Было: "${cellValue}"`);
      console.log(`  Стало: "${target}"`);
      
      // Меняем только значение, сохраняя гиперссылку и всё остальное
      cell.v = target;
      cell.w = target; // Отображаемое значение
      
      replacements++;
    }
  }
  
  console.log(`\nВсего замен: ${replacements}`);
  
  console.log('Сохранение файла...');
  
  // Удаляем старый файл перед записью нового
  if (existsSync(filePath)) {
    console.log('Удаление старого файла...');
    unlinkSync(filePath);
  }
  
  XLSX.writeFile(workbook, filePath);
  
  console.log('✅ Готово! Файл обновлён.');

} catch (error) {
  console.error('❌ Ошибка:', error);
}