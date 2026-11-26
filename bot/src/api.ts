import type {
  Dog,
  DogData,
  SpeedRecord,
  CoursingRecord,
  Rating,
  Competition,
  RatingItem,
  CalendarChangelog,
} from './types';
import { ApiClient } from './api/client';
import { DogsApi } from './api/dogs';
import { CompetitionsApi } from './api/competitions';
import { ShowsApi } from './api/shows';
import { DoninoApi } from './api/donino';
import { JudgesApi } from './api/judges';
import { GuideApi } from './api/guide';
import { DEFAULT_SITE_URL } from './api/constants';

class CoursingStatsAPI {
  private client: ApiClient;
  private dogs: DogsApi;
  private competitions: CompetitionsApi;
  private shows: ShowsApi;
  private donino: DoninoApi;
  private judges: JudgesApi;
  private guide: GuideApi;

  constructor(cache?: KVNamespace, siteUrl: string = DEFAULT_SITE_URL) {
    this.client = new ApiClient(cache, siteUrl);
    this.dogs = new DogsApi(this.client);
    this.competitions = new CompetitionsApi(this.client);
    this.shows = new ShowsApi(this.client);
    this.donino = new DoninoApi(this.client);
    this.judges = new JudgesApi(this.client);
    this.guide = new GuideApi(this.client);
  }

  // Backwards-compatible accessors
  get cache(): KVNamespace | null {
    return this.client.cache;
  }

  get baseApiUrl(): string {
    return this.client.baseApiUrl;
  }

  fetchJSON(url: string, ttl?: number, retries: number = 2): Promise<unknown> {
    return this.client.fetchJSON(url, ttl, retries);
  }

  searchDogsByName(dogName: string, breed?: string, limit: number = 5): Promise<Dog[]> {
    return this.dogs.searchDogsByName(dogName, breed, limit);
  }

  fuzzySearchDogs(dogName: string, maxDistance: number = 2): Promise<Dog[]> {
    return this.dogs.fuzzySearchDogs(dogName, maxDistance);
  }

  async getDogById(dogId: string): Promise<DogData | null> {
    const numId = Number(dogId);
    if (Number.isFinite(numId) && numId >= 1_000_000) {
      return this.shows.getShowDogById(dogId, 0, (sportId) => this.dogs.getDogById(sportId));
    }
    const sportDog = await this.dogs.getDogById(dogId);
    if (sportDog) return sportDog;
    return this.shows.getShowDogById(dogId, 0, (sportId) => this.dogs.getDogById(sportId));
  }

  getTopRatings(
    discipline: string = 'coursing',
    category: string = 'score',
    year: string = '2026',
    limit: number = 10,
  ): Promise<Rating[]> {
    return this.competitions.getTopRatings(discipline, category, year, limit);
  }

  getSpeedRecords(): Promise<{ speed: SpeedRecord[]; coursing: CoursingRecord[] }> {
    return this.donino.getSpeedRecords();
  }

  searchDoninoRecords(query: string): Promise<{ speed: SpeedRecord[]; coursing: CoursingRecord[] }> {
    return this.donino.searchDoninoRecords(query);
  }

  getCalendar(year: string = new Date().getFullYear().toString()): Promise<Competition[]> {
    return this.competitions.getCalendar(year);
  }

  getCalendarChangelog(year: string = '2027'): Promise<CalendarChangelog | null> {
    return this.competitions.getCalendarChangelog(year);
  }

  getShowsCalendar(year: string = new Date().getFullYear().toString()): Promise<Competition[]> {
    return this.shows.getShowsCalendar(year);
  }

  getShows(year: string): Promise<RatingItem[]> {
    return this.shows.getShows(year);
  }

  getJudgesSummary(): Promise<RatingItem[]> {
    return this.judges.getJudgesSummary();
  }

  getShowJudges(): Promise<RatingItem[]> {
    return this.judges.getShowJudges();
  }

  getShowSummaryForCompetitionDog(competitionDogId: number | string): Promise<{
    total_shows: number;
    best_award: string | null;
    title_keys: string[];
    title_counts: Record<string, number>;
  } | null> {
    return this.shows.getShowSummaryForCompetitionDog(competitionDogId);
  }

  getGuide(): Promise<any | null> {
    return this.guide.getGuide();
  }
}

export { CoursingStatsAPI };
export * from './api/constants';
export * from './api/types';
