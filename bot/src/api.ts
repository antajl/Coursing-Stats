import { Dog, DogData, SpeedRecord, CoursingRecord, Rating, Competition, RatingItem, SpeedRecordExtended, CompetitionData } from './types';

const SITE_URL = 'https://coursing-stats.ru';
const BASE_API_URL = `${SITE_URL}/data/v1`;

interface CompactSearchIndex {
  schema: string;
  popular: CompactDogEntry[];
  name_prefix: { [prefix: string]: number[] };
  breed_index: { [breed: string]: number[] };
  metadata: {
    total_dogs: number;
    popular_count: number;
    last_updated: string;
    version: string;
  };
}

interface CompactDogEntry {
  id: number;
  name_lat: string;
  name_ru: string;
  breed: string;
  activity_score: number;
}

/**
 * Константы времени кэширования для KV хранилища
 * Значения в секундах
 */
const CACHE_TTL = {
  /** Индекс собак - 1 час. Индекс меняется редко при добавлении новых собак. */
  DOGS_INDEX: 3600,
  /** Рейтинги - 1 час. Рейтинги обновляются редко, обычно после соревнований. */
  RATINGS: 3600,
  /** Рекорды скорости и курсинга - 1 час. Рекорды меняются редко. */
  RECORDS: 3600,
  /** Календарь соревнований - 30 минут. Календарь может обновляться чаще. */
  CALENDAR: 1800,
  /** Профиль собаки - без кэширования. Профили индивидуальны и часто запрашиваются. */
  DOG_PROFILE: 0,
  /** Выставки - 1 час. Данные выставок обновляются после событий. */
  SHOWS: 3600,
  /** Судьи - 1 час. Рейтинги судей меняются редко. */
  JUDGES: 3600,
  /** Компактный поисковый индекс - 1 час. Обновляется редко. */
  BOT_SEARCH_COMPACT: 3600,
} as const;

class CoursingStatsAPI {
  private cache: KVNamespace | null = null;

  /**
   * Создает экземпляр API клиента для Coursing Stats
   * @param cache - опциональное KV хранилище для кэширования запросов
   */
  constructor(cache?: KVNamespace) {
    this.cache = cache || null;
  }

  private async fetchJSON(url: string, ttl?: number, retries: number = 3): Promise<unknown> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Try to get from cache first
        if (this.cache) {
          const cacheKey = `cache:${url}`;
          const cached = await this.cache.get(cacheKey, 'json');
          if (cached) {
            return cached;
          }
        }

        const response = await fetch(url);
        
        if (response.ok) {
          const text = await response.text();
          const data = JSON.parse(text);

          // Store in cache if TTL is provided
          if (this.cache && ttl) {
            const cacheKey = `cache:${url}`;
            await this.cache.put(cacheKey, JSON.stringify(data), { expirationTtl: ttl });
          }

          return data;
        }
        
        // If not OK and not last attempt, wait before retry
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        return null;
      } catch (error) {
        // If error and not last attempt, wait before retry
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        return null;
      }
    }
    return null;
  }

  private async getDogsIndex(): Promise<Dog[] | null> {
    try {
      // Кэширование: индекс собак - 1 час (индекс меняется редко)
      const data = await this.fetchJSON(`${BASE_API_URL}/indexes/dogs-index.json`, CACHE_TTL.DOGS_INDEX);

      if (data && Array.isArray(data)) {
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async getCompactSearchIndex(): Promise<CompactSearchIndex | null> {
    try {
      // Кэширование: компактный индекс - 1 час
      const data = await this.fetchJSON(`${BASE_API_URL}/indexes/bot-search-compact.json`, CACHE_TTL.BOT_SEARCH_COMPACT);

      if (data && (data as any).schema === 'coursing-stats/bot-search-compact-v1') {
        return data as CompactSearchIndex;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Ищет собак по имени с нечетким matching (оптимизировано)
   * @param dogName - имя собаки для поиска (минимум 2 символа)
   * @param breed - опциональная фильтрация по породе
   * @param limit - максимальное количество результатов (по умолчанию 5)
   * @returns массив найденных собак
   */
  async searchDogsByName(dogName: string, breed?: string, limit: number = 5): Promise<Dog[]> {
    try {
      const dogNameLower = dogName.toLowerCase();
      
      // Проверяем кэш для поиска
      const cacheKey = `search:${dogNameLower}:${breed || 'all'}:${limit}`;
      if (this.cache) {
        const cached = await this.cache.get(cacheKey, 'json');
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
          // Хороший результат в компактном индексе - кэшируем
          if (this.cache) {
            await this.cache.put(cacheKey, JSON.stringify(results), { expirationTtl: 1800 }); // 30 минут
          }
          return results;
        }
        
        // Если мало результатов, расширяем поиск через prefix index
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
      
      // Кэшируем результаты
      if (this.cache && results.length > 0) {
        await this.cache.put(cacheKey, JSON.stringify(results), { expirationTtl: 1800 }); // 30 минут
      }
      
      return results;
    } catch (error) {
      return [];
    }
  }

  private searchFullIndex(query: string, breed: string | undefined, dogsIndex: Dog[], limit: number): Dog[] {
    const foundDogs: Dog[] = [];

    for (const dog of dogsIndex) {
      const nameLat = dog.name_lat || '';
      const nameRu = dog.name_ru || '';
      
      // Фильтрация по породе если указана
      if (breed && dog.breed !== breed) {
        continue;
      }
      
      if (nameLat.toLowerCase().includes(query) || nameRu.toLowerCase().includes(query)) {
        foundDogs.push({
          id: dog.id,
          name_lat: nameLat,
          name_ru: nameRu,
          breed: dog.breed || '',
          competition_count: dog.competition_count || 0
        });
      }
    }

    return this.sortByRelevance(foundDogs, query).slice(0, limit);
  }

  private searchInCompactIndex(query: string, breed: string | undefined, index: CompactSearchIndex, limit: number): Dog[] {
    const results: Dog[] = [];
    
    for (const dog of index.popular) {
      // Фильтрация по породе
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
          competition_count: dog.activity_score // Используем activity_score как proxy
        });
      }
      
      if (results.length >= limit) break;
    }
    
    return this.sortByRelevance(results, query);
  }

  private searchByPrefix(query: string, breed: string | undefined, index: CompactSearchIndex, limit: number): Dog[] {
    const results: Dog[] = [];
    const searchedIds = new Set<number>();
    
    // Поиск по префиксам
    for (let i = 1; i <= Math.min(3, query.length); i++) {
      const prefix = query.substring(0, i);
      const dogIds = index.name_prefix[prefix];
      
      if (dogIds) {
        for (const dogId of dogIds) {
          if (searchedIds.has(dogId)) continue;
          searchedIds.add(dogId);
          
          const dog = index.popular.find(d => d.id === dogId);
          if (dog) {
            // Фильтрация по породе
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
                competition_count: dog.activity_score
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
    const seenIds = new Set(primary.map(d => d.id));
    
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
      // Точное совпадение
      const aExact = a.name_lat.toLowerCase() === queryLower || a.name_ru.toLowerCase() === queryLower;
      const bExact = b.name_lat.toLowerCase() === queryLower || b.name_ru.toLowerCase() === queryLower;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Начинается с query
      const aStarts = a.name_lat.toLowerCase().startsWith(queryLower) || a.name_ru.toLowerCase().startsWith(queryLower);
      const bStarts = b.name_lat.toLowerCase().startsWith(queryLower) || b.name_ru.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      // По activity_score (более активные собаки первыми)
      return (b.competition_count || 0) - (a.competition_count || 0);
    });
  }

  /**
   * Нечеткое соответствие (fuzzy matching) для поиска
   * @param dogName - имя собаки для поиска
   * @param maxDistance - максимальное расстояние Левенштейна (по умолчанию 2)
   * @returns массив собак с нечетким соответствием
   */
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
        
        // Calculate Levenshtein distance for both names
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
              competition_count: dog.competition_count || 0
            },
            distance: minDistance
          });
        }
      }

      // Sort by distance (closer matches first)
      results.sort((a, b) => a.distance - b.distance);

      return results.map(r => r.dog);
    } catch (error) {
      return [];
    }
  }

  /**
   * Расстояние Левенштейна между двумя строками
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    
    // Оптимизация для коротких строк
    if (m === 0) return n;
    if (n === 0) return m;
    if (Math.abs(m - n) > 3) return Math.max(m, n); // Слишком большая разница в длине
    
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }
    
    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    
    return dp[m][n];
  }

  /**
   * Получает профиль собаки по ID
   * @param dogId - уникальный идентификатор собаки
   * @returns данные профиля собаки или null если не найден
   */
  async getDogById(dogId: string): Promise<DogData | null> {
    try {
      const url = `${BASE_API_URL}/indexes/dog-profiles/${dogId}.json`;
      // Без кэширования - профили индивидуальны и часто запрашиваются
      const result = await this.fetchJSON(url, CACHE_TTL.DOG_PROFILE);

      return result as DogData | null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Получает топ рейтинги по дисциплине и категории
   * @param discipline - дисциплина (coursing, racing, shows)
   * @param category - категория рейтинга (score, placement)
   * @param year - год (или 'all' для всех лет)
   * @param limit - максимальное количество результатов
   * @returns массив рейтингов
   */
  async getTopRatings(discipline: string = 'coursing', category: string = 'score', year: string = '2026', limit: number = 10): Promise<Rating[]> {
    try {
      let data;
      let endpoint;
      
      if (discipline === 'racing') {
        // Racing might not have separate endpoints, try to use coursing endpoints with filtering
        endpoint = `${BASE_API_URL}/indexes/top-placement-${year}.json`;
      } else {
        // Coursing (default)
        if (category === 'score') {
          endpoint = `${BASE_API_URL}/indexes/top-score-${year}.json`;
        } else {
          endpoint = `${BASE_API_URL}/indexes/top-placement-${year}.json`;
        }
      }

      // Кэширование: рейтинги - 1 час (обновляются редко после соревнований)
      data = await this.fetchJSON(endpoint, CACHE_TTL.RATINGS);

      const ratingsData = data as { items?: Rating[] } | Rating[];

      if (ratingsData && typeof ratingsData === 'object' && 'items' in ratingsData && ratingsData.items) {
        let ratings = ratingsData.items.slice(0, limit);

        // If racing discipline, filter by racing-related breeds or activities
        if (discipline === 'racing') {
          // Try to filter - this is a simplified approach
          // In reality, we'd need proper racing data
        }

        return ratings;
      } else if (ratingsData && Array.isArray(ratingsData)) {
        return ratingsData.slice(0, limit);
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Получает рекорды скорости Донино
   * @returns объект с массивами рекордов скорости и курсинга
   */
  async getSpeedRecords(): Promise<{ speed: SpeedRecord[]; coursing: CoursingRecord[] }> {
    try {
      // Кэширование: рекорды - 1 час (меняются редко)
      const speedData = await this.fetchJSON(`${BASE_API_URL}/donino/speed_records.json`, CACHE_TTL.RECORDS);
      const coursingData = await this.fetchJSON(`${BASE_API_URL}/donino/coursing_records.json`, CACHE_TTL.RECORDS);

      const speedRecords = (speedData as { records?: SpeedRecord[] })?.records || [];
      const coursingRecords = (coursingData as { records?: CoursingRecord[] })?.records || [];

      return {
        speed: speedRecords,
        coursing: coursingRecords
      };
    } catch (error) {
      return { speed: [], coursing: [] };
    }
  }

  /**
   * Поиск собаки в рекордах Донино по имени
   * @param query - имя собаки для поиска
   * @returns массив найденных рекордов (скорость и курсинг)
   */
  async searchDoninoRecords(query: string): Promise<{ speed: SpeedRecord[]; coursing: CoursingRecord[] }> {
    try {
      const records = await this.getSpeedRecords();
      const lowerQuery = query.toLowerCase();
      
      const speedResults = records.speed.filter(record => 
        record.name.toLowerCase().includes(lowerQuery) ||
        (record.breed && record.breed.toLowerCase().includes(lowerQuery))
      );
      
      const coursingResults = records.coursing.filter(record => 
        record.name.toLowerCase().includes(lowerQuery) ||
        (record.breed && record.breed.toLowerCase().includes(lowerQuery))
      );
      
      return {
        speed: speedResults.slice(0, 5), // Максимум 5 результатов
        coursing: coursingResults.slice(0, 5)
      };
    } catch (error) {
      return { speed: [], coursing: [] };
    }
  }

  /**
   * Получает календарь соревнований
   * @param year - год (по умолчанию текущий год)
   * @returns массив соревнований
   */
  async getCalendar(year: string = new Date().getFullYear().toString()): Promise<Competition[]> {
    try {
      // Кэширование: календарь - 30 минут (может обновляться чаще)
      const data = await this.fetchJSON(`${BASE_API_URL}/calendar/${year}.json`, CACHE_TTL.CALENDAR);
      const calendarData = data as { events?: Competition[] };
      return calendarData?.events || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Получает календарь выставок
   * @param year - год (по умолчанию текущий год)
   * @returns массив выставок
   */
  async getShowsCalendar(year: string = new Date().getFullYear().toString()): Promise<Competition[]> {
    try {
      // Кэширование: календарь выставок - 30 минут (может обновляться чаще)
      const data = await this.fetchJSON(`${BASE_API_URL}/shows/calendar/${year}.json`, CACHE_TTL.CALENDAR);
      const calendarData = data as { events?: Competition[] };
      return calendarData?.events || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Получает рейтинги выставок за год
   * @param year - год
   * @returns массив рейтингов выставок
   */
  async getShows(year: string): Promise<RatingItem[]> {
    try {
      // Кэширование: выставки - 1 час (обновляются после событий)
      const data = await this.fetchJSON(`${BASE_API_URL}/shows/indexes/dog-ranking-${year}.json`, CACHE_TTL.SHOWS);
      // Shows data is a flat array, not {top: [...]}
      if (data && Array.isArray(data)) {
        return data as RatingItem[];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Получает сводку судей соревнований
   * @returns массив данных судей
   */
  async getJudgesSummary(): Promise<RatingItem[]> {
    try {
      // Competition judges: indexes/judges-summary.json
      // Кэширование: судьи соревнований - 1 час (рейтинги меняются редко)
      const data = await this.fetchJSON(`${BASE_API_URL}/indexes/judges-summary.json`, CACHE_TTL.JUDGES);
      if (data && Array.isArray(data)) {
        return data as RatingItem[];
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Получает судей выставок
   * @returns массив данных судей выставок
   */
  async getShowJudges(): Promise<RatingItem[]> {
    try {
      // Show judges: shows/indexes/judges.json
      // Кэширование: судьи выставок - 1 час (рейтинги меняются редко)
      const data = await this.fetchJSON(`${BASE_API_URL}/shows/indexes/judges.json`, CACHE_TTL.JUDGES);
      if (data && Array.isArray(data)) {
        return data as RatingItem[];
      }
      return [];
    } catch (error) {
      return [];
    }
  }
}

export { CoursingStatsAPI };

