import type { RatingItem } from '../types';
import type { ApiClient } from './client';
import { CACHE_TTL } from './constants';

export class JudgesApi {
  constructor(private client: ApiClient) {}

  async getJudgesSummary(): Promise<RatingItem[]> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/indexes/judges-summary.json`,
        CACHE_TTL.JUDGES,
      );
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) return data as RatingItem[];
        if ('judges' in data && Array.isArray((data as any).judges)) {
          return (data as any).judges as RatingItem[];
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  async getShowJudges(): Promise<RatingItem[]> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/indexes/judges.json`,
        CACHE_TTL.JUDGES,
      );
      if (data && Array.isArray(data)) {
        return data as RatingItem[];
      }
      return [];
    } catch {
      return [];
    }
  }
}
