import { useQuery } from '@tanstack/react-query';
import { deriveCompetingBreeds, type DogsIndexEntry } from '../lib/competingBreeds';
import {
  getCoursingRecords,
  getJudges,
  getJudgeDetails,
  getSpeedRecords,
  getShowJudges,
  getShowJudgeDetails,
  getShowJudgesStrictnessBaseline,
} from '../lib/staticData';
import {
  calendarVisibleFromFlags,
  getUiFlags,
  type PublicCalendarKind,
} from '../lib/uiFlags';

const STALE_MS = 5 * 60 * 1000;
const STALE_LONG_MS = 60 * 60 * 1000;

function topIndexFileName(prefix: string, year: string): string {
  const key = !year || year === 'all' ? 'all' : year;
  return `${prefix}-${key}.json`;
}

async function fetchStaticData<T>(path: string): Promise<{ success: true; data: T }> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  const data = await response.json();
  return { success: true, data };
}

export function useTopPlacement(year: string) {
  const fileName = topIndexFileName('top-placement', year);
  return useQuery({
    queryKey: ['topPlacement', year || 'all'],
    queryFn: () => fetchStaticData<{ items: any[]; count: number }>(`/data/v1/indexes/${fileName}`),
    staleTime: STALE_MS,
  });
}

export function useTopScore(year: string) {
  const fileName = topIndexFileName('top-score', year);
  return useQuery({
    queryKey: ['topScore', year || 'all'],
    queryFn: () => fetchStaticData<{ items: any[]; count: number }>(`/data/v1/indexes/${fileName}`),
    staleTime: STALE_MS,
  });
}

export function useTopSpeed(year: string) {
  const fileName = topIndexFileName('top-speed', year);
  return useQuery({
    queryKey: ['topSpeed', year || 'all'],
    queryFn: () => fetchStaticData<{ items: any[]; count: number }>(`/data/v1/indexes/${fileName}`),
    staleTime: STALE_MS,
  });
}

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: () => fetchStaticData<{ breeds: string[]; count: number }>('/data/v1/breeds.json'),
    staleTime: STALE_LONG_MS,
  });
}

/** Породы с реальными выступлениями (dogs-index, competition_count > 0). */
export function useCompetingBreeds() {
  return useQuery({
    queryKey: ['competingBreeds'],
    queryFn: async () => {
      const result = await fetchStaticData<DogsIndexEntry[]>('/data/v1/indexes/dogs-index.json');
      const breeds = deriveCompetingBreeds(result.data);
      return { success: true as const, data: { breeds, count: breeds.length } };
    },
    staleTime: STALE_LONG_MS,
  });
}

export function useYears() {
  return useQuery({
    queryKey: ['years'],
    queryFn: () => fetchStaticData<{ years: number[]; count: number }>('/data/v1/indexes/years.json'),
    staleTime: STALE_LONG_MS,
  });
}

export function useJudges(breed: string, discipline: string, year = '') {
  return useQuery({
    queryKey: ['judges', breed, discipline, year],
    queryFn: () => getJudges(breed, discipline, year),
    staleTime: STALE_MS,
  });
}

export function useJudgeDetails(
  judgeId: string | undefined,
  breed: string,
  discipline: string,
  year = '',
) {
  return useQuery({
    queryKey: ['judgeDetails', judgeId, breed, discipline, year],
    queryFn: () => getJudgeDetails(judgeId!, breed, discipline, year),
    enabled: !!judgeId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecords(breed: string, sex: string, limit: number, search: string, year: string) {
  return useQuery({
    queryKey: ['speedRecords', breed, sex, limit, search, year],
    queryFn: () => getSpeedRecords(breed, sex, limit, search, year),
    staleTime: STALE_MS,
  });
}

export function useCoursingRecords(breed: string, limit: number, search: string, year: string) {
  return useQuery({
    queryKey: ['coursingRecords', breed, limit, search, year],
    queryFn: () => getCoursingRecords(breed, limit, search, year),
    staleTime: STALE_MS,
  });
}

export function useDogProfile(dogId: string) {
  return useQuery({
    queryKey: ['dogProfile', dogId],
    queryFn: async () => {
      const result = await fetchStaticData<any>(`/data/v1/indexes/dog-profiles/${dogId}.json`);
      if (result.success && result.data?.dog) {
        return { success: true, data: result.data.dog };
      }
      return result;
    },
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useDogEvents(dogId: string) {
  return useQuery({
    queryKey: ['dogEvents', dogId],
    queryFn: async () => {
      const result = await fetchStaticData<any>(`/data/v1/indexes/dog-profiles/${dogId}.json`);
      if (result.success && result.data?.competitions) {
        return { success: true, data: result.data.competitions };
      }
      return result;
    },
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useDogSpeedRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogSpeedRecords', dogId],
    queryFn: () => getSpeedRecords('', '', 1000, '', '', dogId),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['speedRecordsByBreed', breed],
    queryFn: () => getSpeedRecords(breed, '', 1000, '', ''),
    enabled: !!breed,
    staleTime: STALE_MS,
  });
}

export function useDogCoursingRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogCoursingRecords', dogId],
    queryFn: () => getCoursingRecords('', 1000, '', '', dogId),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useCoursingRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['coursingRecordsByBreed', breed],
    queryFn: () => getCoursingRecords(breed, 1000, '', ''),
    enabled: !!breed,
    staleTime: STALE_MS,
  });
}

export function useUiFlags() {
  return useQuery({
    queryKey: ['uiFlags'],
    queryFn: getUiFlags,
    staleTime: STALE_MS,
  })
}

/** Локально всегда true; на проде — data/v1/ui-flags.json. */
export function usePublicCalendarVisible(kind: PublicCalendarKind): boolean {
  const { data } = useUiFlags()
  return calendarVisibleFromFlags(kind, data)
}

export function useShowJudges() {
  return useQuery({
    queryKey: ['showJudges'],
    queryFn: getShowJudges,
    staleTime: STALE_MS,
  })
}

export function useShowJudgeDetails(judgeId: string | undefined) {
  return useQuery({
    queryKey: ['showJudgeDetails', judgeId],
    queryFn: () => getShowJudgeDetails(judgeId),
    enabled: Boolean(judgeId),
    staleTime: STALE_MS,
  })
}

export function useShowJudgesStrictnessBaseline() {
  return useQuery({
    queryKey: ['showJudgesStrictnessBaseline'],
    queryFn: getShowJudgesStrictnessBaseline,
    staleTime: STALE_LONG_MS,
  })
}
