import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { DogBreedSilhouette, resolveSilhouetteBreed } from './DogSilhouettes';

export interface DogPhotoFrameProps {
  photoUrl?: string | null;
  breed?: string | null;
  name?: string | null;
  className?: string;
  onPhotoClick?: () => void;
}

/**
 * Universal dog avatar container for CoursingStats:
 * - If photoUrl exists: displays high-res photo with zoom lightbox trigger
 * - If breed vector silhouette exists: displays Old Money physical card with verified breed vector on ground baseline
 * - If neither exists: displays an elegant empty Old Money frame / cube without any generic or incorrect breed silhouette
 */
export const DogPhotoFrame: React.FC<DogPhotoFrameProps> = ({
  photoUrl,
  breed,
  name,
  className = 'h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32',
  onPhotoClick,
}) => {
  const [imgError, setImgError] = useState(false);
  const dogName = name || 'Собака';
  const hasPhoto = Boolean(photoUrl) && !imgError;
  const silhouetteKey = resolveSilhouetteBreed(breed);

  if (hasPhoto) {
    return (
      <button
        type="button"
        onClick={onPhotoClick}
        className={`group relative shrink-0 overflow-hidden rounded-2xl border border-cream-200/90 bg-cream-50/60 shadow-xs transition-all hover:border-camel-400 hover:shadow-sm focus-visible:outline-hidden cursor-pointer ${className}`}
        aria-label={`Увеличить фото ${dogName}`}
        title="Нажмите, чтобы открыть фото в полном размере"
      >
        <img
          src={photoUrl!}
          alt={dogName}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-[center_20%] transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
        <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded-md bg-charcoal-900/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs">
          <Maximize2 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        </span>
      </button>
    );
  }

  // Frame with verified breed vector silhouette (optically normalized portrait avatar)
  if (silhouetteKey) {
    return (
      <div
        className={`group relative shrink-0 overflow-hidden rounded-2xl border border-cream-200/90 bg-[#FAF7F0] shadow-xs flex items-center justify-center select-none ${className}`}
        title={breed ? `Порода: ${breed}` : 'Силуэт породы'}
        aria-label={breed ? `Силуэт породы ${breed}` : 'Силуэт породы'}
      >
        {/* Vector silhouette */}
        <div className="relative z-10 w-full h-full p-2 flex items-center justify-center">
          <DogBreedSilhouette
            breed={breed}
            className="w-full h-full text-camel-700/60"
          />
        </div>
      </div>
    );
  }

  // Empty cube / placeholder frame when neither photo nor breed silhouette is available yet
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-cream-200/90 bg-[#FAF7F0]/60 shadow-2xs select-none ${className}`}
      title={breed ? `Фото отсутствует (${breed})` : 'Фото отсутствует'}
      aria-label="Фото отсутствует"
    />
  );
};
