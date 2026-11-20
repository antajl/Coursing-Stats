import type { ApiClient } from './client';

export class GuideApi {
  constructor(private client: ApiClient) {}

  async getGuide(): Promise<any | null> {
    try {
      const data = await this.client.fetchJSON(`${this.client.baseApiUrl}/guide.json`, 86400);
      return data || null;
    } catch {
      return null;
    }
  }
}
