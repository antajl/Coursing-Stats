import type { SpeedRecord, CoursingRecord } from '../types';
import type { ApiClient } from './client';
import { CACHE_TTL } from './constants';

export class DoninoApi {
  constructor(private client: ApiClient) {}

  async getSpeedRecords(): Promise<{ speed: SpeedRecord[]; coursing: CoursingRecord[] }> {
    try {
      const speedData = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/donino/speed_records.json`,
        CACHE_TTL.RECORDS,
      );
      const coursingData = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/donino/coursing_records.json`,
        CACHE_TTL.RECORDS,
      );

      const speedRecords = (speedData as { records?: SpeedRecord[] })?.records || [];
      const coursingRecords = (coursingData as { records?: CoursingRecord[] })?.records || [];

      return {
        speed: speedRecords,
        coursing: coursingRecords,
      };
    } catch {
      return { speed: [], coursing: [] };
    }
  }

  async searchDoninoRecords(query: string): Promise<{ speed: SpeedRecord[]; coursing: CoursingRecord[] }> {
    try {
      const records = await this.getSpeedRecords();
      const lowerQuery = query.toLowerCase();

      const speedResults = records.speed.filter(
        (record) =>
          record.name.toLowerCase().includes(lowerQuery) ||
          (record.breed && record.breed.toLowerCase().includes(lowerQuery)),
      );

      const coursingResults = records.coursing.filter(
        (record) =>
          record.name.toLowerCase().includes(lowerQuery) ||
          (record.breed && record.breed.toLowerCase().includes(lowerQuery)),
      );

      return {
        speed: speedResults.slice(0, 5),
        coursing: coursingResults.slice(0, 5),
      };
    } catch {
      return { speed: [], coursing: [] };
    }
  }
}
