import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSpeedRecords, useCoursingRecords } from '../../hooks/useApi';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import SpeedRecordsStats from './Stats';

function SpeedRecords() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'table');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  // React Query хуки для данных
  const speedRecordsQuery = useSpeedRecords('', '', 1000, '', '');
  const coursingRecordsQuery = useCoursingRecords('', 1000, '', '');
  
  // Локальное состояние для фильтров
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
  
  // Обработка данных из React Query
  // API возвращает { success: true, data: [...] }
  const speedRecordsData = speedRecordsQuery.data?.success ? (Array.isArray(speedRecordsQuery.data.data) ? speedRecordsQuery.data.data : []) : [];
  const coursingRecordsData = coursingRecordsQuery.data?.success ? (Array.isArray(coursingRecordsQuery.data.data) ? coursingRecordsQuery.data.data : []) : [];
  
  // Обработка coursing records с группировкой
  const coursingRecords = useMemo(() => 
    coursingRecordsData.map(record => ({
      ...record,
      history: record.history ? JSON.parse(record.history) : []
    })),
    [coursingRecordsData]
  );
  
  const bestCoursingRecords = useMemo(() => {
    const records = [];
    const seenKeys = new Set();
    const sortedCoursingRecords = [...coursingRecords].sort((a, b) => a.time_seconds - b.time_seconds);
    
    for (const record of sortedCoursingRecords) {
      const key = `${record.name}_${record.breed}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        records.push(record);
      }
    }
    return records;
  }, [coursingRecords]);

  // Фильтрация бегов борзых по поиску
  const filteredCoursingRecords = useMemo(() => {
    let filtered = bestCoursingRecords;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(query)
      );
    }
    
    if (filterBreeds.length > 0) {
      filtered = filtered.filter(record => filterBreeds.includes(record.breed));
    }
    
    if (filterYears.length > 0) {
      filtered = filtered.filter(record => filterYears.includes(record.date.split('.')[2]));
    }
    
    return filtered;
  }, [bestCoursingRecords, searchQuery, filterBreeds, filterYears]);
  
  // Обработка speed records с группировкой
  const speedRecordsWithHistory = useMemo(() => 
    speedRecordsData.map(record => ({
      ...record,
      history: record.history ? JSON.parse(record.history) : []
    })),
    [speedRecordsData]
  );
  
  const bestSpeedRecords = useMemo(() => {
    const records = [];
    const seenSpeedKeys = new Set();
    const sortedSpeedRecords = [...speedRecordsWithHistory].sort((a, b) => b.speed_km_h - a.speed_km_h);
    
    for (const record of sortedSpeedRecords) {
      const key = `${record.name}_${record.breed}`;
      if (!seenSpeedKeys.has(key)) {
        seenSpeedKeys.add(key);
        records.push(record);
      }
    }
    
    return records;
  }, [speedRecordsWithHistory]);
  
  const allRecords = bestSpeedRecords;
  
  // Loading и error из React Query
  const loading = speedRecordsQuery.isLoading || coursingRecordsQuery.isLoading;
  const error = speedRecordsQuery.error || coursingRecordsQuery.error;
  const coursingLoading = coursingRecordsQuery.isLoading;
  
  // Состояние для dropdown menus
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Ref для закрытия dropdown при клике вне
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFilters = useCallback((baseRecords) => {
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
    
    return sorted;
  }, [filterYears, filterBreeds, filterSexes, searchQuery, sortField, sortDirection]);

  const filteredRecords = useMemo(() => {
    return applyFilters(allRecords);
  }, [allRecords, applyFilters]);

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

  function exportCoursingToExcel() {
    // Заголовки Excel для бегов борзых
    const headers = ['Кличка', 'Порода', 'Время (сек)', 'Дата'];
    
    // Данные для экспорта (только отфильтрованные записи)
    const excelData = filteredCoursingRecords.map(record => ({
      'Кличка': record.name,
      'Порода': record.breed,
      'Время (сек)': record.time_seconds,
      'Дата': record.date
    }));
    
    // Создаем книгу Excel
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Беги борзых');
    
    // Скачиваем файл
    XLSX.writeFile(workbook, `беги-борзых-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  const hasActiveFilters = filterYears.length > 0 || filterBreeds.length > 0 || filterSexes.length > 0 || searchQuery;

  const coursingYears = [...new Set(bestCoursingRecords.map(r => r.date.split('.')[2]))].sort().reverse();
  const coursingBreeds = [...new Set(bestCoursingRecords.map(r => r.breed))].sort();

  const years = [...new Set(allRecords.map(r => r.date.split('.')[2]))].sort().reverse();
  const breeds = [...new Set(allRecords.map(r => r.breed))].sort();
  const sexes = [...new Set(allRecords.map(r => r.sex))].sort();

  return (
    <div className="space-y-6">
      <div className="bg-cream-50/90 dark:bg-charcoal-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
        <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 bg-old-money-100 dark:bg-charcoal-700 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => handleTabChange('table')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'table'
                ? 'bg-white dark:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-200 shadow-sm'
                : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-700 dark:hover:text-charcoal-200'
            }`}
          >
            <span className="md:hidden">Скорость</span>
            <span className="hidden md:inline">Замер скорости</span>
          </button>
          <button
            onClick={() => handleTabChange('coursing')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'coursing'
                ? 'bg-white dark:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-200 shadow-sm'
                : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-700 dark:hover:text-charcoal-200'
            }`}
          >
            <span className="md:hidden">Бега</span>
            <span className="hidden md:inline">Бега борзых</span>
          </button>
          <button
            onClick={() => handleTabChange('stats')}
            className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-200 shadow-sm'
                : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-700 dark:hover:text-charcoal-200'
            }`}
          >
            <span className="md:hidden">Статистика</span>
            <span className="hidden md:inline">Статистика Донино</span>
          </button>
        </div>

        {activeTab === 'table' && (
          <div className="space-y-6">
            <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 flex-wrap" ref={dropdownRef}>
              <div className="flex-1 min-w-[120px] relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                />
              </div>
              <div className="flex-1 min-w-[100px] relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                  className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                >
                  {filterYears.length > 0 ? `Год: ${filterYears.length}` : 'Год'}
                </button>
                {openDropdown === 'year' && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
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
              <div className="flex-1 min-w-[120px] relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'breed' ? null : 'breed')}
                  className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                >
                  {filterBreeds.length > 0 ? `Порода: ${filterBreeds.length}` : 'Порода'}
                </button>
                {openDropdown === 'breed' && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
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
              <div className="flex-1 min-w-[80px] relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sex' ? null : 'sex')}
                  className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                >
                  {filterSexes.length > 0 ? `Пол: ${filterSexes.length}` : 'Пол'}
                </button>
                {openDropdown === 'sex' && (
                  <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
                    {sexes.map(sex => (
                      <label key={sex} className="flex items-center px-4 py-2 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer">
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
              <div className="flex items-end">
                <button
                  onClick={exportToExcel}
                  className="rounded-xl border border-camel-300 dark:border-camel-600 px-4 py-3 font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700"
                >
                  Скачать Excel
                </button>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="rounded-xl border border-red-300 dark:border-red-600 px-4 py-3 font-semibold text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    Сбросить
                  </button>
                </div>
              )}
            </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent"></div>
            <p className="mt-4 text-old-money-600 dark:text-old-money-400">Загрузка...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300">
            Ошибка: {error instanceof Error ? error.message : String(error)}
          </div>
        )}

        {!loading && !error && filteredRecords.length === 0 && (
          <div className="text-center py-12 text-old-money-600 dark:text-old-money-400">
            Нет данных
          </div>
        )}

        {!loading && !error && filteredRecords.length > 0 && (
          <div className="rounded-xl border border-old-money-200 dark:border-charcoal-600 overflow-hidden">
            {/* Mobile cards */}
            <div className="md:hidden space-y-3 p-3">
              {filteredRecords.map((record) => (
                <div key={record.id} className="bg-white dark:bg-charcoal-800 rounded-xl p-4 shadow-sm border border-cream-200 dark:border-charcoal-600">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div 
                        className={`font-bold text-charcoal-900 dark:text-charcoal-100 mb-1 cursor-pointer hover:text-camel-700 dark:hover:text-camel-400 transition-colors ${
                          record.dog_id ? '' : 'cursor-default'
                        }`}
                        onClick={() => {
                          if (record.dog_id) {
                            navigate(`/dog/${record.dog_id}`, { state: { from: 'speed-records' } });
                          }
                        }}
                      >
                        {record.name}
                      </div>
                      <div className="text-xs text-old-money-600 dark:text-old-money-400">{record.breed} • {record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}</div>
                      <div className="text-xs text-old-money-500 dark:text-old-money-400 mt-1">{record.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{record.speed_km_h}</div>
                      <div className="text-xs text-old-money-500 dark:text-old-money-400">км/ч</div>
                    </div>
                  </div>
                  {record.screenshot_url && (
                    <a
                      href={record.screenshot_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-xs text-camel-700 dark:text-camel-400 hover:text-camel-800 dark:hover:text-camel-300 font-semibold"
                    >
                      Открыть скриншот →
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
              <thead className="bg-cream-100 dark:bg-charcoal-700">
                <tr>
                  <th 
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('name')}
                  >
                    Кличка {sortField === 'name' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('sex')}
                  >
                    Пол {sortField === 'sex' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('breed')}
                  >
                    Порода {sortField === 'breed' && (sortDirection === 'desc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('speed_km_h')}
                  >
                    Скорость {sortField === 'speed_km_h' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th 
                    className="cursor-pointer px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200 transition-colors hover:bg-cream-200 dark:hover:bg-charcoal-600"
                    onClick={() => handleSort('date')}
                  >
                    Дата {sortField === 'date' && (sortDirection === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">Скриншот</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span
                        className="font-semibold text-charcoal-900 dark:text-charcoal-100 transition-colors cursor-pointer hover:text-camel-700 dark:hover:text-camel-400"
                        onClick={() => {
                          navigate(`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`, { state: { from: 'speed-records' } });
                        }}
                      >
                        {record.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}</td>
                    <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.breed}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="relative inline-block">
                        <span className="inline-block rounded-full bg-camel-600 px-3 py-1 text-sm font-bold text-white shadow-sm">
                          {record.speed_km_h} км/ч
                        </span>
                        {record.status === 'new' && (
                          <span className="absolute -right-4 -top-3 rounded border border-red-300 bg-red-100 px-1 py-0.5 text-[10px] font-bold text-red-600 shadow-sm">new</span>
                        )}
                        {(record.status === 'improved' || (record.history && record.history.length > 0)) && (
                          <span className="absolute -right-4 -top-3 rounded border border-warm-blue-300 bg-warm-blue-100 px-1 py-0.5 text-[10px] font-bold text-warm-blue-700 shadow-sm">upd</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.date}</td>
                    <td className="px-6 py-4 text-center">
                      {record.screenshot_url && (
                        <a
                          href={record.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-camel-700 transition-colors hover:text-camel-800"
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
          </div>
        )}
          </div>
        )}

        {activeTab === 'coursing' && (
          <div className="space-y-6">
            {coursingLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-500 border-t-transparent"></div>
                <p className="mt-4 text-old-money-600">Загрузка рекордов курсинга...</p>
              </div>
            ) : (
              <>
                {/* Фильтры для бегов борзых */}
                <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 flex-wrap" ref={dropdownRef}>
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Поиск по кличке..."
                      className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                    />
                  </div>
                  <div className="flex-1 min-w-[120px] relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                      className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                    >
                      {filterYears.length > 0 ? `Выбрано: ${filterYears.length}` : 'Год'}
                    </button>
                    {openDropdown === 'year' && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
                        {coursingYears.map(year => (
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
                  <div className="flex-1 min-w-[120px] relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === 'breed' ? null : 'breed')}
                      className="w-full rounded-xl border border-old-money-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 px-4 py-3 text-left text-charcoal-800 dark:text-charcoal-200 shadow-sm transition-all duration-200 hover:bg-cream-50 dark:hover:bg-charcoal-700 focus:border-camel-500 focus:outline-none focus:ring-4 focus:ring-camel-100 dark:focus:ring-camel-900"
                    >
                      {filterBreeds.length > 0 ? `Выбрано: ${filterBreeds.length}` : 'Порода'}
                    </button>
                    {openDropdown === 'breed' && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 shadow-xl">
                        {coursingBreeds.map(breed => (
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
                  <div className="flex items-end">
                    <button
                      onClick={exportCoursingToExcel}
                      className="rounded-xl border border-camel-300 dark:border-camel-600 px-4 py-3 font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700"
                    >
                      Скачать Excel
                    </button>
                  </div>
                  {(searchQuery || filterBreeds.length > 0 || filterYears.length > 0) && (
                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setFilterBreeds([]);
                          setFilterYears([]);
                        }}
                        className="rounded-xl border border-red-300 dark:border-red-600 px-4 py-3 font-semibold text-red-600 dark:text-red-400 transition-all hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        Сбросить
                      </button>
                    </div>
                  )}
                </div>

                {/* Таблица бегов борзых */}
                <div className="rounded-xl border border-old-money-200 dark:border-charcoal-600 overflow-hidden">
                  {/* Mobile cards */}
                  <div className="md:hidden space-y-3 p-3">
                    {filteredCoursingRecords.map((record) => (
                      <div key={record.id} className="bg-white dark:bg-charcoal-800 rounded-xl p-4 shadow-sm border border-cream-200 dark:border-charcoal-600">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div 
                              className="font-bold text-charcoal-900 dark:text-charcoal-100 mb-1 cursor-pointer hover:text-camel-700 dark:hover:text-camel-400 transition-colors"
                              onClick={() => {
                                navigate(`/donino-dog/${encodeURIComponent(record.name)}/${encodeURIComponent(record.breed)}`, { state: { from: 'coursing-records' } });
                              }}
                            >
                              {record.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{record.breed}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{record.time_seconds}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">350 м</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-cream-100 dark:bg-charcoal-700">
                        <tr>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">Кличка</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">Порода</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">Время (350 метров)</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-charcoal-700 dark:text-charcoal-200">Дата</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-old-money-200 dark:divide-charcoal-600">
                        {filteredCoursingRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700 transition-colors">
                            <td className="px-6 py-4 text-center">
                              <span 
                                className="font-semibold text-charcoal-900 dark:text-charcoal-100 transition-colors cursor-pointer hover:text-camel-700 dark:hover:text-camel-400"
                                onClick={() => {
                                  if (record.dog_id) {
                                    navigate(`/dog/${record.dog_id}`, { state: { from: 'coursing-records' } });
                                  }
                                }}
                              >
                                {record.name}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.breed}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="relative inline-block">
                                <span className="inline-block px-3 py-1 rounded-full bg-camel-600 text-white font-bold text-sm">
                                  {record.time_seconds} сек
                                </span>
                                {record.history && record.history.length > 0 && (
                                  <span className="absolute -right-4 -top-3 rounded border border-warm-blue-300 bg-warm-blue-100 px-1 py-0.5 text-[10px] font-bold text-warm-blue-700 shadow-sm">upd</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-old-money-800 dark:text-old-money-300">{record.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'stats' && <SpeedRecordsStats />}
      </div>
    </div>
  );
}

export default SpeedRecords;
