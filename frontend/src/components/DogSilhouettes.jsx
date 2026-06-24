// Dog silhouettes for tooltip
// NOTE: These are placeholder silhouettes that need to be confirmed as accurate
// representations of actual coursing/racing breeds before production use.

export const DogSilhouettes = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      {/* Smooth-coat silhouette (Whippet, Greyhound, Italian Greyhound, Sloughi) */}
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

export const getSilhouetteType = (breed) => {
  if (!breed) return 'neutral';
  
  const breedLower = breed.toLowerCase();
  
  // Smooth-coat breeds
  const smoothCoatBreeds = ['whippet', 'greyhound', 'italian greyhound', 'sloughi'];
  if (smoothCoatBreeds.some(b => breedLower.includes(b))) {
    return 'smooth';
  }
  
  // Long-coat breeds
  const longCoatBreeds = ['saluki', 'afghan hound', 'borzoi', 'scottish deerhound'];
  if (longCoatBreeds.some(b => breedLower.includes(b))) {
    return 'long';
  }
  
  return 'neutral';
};
