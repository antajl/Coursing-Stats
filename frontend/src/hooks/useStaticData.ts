import { useQuery } from '@tanstack/react-query';
import { deriveCompetingBreeds, type DogsIndexEntry } from '../lib/competingBreeds';
import { getJudgeDetails } from '../lib/staticData';

const STALE_MS = 5 * 60 * 1000;
const STALE_LONG_MS = 60 * 60 * 1000;

function topIndexFileName(prefix: string, year: string): string {
  const key = !year || year === 'all' ? 'all' : year;
  return `${prefix}-${key}.json`;
}

async function fetchStaticData<T>(path: string): Promise<{ success: true; data: T }> {
  console.log(`[DEBUG] Fetching: ${path}`);
  const response = await fetch(path);
  console.log(`[DEBUG] Response status: ${response.status} ${response.statusText}`);
  if (!response.ok) {
    console.error(`[DEBUG] Failed to fetch ${path}: ${response.statusText}`);
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }
  const data = await response.json();
  console.log(`[DEBUG] Data received for ${path}:`, data);
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

export function useJudges(breed: string, discipline: string) {
  return useQuery({
    queryKey: ['judges', breed, discipline],
    queryFn: () => fetchStaticData<{ judges: any[]; count: number }>('/data/v1/indexes/judges-summary.json'),
    staleTime: STALE_MS,
  });
}

export function useJudgeDetails(judgeId: string | undefined, breed: string, discipline: string) {
  return useQuery({
    queryKey: ['judgeDetails', judgeId, breed, discipline],
    queryFn: () => getJudgeDetails(judgeId!, breed, discipline),
    enabled: !!judgeId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecords(breed: string, sex: string, limit: number, search: string, year: string) {
  return useQuery({
    queryKey: ['speedRecords', breed, sex, limit, search, year],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/speed_records.json'),
    staleTime: STALE_MS,
  });
}

export function useCoursingRecords(breed: string, limit: number, search: string, year: string) {
  return useQuery({
    queryKey: ['coursingRecords', breed, limit, search, year],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/coursing_records.json'),
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
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/speed_records.json'),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['speedRecordsByBreed', breed],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/speed_records.json'),
    staleTime: STALE_MS,
  });
}

export function useDogCoursingRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogCoursingRecords', dogId],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/coursing_records.json'),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useCoursingRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['coursingRecordsByBreed', breed],
    queryFn: () => fetchStaticData<{ records: any[]; count: number }>('/data/v1/donino/coursing_records.json'),
    staleTime: STALE_MS,
  });
}
