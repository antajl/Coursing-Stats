import { describe, expect, it } from 'vitest';
import { 
  calculateEloRating, 
  calculateExpectedScore, 
  calculateActualScore, 
  calculateKFactor,
  calculateEloRatings,
  applySoloLossToDog,
  type Race,
  type SoloLoss,
  type DogRating,
} from '../lib/rating/elo-calculator';

describe('Elo Calculator', () => {
  describe('calculateExpectedScore', () => {
    it('calculates expected score for equal ratings', () => {
      const expected = calculateExpectedScore(1500, 1500);
      expect(expected).toBeCloseTo(0.5, 5);
    });

    it('higher rated player has higher expected score', () => {
      const expected = calculateExpectedScore(1600, 1400);
      expect(expected).toBeGreaterThan(0.5);
      expect(expected).toBeLessThan(1.0);
    });

    it('expected score is symmetric', () => {
      const expectedA = calculateExpectedScore(1600, 1400);
      const expectedB = calculateExpectedScore(1400, 1600);
      expect(expectedA + expectedB).toBeCloseTo(1.0, 5);
    });
  });

  describe('calculateActualScore', () => {
    it('actual score is 0.5 for equal scores', () => {
      const actual = calculateActualScore(90, 90, 15);
      expect(actual).toBeCloseTo(0.5, 5);
    });

    it('higher score gives actual > 0.5', () => {
      const actual = calculateActualScore(95, 85, 15);
      expect(actual).toBeGreaterThan(0.5);
      expect(actual).toBeLessThan(1.0);
    });

    it('lower score gives actual < 0.5', () => {
      const actual = calculateActualScore(85, 95, 15);
      expect(actual).toBeLessThan(0.5);
      expect(actual).toBeGreaterThan(0.0);
    });

    it('larger difference gives more extreme actual score', () => {
      const smallDiff = calculateActualScore(92, 88, 15);
      const largeDiff = calculateActualScore(95, 85, 15);
      expect(largeDiff).toBeGreaterThan(smallDiff);
    });

    it('actual scores are symmetric', () => {
      const actualA = calculateActualScore(95, 85, 15);
      const actualB = calculateActualScore(85, 95, 15);
      expect(actualA + actualB).toBeCloseTo(1.0, 5);
    });
  });

  describe('calculateKFactor', () => {
    it('K decreases with more starts', () => {
      const k1 = calculateKFactor(0, 40);
      const k10 = calculateKFactor(10, 40);
      const k50 = calculateKFactor(50, 40);
      expect(k1).toBeGreaterThan(k10);
      expect(k10).toBeGreaterThan(k50);
    });

    it('K is capped at K0 for zero starts', () => {
      const k = calculateKFactor(0, 40);
      expect(k).toBe(40);
    });

    it('K approaches zero for very many starts', () => {
      const k = calculateKFactor(1000, 40);
      expect(k).toBeLessThan(5);
    });
  });

  describe('calculateEloRating', () => {
    it('updates ratings based on expected vs actual', () => {
      const result = calculateEloRating({
        ratingA: 1500,
        ratingB: 1500,
        actualScoreA: 1.0,
        kA: 40,
        kB: 40
      });
      
      expect(result.newRatingA).toBeGreaterThan(1500);
      expect(result.newRatingB).toBeLessThan(1500);
      expect(result.newRatingA + result.newRatingB).toBeCloseTo(3000, 5);
    });

    it('rating change is symmetric for draw', () => {
      const result = calculateEloRating({
        ratingA: 1500,
        ratingB: 1500,
        actualScoreA: 0.5,
        kA: 40,
        kB: 40
      });
      
      expect(result.newRatingA).toBeCloseTo(1500, 5);
      expect(result.newRatingB).toBeCloseTo(1500, 5);
    });

    it('higher K factor gives larger rating change', () => {
      const result1 = calculateEloRating({
        ratingA: 1500,
        ratingB: 1500,
        actualScoreA: 1.0,
        kA: 40,
        kB: 40
      });
      
      const result2 = calculateEloRating({
        ratingA: 1500,
        ratingB: 1500,
        actualScoreA: 1.0,
        kA: 20,
        kB: 20
      });
      
      const change1 = Math.abs(result1.newRatingA - 1500);
      const change2 = Math.abs(result2.newRatingA - 1500);
      expect(change1).toBeGreaterThan(change2);
    });
  });

  describe('calculateEloRatings', () => {
    it('processes races in chronological order', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 95,
          score_b: 85,
          judge_count: 2
        },
        {
          event_id: 2,
          date: '2025-01-02',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 90,
          score_b: 90,
          judge_count: 2
        }
      ];
      
      const ratings = calculateEloRatings(races, [], 18, 40, 1500, false);
      
      expect(ratings.size).toBe(2);
      expect(ratings.get(1)?.starts_count).toBe(2);
      expect(ratings.get(2)?.starts_count).toBe(2);
    });

    it('skips races between different breeds when breedPools is true', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_B',
          score_a: 95,
          score_b: 85,
          judge_count: 2
        }
      ];
      
      const ratings = calculateEloRatings(races, [], 18, 40, 1500, true);
      
      // Собаки создаются но рейтинги не обновляются
      expect(ratings.size).toBe(2);
      expect(ratings.get(1)?.starts_count).toBe(0);
      expect(ratings.get(2)?.starts_count).toBe(0);
    });

    it('includes same breed races when breedPools is true', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 95,
          score_b: 85,
          judge_count: 2
        }
      ];
      
      const ratings = calculateEloRatings(races, [], 18, 40, 1500, true);
      
      expect(ratings.size).toBe(2);
      expect(ratings.get(1)?.starts_count).toBe(1);
      expect(ratings.get(2)?.starts_count).toBe(1);
    });

    it('maintains rating history for each dog', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 95,
          score_b: 85,
          judge_count: 2
        },
        {
          event_id: 2,
          date: '2025-01-02',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 90,
          score_b: 90,
          judge_count: 2
        }
      ];
      
      const ratings = calculateEloRatings(races, [], 18, 40, 1500, false);
      
      const dog1 = ratings.get(1);
      expect(dog1?.history.length).toBe(2);
      expect(dog1?.history[0].date).toBe('2025-01-01');
      expect(dog1?.history[1].date).toBe('2025-01-02');
    });

    it('bye-run increments starts without changing rating', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 95,
          score_b: 85,
          judge_count: 2,
        },
      ];
      const afterPairOnly = calculateEloRatings(races, [], 8, 50, 1500, true);
      const withBye = calculateEloRatings(
        races,
        [{ dog_id: 1, date: '2025-01-02', event_id: 2, heat_number: 1, bib_number: 10 }],
        8,
        50,
        1500,
        true
      );
      expect(withBye.get(1)?.starts_count).toBe(2);
      expect(withBye.get(1)?.rating).toBeCloseTo(afterPairOnly.get(1)!.rating, 8);
    });

    it('dq_pair: DQ dog loses hard (S=0), partner gains', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 0,
          score_b: 90,
          judge_count: 2,
          outcome: 'dq_pair',
          forced_actual_a: 0,
        },
      ];
      const ratings = calculateEloRatings(races, [], 8, 50, 1500, true);
      expect(ratings.get(1)!.rating).toBeLessThan(1500);
      expect(ratings.get(2)!.rating).toBeGreaterThan(1500);
      expect(ratings.get(1)!.starts_count).toBe(1);
      expect(ratings.get(2)!.starts_count).toBe(1);
      // Equal start: K=50, E=0.5, S=0 → change = -25
      expect(ratings.get(1)!.rating).toBeCloseTo(1475, 5);
      expect(ratings.get(2)!.rating).toBeCloseTo(1525, 5);
    });

    it('solo DQ loss lowers rating against virtual equal opponent', () => {
      const soloLosses: SoloLoss[] = [
        { dog_id: 1, date: '2025-01-01', event_id: 1, heat_number: 1, breed: 'BREED_A' },
      ];
      const ratings = calculateEloRatings([], [], 8, 50, 1500, true, soloLosses);
      expect(ratings.get(1)!.rating).toBeCloseTo(1475, 5);
      expect(ratings.get(1)!.starts_count).toBe(1);
    });

    it('double DQ via two solo losses both drop', () => {
      const soloLosses: SoloLoss[] = [
        { dog_id: 1, date: '2025-01-01', event_id: 1, heat_number: 1, breed: 'BREED_A' },
        { dog_id: 2, date: '2025-01-01', event_id: 1, heat_number: 1, breed: 'BREED_A' },
      ];
      const ratings = calculateEloRatings([], [], 8, 50, 1500, true, soloLosses);
      expect(ratings.get(1)!.rating).toBeCloseTo(1475, 5);
      expect(ratings.get(2)!.rating).toBeCloseTo(1475, 5);
    });

    it('scored path unchanged when outcome omitted', () => {
      const races: Race[] = [
        {
          event_id: 1,
          date: '2025-01-01',
          heat_number: 1,
          dog_id_a: 1,
          dog_id_b: 2,
          breed_a: 'BREED_A',
          breed_b: 'BREED_A',
          score_a: 90,
          score_b: 90,
          judge_count: 2,
        },
      ];
      const ratings = calculateEloRatings(races, [], 8, 50, 1500, true);
      expect(ratings.get(1)!.rating).toBeCloseTo(1500, 5);
      expect(ratings.get(2)!.rating).toBeCloseTo(1500, 5);
    });
  });

  describe('applySoloLossToDog', () => {
    it('applies S=0 vs E=0.5', () => {
      const dog: DogRating = {
        dog_id: 1,
        rating: 1500,
        breed: 'X',
        starts_count: 0,
        history: [],
      };
      applySoloLossToDog(dog, '2025-01-01', 50);
      expect(dog.rating).toBeCloseTo(1475, 5);
      expect(dog.starts_count).toBe(1);
    });
  });
});
