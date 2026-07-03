import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { api } from '../../services/api';
import { dedupeByRecordDate, dedupeSpeedRecords, formatRecordDate, getRecordYear } from '../../lib/recordDates';

function SpeedRecordsStats() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Фильтры
  const [filterYears, setFilterYears] = useState([]);
  const [filterBreeds, setFilterBreeds] = useState([]);
  const [filterSexes, setFilterSexes] = useState([]);
  const [filterMinSpeed, setFilterMinSpeed] = useState('');
  const [filterMaxSpeed, setFilterMaxSpeed] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Состояние для dropdown menus
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // Для интерактивных списков
  
  // Состояние для сортировки
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Состояние для вкладок статистики
  const [statsTab, setStatsTab] = useState('overview');
  
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

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setLoading(true);
    setError(null);
    const result = await api.getSpeedRecords('', '', 10000, '', '');
    
    if (result.success) {
      const dataArray = Array.isArray(result.data) ? result.data : [];
      const recordsWithHistory = dataArray.map(record => ({
        ...record,
        history: record.history ? JSON.parse(record.history) : []
      }));
      setRecords(recordsWithHistory);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

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

  function clearAllFilters() {
    setFilterYears([]);
    setFilterBreeds([]);
    setFilterSexes([]);
    setFilterMinSpeed('');
    setFilterMaxSpeed('');
  }

  function handleSort(key) {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }

  function sortData(data, key) {
    if (!sortConfig.key || sortConfig.key !== key) return data;
    
    return [...data].sort((a, b) => {
      let aVal, bVal;
      
      switch(key) {
        case 'breed':
          aVal = a.breed;
          bVal = b.breed;
          break;
        case 'count':
          aVal = a.count;
          bVal = b.count;
          break;
        case 'avgSpeed':
          aVal = a.avgSpeed;
          bVal = b.avgSpeed;
          break;
        case 'maxSpeed':
          aVal = a.maxSpeed;
          bVal = b.maxSpeed;
          break;
        case 'avgTime350':
          aVal = a.avgTime350;
          bVal = b.avgTime350;
          break;
        case 'bestTime350':
          aVal = a.bestTime350;
          bVal = b.bestTime350;
          break;
        case 'year':
          aVal = a.year;
          bVal = b.year;
          break;
        case 'sex':
          aVal = a.sex;
          bVal = b.sex;
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return sortConfig.direction === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  function applyFilters(data) {
    let filtered = data;
    
    // Поиск по кличке
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.name.toLowerCase().includes(query)
      );
    }
    
    // Фильтр по годам
    if (filterYears.length > 0) {
      filtered = filtered.filter(record => 
        filterYears.includes(String(getRecordYear(record.date)))
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
    
    // Фильтр по диапазону скорости
    if (filterMinSpeed) {
      filtered = filtered.filter(record => parseFloat(record.speed_km_h) >= parseFloat(filterMinSpeed));
    }
    if (filterMaxSpeed) {
      filtered = filtered.filter(record => parseFloat(record.speed_km_h) <= parseFloat(filterMaxSpeed));
    }
    
    return filtered;
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-charcoal-900 dark:text-charcoal-100">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-camel-600 border-t-transparent"></div>
        <p className="mt-4 text-old-money-600 dark:text-old-money-400">Загрузка статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300">
        Ошибка: {error}
      </div>
    );
  }

  // Применяем фильтры к данным
  const filteredRecords = applyFilters(records);
  const uniqueMeasurements = dedupeSpeedRecords(filteredRecords);
  
  // Расчёт статистики обзора на уникальных замерах (как вкладки порода/пол/год)
  const totalRecords = uniqueMeasurements.length;
  const averageSpeed = totalRecords > 0 ? uniqueMeasurements.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / totalRecords : 0;
  const maxSpeed = totalRecords > 0 ? Math.max(...uniqueMeasurements.map(r => parseFloat(r.speed_km_h))) : 0;
  const minSpeed = totalRecords > 0 ? Math.min(...uniqueMeasurements.map(r => parseFloat(r.speed_km_h))) : 0;
  
  const breeds = [...new Set(uniqueMeasurements.map(r => r.breed))];
  const breedStats = breeds.map(breed => {
    const breedRecords = uniqueMeasurements.filter(r => r.breed === breed);
    const avgSpeed = breedRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / breedRecords.length;
    const maxSpeed = Math.max(...breedRecords.map(r => parseFloat(r.speed_km_h)));
    const avgTime350 = avgSpeed > 0 ? (1260 / avgSpeed).toFixed(2) : '-';
    const bestTime350 = maxSpeed > 0 ? (1260 / maxSpeed).toFixed(2) : '-';
    const names = [...new Set(breedRecords.map(r => r.name))].sort().join(', ');
    return { breed, count: breedRecords.length, avgSpeed, maxSpeed, avgTime350, bestTime350, names };
  });
  const sortedBreedStats = sortData(breedStats, sortConfig.key);

  // Карта породных средних для сравнения
  const breedAverageMap = new Map();
  breedStats.forEach(stat => {
    breedAverageMap.set(stat.breed, stat.avgSpeed);
  });

  // Поиск конкретной собаки
  const searchedDog = searchQuery ? filteredRecords.find(r => 
    r.name.toLowerCase() === searchQuery.toLowerCase()
  ) : null;

  // Статистика найденной собаки
  const dogStats = searchedDog ? (() => {
    const dogRecords = filteredRecords.filter(r => 
      r.name.toLowerCase() === searchedDog.name.toLowerCase() &&
      r.breed === searchedDog.breed &&
      r.sex === searchedDog.sex
    );
    const bestSpeed = Math.max(...dogRecords.map(r => parseFloat(r.speed_km_h)));
    const avgSpeed = dogRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / dogRecords.length;
    const breedAvg = breedAverageMap.get(searchedDog.breed) || 0;
    const diffFromBreedAvg = breedAvg > 0 ? ((bestSpeed - breedAvg) / breedAvg * 100).toFixed(1) : 0;
    
    // Процентиль в породе
    const breedDogs = [...new Set(filteredRecords.filter(r => r.breed === searchedDog.breed).map(r => r.name))];
    const breedBestSpeeds = breedDogs.map(name => {
      const dogRecs = filteredRecords.filter(r => r.name === name && r.breed === searchedDog.breed);
      return Math.max(...dogRecs.map(r => parseFloat(r.speed_km_h)));
    }).sort((a, b) => b - a);
    const percentile = breedBestSpeeds.length > 0 
      ? ((breedBestSpeeds.findIndex(s => s <= bestSpeed) + 1) / breedBestSpeeds.length * 100).toFixed(0)
      : 0;
    
    // Рейтинг в породе
    const rank = breedBestSpeeds.findIndex(s => s === bestSpeed) + 1;
    
    return {
      ...searchedDog,
      bestSpeed,
      avgSpeed,
      breedAvg,
      diffFromBreedAvg,
      percentile,
      rank,
      totalInBreed: breedBestSpeeds.length,
      history: dedupeByRecordDate(
        dogRecords,
        (candidate, existing) => parseFloat(candidate.speed_km_h) > parseFloat(existing.speed_km_h)
      )
    };
  })() : null;

  const sexes = [...new Set(uniqueMeasurements.map(r => r.sex))];
  const sexStats = sexes.map(sex => {
    const sexRecords = uniqueMeasurements.filter(r => r.sex === sex);
    const avgSpeed = sexRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / sexRecords.length;
    const maxSpeed = Math.max(...sexRecords.map(r => parseFloat(r.speed_km_h)));
    const avgTime350 = avgSpeed > 0 ? (1260 / avgSpeed).toFixed(2) : '-';
    const bestTime350 = maxSpeed > 0 ? (1260 / maxSpeed).toFixed(2) : '-';
    const names = [...new Set(sexRecords.map(r => r.name))].sort().join(', ');
    return { sex: sex === 'С' ? 'Сука' : 'Кабель', count: sexRecords.length, avgSpeed, maxSpeed, avgTime350, bestTime350, names };
  });
  const sortedSexStats = sortData(sexStats, sortConfig.key);

  const years = [...new Set(uniqueMeasurements.map(r => String(getRecordYear(r.date))).filter(Boolean))].sort();
  const yearStats = years.map(year => {
    const yearRecords = uniqueMeasurements.filter(r => String(getRecordYear(r.date)) === year);
    const avgSpeed = yearRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / yearRecords.length;
    const maxSpeed = Math.max(...yearRecords.map(r => parseFloat(r.speed_km_h)));
    const avgTime350 = avgSpeed > 0 ? (1260 / avgSpeed).toFixed(2) : '-';
    const bestTime350 = maxSpeed > 0 ? (1260 / maxSpeed).toFixed(2) : '-';
    const names = [...new Set(yearRecords.map(r => r.name))].sort().join(', ');
    return { year, count: yearRecords.length, avgSpeed, maxSpeed, avgTime350, bestTime350, names };
  });
  const sortedYearStats = sortData(yearStats, sortConfig.key);

  // Данные для dropdown menus
  const allYears = [...new Set(records.map(r => String(getRecordYear(r.date))).filter(Boolean))].sort().reverse();
  const allBreeds = [...new Set(records.map(r => r.breed))].sort();
  const allSexes = [...new Set(records.map(r => r.sex))].sort();
  
  // Топ собак по скорости - только лучшие результаты для каждой собаки
  const topDogs = (() => {
    const dogsMap = new Map();
    
    // Группируем по собаке и сохраняем только лучший результат
    filteredRecords.forEach(record => {
      const key = `${record.name}_${record.breed}_${record.sex}`;
      const currentBest = dogsMap.get(key);
      
      if (!currentBest || parseFloat(record.speed_km_h) > parseFloat(currentBest.speed_km_h)) {
        dogsMap.set(key, record);
      }
    });
    
    // Получаем массив лучших результатов и сортируем по скорости
    return Array.from(dogsMap.values())
      .sort((a, b) => parseFloat(b.speed_km_h) - parseFloat(a.speed_km_h))
      .slice(0, 20);
  })();

  const hasActiveFilters = filterYears.length > 0 || filterBreeds.length > 0 || filterSexes.length > 0 || filterMinSpeed || filterMaxSpeed;

  return (
    <div className="space-y-6">
      {/* Вкладки статистики */}
      <div className="flex gap-2 border-b-2 border-cream-300 dark:border-charcoal-600 pb-2 overflow-x-auto scrollbar-thin scrollbar-gray-300">
        <button
          onClick={() => setStatsTab('overview')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            statsTab === 'overview'
              ? 'bg-camel-600 text-white shadow-md'
              : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600 hover:text-charcoal-900 dark:hover:text-charcoal-100'
          }`}
        >
          Обзор
        </button>
        <button
          onClick={() => setStatsTab('breeds')}
          className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            statsTab === 'breeds'
              ? 'bg-camel-600 text-white shadow-md'
              : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600 hover:text-charcoal-900 dark:hover:text-charcoal-100'
          }`}
        >
          Порода
        </button>
        <button
          onClick={() => setStatsTab('sex')}
          className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            statsTab === 'sex'
              ? 'bg-camel-600 text-white shadow-md'
              : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600 hover:text-charcoal-900 dark:hover:text-charcoal-100'
          }`}
        >
          Пол
        </button>
        <button
          onClick={() => setStatsTab('years')}
          className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
            statsTab === 'years'
              ? 'bg-camel-600 text-white shadow-md'
              : 'bg-cream-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-200 hover:bg-cream-200 dark:hover:bg-charcoal-600 hover:text-charcoal-900 dark:hover:text-charcoal-100'
          }`}
        >
          Год
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 md:gap-4 mb-6 flex-wrap" ref={dropdownRef}>
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по кличке..."
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-charcoal-100"
          />
        </div>
        <div className="flex-1 min-w-[120px] relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white dark:bg-charcoal-800 text-left text-charcoal-900 dark:text-charcoal-100"
          >
            {filterYears.length > 0 ? `Выбрано: ${filterYears.length}` : 'Год'}
          </button>
          {openDropdown === 'year' && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-charcoal-800 border-2 border-cream-300 dark:border-charcoal-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {allYears.map(year => (
                <label key={year} className="flex items-center px-4 py-2 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer text-charcoal-900 dark:text-charcoal-100">
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
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white dark:bg-charcoal-800 text-left text-charcoal-900 dark:text-charcoal-100"
          >
            {filterBreeds.length > 0 ? `Выбрано: ${filterBreeds.length}` : 'Порода'}
          </button>
          {openDropdown === 'breed' && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-charcoal-800 border-2 border-cream-300 dark:border-charcoal-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {allBreeds.map(breed => (
                <label key={breed} className="flex items-center px-4 py-2 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer text-charcoal-900 dark:text-charcoal-100">
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
        <div className="flex-1 min-w-[100px] relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'sex' ? null : 'sex')}
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white dark:bg-charcoal-800 text-left text-charcoal-900 dark:text-charcoal-100"
          >
            {filterSexes.length > 0 ? `Выбрано: ${filterSexes.length}` : 'Пол'}
          </button>
          {openDropdown === 'sex' && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-charcoal-800 border-2 border-cream-300 dark:border-charcoal-600 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {allSexes.map(sex => (
                <label key={sex} className="flex items-center px-4 py-2 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer text-charcoal-900 dark:text-charcoal-100">
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
        <div className="flex-1 min-w-[100px]">
          <input
            type="number"
            value={filterMinSpeed}
            onChange={(e) => setFilterMinSpeed(e.target.value)}
            placeholder="Мин. скорость"
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-charcoal-100"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <input
            type="number"
            value={filterMaxSpeed}
            onChange={(e) => setFilterMaxSpeed(e.target.value)}
            placeholder="Макс. скорость"
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 dark:border-charcoal-600 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-charcoal-100"
          />
        </div>
        {hasActiveFilters && (
          <div className="flex items-end">
            <button
              onClick={clearAllFilters}
              className="px-4 py-3 rounded-xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-all font-semibold"
            >
              Сбросить
            </button>
          </div>
        )}
      </div>

      {/* Статистика найденной собаки */}
      {dogStats && (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md">
          <h2 className="text-xl lg:text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">
            Статистика: {dogStats.name} ({dogStats.breed}, 350 метров)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
              <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-1 uppercase tracking-wide">Лучшая скорость</div>
              <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">{dogStats.bestSpeed} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
            </div>
            <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
              <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Средняя скорость</div>
              <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{dogStats.avgSpeed.toFixed(1)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
            </div>
            <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
              <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Среднее по породе</div>
              <div className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100">{dogStats.breedAvg.toFixed(1)} <span className="text-sm font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
            </div>
            <div className="bg-gradient-to-br from-old-money-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-old-money-200 dark:border-charcoal-500">
              <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Отличие от среднего</div>
              <div className={`text-2xl font-bold ${parseFloat(dogStats.diffFromBreedAvg) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {parseFloat(dogStats.diffFromBreedAvg) >= 0 ? '+' : ''}{dogStats.diffFromBreedAvg}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
              <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Рейтинг в породе</div>
              <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">#{dogStats.rank} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">из {dogStats.totalInBreed}</span></div>
            </div>
            <div className="bg-gradient-to-br from-camel-50 dark:from-charcoal-700 to-cream-100 dark:to-charcoal-600 rounded-xl p-4 border border-camel-200 dark:border-charcoal-500">
              <div className="text-xs font-medium text-old-money-600 mb-1 uppercase tracking-wide">Процентиль</div>
              <div className="text-2xl font-bold text-camel-700 dark:text-camel-400">Топ <span className="text-charcoal-600 dark:text-charcoal-400">{100 - dogStats.percentile}%</span></div>
            </div>
          </div>

          {/* График прогресса */}
          <div>
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-charcoal-100 mb-3">Прогресс во времени</h3>
            <div className="space-y-2">
              {dogStats.history.map((record, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right">{formatRecordDate(record.date)}</div>
                  <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden relative">
                    <div 
                      className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(parseFloat(record.speed_km_h) / 80) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-charcoal-900 dark:text-charcoal-100">
                      {record.speed_km_h} км/ч
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Контент вкладок */}
      {statsTab === 'overview' && (
        <>
          {/* Общая статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-2 uppercase tracking-wide">Всего записей</div>
              <div className="text-3xl font-bold text-charcoal-900 dark:text-charcoal-100">{totalRecords}</div>
            </div>
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-camel-300 dark:border-camel-600 p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-2 uppercase tracking-wide">Средняя скорость</div>
              <div className="text-3xl font-bold text-camel-700 dark:text-camel-400">{averageSpeed.toFixed(1)} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
            </div>
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-camel-300 dark:border-camel-600 p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-2 uppercase tracking-wide">Лучшая скорость</div>
              <div className="text-3xl font-bold text-camel-700 dark:text-camel-400">{maxSpeed} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
            </div>
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-xs font-medium text-old-money-600 dark:text-old-money-400 mb-2 uppercase tracking-wide">Минимальная скорость</div>
              <div className="text-3xl font-bold text-charcoal-900 dark:text-charcoal-100">{minSpeed} <span className="text-base font-normal text-charcoal-600 dark:text-charcoal-400">км/ч</span></div>
            </div>
          </div>

          {/* График распределения скоростей */}
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md">
            <h2 className="text-xl lg:text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">Распределение скоростей</h2>
            <div className="space-y-2">
              {(() => {
                const speedRanges = [
                  { min: 0, max: 40, label: '0-40 км/ч' },
                  { min: 40, max: 45, label: '40-45 км/ч' },
                  { min: 45, max: 50, label: '45-50 км/ч' },
                  { min: 50, max: 55, label: '50-55 км/ч' },
                  { min: 55, max: 60, label: '55-60 км/ч' },
                  { min: 60, max: 65, label: '60-65 км/ч' },
                  { min: 65, max: 70, label: '65-70 км/ч' },
                  { min: 70, max: 100, label: '70+ км/ч' },
                ];
                const maxCount = Math.max(...speedRanges.map(range => 
                  uniqueMeasurements.filter(r => {
                    const speed = parseFloat(r.speed_km_h);
                    return speed >= range.min && speed < range.max;
                  }).length
                ));
                
                return speedRanges.map((range, idx) => {
                  const count = uniqueMeasurements.filter(r => {
                    const speed = parseFloat(r.speed_km_h);
                    return speed >= range.min && speed < range.max;
                  }).length;
                  const percentage = totalRecords > 0 ? (count / totalRecords) * 100 : 0;
                  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-charcoal-700 dark:text-charcoal-300 text-right">{range.label}</div>
                      <div className="flex-1 bg-cream-200 dark:bg-charcoal-600 rounded-full h-6 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-camel-400 to-camel-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className="w-20 text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">{count} <span className="text-charcoal-600 dark:text-charcoal-400">({percentage.toFixed(1)}%)</span></div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

        </>
      )}

      {statsTab === 'breeds' && (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md">
          <h2 className="text-xl lg:text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">Статистика по породам</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-cream-300 dark:border-charcoal-600">
                  <th 
                    className="px-4 py-3 text-left font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700"
                    onClick={() => handleSort('breed')}
                  >
                    Порода {sortConfig.key === 'breed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700"
                    onClick={() => handleSort('count')}
                  >
                    Количество {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('avgSpeed')}
                  >
                    Средняя скорость {sortConfig.key === 'avgSpeed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('maxSpeed')}
                  >
                    Лучшая скорость {sortConfig.key === 'maxSpeed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('avgTime350')}
                  >
                    Время за 350м (ср) {sortConfig.key === 'avgTime350' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('bestTime350')}
                  >
                    Время за 350м (лучшее) {sortConfig.key === 'bestTime350' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedBreedStats.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    <tr 
                      className="border-b border-cream-200 dark:border-charcoal-600 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer"
                      onClick={() => setExpandedSection(expandedSection === `breed-${idx}` ? null : `breed-${idx}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-charcoal-900 dark:text-charcoal-100">{stat.breed}</td>
                      <td className="px-4 py-3 text-center text-charcoal-700 dark:text-charcoal-300">{stat.count}</td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-semibold whitespace-nowrap">{stat.avgSpeed.toFixed(1)} <span className="text-charcoal-600 dark:text-charcoal-400">км/ч</span></td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-bold whitespace-nowrap">{stat.maxSpeed} <span className="text-charcoal-600 dark:text-charcoal-400">км/ч</span></td>
                      <td className="px-4 py-3 text-center text-charcoal-700 dark:text-charcoal-300 whitespace-nowrap">{stat.avgTime350} <span className="text-charcoal-600 dark:text-charcoal-400">сек</span></td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-bold whitespace-nowrap">{stat.bestTime350} <span className="text-charcoal-600 dark:text-charcoal-400">сек</span></td>
                    </tr>
                    {expandedSection === `breed-${idx}` && (
                      <tr className="bg-cream-50 dark:bg-charcoal-700">
                        <td colSpan={6} className="px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                          <strong>Клички:</strong> {stat.names}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {statsTab === 'sex' && (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md">
          <h2 className="text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">Статистика по полу</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-cream-300 dark:border-charcoal-600">
                  <th 
                    className="px-4 py-3 text-left font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700"
                    onClick={() => handleSort('sex')}
                  >
                    Пол {sortConfig.key === 'sex' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700"
                    onClick={() => handleSort('count')}
                  >
                    Количество {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('avgSpeed')}
                  >
                    Средняя скорость {sortConfig.key === 'avgSpeed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('maxSpeed')}
                  >
                    Лучшая скорость {sortConfig.key === 'maxSpeed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('avgTime350')}
                  >
                    Время за 350м (ср) {sortConfig.key === 'avgTime350' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('bestTime350')}
                  >
                    Время за 350м (лучшее) {sortConfig.key === 'bestTime350' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedSexStats.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    <tr 
                      className="border-b border-cream-200 dark:border-charcoal-600 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer"
                      onClick={() => setExpandedSection(expandedSection === `sex-${idx}` ? null : `sex-${idx}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-charcoal-900 dark:text-charcoal-100">{stat.sex}</td>
                      <td className="px-4 py-3 text-center text-charcoal-700 dark:text-charcoal-300">{stat.count}</td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-semibold whitespace-nowrap">{stat.avgSpeed.toFixed(1)} <span className="text-charcoal-600 dark:text-charcoal-400">км/ч</span></td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-bold whitespace-nowrap">{stat.maxSpeed} <span className="text-charcoal-600 dark:text-charcoal-400">км/ч</span></td>
                      <td className="px-4 py-3 text-center text-charcoal-700 dark:text-charcoal-300 whitespace-nowrap">{stat.avgTime350} <span className="text-charcoal-600 dark:text-charcoal-400">сек</span></td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-bold whitespace-nowrap">{stat.bestTime350} <span className="text-charcoal-600 dark:text-charcoal-400">сек</span></td>
                    </tr>
                    {expandedSection === `sex-${idx}` && (
                      <tr className="bg-cream-50 dark:bg-charcoal-700">
                        <td colSpan={6} className="px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                          <strong>Клички:</strong> {stat.names}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {statsTab === 'years' && (
        <div className="bg-white dark:bg-charcoal-800 rounded-2xl border-2 border-cream-300 dark:border-charcoal-600 p-6 shadow-md">
          <h2 className="text-xl lg:text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">Статистика по годам</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-cream-300 dark:border-charcoal-600">
                  <th 
                    className="px-4 py-3 text-left font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700"
                    onClick={() => handleSort('year')}
                  >
                    Год {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700"
                    onClick={() => handleSort('count')}
                  >
                    Количество {sortConfig.key === 'count' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('avgSpeed')}
                  >
                    Средняя скорость {sortConfig.key === 'avgSpeed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('maxSpeed')}
                  >
                    Лучшая скорость {sortConfig.key === 'maxSpeed' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('avgTime350')}
                  >
                    Время за 350м (ср) {sortConfig.key === 'avgTime350' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-4 py-3 text-center font-semibold text-charcoal-900 dark:text-charcoal-100 cursor-pointer hover:bg-cream-50 dark:hover:bg-charcoal-700 whitespace-nowrap"
                    onClick={() => handleSort('bestTime350')}
                  >
                    Время за 350м (лучшее) {sortConfig.key === 'bestTime350' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedYearStats.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    <tr 
                      className="border-b border-cream-200 dark:border-charcoal-600 hover:bg-cream-50 dark:hover:bg-charcoal-700 cursor-pointer"
                      onClick={() => setExpandedSection(expandedSection === `year-${idx}` ? null : `year-${idx}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-charcoal-900 dark:text-charcoal-100">{stat.year}</td>
                      <td className="px-4 py-3 text-center text-charcoal-700 dark:text-charcoal-300">{stat.count}</td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-semibold whitespace-nowrap">{stat.avgSpeed.toFixed(1)} <span className="text-charcoal-600 dark:text-charcoal-400">км/ч</span></td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-bold whitespace-nowrap">{stat.maxSpeed} <span className="text-charcoal-600 dark:text-charcoal-400">км/ч</span></td>
                      <td className="px-4 py-3 text-center text-charcoal-700 dark:text-charcoal-300 whitespace-nowrap">{stat.avgTime350} <span className="text-charcoal-600 dark:text-charcoal-400">сек</span></td>
                      <td className="px-4 py-3 text-center text-camel-700 dark:text-camel-400 font-bold whitespace-nowrap">{stat.bestTime350} <span className="text-charcoal-600 dark:text-charcoal-400">сек</span></td>
                    </tr>
                    {expandedSection === `year-${idx}` && (
                      <tr className="bg-cream-50 dark:bg-charcoal-700">
                        <td colSpan={6} className="px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                          <strong>Клички:</strong> {stat.names}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpeedRecordsStats;
