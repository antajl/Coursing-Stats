import type { StageInfo, StageResult, StageWinner } from './types.js';
import { cleanDogNameFields, parseLeague } from './matchers.js';

export function parseStageResults(rawEventJson: any): StageResult[] {
  return (rawEventJson?.results || []).map((r: any) => {
    const rawScores = r.raw_scores_json || {};
    const heats = Array.isArray(rawScores.heats)
      ? rawScores.heats.map((h: any, idx: number) => ({
          heat_no: idx + 1,
          time: typeof h.time === 'number' ? h.time : null,
          rank: typeof h.rank === 'number' ? h.rank : null,
          disqualified: Boolean(h.disqualified),
        }))
      : [];

    const names = cleanDogNameFields(
      r.dog?.name_ru || r.name_ru,
      r.dog?.name_lat || r.name_lat,
      r.dog_id || r.dog?.id
    );
    const league = parseLeague(r.breed_class);

    return {
      id: r.id,
      catalog_no: r.catalog_no,
      dog_id: r.dog_id || r.dog?.id || null,
      dog_name: names.name,
      name_ru: names.name_ru,
      name_lat: names.name_lat,
      breed: (r.dog?.breed || r.breed || '').trim().toUpperCase(),
      sex: r.dog?.sex || r.sex || '',
      breed_class: r.breed_class || '',
      league,
      placement: r.placement || 0,
      total_score: typeof r.total_score === 'number' ? r.total_score : null,
      status: r.status || 'finished',
      status_reason: r.status_reason || null,
      heats,
    };
  });
}

export function buildStageInfo(
  id: number,
  stageNum: number,
  dateStart: string,
  dateEnd: string | null,
  title: string,
  rawEventJson: any,
  results: StageResult[],
  customPdfUrl?: string | null
): StageInfo {
  const winners: StageWinner[] = results
    .filter((r) => r.placement === 1)
    .map((r) => ({
      dog_name: r.dog_name,
      breed: r.breed,
      breed_class: r.breed_class,
      league: r.league,
      placement: 1,
      time: r.total_score,
    }));

  return {
    id,
    stage_num: stageNum,
    date_start: dateStart,
    date_end: dateEnd,
    title,
    discipline: 'Бега борзых (рейсинг 350 м)',
    location: 'Московская область, Раменский р-н, д. Донино',
    judge: null,
    series_director: 'Манухин Михаил Андреевич',
    participants_count: results.length,
    has_results: results.length > 0,
    status: results.length > 0 ? 'completed' : 'upcoming',
    catalog_url: rawEventJson?.event?.catalog_url || null,
    rules_url: rawEventJson?.event?.rules_url || null,
    results_pdf_url: rawEventJson?.event?.results_pdf_url || customPdfUrl || null,
    protocol_url: `/event/${id}`,
    classes_count: new Set(results.map((r) => r.breed_class)).size,
    winners,
    results,
  };
}
