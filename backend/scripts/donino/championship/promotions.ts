import type { DogStanding, PromotionRecord, StageInfo, StageResult } from './types.js';
import { findStagePointEntry, getDogKey } from './matchers.js';

export function recordStagePromotions(
  stageNum: number,
  results: StageResult[]
): PromotionRecord[] {
  const promotions: PromotionRecord[] = [];
  for (const r of results) {
    if (r.placement === 1) {
      if (r.league === 'Чемпионов') {
        promotions.push({
          stage_from: stageNum,
          stage_to: stageNum + 1,
          dog_name: r.dog_name,
          breed: r.breed,
          from_league: 'Лига Чемпионов',
          to_league: 'Лига Абсолют',
          reason: `1 место в классе ${r.breed_class}`,
        });
      } else if (r.league === 'Прогресс') {
        promotions.push({
          stage_from: stageNum,
          stage_to: stageNum + 1,
          dog_name: r.dog_name,
          breed: r.breed,
          from_league: 'Лига Прогресс',
          to_league: 'Лига Чемпионов',
          reason: `1 место в классе ${r.breed_class}`,
        });
      }
    }
  }
  return promotions;
}

export function processStageResults(
  stage: StageInfo,
  stageResults: StageResult[],
  pointsList: any[] | undefined,
  dogsMap: Map<string, DogStanding>
): void {
  const stageNum = stage.stage_num;

  for (const r of stageResults) {
    const key = getDogKey(r.dog_id, r.dog_name, r.breed);
    const isWin = r.placement === 1;
    let standing = dogsMap.get(key);

    const pts = findStagePointEntry(r.dog_name, r.breed, r.name_ru, r.name_lat, pointsList);
    const sPoints = pts ? pts.total_points : 0;
    const sBreakdown = pts
      ? {
          place_points: pts.place_points || 0,
          best_final_points: pts.best_final_points || 0,
          best_class_points: pts.best_class_points || 0,
          best_breed_points: pts.best_breed_points || 0,
          track_record_points: pts.track_record_points || 0,
        }
      : undefined;

    if (!standing) {
      // New dog joining at this stage
      let targetLeague = r.league;
      if (isWin) {
        if (r.league === 'Чемпионов') targetLeague = 'Абсолют';
        else if (r.league === 'Прогресс') targetLeague = 'Чемпионов';
        else if (r.league === 'Юниоры') targetLeague = 'Юниоры';
        else if (r.league === 'Абсолют') targetLeague = 'Абсолют';
      }

      let promoLabel: string | null = null;
      if (isWin) {
        if (r.league === 'Чемпионов') {
          promoLabel = stageNum === 1 ? 'Выход в Абсолют (победа I этапа)' : stageNum === 2 ? 'Выход в Абсолют (победа II этапа)' : 'Выход в Абсолют (победа в финале)';
        } else if (r.league === 'Прогресс') {
          promoLabel = stageNum === 1 ? 'Выход в Чемпионы (победа I этапа)' : stageNum === 2 ? 'Выход в Чемпионы (победа II этапа)' : 'Выход в Чемпионы (победа в финале)';
        } else if (r.league === 'Юниоры') {
          promoLabel = stageNum === 3 ? 'Победитель Лиги Юниоров (финал)' : 'Победитель Лиги Юниоров';
        } else if (r.league === 'Абсолют') {
          promoLabel = stageNum === 3 ? 'Победитель Лиги Абсолют (финал)' : `Победа в Лиге Абсолют ${stageNum} этапа`;
        }
      }

      standing = {
        dog_key: key,
        dog_id: r.dog_id,
        name: r.dog_name,
        name_ru: r.name_ru || r.dog_name,
        name_lat: r.name_lat || r.dog_name,
        breed: r.breed,
        sex: r.sex,
        current_league: targetLeague,
        wins_count: isWin ? 1 : 0,
        consecutive_losses: isWin ? 0 : 1,
        best_time: r.total_score,
        stages_count: 1,
        total_points: sPoints,
        stage_points: sPoints ? { [stageNum]: sPoints } : {},
        status_badge: isWin ? (r.league === 'Юниоры' ? 'stable' : 'promoted_up') : 'stable',
        promotion_label: promoLabel,
        history: [
          {
            stage_num: stageNum,
            date: stage.date_start,
            placement: r.placement,
            total_score: r.total_score,
            league: r.league,
            breed_class: r.breed_class,
            status: r.status,
            points: sPoints,
            points_breakdown: sBreakdown,
          },
        ],
      };
      dogsMap.set(key, standing);
    } else {
      // Existing dog
      standing.stages_count += 1;
      if (!standing.name_ru && r.name_ru) standing.name_ru = r.name_ru;
      if (!standing.name_lat && r.name_lat) standing.name_lat = r.name_lat;
      if (r.name_ru && (!standing.name || /[a-z]/i.test(standing.name))) {
        standing.name = r.name_ru;
      }
      if (typeof r.total_score === 'number') {
        if (standing.best_time === null || r.total_score < standing.best_time) {
          standing.best_time = r.total_score;
        }
      }

      if (isWin) {
        standing.wins_count += 1;
        standing.consecutive_losses = 0;
        if (r.league === 'Чемпионов') {
          standing.current_league = 'Абсолют';
          standing.status_badge = 'promoted_up';
          standing.promotion_label = stageNum === 3 ? 'Выход в Абсолют (победа в финале)' : `Выход в Абсолют на ${stageNum + 1} этап`;
        } else if (r.league === 'Прогресс') {
          standing.current_league = 'Чемпионов';
          standing.status_badge = 'promoted_up';
          standing.promotion_label = stageNum === 3 ? 'Выход в Чемпионы (победа в финале)' : `Выход в Чемпионы на ${stageNum + 1} этап`;
        } else if (r.league === 'Юниоры') {
          standing.current_league = 'Юниоры';
          standing.status_badge = 'stable';
          standing.promotion_label = stageNum === 3 ? 'Победитель Лиги Юниоров (финал)' : 'Победитель Лиги Юниоров';
        } else if (r.league === 'Абсолют') {
          standing.current_league = 'Абсолют';
          standing.status_badge = 'stable';
          standing.promotion_label = stageNum === 3 ? 'Победитель Лиги Абсолют (финал)' : `Победитель Лиги Абсолют ${stageNum} этапа`;
        }
      } else {
        standing.consecutive_losses += 1;
        if (standing.consecutive_losses >= 3) {
          if (standing.current_league === 'Абсолют') {
            standing.current_league = 'Чемпионов';
            standing.status_badge = 'relegated_down';
            standing.promotion_label = 'Переход в Чемпионы (3 поражения подряд)';
          } else if (standing.current_league === 'Чемпионов') {
            standing.current_league = 'Прогресс';
            standing.status_badge = 'relegated_down';
            standing.promotion_label = 'Переход в Прогресс (3 поражения подряд)';
          }
        } else {
          standing.status_badge = 'stable';
          standing.promotion_label = null;
        }
      }

      if (sPoints) {
        standing.stage_points[stageNum] = sPoints;
      }
      standing.total_points = Object.values(standing.stage_points).reduce((acc, val) => acc + val, 0);

      standing.history.push({
        stage_num: stageNum,
        date: stage.date_start,
        placement: r.placement,
        total_score: r.total_score,
        league: r.league,
        breed_class: r.breed_class,
        status: r.status,
        points: sPoints,
        points_breakdown: sBreakdown,
      });
    }
  }
}
