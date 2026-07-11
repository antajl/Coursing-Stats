import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

/** Кэш на клиенте — меньше повторных запросов к API */
const STALE_MS = 5 * 60 * 1000;
const STALE_LONG_MS = 60 * 60 * 1000;

export function useTopPlacement(year = '', breed = '', minStarts = 0, sortBy = 'gold', limit = null, offset = 0) {
  return useQuery({
    queryKey: ['topPlacement', year, breed, minStarts, sortBy, limit, offset],
    queryFn: () => api.getTopPlacement(year, breed, minStarts, sortBy, limit, offset),
    staleTime: STALE_MS,
  });
}

export function useTopScore(year = '', breed = '', minStarts = 0, sortBy = 'rating_score', limit = null, offset = 0) {
  return useQuery({
    queryKey: ['topScore', year, breed, minStarts, sortBy, limit, offset],
    queryFn: () => api.getTopScore(year, breed, minStarts, sortBy, limit, offset),
    staleTime: STALE_MS,
  });
}

export function useTopSpeed(year = '', breed = '', minStarts = 0, sortBy = 'best_speed', limit = null, offset = 0) {
  return useQuery({
    queryKey: ['topSpeed', year, breed, minStarts, sortBy, limit, offset],
    queryFn: () => api.getTopSpeed(year, breed, minStarts, sortBy, limit, offset),
    staleTime: STALE_MS,
  });
}

export function useBreeds() {
  return useQuery({
    queryKey: ['breeds'],
    queryFn: () => api.getBreeds(),
    staleTime: STALE_LONG_MS,
  });
}

export function useYears() {
  return useQuery({
    queryKey: ['years'],
    queryFn: () => api.getYears(),
    staleTime: STALE_LONG_MS,
  });
}

export function useEvents(year = '') {
  return useQuery({
    queryKey: ['events', year],
    queryFn: () => api.getEvents(year),
    staleTime: STALE_MS,
  });
}

export function useDogProfile(dogId: string) {
  return useQuery({
    queryKey: ['dogProfile', dogId],
    queryFn: () => api.getDogProfile(dogId),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useDogEvents(dogId: string) {
  return useQuery({
    queryKey: ['dogEvents', dogId],
    queryFn: () => api.getDogEvents(dogId),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEvent(eventId),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}

export function useEventResults(eventId: string) {
  return useQuery({
    queryKey: ['eventResults', eventId],
    queryFn: () => api.getEventResults(eventId),
    enabled: !!eventId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecords(breed = '', sex = '', limit = 100, search = '', year = '') {
  return useQuery({
    queryKey: ['speedRecords', breed, sex, limit, search, year],
    queryFn: () => api.getSpeedRecords(breed, sex, limit, search, year),
    staleTime: STALE_MS,
  });
}

export function useDogSpeedRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogSpeedRecords', dogId],
    queryFn: () => api.getSpeedRecords('', '', 1000, '', '', dogId),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useSpeedRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['speedRecordsByBreed', breed],
    queryFn: () => api.getSpeedRecords(breed, '', 10000, '', ''),
    enabled: !!breed,
    staleTime: STALE_MS,
  });
}

export function useCoursingRecords(breed = '', limit = 100, search = '', year = '') {
  return useQuery({
    queryKey: ['coursingRecords', breed, limit, search, year],
    queryFn: () => api.getCoursingRecords(breed, limit, search, year),
    staleTime: STALE_MS,
  });
}

export function useDogCoursingRecords(dogId: string) {
  return useQuery({
    queryKey: ['dogCoursingRecords', dogId],
    queryFn: () => api.getCoursingRecords('', 1000, '', '', dogId),
    enabled: !!dogId,
    staleTime: STALE_MS,
  });
}

export function useCoursingRecordsByBreed(breed: string) {
  return useQuery({
    queryKey: ['coursingRecordsByBreed', breed],
    queryFn: () => api.getCoursingRecords(breed, 10000, '', ''),
    enabled: !!breed,
    staleTime: STALE_MS,
  });
}

export function useJudges(breed = '', discipline = '') {
  return useQuery({
    queryKey: ['judges', breed, discipline],
    queryFn: () => api.getJudges(breed, discipline),
    staleTime: STALE_MS,
  });
}

export function useJudgeDetails(judgeId: string, breed = '', discipline = '') {
  return useQuery({
    queryKey: ['judgeDetails', judgeId, breed, discipline],
    queryFn: () => api.getJudgeDetails(judgeId, breed, discipline),
    enabled: !!judgeId,
    staleTime: STALE_MS,
  });
}
