import type { Competition, RatingItem } from '../types';
import type { ApiClient } from './client';
import { CACHE_TTL } from './constants';

export function parseShowCalendarDate(date?: string): string | undefined {
  if (!date) return undefined;
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date.trim());
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return date;
}

export class ShowsApi {
  constructor(private client: ApiClient) {}

  async getShowsCalendar(year: string = new Date().getFullYear().toString()): Promise<Competition[]> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/calendar/${year}.json`,
        CACHE_TTL.CALENDAR,
      );
      const calendarData = data as {
        exhibitions?: Array<{
          id: number;
          date?: string;
          title?: string;
          location?: string;
          rank?: string;
        }>;
      };

      const exhibitions = calendarData?.exhibitions || [];
      return exhibitions.map((ex) => {
        const isoDate = parseShowCalendarDate(ex.date);
        return {
          id: ex.id,
          title: ex.title,
          name: ex.title,
          date: isoDate,
          date_start: isoDate,
          location: ex.location || '',
          event_type: 'show',
          type: ex.rank,
        } satisfies Competition;
      });
    } catch {
      return [];
    }
  }

  async getShows(year: string): Promise<RatingItem[]> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/indexes/dog-ranking-${year}.json`,
        CACHE_TTL.SHOWS,
      );
      if (data && Array.isArray(data)) {
        return data as RatingItem[];
      }
      return [];
    } catch {
      return [];
    }
  }

  async getShowSummaryForCompetitionDog(competitionDogId: number | string): Promise<{
    total_shows: number;
    best_award: string | null;
    title_keys: string[];
    title_counts: Record<string, number>;
  } | null> {
    const idNum = Number(competitionDogId);
    if (!Number.isFinite(idNum) || idNum <= 0) return null;

    try {
      const shard = String(Math.abs(idNum) % 256).padStart(3, '0');
      const pack = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/indexes/dog-details/${shard}.json`,
        CACHE_TTL.SHOWS,
      );
      if (!pack || typeof pack !== 'object') return null;

      const entries = Object.values(pack as Record<string, Record<string, unknown>>);
      const dog =
        entries.find((d) => Number(d.competition_dog_id) === idNum) ||
        (pack as Record<string, Record<string, unknown>>)[String(idNum)];

      if (!dog) return null;

      const totalShows = Number(dog.total_shows) || 0;
      if (totalShows <= 0) return null;

      const titleOrder = [
        'BIS', 'BIG', 'BIS_JUNIOR', 'BIS_VETERAN', 'BIS_PUPPY', 'BIS_BABY',
        'BOB', 'BOS', 'LYU', 'LV', 'LSH', 'LB',
        'CACIB', 'R_CACIB', 'CAC', 'JCAC', 'VCAC',
        'CHRKF', 'YCHRKF', 'VCHRKF',
        'P_RUSSIA', 'P_MOSCOW', 'YP_RUSSIA', 'YP_MOSCOW', 'VP_RUSSIA', 'VP_MOSCOW',
        'KCHK', 'KCHP', 'YKCHK', 'YKCHP', 'VKCHK', 'VKCHP',
        'CW', 'R_CAC', 'R_JCAC', 'R_VCAC', 'SS', 'YSS', 'VSS',
      ];

      const titles = dog.titles;
      const title_counts: Record<string, number> = {};
      if (titles && typeof titles === 'object' && !Array.isArray(titles)) {
        for (const [key, value] of Object.entries(titles as Record<string, unknown>)) {
          const n = Number(value);
          if (Number.isFinite(n) && n > 0) title_counts[key] = n;
        }
      }

      const known = titleOrder.filter((key) => (title_counts[key] ?? 0) > 0);
      const extras = Object.keys(title_counts).filter((key) => !known.includes(key));
      const title_keys = [...known, ...extras];

      const bestAward =
        typeof dog.best_award === 'string' && dog.best_award.trim()
          ? dog.best_award.trim()
          : null;

      return {
        total_shows: totalShows,
        best_award: bestAward,
        title_keys,
        title_counts,
      };
    } catch {
      return null;
    }
  }
}
