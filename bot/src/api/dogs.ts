import type { Dog, DogData } from '../types';
import type { CompactSearchIndex } from './types';
import type { ApiClient } from './client';
import { CACHE_TTL } from './constants';

export class DogsApi {
  constructor(private client: ApiClient) {}

  private async getDogsIndex(): Promise<Dog[] | null> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/indexes/dogs-index.json`,
        CACHE_TTL.DOGS_INDEX,
      );

      if (data && Array.isArray(data)) {
        return data as Dog[];
      }
      return null;
    } catch {
      return null;
    }
  }

  private async getCompactSearchIndex(): Promise<CompactSearchIndex | null> {
    try {
      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/indexes/bot-search-compact.json`,
        CACHE_TTL.BOT_SEARCH_COMPACT,
      );

      if (data && (data as any).schema === 'coursing-stats/bot-search-compact-v1') {
        return data as CompactSearchIndex;
      }
      return null;
    } catch {
      return null;
    }
  }

  async searchDogsByName(dogName: string, breed?: string, limit: number = 5): Promise<Dog[]> {
    try {
      const dogNameLower = dogName.toLowerCase();

      // Проверяем кэш для поиска
      const cacheKey = `search:${dogNameLower}:${breed || 'all'}:${limit}`;
      if (this.client.cache) {
        const cached = await this.client.cache.get(cacheKey, 'json');
        if (cached && Array.isArray(cached)) {
          return cached as Dog[];
        }
      }

      let results: Dog[] = [];

      // Сначала пробуем компактный индекс (быстрый поиск)
      const compactIndex = await this.getCompactSearchIndex();

      if (compactIndex) {
        results = this.searchInCompactIndex(dogNameLower, breed, compactIndex, limit);

        if (results.length >= Math.min(3, limit)) {
          if (this.client.cache) {
            await this.client.cache.put(cacheKey, JSON.stringify(results), { expirationTtl: 1800 });
          }
          return results;
        }

        if (results.length < limit) {
          const prefixResults = this.searchByPrefix(dogNameLower, breed, compactIndex, limit);
          if (prefixResults.length >= results.length) {
            results = this.mergeAndRankResults(results, prefixResults, limit);
          }
        }
      }

      // Fallback к полному индексу если компактный индекс недоступен или результатов мало
      if (results.length < limit) {
        const dogsIndex = await this.getDogsIndex();
        if (dogsIndex) {
          results = this.searchFullIndex(dogNameLower, breed, dogsIndex, limit);
        }
      }

      if (this.client.cache && results.length > 0) {
        await this.client.cache.put(cacheKey, JSON.stringify(results), { expirationTtl: 1800 });
      }

      return results;
    } catch {
      return [];
    }
  }

  private searchFullIndex(query: string, breed: string | undefined, dogsIndex: Dog[], limit: number): Dog[] {
    const foundDogs: Dog[] = [];

    for (const dog of dogsIndex) {
      const nameLat = dog.name_lat || '';
      const nameRu = dog.name_ru || '';

      if (breed && dog.breed !== breed) {
        continue;
      }

      if (nameLat.toLowerCase().includes(query) || nameRu.toLowerCase().includes(query)) {
        foundDogs.push({
          id: dog.id,
          name_lat: nameLat,
          name_ru: nameRu,
          breed: dog.breed || '',
          competition_count: dog.competition_count || 0,
        });
      }
    }

    return this.sortByRelevance(foundDogs, query).slice(0, limit);
  }

  private searchInCompactIndex(query: string, breed: string | undefined, index: CompactSearchIndex, limit: number): Dog[] {
    const results: Dog[] = [];

    for (const dog of index.popular) {
      if (breed && dog.breed !== breed) {
        continue;
      }

      const nameLat = dog.name_lat.toLowerCase();
      const nameRu = dog.name_ru.toLowerCase();

      if (nameLat.includes(query) || nameRu.includes(query)) {
        results.push({
          id: dog.id,
          name_lat: dog.name_lat,
          name_ru: dog.name_ru,
          breed: dog.breed,
          competition_count: dog.activity_score,
        });
      }

      if (results.length >= limit) break;
    }

    return this.sortByRelevance(results, query);
  }

  private searchByPrefix(query: string, breed: string | undefined, index: CompactSearchIndex, limit: number): Dog[] {
    const results: Dog[] = [];
    const searchedIds = new Set<number>();

    for (let i = 1; i <= Math.min(3, query.length); i++) {
      const prefix = query.substring(0, i);
      const dogIds = index.name_prefix[prefix];

      if (dogIds) {
        for (const dogId of dogIds) {
          if (searchedIds.has(dogId)) continue;
          searchedIds.add(dogId);

          const dog = index.popular.find((d) => d.id === dogId);
          if (dog) {
            if (breed && dog.breed !== breed) {
              continue;
            }

            const nameLat = dog.name_lat.toLowerCase();
            const nameRu = dog.name_ru.toLowerCase();

            if (nameLat.includes(query) || nameRu.includes(query)) {
              results.push({
                id: dog.id,
                name_lat: dog.name_lat,
                name_ru: dog.name_ru,
                breed: dog.breed,
                competition_count: dog.activity_score,
              });
            }
          }

          if (results.length >= limit) break;
        }
      }

      if (results.length >= limit) break;
    }

    return this.sortByRelevance(results, query);
  }

  private mergeAndRankResults(primary: Dog[], secondary: Dog[], limit: number): Dog[] {
    const merged = [...primary];
    const seenIds = new Set(primary.map((d) => d.id));

    for (const dog of secondary) {
      if (!seenIds.has(dog.id)) {
        merged.push(dog);
        seenIds.add(dog.id);
      }
    }

    return this.sortByRelevance(merged, '').slice(0, limit);
  }

  private sortByRelevance(dogs: Dog[], query: string): Dog[] {
    const queryLower = query.toLowerCase();

    return dogs.sort((a, b) => {
      const aExact = a.name_lat.toLowerCase() === queryLower || a.name_ru.toLowerCase() === queryLower;
      const bExact = b.name_lat.toLowerCase() === queryLower || b.name_ru.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStarts = a.name_lat.toLowerCase().startsWith(queryLower) || a.name_ru.toLowerCase().startsWith(queryLower);
      const bStarts = b.name_lat.toLowerCase().startsWith(queryLower) || b.name_ru.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return (b.competition_count || 0) - (a.competition_count || 0);
    });
  }

  async fuzzySearchDogs(dogName: string, maxDistance: number = 2): Promise<Dog[]> {
    try {
      const dogsIndex = await this.getDogsIndex();
      if (!dogsIndex) {
        return [];
      }

      const dogNameLower = dogName.toLowerCase();
      const results: { dog: Dog; distance: number }[] = [];

      for (const dog of dogsIndex) {
        const nameLat = (dog.name_lat || '').toLowerCase();
        const nameRu = (dog.name_ru || '').toLowerCase();

        const latDistance = this.levenshteinDistance(dogNameLower, nameLat);
        const ruDistance = this.levenshteinDistance(dogNameLower, nameRu);

        const minDistance = Math.min(latDistance, ruDistance);

        if (minDistance <= maxDistance) {
          results.push({
            dog: {
              id: dog.id,
              name_lat: dog.name_lat || '',
              name_ru: dog.name_ru || '',
              breed: dog.breed || '',
              competition_count: dog.competition_count || 0,
            },
            distance: minDistance,
          });
        }
      }

      results.sort((a, b) => a.distance - b.distance);
      return results.map((r) => r.dog);
    } catch {
      return [];
    }
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;
    if (Math.abs(m - n) > 3) return Math.max(m, n);

    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost,
        );
      }
    }

    return dp[m][n];
  }

  async getDogById(dogId: string): Promise<DogData | null> {
    try {
      const shard = this.client.cdnPackShardKey(dogId);
      const packUrl = `${this.client.baseApiUrl}/indexes/dog-profiles/pack-${shard}.json`;
      const pack = (await this.client.fetchJSON(packUrl, CACHE_TTL.DOG_PROFILE)) as {
        byId?: Record<string, DogData>;
      } | null;
      const fromPack = pack?.byId?.[String(dogId)];
      if (fromPack) return fromPack;

      const url = `${this.client.baseApiUrl}/indexes/dog-profiles/${dogId}.json`;
      const result = await this.client.fetchJSON(url, CACHE_TTL.DOG_PROFILE);
      return result as DogData | null;
    } catch {
      return null;
    }
  }
}
