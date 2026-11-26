import type { Competition, DogData, RatingItem, ShowDogSummary } from '../types';
import type { ApiClient } from './client';
import { CACHE_TTL } from './constants';

const SHOW_TITLE_ORDER = [
  'BIS', 'BIG', 'BIS_JUNIOR', 'BIS_VETERAN', 'BIS_PUPPY', 'BIS_BABY',
  'BOB', 'BOS', 'LYU', 'LV', 'LSH', 'LB',
  'CACIB', 'R_CACIB', 'CAC', 'JCAC', 'VCAC',
  'CHRKF', 'YCHRKF', 'VCHRKF',
  'P_RUSSIA', 'P_MOSCOW', 'YP_RUSSIA', 'YP_MOSCOW', 'VP_RUSSIA', 'VP_MOSCOW',
  'KCHK', 'KCHP', 'YKCHK', 'YKCHP', 'VKCHK', 'VKCHP',
  'CW', 'R_CAC', 'R_JCAC', 'R_VCAC', 'SS', 'YSS', 'VSS',
];

function extractShowSummary(dog: Record<string, unknown>): ShowDogSummary | null {
  const totalShows = Number(dog.total_shows) || 0;
  if (totalShows <= 0) return null;

  const titles = dog.titles;
  const title_counts: Record<string, number> = {};
  if (titles && typeof titles === 'object' && !Array.isArray(titles)) {
    for (const [key, value] of Object.entries(titles as Record<string, unknown>)) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) title_counts[key] = n;
    }
  }

  const known = SHOW_TITLE_ORDER.filter((key) => (title_counts[key] ?? 0) > 0);
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
}

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
      const page0 = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/indexes/dog-ranking-${year}-page0.json`,
        CACHE_TTL.SHOWS,
      );
      if (page0 && typeof page0 === 'object' && Array.isArray((page0 as { dogs?: unknown }).dogs)) {
        return (page0 as { dogs: RatingItem[] }).dogs;
      }

      const data = await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/indexes/dog-ranking-${year}.json`,
        CACHE_TTL.SHOWS,
      );
      if (Array.isArray(data)) {
        return data as RatingItem[];
      }
      if (data && typeof data === 'object' && Array.isArray((data as { dogs?: unknown }).dogs)) {
        return (data as { dogs: RatingItem[] }).dogs;
      }
      if (data && typeof data === 'object' && Array.isArray((data as { shards?: unknown }).shards)) {
        const firstShard = (data as { shards: string[] }).shards[0];
        if (firstShard) {
          const shardData = await this.client.fetchJSON(
            `${this.client.baseApiUrl}/shows/indexes/${firstShard}`,
            CACHE_TTL.SHOWS,
          );
          if (Array.isArray(shardData)) return shardData as RatingItem[];
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  async getShowDogById(
    dogId: string,
    depth: number = 0,
    onResolveSportId?: (sportId: string) => Promise<DogData | null>,
  ): Promise<DogData | null> {
    if (depth > 3) return null;
    try {
      const shard = this.client.cdnPackShardKey(dogId);
      const pack = (await this.client.fetchJSON(
        `${this.client.baseApiUrl}/shows/indexes/dog-details/${shard}.json`,
        CACHE_TTL.SHOWS,
      )) as Record<string, Record<string, unknown>> | null;
      if (!pack || typeof pack !== 'object') return null;

      const entry = pack[String(dogId)];
      if (!entry) return null;
      if (entry.alias_to) {
        return this.getShowDogById(String(entry.alias_to), depth + 1, onResolveSportId);
      }

      const showSummary = extractShowSummary(entry);
      const linkedSportId = entry.competition_dog_id != null ? Number(entry.competition_dog_id) : NaN;
      if (Number.isFinite(linkedSportId) && linkedSportId > 0 && onResolveSportId) {
        const sportData = await onResolveSportId(String(linkedSportId));
        if (sportData) {
          return showSummary ? { ...sportData, show_summary: showSummary } : sportData;
        }
      }

      const resolvedId = Number(entry.id ?? dogId);
      const dogIdNum = Number.isFinite(resolvedId) ? resolvedId : Number(dogId) || 0;
      return {
        schema: 'coursing-stats/show-dog-profile-v1',
        exported_at: new Date().toISOString(),
        show_summary: showSummary,
        dog: {
          id: dogIdNum,
          dog_key: String(entry.id ?? dogId),
          name_lat: String(entry.name_lat || entry.name_ru || `Собака #${dogId}`),
          name_ru: String(entry.name_ru || entry.name_lat || ''),
          breed: String(entry.breed || 'Порода не указана'),
          sex: entry.sex ? String(entry.sex) : null,
          owner: null,
          pedigree_url: entry.pedigree_url ? String(entry.pedigree_url) : null,
          coursing_stats: {
            total_starts: 0,
            best_score: null,
            gold: 0,
            silver: 0,
            bronze: 0,
          },
          racing_stats: {
            total_starts: 0,
            best_speed: null,
            gold: 0,
            silver: 0,
            bronze: 0,
          },
        },
      };
    } catch {
      return null;
    }
  }

  async getShowSummaryForCompetitionDog(competitionDogId: number | string): Promise<ShowDogSummary | null> {
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
      return extractShowSummary(dog);
    } catch {
      return null;
    }
  }
}
