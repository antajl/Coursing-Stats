/* eslint-disable react-refresh/only-export-components */
// Dog breed silhouettes for profile cards and tooltips.
// Breed-specific symbols take precedence; category fallbacks cover remaining breeds.

/** Keys matched via breed.toLowerCase().includes(key) */
const BREED_SILHOUETTES: Record<string, string> = {
  whippet: 'whippet',
  уиппет: 'whippet',
};

const SMOOTH_COAT_BREEDS = ['greyhound', 'italian greyhound', 'sloughi'];
const LONG_COAT_BREEDS = ['saluki', 'afghan hound', 'borzoi', 'scottish deerhound'];

export const DogSilhouettes = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      {/* Whippet — lean sighthound: deep chest, tucked waist, long legs, rose ear */}
      <symbol id="silhouette-whippet" viewBox="0 0 100 100">
        <path
          fill="currentColor"
          d="M 44 21 C 42 17 39 16 37 18 C 39 19 42 20 44 21 Z"
        />
        <path
          fill="currentColor"
          d="M 10 42 C 8 43 8 45 11 45.5 L 17 43.5 C 22 42 26 38.5 28 33.5 C 32 25.5 38.5 21 46.5 20.5 C 50.5 18.5 54.5 19.5 58.5 21.5 C 62.5 19.5 66.5 20.5 70.5 23.5 L 75.5 21.5 C 80.5 19.5 84.5 21 84 25 C 85.5 27 83.5 28.5 80.5 26.5 L 71.5 24.5 C 66 26.5 62 30 59.5 34 L 57.5 36 C 55 33.5 51.5 33.5 49 36.5 L 47 58 L 45 83.5 L 41 84.5 L 42 58 L 44 38.5 C 42 36 39 36.5 37 40 L 35 58 L 33 83.5 L 29 84.5 L 30 56 L 33 38.5 C 30.5 34.5 25.5 35 22 37.5 C 18 39 14 40.5 10 42 Z M 57 36 L 55 58 L 53 83.5 L 49 84.5 L 50 58 L 52 36 C 53.5 34.5 55.5 34.5 57 36 Z"
        />
      </symbol>

      {/* Smooth-coat silhouette (Greyhound, Italian Greyhound, Sloughi) */}
      <symbol id="silhouette-smooth" viewBox="0 0 100 100">
        <path
          d="M20 70 Q15 50 25 35 Q30 25 40 20 Q50 18 60 20 Q70 25 75 35 Q85 50 80 70 L75 75 Q70 80 60 82 L40 82 Q30 80 25 75 Z"
          fill="currentColor"
        />
        <path
          d="M40 20 Q45 15 50 18 Q55 15 60 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </symbol>

      {/* Long-coat silhouette (Saluki, Afghan Hound, Borzoi, Scottish Deerhound) */}
      <symbol id="silhouette-long" viewBox="0 0 100 100">
        <path
          d="M20 70 Q15 50 25 35 Q30 25 40 20 Q50 18 60 20 Q70 25 75 35 Q85 50 80 70 L75 75 Q70 80 60 82 L40 82 Q30 80 25 75 Z"
          fill="currentColor"
        />
        <path
          d="M25 35 Q20 40 22 50 Q20 45 25 40"
          fill="currentColor"
        />
        <path
          d="M75 35 Q80 40 78 50 Q80 45 75 40"
          fill="currentColor"
        />
        <path
          d="M40 20 Q45 10 50 18 Q55 10 60 20"
          fill="currentColor"
        />
      </symbol>

      {/* Neutral silhouette (unknown breed) */}
      <symbol id="silhouette-neutral" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="30" fill="currentColor" />
        <path
          d="M35 40 Q50 35 65 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </symbol>
    </defs>
  </svg>
);

export const getSilhouetteType = (breed?: string | null): string => {
  if (!breed) return 'neutral';

  const breedLower = breed.toLowerCase().trim();

  for (const [key, type] of Object.entries(BREED_SILHOUETTES)) {
    if (breedLower.includes(key)) return type;
  }

  if (SMOOTH_COAT_BREEDS.some((b) => breedLower.includes(b))) {
    return 'smooth';
  }

  if (LONG_COAT_BREEDS.some((b) => breedLower.includes(b))) {
    return 'long';
  }

  return 'neutral';
};
