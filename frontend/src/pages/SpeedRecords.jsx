import { useState, useEffect } from 'react';
import { api } from '../services/api';

function SpeedRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterBreed, setFilterBreed] = useState('');
  const [filterSex, setFilterSex] = useState('');

  useEffect(() => {
    loadRecords();
  }, [filterBreed, filterSex]);

  async function loadRecords() {
    setLoading(true);
    setError(null);
    const result = await api.getSpeedRecords(filterBreed, filterSex, 100);
    
    if (result.success) {
      setRecords(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  const breeds = [...new Set(records.map(r => r.breed))].sort();
  const sexes = [...new Set(records.map(r => r.sex))].sort();

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gold-200 p-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent mb-6">
          Личные рекорды скорости в Донино
        </h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-old-money-700 mb-2">Порода</label>
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all bg-white"
            >
              <option value="">Все породы</option>
              {breeds.map(breed => (
                <option key={breed} value={breed}>{breed}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-old-money-700 mb-2">Пол</label>
            <select
              value={filterSex}
              onChange={(e) => setFilterSex(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gold-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 transition-all bg-white"
            >
              <option value="">Все</option>
              {sexes.map(sex => (
                <option key={sex} value={sex}>{sex}</option>
              ))}
            </select>
          </div>
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
          <div className="overflow-x-auto rounded-xl border-2 border-gold-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gold-500 to-gold-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Кличка</th>
                  <th className="px-6 py-4 text-left font-semibold">Пол</th>
                  <th className="px-6 py-4 text-left font-semibold">Порода</th>
                  <th className="px-6 py-4 text-left font-semibold">Скорость (км/ч)</th>
                  <th className="px-6 py-4 text-left font-semibold">Дата</th>
                  <th className="px-6 py-4 text-left font-semibold">Статус</th>
                  <th className="px-6 py-4 text-left font-semibold">Скриншот</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gold-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gold-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-old-money-900">{record.name}</td>
                    <td className="px-6 py-4 text-old-money-900">{record.sex === 'С' ? 'Сука' : record.sex === 'К' ? 'Кабель' : record.sex}</td>
                    <td className="px-6 py-4 text-old-money-900">{record.breed}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-white font-bold text-sm">
                        {record.speed_km_h} км/ч
                      </span>
                    </td>
                    <td className="px-6 py-4 text-old-money-700">{record.date}</td>
                    <td className="px-6 py-4">
                      {record.status === 'new' && (
                        <span className="inline-block px-3 py-1 rounded-full bg-green-500 text-white font-bold text-sm">
                          Новый результат
                        </span>
                      )}
                      {record.status === 'improved' && (
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500 text-white font-bold text-sm">
                          Улучшение личного рекорда
                        </span>
                      )}
                      {record.status === 'normal' && (
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-300 text-gray-700 font-bold text-sm">
                          Обычный результат
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {record.screenshot_url && (
                        <a
                          href={record.screenshot_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold-600 hover:text-gold-700 font-semibold hover:underline"
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
    </div>
  );
}

export default SpeedRecords;
