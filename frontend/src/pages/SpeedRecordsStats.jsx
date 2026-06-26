import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { api } from '../services/api';

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
  
  // Состояние для dropdown menus
  const [openDropdown, setOpenDropdown] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null); // Для интерактивных списков
  
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
    const result = await api.getSpeedRecords('', '', 100, '', '');
    
    if (result.success) {
      const recordsWithHistory = result.data.map(record => ({
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

  function applyFilters(data) {
    let filtered = data;
    
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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold-500 border-t-transparent"></div>
        <p className="mt-4 text-old-money-600">Загрузка статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
        Ошибка: {error}
      </div>
    );
  }

  // Применяем фильтры к данным
  const filteredRecords = applyFilters(records);
  
  // Расчёт статистики на отфильтрованных данных
  const totalRecords = filteredRecords.length;
  const averageSpeed = totalRecords > 0 ? filteredRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / totalRecords : 0;
  const maxSpeed = totalRecords > 0 ? Math.max(...filteredRecords.map(r => parseFloat(r.speed_km_h))) : 0;
  const minSpeed = totalRecords > 0 ? Math.min(...filteredRecords.map(r => parseFloat(r.speed_km_h))) : 0;
  
  const breeds = [...new Set(filteredRecords.map(r => r.breed))];
  const breedStats = breeds.map(breed => {
    const breedRecords = filteredRecords.filter(r => r.breed === breed);
    const avgSpeed = breedRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / breedRecords.length;
    const maxSpeed = Math.max(...breedRecords.map(r => parseFloat(r.speed_km_h)));
    return { breed, count: breedRecords.length, avgSpeed, maxSpeed };
  }).sort((a, b) => b.count - a.count);

  const sexes = [...new Set(filteredRecords.map(r => r.sex))];
  const sexStats = sexes.map(sex => {
    const sexRecords = filteredRecords.filter(r => r.sex === sex);
    const avgSpeed = sexRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / sexRecords.length;
    const maxSpeed = Math.max(...sexRecords.map(r => parseFloat(r.speed_km_h)));
    return { sex: sex === 'С' ? 'Сука' : 'Кабель', count: sexRecords.length, avgSpeed, maxSpeed };
  });

  const years = [...new Set(filteredRecords.map(r => r.date.split('.')[2]))].sort();
  const yearStats = years.map(year => {
    const yearRecords = filteredRecords.filter(r => r.date.split('.')[2] === year);
    const avgSpeed = yearRecords.reduce((sum, r) => sum + parseFloat(r.speed_km_h), 0) / yearRecords.length;
    const maxSpeed = Math.max(...yearRecords.map(r => parseFloat(r.speed_km_h)));
    return { year, count: yearRecords.length, avgSpeed, maxSpeed };
  }).sort((a, b) => b.year - a.year);

  // Данные для dropdown menus
  const allYears = [...new Set(records.map(r => r.date.split('.')[2]))].sort().reverse();
  const allBreeds = [...new Set(records.map(r => r.breed))].sort();
  const allSexes = [...new Set(records.map(r => r.sex))].sort();
  
  const hasActiveFilters = filterYears.length > 0 || filterBreeds.length > 0 || filterSexes.length > 0 || filterMinSpeed || filterMaxSpeed;

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex gap-4 mb-6 flex-wrap" ref={dropdownRef}>
        <div className="flex-1 min-w-[150px] relative">
          <label className="block text-sm font-semibold text-old-money-700 mb-2">Год</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white text-left"
          >
            {filterYears.length > 0 ? `Выбрано: ${filterYears.length}` : 'Все года'}
          </button>
          {openDropdown === 'year' && (
            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-cream-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {allYears.map(year => (
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
        <div className="flex-1 min-w-[150px] relative">
          <label className="block text-sm font-semibold text-old-money-700 mb-2">Порода</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'breed' ? null : 'breed')}
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white text-left"
          >
            {filterBreeds.length > 0 ? `Выбрано: ${filterBreeds.length}` : 'Все породы'}
          </button>
          {openDropdown === 'breed' && (
            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-cream-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {allBreeds.map(breed => (
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
        <div className="flex-1 min-w-[150px] relative">
          <label className="block text-sm font-semibold text-old-money-700 mb-2">Пол</label>
          <button
            onClick={() => setOpenDropdown(openDropdown === 'sex' ? null : 'sex')}
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white text-left"
          >
            {filterSexes.length > 0 ? `Выбрано: ${filterSexes.length}` : 'Все'}
          </button>
          {openDropdown === 'sex' && (
            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-cream-300 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {allSexes.map(sex => (
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
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold text-old-money-700 mb-2">От (км/ч)</label>
          <input
            type="number"
            value={filterMinSpeed}
            onChange={(e) => setFilterMinSpeed(e.target.value)}
            placeholder="Мин. скорость"
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold text-old-money-700 mb-2">До (км/ч)</label>
          <input
            type="number"
            value={filterMaxSpeed}
            onChange={(e) => setFilterMaxSpeed(e.target.value)}
            placeholder="Макс. скорость"
            className="w-full px-4 py-3 rounded-xl border-2 border-cream-300 focus:border-camel-500 focus:ring-2 focus:ring-camel-200 transition-all bg-white"
          />
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

      {/* Общая статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
          <div className="text-sm font-semibold text-old-money-600 mb-2">Всего записей</div>
          <div className="text-3xl font-bold text-charcoal-900">{totalRecords}</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
          <div className="text-sm font-semibold text-old-money-600 mb-2">Средняя скорость</div>
          <div className="text-3xl font-bold text-camel-700">{averageSpeed.toFixed(1)} км/ч</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
          <div className="text-sm font-semibold text-old-money-600 mb-2">Лучшая скорость</div>
          <div className="text-3xl font-bold text-camel-700">{maxSpeed} км/ч</div>
        </div>
        <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
          <div className="text-sm font-semibold text-old-money-600 mb-2">Минимальная скорость</div>
          <div className="text-3xl font-bold text-charcoal-900">{minSpeed} км/ч</div>
        </div>
      </div>

      {/* Статистика по породам */}
      <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Статистика по породам</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-cream-300">
                <th className="px-4 py-3 text-left font-semibold text-charcoal-900">Порода</th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal-900">Количество</th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal-900">Средняя скорость</th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal-900">Лучшая скорость</th>
              </tr>
            </thead>
            <tbody>
              {breedStats.map((stat, idx) => {
                const breedRecords = filteredRecords.filter(r => r.breed === stat.breed);
                const isExpanded = expandedSection === `breed-${stat.breed}`;
                return (
                  <React.Fragment key={idx}>
                    <tr 
                      className="border-b border-cream-200 hover:bg-cream-50 cursor-pointer"
                      onClick={() => setExpandedSection(isExpanded ? null : `breed-${stat.breed}`)}
                    >
                      <td className="px-4 py-3 font-semibold text-charcoal-900">{stat.breed}</td>
                      <td className="px-4 py-3 text-center text-charcoal-700">{stat.count}</td>
                      <td className="px-4 py-3 text-center text-camel-700 font-semibold">{stat.avgSpeed.toFixed(1)} км/ч</td>
                      <td className="px-4 py-3 text-center text-camel-700 font-bold">{stat.maxSpeed} км/ч</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-cream-50">
                        <td colSpan="4" className="px-4 py-3">
                          <div className="text-sm font-semibold text-charcoal-700 mb-2">Клички:</div>
                          <div className="flex flex-wrap gap-2">
                            {breedRecords.map((record, rIdx) => (
                              <span key={rIdx} className="inline-block bg-white border border-cream-300 rounded-lg px-3 py-1 text-sm text-charcoal-900">
                                {record.name} ({record.speed_km_h} км/ч)
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Статистика по полу */}
      <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Статистика по полу</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sexStats.map((stat, idx) => {
            const sexRecords = filteredRecords.filter(r => (stat.sex === 'Сука' ? r.sex === 'С' : r.sex === 'К'));
            const isExpanded = expandedSection === `sex-${stat.sex}`;
            return (
              <div key={idx} className="bg-cream-50 rounded-lg p-4 border border-cream-200 cursor-pointer hover:bg-cream-100 transition-colors" onClick={() => setExpandedSection(isExpanded ? null : `sex-${stat.sex}`)}>
                <div className="text-lg font-bold text-charcoal-900 mb-2">{stat.sex}</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-old-money-600">Количество:</span>
                    <span className="font-semibold text-charcoal-900">{stat.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-old-money-600">Средняя скорость:</span>
                    <span className="font-semibold text-camel-700">{stat.avgSpeed.toFixed(1)} км/ч</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-old-money-600">Лучшая скорость:</span>
                    <span className="font-bold text-camel-700">{stat.maxSpeed} км/ч</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-cream-300">
                    <div className="text-sm font-semibold text-charcoal-700 mb-2">Клички:</div>
                    <div className="flex flex-wrap gap-2">
                      {sexRecords.map((record, rIdx) => (
                        <span key={rIdx} className="inline-block bg-white border border-cream-300 rounded-lg px-3 py-1 text-sm text-charcoal-900">
                          {record.name} ({record.speed_km_h} км/ч)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Статистика по годам */}
      <div className="bg-white rounded-xl border-2 border-cream-300 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Статистика по годам</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-cream-300">
                <th className="px-4 py-3 text-left font-semibold text-charcoal-900">Год</th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal-900">Количество</th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal-900">Средняя скорость</th>
                <th className="px-4 py-3 text-center font-semibold text-charcoal-900">Лучшая скорость</th>
              </tr>
            </thead>
            <tbody>
              {yearStats.map((stat, idx) => {
                const yearRecords = filteredRecords.filter(r => r.date.split('.')[2] === stat.year);
                const isExpanded = expandedSection === `year-${stat.year}`;
                return (
                  <React.Fragment key={idx}>
                    <tr className="border-b border-cream-200 hover:bg-cream-50">
                      <td className="px-4 py-3 font-semibold text-charcoal-900">{stat.year}</td>
                      <td 
                        className="px-4 py-3 text-center text-charcoal-700 cursor-pointer hover:text-camel-700 font-semibold"
                        onClick={() => setExpandedSection(isExpanded ? null : `year-${stat.year}`)}
                      >
                        {stat.count}
                      </td>
                      <td className="px-4 py-3 text-center text-camel-700 font-semibold">{stat.avgSpeed.toFixed(1)} км/ч</td>
                      <td className="px-4 py-3 text-center text-camel-700 font-bold">{stat.maxSpeed} км/ч</td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-cream-50">
                        <td colSpan="4" className="px-4 py-3">
                          <div className="text-sm font-semibold text-charcoal-700 mb-2">Клички за {stat.year} год:</div>
                          <div className="flex flex-wrap gap-2">
                            {yearRecords.map((record, rIdx) => (
                              <span key={rIdx} className="inline-block bg-white border border-cream-300 rounded-lg px-3 py-1 text-sm text-charcoal-900">
                                {record.name} ({record.speed_km_h} км/ч)
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SpeedRecordsStats;
