import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import SpeedRecordsStats from './SpeedRecordsStats';

function SpeedRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('table');
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]); // Все записи для фильтрации
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterYears, setFilterYears] = useState(() => {
    const years = searchParams.get('years');
    return years ? years.split(',') : [];
  });
  const [filterBreeds, setFilterBreeds] = useState(() => {
    const breeds = searchParams.get('breeds');
    return breeds ? breeds.split(',') : [];
  });
  const [filterSexes, setFilterSexes] = useState(() => {
    const sexes = searchParams.get('sexes');
    return sexes ? sexes.split(',') : [];
  });
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [sortField, setSortField] = useState(() => searchParams.get('sort') || 'speed_km_h');
  const [sortDirection, setSortDirection] = useState(() => searchParams.get('dir') || 'desc');
  
  // Состояние для dropdown menus
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Ref для закрытия dropdown при клике вне
  const dropdownRef = useRef(null);
  
  // Состояние для модального окна истории (не используется, но оставлено для будущего)
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadRecords();
  }, []);

  // Синхронизация фильтров с URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filterYears.length > 0) params.set('years', filterYears.join(','));
    if (filterBreeds.length > 0) params.set('breeds', filterBreeds.join(','));
    if (filterSexes.length > 0) params.set('sexes', filterSexes.join(','));
    if (searchQuery) params.set('search', searchQuery);
    if (sortField !== 'speed_km_h') params.set('sort', sortField);
    if (sortDirection !== 'desc') params.set('dir', sortDirection);
    setSearchParams(params);
  }, [filterYears, filterBreeds, filterSexes, searchQuery, sortField, sortDirection, setSearchParams]);

  async function loadRecords() {
    setLoading(true);
    setError(null);
    const result = await api.getSpeedRecords('', '', 100, '', '');
    
    if (result.success) {
      // Парсим history из JSON
      const recordsWithHistory = result.data.map(record => ({
        ...record,
        history: record.history ? JSON.parse(record.history) : []
      }));
      setAllRecords(recordsWithHistory);
      applyFilters(recordsWithHistory);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  function applyFilters(baseRecords) {
    let filtered = baseRecords;
    
    // Фильтр по годам
    if (filterYears.length > 0) {
      filtered = filtered.filter(record => 
        filterYears.includes(record.date.split('.')[2])
      );
    }
    
    // Фильтр по породам
    if (filterBreeds.length > 0) {
      filtered = filtered.filter(record => 
        filterBreeds.includes(record.breed)
      );
    }
    
    // Фильтр по полу
    if (filterSexes.length > 0) {
      filtered = filtered.filter(record => 
        filterSexes.includes(record.sex)
      );
    }
    
    // Поиск
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(record => {
        const nameMatch = record.name.toLowerCase().includes(searchLower);
        const breedMatch = record.breed.toLowerCase().includes(searchLower);
        
        // Алиасы для поиска по полу
        let sexMatch = record.sex.toLowerCase().includes(searchLower);
        if (!sexMatch) {
          if (searchLower.includes('сука') || searchLower.includes('сук') || searchLower.includes('самка') || searchLower.includes('самки')) {
            sexMatch = record.sex === 'С';
          } else if (searchLower.includes('кабель') || searchLower.includes('кобель') || searchLower.includes('каб') || searchLower.includes('самец') || searchLower.includes('самцы')) {
            sexMatch = record.sex === 'К';
          }
        }
        
        const speedMatch = record.speed_km_h.toString().includes(searchQuery);
        const dateMatch = record.date.includes(searchQuery);
        
        return nameMatch || breedMatch || sexMatch || speedMatch || dateMatch;
      });
    }
    
    // Сортировка
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'speed_km_h') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      
      if (sortField === 'date') {
        const parseDate = (d) => {
          const parts = d.split('.');
          return new Date(parts[2], parts[1] - 1, parts[0]);
        };
        aVal = parseDate(aVal);
        bVal = parseDate(bVal);
      }
      
      // desc = от большего к меньшему (стрелка ↓)
      // asc = от меньшего к большему (стрелка ↑)
      if (sortDirection === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0; // от большего к меньшему
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0; // от меньшего к большему
      }
    });
    
    setRecords(sorted);
  }

  useEffect(() => {
    applyFilters(allRecords);
  }, [filterYears, filterBreeds, filterSexes, searchQuery, sortField, sortDirection]);

  function toggleFilter(type, value) {
    if (type === 'year') {
      setFilterYears(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (type === 'breed') {
      setFilterBreeds(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    } else if (type === 'sex') {
      setFilterSexes(prev => 
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );
    }
  }

  function handleSort(field) {
    if (sortField === field) {
      // Переключаем направление сортировки
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Новое поле - устанавливаем направление по умолчанию
      setSortField(field);
      // Для текстовых полей и даты - asc (по алфавиту/хронологии), для скорости - desc (от большего к меньшему)
      if (field === 'speed_km_h') {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
  }

  async function downloadCardAsImage(recordId, dogName) {
    const element = document.getElementById(`history-card-${recordId}`);
    if (!element) return;

    // Сохраняем текущие классы
    const originalClasses = element.className;
    
    // Делаем элемент видимым для скриншота
    element.classList.remove('opacity-0', 'invisible');
    element.classList.add('opacity-100', 'visible');

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        backgroundColor: '#ffffff',
      });
      
      const link = document.createElement('a');
      link.download = `${dogName}-history.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Ошибка при создании скриншота:', error);
    } finally {
      // Возвращаем исходные классы
      element.className = originalClasses;
    }
  }

  function clearAllFilters() {
    setFilterYears([]);
    setFilterBreeds([]);
    setFilterSexes([]);
    setSearchQuery('');
  }

  function exportToExcel() {
    // Заголовки Excel
    const headers = ['Кличка', 'Пол', 'Порода', 'Скорость (км/ч)', 'Дата', 'Скриншот'];
    
    // Данные для экспорта (только отфильтрованные записи)
    const excelData = records.map(record => ({
      'Кличка': record.name,
      'Пол': record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex,
      'Порода': record.breed,
      'Скорость (км/ч)': record.speed_km_h,
      'Дата': record.date,
      'Скриншот': record.screenshot_url || ''
    }));
    
    // Создаем книгу Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Рекорды');
    
    // Скачиваем файл
    XLSX.writeFile(workbook, `рекорды-донино-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  const hasActiveFilters = filterYears.length > 0 || filterBreeds.length > 0 || filterSexes.length > 0 || searchQuery;

  const years = [...new Set(allRecords.map(r => r.date.split('.')[2]))].sort().reverse();
  const breeds = [...new Set(allRecords.map(r => r.breed))].sort();
  const sexes = [...new Set(allRecords.map(r => r.sex))].sort();

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 p-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'table'
                ? 'bg-camel-600 text-white shadow-lg'
                : 'bg-white text-charcoal-700 border-2 border-cream-300 hover:border-camel-500'
            }`}
          >
            Таблица
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'stats'
                ? 'bg-camel-600 text-white shadow-lg'
                : 'bg-white text-charcoal-700 border-2 border-cream-300 hover:border-camel-500'
            }`}
          >
            Статистика
          </button>
        </div>

        {activeTab === 'table' && (
          <div className="space-y-6">
            <div className="flex gap-4 mb-6" ref={dropdownRef}>
              <div className="flex-1 relative">
                <label className="block text-sm font-semibold text-old-money-700 mb-2">Год</label>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white text-left"
                >
                  {filterYears.length > 0 ? `Выбрано: ${filterYears.length}` : 'Все года'}
                </button>
                {openDropdown === 'year' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-cream-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {years.map(year => (
                      <label key={year} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterYears.includes(year)}
                          onChange={() => toggleFilter('year', year)}
                          className="mr-2"
                        />
                        {year}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <label className="block text-sm font-semibold text-old-money-700 mb-2">Порода</label>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'breed' ? null : 'breed')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white text-left"
                >
                  {filterBreeds.length > 0 ? `Выбрано: ${filterBreeds.length}` : 'Все породы'}
                </button>
                {openDropdown === 'breed' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-cream-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {breeds.map(breed => (
                      <label key={breed} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterBreeds.includes(breed)}
                          onChange={() => toggleFilter('breed', breed)}
                          className="mr-2"
                        />
                        {breed}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <label className="block text-sm font-semibold text-old-money-700 mb-2">Пол</label>
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sex' ? null : 'sex')}
                  className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white text-left"
                >
                  {filterSexes.length > 0 ? `Выбрано: ${filterSexes.length}` : 'Все'}
                </button>
                {openDropdown === 'sex' && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-cream-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {sexes.map(sex => (
                      <label key={sex} className="flex items-center px-4 py-2 hover:bg-cream-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filterSexes.includes(sex)}
                          onChange={() => toggleFilter('sex', sex)}
                          className="mr-2"
                        />
                        {sex === 'С' ? 'Сука' : sex === 'К' ? 'Кабель' : sex}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-old-money-700 mb-2">Поиск</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Имя, порода или дата..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={exportToExcel}
                  className="px-4 py-3 rounded-xl border-2 border-camel-300 text-camel-700 hover:bg-camel-50 transition-all font-semibold"
                >
                  Скачать Excel
                </button>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-3 rounded-xl border-2 border-red-300 text-red-600 hover:bg-red-50 transition-all font-semibold"
                  >
                    Сбросить
                  </button>
                </div>
              )}
            </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent"></div>
            <p className="mt-4 text-old-money-600">Загрузка...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="text-center py-12 text-old-money-600">
            Нет данных
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <div className="rounded-xl border-2 border-cream-300 overflow-visible">
            <table className="w-full">
              <thead className="bg-charcoal-700 text-white">
                <tr>
                  <th 
                    className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-charcoal-600 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Кличка {sortField === 'name' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-charcoal-600 transition-colors"
                    onClick={() => handleSort('sex')}
                  >
                    Пол {sortField === 'sex' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-charcoal-600 transition-colors"
                    onClick={() => handleSort('breed')}
                  >
                    Порода {sortField === 'breed' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-charcoal-600 transition-colors"
                    onClick={() => handleSort('speed_km_h')}
                  >
                    Скорость {sortField === 'speed_km_h' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="px-6 py-4 text-center font-semibold cursor-pointer hover:bg-charcoal-600 transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    Дата {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">Скриншот</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-cream-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-cream-50 transition-colors overflow-visible">
                    <td className="px-6 py-4 text-center overflow-visible">
                      <div className="relative group inline-block">
                        <span className={`font-semibold text-charcoal-900 transition-colors ${
                          record.history && record.history.length > 0 
                            ? 'text-camel-700 hover:text-camel-800 border-2 border-gold-300 rounded-lg px-2 py-0.5' 
                            : ''
                        }`}>
                          {record.name}
                        </span>
                        {record.history && record.history.length > 0 && (
                          <div 
                            id={`history-card-${record.id}`}
                            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-cream-300 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[9999]"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-charcoal-900">{record.name}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadCardAsImage(record.id, record.name);
                                }}
                                className="text-charcoal-400 hover:text-camel-600 transition-colors p-1"
                                title="Скачать скриншот"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-sm text-charcoal-600 mb-3">{record.breed} • {record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}</div>
                            
                            <div className="space-y-2">
                              <div className="bg-camel-50 border border-camel-200 rounded-lg p-2">
                                <div className="text-xs text-charcoal-600">Текущий результат</div>
                                <div className="flex justify-between items-center">
                                  <div className="text-lg font-bold text-camel-700">{record.speed_km_h} км/ч</div>
                                  <div className="text-sm text-charcoal-600">{record.date}</div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-semibold text-charcoal-700 mb-1">Предыдущие результаты:</div>
                                <div className="space-y-1">
                                  {record.history.map((h, idx) => (
                                    <div key={idx} className="bg-cream-50 border border-cream-200 rounded-lg p-2">
                                      <div className="flex justify-between items-center">
                                        <div className="text-sm font-bold text-charcoal-900">{h.speed_km_h} км/ч</div>
                                        <div className="text-xs text-charcoal-600">{h.date}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cream-300"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-charcoal-900">{record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}</td>
                    <td className="px-6 py-4 text-center text-charcoal-900">{record.breed}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <span className="inline-block px-3 py-1 rounded-full bg-camel-600 text-white font-bold text-sm">
                          {record.speed_km_h} км/ч
                        </span>
                        {record.status === 'new' && (
                          <span className="absolute -top-3 -right-4 text-[10px] font-bold text-red-600 bg-red-100 border border-red-300 px-1 py-0.5 rounded shadow-sm">new</span>
                        )}
                        {(record.status === 'improved' || (record.history && record.history.length > 0)) && (
                          <span className="absolute -top-3 -right-4 text-[10px] font-bold text-blue-600 bg-blue-100 border border-blue-300 px-1 py-0.5 rounded shadow-sm">upd</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-charcoal-700">{record.date}</td>
                    <td className="px-6 py-4 text-center">
                      {record.screenshot_url && (
                        <a
                          href={record.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-camel-700 hover:text-camel-800 font-semibold"
                        >
                          Открыть
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
          </div>
        )}

        {activeTab === 'stats' && <SpeedRecordsStats />}
      </div>
    </div>
  );
}

export default SpeedRecords;
