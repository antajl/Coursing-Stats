// In-Memory Test Fixture Generator for RKF Calendars
import XLSX from 'xlsx';

export function createMockRkfCalendarBuffer() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Coursing
  const coursingData = [
    ['РЕЕСТР МЕРОПРИЯТИЙ ПО КУРСИНГУ БОРЗЫХ НА 2026 ГОД'],
    ['№ п/п', 'Дата', 'Ранг состязания', 'Место проведения', 'Организатор', 'Статус', 'Номер в календаре', 'Судьи'],
    ['1', '10-11.05.2026', 'ЧРКФ-CACL', 'Суханово (Московская обл.)', 'МОКО Русский простор', 'Утверждено', '2026/К-12', 'Козлова И.В.'],
    ['2', '24.05.2026', 'CACL', 'Кадниково (Свердловская обл.)', 'СООК Догвилл', 'На согласовании', '', 'Иванов А.А.'],
    ['3', '06.06.2026', 'Сертификатные', 'Тверь', 'ТГОО Клуб Борзых', 'Отклонено', '', '']
  ];
  const wsCoursing = XLSX.utils.aoa_to_sheet(coursingData);
  XLSX.utils.book_append_sheet(wb, wsCoursing, 'Курсинг борзых');

  // Sheet 2: Agility
  const agilityData = [
    ['Дата проведения', 'Ранг', 'Город', 'Клуб', 'Статус согласования', 'Код'],
    ['15.08.2026', 'ЧР', 'Москва', 'КЦ Сокольники', 'В графике', '2026/А-05']
  ];
  const wsAgility = XLSX.utils.aoa_to_sheet(agilityData);
  XLSX.utils.book_append_sheet(wb, wsAgility, 'Аджилити');

  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
