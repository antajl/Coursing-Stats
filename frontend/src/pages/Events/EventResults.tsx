import { useState, useEffect } from 'react'
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import ErrorState from '../../components/ErrorState'
import SkeletonLoader from '../../components/SkeletonLoader'

export default function EventResults() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year}`
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [eventResult, resultsResult] = await Promise.all([
          api.getEvent(id),
          api.getEventResults(id)
        ])

        if (eventResult.source === 'mock' || resultsResult.source === 'mock') {
          setError('Не удалось загрузить данные с сервера. Используются демо-данные.')
        }

        if (eventResult.data) {
          setEvent(eventResult.data)
        }
        if (resultsResult.data) {
          setResults(Array.isArray(resultsResult.data) ? resultsResult.data : [])
        }
      } catch (err) {
        console.error('Error fetching event data:', err)
        setError(`Ошибка при загрузке: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-800 p-6">
        <div className="max-w-4xl mx-auto">
          <SkeletonLoader variant="card" count={3} />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-charcoal-800 p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="Событие не найдено"
            message={`ID: ${id}`}
            action={
              <Link to="/" className="rounded-xl border-2 border-camel-300 dark:border-camel-600 bg-white dark:bg-charcoal-800 px-4 py-2 text-sm font-semibold text-camel-700 dark:text-camel-400 transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700 hover:border-camel-400">
                На главную
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-charcoal-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <ErrorState
            title="Ошибка загрузки"
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        <Link to="/" className="mb-6 inline-block font-medium text-camel-700 dark:text-camel-400 transition-colors hover:text-camel-800 dark:hover:text-camel-300">
          <span className="md:hidden">Назад</span>
          <span className="hidden md:inline">← Назад к календарю</span>
        </Link>

        {/* Информация о событии */}
        <div className="mb-6 rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-4 shadow-md md:p-6">
          <h1 className="mb-4 text-xl font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-2xl">
            {event.results_url ? (
              <a 
                href={event.results_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-camel-700 dark:hover:text-camel-400 hover:underline transition-colors"
              >
                {event.full_title || `${event.competition_kind} ${event.competition_type}`}
              </a>
            ) : (
              event.full_title || `${event.competition_kind} ${event.competition_type}`
            )}
          </h1>
          
          <div className="flex flex-wrap gap-x-4 md:gap-x-6 gap-y-2 text-sm text-old-money-800 dark:text-old-money-300 mb-4">
            <span>
              <span className="text-old-money-500 dark:text-old-money-400">Дата:</span> {event.event_date || formatDate(event.date_start)}
            </span>
            <span>
              <span className="text-old-money-500 dark:text-old-money-400">Локация:</span> {event.protocol_location || event.location}
            </span>
            <span>
              <span className="text-old-money-500 dark:text-old-money-400">Участников:</span> {new Set(results.map(r => r.dog_id)).size}
            </span>
            <span>
              <span className="text-old-money-500 dark:text-old-money-400">Пород:</span> {new Set(results.map(r => r.breed)).size}
            </span>
          </div>

          <div className="space-y-1 text-sm text-old-money-800 dark:text-old-money-300">
            {event.host_club && (
              <div>
                <span className="text-old-money-500 dark:text-old-money-400">Кинологическая организация:</span> {event.host_club}
              </div>
            )}
            {event.title && (
              <div>
                <span className="text-old-money-500 dark:text-old-money-400">Клуб-организатор:</span>{' '}
                {event.telegram_url ? (
                  <a 
                    href={event.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-camel-700 dark:text-camel-400 underline transition-colors hover:text-camel-800 dark:hover:text-camel-300"
                  >
                    {event.title.replace(/Курсинг\d{4}/i, '').trim()}
                  </a>
                ) : event.results_url ? (
                  <a 
                    href={event.results_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-camel-700 dark:text-camel-400 underline transition-colors hover:text-camel-800 dark:hover:text-camel-300"
                  >
                    {event.title.replace(/Курсинг\d{4}/i, '').trim()}
                  </a>
                ) : (
                  <span className="text-camel-700 dark:text-camel-400">{event.title.replace(/Курсинг\d{4}/i, '').trim()}</span>
                )}
              </div>
            )}
            {event.judges && (
              <div>
                <span className="text-old-money-500 dark:text-old-money-400">Судьи:</span> {event.judges}
              </div>
            )}
            {event.track_schemes && JSON.parse(event.track_schemes).length > 0 && (
              <div>
                <span className="text-old-money-500 dark:text-old-money-400">Схемы трасс:</span>{' '}
                {JSON.parse(event.track_schemes).map((scheme, index) => (
                  <span key={index} className="group relative inline-block mr-3 cursor-pointer">
                    <span className="text-camel-700 dark:text-camel-400 underline transition-colors hover:text-camel-800 dark:hover:text-camel-300">
                      {scheme.name}{scheme.length && ` (${scheme.length})`}
                    </span>
                    {scheme.url && (
                      <div className="absolute left-1/2 top-full z-50 mt-2 hidden w-max max-w-[90vw] -translate-x-1/2 rounded-lg border border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-2 shadow-xl group-hover:block md:left-0 md:max-w-md md:-translate-x-0">
                        <img 
                          src={scheme.url} 
                          alt={scheme.name}
                          className="max-w-[90vw] md:max-w-md max-h-96 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Результаты */}
        <div className="rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-4 shadow-md md:p-6">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-charcoal-900 dark:text-charcoal-100 md:text-xl">Результаты</h2>
          
          {results.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Нет данных о результатах</div>
          ) : (
            <div className="space-y-6">
              {(() => {
                // Группируем по breed_class (Порода - Класс - Пол)
                const grouped = results.reduce((acc, result) => {
                  const groupKey = result.breed_class || 'Другие';
                  if (!acc[groupKey]) acc[groupKey] = [];
                  acc[groupKey].push(result);
                  return acc;
                }, {});
                
                // Сортируем группы: Басенджи, Грейхаунд, остальные алфавитно, Неприбывшие участники в конце
                const sortedGroups = Object.keys(grouped).sort((a, b) => {
                  // Неприбывшие участники всегда в конце
                  if (a === 'Неприбывшие участники') return 1;
                  if (b === 'Неприбывшие участники') return -1;
                  
                  const breedOrder = ['Басенджи', 'Грейхаунд'];
                  
                  const getBreed = (group) => {
                    const parts = group.split(' - ');
                    return parts[0] || group;
                  };
                  
                  const aBreed = getBreed(a);
                  const bBreed = getBreed(b);
                  
                  const aIndex = breedOrder.indexOf(aBreed);
                  const bIndex = breedOrder.indexOf(bBreed);
                  
                  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                  if (aIndex !== -1) return -1;
                  if (bIndex !== -1) return 1;
                  return a.localeCompare(b);
                });
                
                return sortedGroups.map(groupKey => {
                  const groupResults = grouped[groupKey].sort((a, b) => 
                    (a.placement || 999) - (b.placement || 999)
                  );
                  
                  // Извлекаем название породы из группы для скрытия в карточке
                  const breedName = groupKey.split(' - ')[0] || null;
                  
                  return (
                    <div key={groupKey}>
                      <h3 className="mb-3 border-b border-old-money-200 dark:border-charcoal-600 pb-2 text-lg font-bold tracking-tight text-charcoal-800 dark:text-charcoal-100">
                        {groupKey}
                      </h3>
                      <div className="space-y-2">
                        {groupResults.map((result, idx) => {
                          const rawScores = result.raw_scores_json ? JSON.parse(result.raw_scores_json) : null;
                          const isDisqualified = result.status === 'disqualified' || result.status === 'dns';

                          return (
                            <details key={`${result.dog_id}-${idx}`} className="group">
                              <summary className="list-none cursor-pointer">
                                <div className="flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg hover:bg-old-money-100 dark:hover:bg-charcoal-700 transition-colors">
                                  {/* Medal/Place */}
                                  <div className="flex-shrink-0">
                                    {result.status === 'disqualified' ? (
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-100 dark:bg-red-900 border-2 border-red-500 dark:border-red-600 flex items-center justify-center">
                                        <svg className="w-4 h-4 md:w-6 md:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </div>
                                    ) : result.status === 'dns' ? (
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 md:w-6 md:h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </div>
                                    ) : result.placement === 1 ? (
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-400 dark:bg-camel-700 border-2 border-yellow-500 dark:border-camel-600 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                                        {result.placement}
                                      </div>
                                    ) : result.placement === 2 ? (
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 dark:bg-charcoal-500 border-2 border-gray-400 dark:border-charcoal-400 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-xs md:text-sm">
                                        {result.placement}
                                      </div>
                                    ) : result.placement === 3 ? (
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-400 dark:bg-terracotta-700 border-2 border-orange-500 dark:border-terracotta-600 flex items-center justify-center text-white font-bold text-xs md:text-sm">
                                        {result.placement}
                                      </div>
                                    ) : result.placement ? (
                                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-old-money-200 dark:bg-charcoal-600 border border-old-money-300 dark:border-charcoal-500 flex items-center justify-center text-old-money-700 dark:text-old-money-300 font-bold text-xs md:text-sm">
                                        {result.placement}
                                      </div>
                                    ) : null}
                                  </div>
                                  
                                  {/* Name */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-medium text-old-money-800 dark:text-old-money-300 truncate text-sm md:text-base">
                                        {result.name_ru || result.name_lat}
                                      </span>
                                      {result.name_ru && result.name_lat && result.name_ru !== result.name_lat && (
                                        <span className="text-xs md:text-sm text-old-money-600 dark:text-old-money-400 truncate">
                                          / {result.name_lat}
                                        </span>
                                      )}
                                    </div>
                                    {/* Title badges - only show if not disqualified */}
                                    {!isDisqualified && result.qualification && (
                                      <div className="flex gap-1 mt-1 flex-wrap">
                                        {result.qualification.split(',').map((title, i) => {
                                          const titleLower = title.trim().toLowerCase();
                                          const isChampion = titleLower.includes('чемпион') || titleLower.includes('champion');
                                          const isCACL = titleLower.includes('cacl');
                                          const isReg = titleLower.includes('reg');
                                          return (
                                            <span key={i} className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                                              isChampion ? 'border border-camel-300 dark:border-camel-600 bg-camel-100 dark:bg-camel-900 text-camel-800 dark:text-camel-300' :
                                              isCACL ? 'bg-old-money-100 dark:bg-charcoal-700 text-old-money-700 dark:text-old-money-300 border border-old-money-300 dark:border-charcoal-600' :
                                              isReg ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500' :
                                              'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
                                            }`}>
                                              {title.trim()}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {/* Status reason on mobile */}
                                    {isDisqualified && result.status_reason && (
                                      <div className="md:hidden text-xs text-red-600 dark:text-red-400 italic mt-1">{result.status_reason}</div>
                                    )}
                                  </div>
                                  
                                  {/* Total score or status reason */}
                                  <div className="flex-shrink-0 text-right md:text-right">
                                    {result.total_score ? (
                                      <div className="flex items-center justify-end gap-1 md:gap-2">
                                        {result.vc === '+' && (
                                          <span className="inline-block px-1 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">ВС</span>
                                        )}
                                        <div>
                                        <div className="text-base font-bold text-camel-700 dark:text-camel-400 md:text-lg">{result.total_score}</div>
                                          <div className="text-xs text-old-money-600 dark:text-old-money-400">баллов</div>
                                        </div>
                                      </div>
                                    ) : result.status_reason ? (
                                      <div className="text-xs md:text-sm text-red-600 dark:text-red-400 italic md:text-right text-left md:block hidden">{result.status_reason}</div>
                                    ) : null}
                                  </div>
                                  
                                  {/* Chevron */}
                                  <div className="flex-shrink-0 text-old-money-400 dark:text-old-money-500 group-open:rotate-180 transition-transform">
                                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </summary>
                              
                              {/* Detailed scores table */}
                              <div className="mt-2 ml-10 md:ml-14 mr-4 md:mr-20">
                                {rawScores && rawScores.heats && rawScores.heats.length > 0 && (
                                  <>
                                    {/* Mobile cards */}
                                    <div className="md:hidden space-y-3">
                                      {rawScores.heats.map((heat, heatIdx) => {
                                        const isHeatDisqualified = heat.disqualified;
                                        
                                        return (
                                          <div key={heatIdx} className="bg-white dark:bg-charcoal-800 rounded-xl p-3 border border-old-money-200 dark:border-charcoal-600">
                                            <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-old-money-100 dark:border-charcoal-600">
                                              {heat.bib_color && (
                                                <span 
                                                  className="inline-block w-2 h-2 rounded-full"
                                                  style={{ 
                                                    backgroundColor: heat.bib_color === 'red' ? '#ef4444' :
                                                                 heat.bib_color === 'white' ? '#ffffff' :
                                                                 heat.bib_color === 'blue' ? '#3b82f6' :
                                                                 '#9ca3af',
                                                    border: heat.bib_color === 'white' ? '1px solid #e5e7eb' : 'none'
                                                  }}
                                                />
                                              )}
                                              <span className={`font-bold ${isHeatDisqualified ? 'text-red-600 dark:text-red-400' : 'text-camel-700 dark:text-camel-400'}`}>
                                                Забег {heat.bib_number || heatIdx + 1}
                                                {isHeatDisqualified && ' (отстранение)'}
                                              </span>
                                            </div>
                                            
                                            {isHeatDisqualified ? (
                                              <div className="text-center text-red-600 dark:text-red-400 italic text-sm py-2">
                                                {heat.disqualification_reason || result.status_reason || 'Отстранение'}
                                              </div>
                                            ) : (
                                              <div className="space-y-2">
                                                {heat.judges.map((judge, judgeIdx) => {
                                                  const judgeLabel = judgeIdx === 0 ? 'Главный судья' : `Судья ${judgeIdx}`;
                                                  const hasScores = judge.scores && judge.scores.some(s => s !== null);
                                                  
                                                  if (!hasScores) return null;
                                                  
                                                  return (
                                                    <div key={judgeIdx} className="bg-old-money-50 dark:bg-charcoal-700 rounded-lg p-2">
                                                      <div className="text-xs font-medium text-old-money-700 dark:text-old-money-300 mb-2">{judgeLabel}</div>
                                                      <div className="grid grid-cols-5 gap-1 text-xs text-center">
                                                        <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                                                          <div className="text-gray-500 dark:text-gray-400 text-[10px]">М</div>
                                                          <div className="font-bold">{judge.scores[0] !== null ? judge.scores[0] : '-'}</div>
                                                        </div>
                                                        <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                                                          <div className="text-gray-500 dark:text-gray-400 text-[10px]">Р</div>
                                                          <div className="font-bold">{judge.scores[1] !== null ? judge.scores[1] : '-'}</div>
                                                        </div>
                                                        <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                                                          <div className="text-gray-500 dark:text-gray-400 text-[10px]">В</div>
                                                          <div className="font-bold">{judge.scores[2] !== null ? judge.scores[2] : '-'}</div>
                                                        </div>
                                                        <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                                                          <div className="text-gray-500 dark:text-gray-400 text-[10px]">П</div>
                                                          <div className="font-bold">{judge.scores[3] !== null ? judge.scores[3] : '-'}</div>
                                                        </div>
                                                        <div className="bg-white dark:bg-charcoal-800 rounded p-1">
                                                          <div className="text-gray-500 dark:text-gray-400 text-[10px]">Э</div>
                                                          <div className="font-bold">{judge.scores[4] !== null ? judge.scores[4] : '-'}</div>
                                                        </div>
                                                      </div>
                                                      <div className="mt-2 text-center">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">Сумма: </span>
                                                        <span className="text-sm font-bold text-camel-700 dark:text-camel-400">{judge.sum || '-'}</span>
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                                {heat.total && (
                                                  <div className="text-center pt-2 border-t border-old-money-200 dark:border-charcoal-600">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">Итого: </span>
                                                    <span className="text-sm font-bold text-camel-700 dark:text-camel-400">{heat.total}</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                      
                                      {rawScores.grand_total && (
                                        <div className="rounded-xl border border-camel-200 dark:border-camel-600 bg-camel-50 dark:bg-charcoal-700 p-3 text-center">
                                          <span className="text-sm text-gray-600 dark:text-gray-400">Общий итог: </span>
                                          <span className="text-lg font-bold text-camel-700 dark:text-camel-400">{rawScores.grand_total}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Desktop table */}
                                    <div className="hidden md:block overflow-x-auto">
                                      <table className="w-full text-xs min-w-[500px] md:min-w-[600px]">
                                    <thead>
                                      <tr className="text-left text-old-money-600 dark:text-old-money-400">
                                        <th className="pb-1 pr-2" title="Судья">Судья</th>
                                        {rawScores.heats.map((heat, heatIdx) => (
                                          <React.Fragment key={heatIdx}>
                                            <th className={`pb-1 pr-2 text-center ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} colSpan="6">
                                              <div className="flex items-center justify-center gap-1">
                                                {heat.bib_color && (
                                                  <span 
                                                    className="inline-block w-2 h-2 rounded-full"
                                                    style={{ 
                                                      backgroundColor: heat.bib_color === 'red' ? '#ef4444' :
                                                                   heat.bib_color === 'white' ? '#ffffff' :
                                                                   heat.bib_color === 'blue' ? '#3b82f6' :
                                                                   '#9ca3af',
                                                      border: heat.bib_color === 'white' ? '1px solid #e5e7eb' : 'none'
                                                    }}
                                                  />
                                                )}
                                                <span className={heat.disqualified ? 'text-red-600 dark:text-red-400' : ''}>
                                                  Забег {heat.bib_number || heatIdx + 1}
                                                  {heat.disqualified && ' (отстранение)'}
                                                </span>
                                              </div>
                                            </th>
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                      <tr className="text-left text-old-money-600 dark:text-old-money-400">
                                        <th className="pb-1 pr-2"></th>
                                        {rawScores.heats.map((heat, heatIdx) => (
                                          <React.Fragment key={heatIdx}>
                                            <th className={`pb-1 pr-2 text-center ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} title="Маневренность">М</th>
                                            <th className="pb-1 pr-2 text-center" title="Резвость">Р</th>
                                            <th className="pb-1 pr-2 text-center" title="Выносливость">В</th>
                                            <th className="pb-1 pr-2 text-center" title="Преследование">П</th>
                                            <th className="pb-1 pr-2 text-center" title="Энтузиазм">Э</th>
                                            <th className="pb-1 text-center font-bold" title="Сумма">Сум</th>
                                          </React.Fragment>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(() => {
                                        // Определяем количество судей по первому забегу
                                        const judgesCount = rawScores.heats[0].judges.length;
                                        
                                        return Array.from({ length: judgesCount }).map((_, judgeIdx) => {
                                          const judgeLabel = judgeIdx === 0 ? 'Главный судья' : 'Судья';
                                          
                                          return (
                                            <tr key={`judge${judgeIdx}`} className={judgeIdx > 0 ? "border-t border-old-money-200 dark:border-charcoal-600" : ""}>
                                              <td className="py-1 pr-2">{judgeLabel}</td>
                                              {rawScores.heats.map((heat, heatIdx) => {
                                                const heatJudge = heat.judges[judgeIdx];
                                                const heatHasScores = heatJudge && heatJudge.scores && heatJudge.scores.some(s => s !== null);
                                                const isHeatDisqualified = heat.disqualified;
                                                
                                                return (
                                                  <React.Fragment key={`heat${heatIdx}`}>
                                                    {heatHasScores ? (
                                                      <>
                                                        <td className={`py-1 pr-2 text-center ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`}>{heatJudge.scores[0] !== null ? heatJudge.scores[0] : '-'}</td>
                                                        <td className="py-1 pr-2 text-center">{heatJudge.scores[1] !== null ? heatJudge.scores[1] : '-'}</td>
                                                        <td className="py-1 pr-2 text-center">{heatJudge.scores[2] !== null ? heatJudge.scores[2] : '-'}</td>
                                                        <td className="py-1 pr-2 text-center">{heatJudge.scores[3] !== null ? heatJudge.scores[3] : '-'}</td>
                                                        <td className="py-1 pr-2 text-center">{heatJudge.scores[4] !== null ? heatJudge.scores[4] : '-'}</td>
                                                        <td className="py-1 text-center font-bold text-old-money-800 dark:text-old-money-300">{heatJudge.sum || '-'}</td>
                                                      </>
                                                    ) : (
                                                      <td className={`py-1 pr-2 text-center italic text-red-600 dark:text-red-400 ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} colSpan="6">
                                                        {isHeatDisqualified ? heat.disqualification_reason : (result.status === 'disqualified' ? result.status_reason || 'Отстранение' : result.status === 'dns' ? 'Неявка' : '-')}
                                                      </td>
                                                    )}
                                                  </React.Fragment>
                                                );
                                              })}
                                            </tr>
                                          );
                                        });
                                      })()}
                                      {rawScores.grand_total && (
                                        <tr className="border-t border-old-money-200 dark:border-charcoal-600">
                                          <td className="py-1 pr-2 font-bold text-camel-700 dark:text-camel-400">Итого</td>
                                          {rawScores.heats.map((heat, heatIdx) => (
                                            <React.Fragment key={heatIdx}>
                                              <td className={`py-1 pr-2 text-center font-bold text-camel-700 dark:text-camel-400 ${heatIdx > 0 ? 'border-l-2 border-old-money-200 dark:border-charcoal-600' : ''}`} colSpan="6">{heat.total || '-'}</td>
                                            </React.Fragment>
                                          ))}
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                  </div>
                                  </>
                                )}
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
