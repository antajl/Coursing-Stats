import type { Competition, Rating, CalendarChangelog } from '../types';
import type { ApiClient } from './client';
import { CACHE_TTL } from './constants';

export class CompetitionsApi {
  constructor(private client: ApiClient) {}

  async getTopRatings(
    discipline: string = 'coursing',
    category: string = 'score',
    year: string = '2026',
    limit: number = 10,
  ): Promise<Rating[]> {
    try {
      let endpoint: string;

      if (discipline === 'racing') {
        endpoint = `${this.client.baseApiUrl}/indexes/top-speed-${year}.json`;
      } else if (category === 'elo') {
        endpoint = `${this.client.baseApiUrl}/indexes/top-elo-${year}.json`;
      } else if (category === 'score') {
        endpoint = `${this.client.baseApiUrl}/indexes/top-score-${year}.json`;
      } else {
        endpoint = `${this.client.baseApiUrl}/indexes/top-placement-${year}.json`;
      }

      const data = await this.client.fetchJSON(endpoint, CACHE_TTL.RATINGS);
      const ratingsData = data as { items?: Rating[] } | Rating[];

      if (ratingsData && typeof ratingsData === 'object' && 'items' in ratingsData && ratingsData.items) {
        return ratingsData.items.slice(0, limit);
      }
      if (ratingsData && Array.isArray(ratingsData)) {
        return ratingsData.slice(0, limit);
      }
      return [];
    } catch {
      return [];
    }
  }

  async getCalendar(year: string = new Date().getFullYear().toString()): Promise<Competition[]> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/calendar/${year}.json`,
        CACHE_TTL.CALENDAR,
      );
      const calendarData = data as { events?: Competition[] };
      return calendarData?.events || [];
    } catch {
      return [];
    }
  }

  async getCalendarChangelog(year: string = '2027'): Promise<CalendarChangelog | null> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/calendar/${year}-changelog.json`,
        CACHE_TTL.CALENDAR,
      );
      return (data as CalendarChangelog) || null;
    } catch {
      return null;
    }
  }
}
