/** Generated from repo `фото/` — do not edit by hand; re-run copy script if assets change. */
export type HomePhotoCategory = 'bzmp' | 'show' | 'race'
export type HomePhotoOrientation = 'landscape' | 'portrait'

export interface HomePhoto {
  id: string
  src: string
  category: HomePhotoCategory
  orientation: HomePhotoOrientation
  width: number
  height: number
}

export const HOME_PHOTOS: HomePhoto[] = [
  { id: 'bzmp-1', src: '/images/home/bzmp-01.jpg', category: 'bzmp', orientation: 'landscape', width: 1280, height: 852 },
  { id: 'bzmp-2', src: '/images/home/bzmp-02.jpg', category: 'bzmp', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'bzmp-3', src: '/images/home/bzmp-03.jpg', category: 'bzmp', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'bzmp-4', src: '/images/home/bzmp-04.jpg', category: 'bzmp', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'bzmp-5', src: '/images/home/bzmp-05.jpg', category: 'bzmp', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'show-1', src: '/images/home/show-01.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-2', src: '/images/home/show-02.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-3', src: '/images/home/show-03.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-4', src: '/images/home/show-04.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-5', src: '/images/home/show-05.jpg', category: 'show', orientation: 'portrait', width: 854, height: 1280 },
  { id: 'show-6', src: '/images/home/show-06.jpg', category: 'show', orientation: 'portrait', width: 854, height: 1280 },
  { id: 'show-7', src: '/images/home/show-07.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-8', src: '/images/home/show-08.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-9', src: '/images/home/show-09.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'show-10', src: '/images/home/show-10.jpg', category: 'show', orientation: 'landscape', width: 1280, height: 1024 },
  { id: 'show-11', src: '/images/home/show-11.jpg', category: 'show', orientation: 'portrait', width: 853, height: 1280 },
  { id: 'race-1', src: '/images/home/race-01.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 852 },
  { id: 'race-2', src: '/images/home/race-02.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-3', src: '/images/home/race-03.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-4', src: '/images/home/race-04.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-5', src: '/images/home/race-05.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 852 },
  { id: 'race-6', src: '/images/home/race-06.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 1045 },
  { id: 'race-7', src: '/images/home/race-07.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 852 },
  { id: 'race-8', src: '/images/home/race-08.jpg', category: 'race', orientation: 'landscape', width: 1158, height: 756 },
  { id: 'race-9', src: '/images/home/race-09.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-10', src: '/images/home/race-10.jpg', category: 'race', orientation: 'portrait', width: 959, height: 1280 },
  { id: 'race-11', src: '/images/home/race-11.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 854 },
  { id: 'race-12', src: '/images/home/race-12.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-13', src: '/images/home/race-13.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-14', src: '/images/home/race-14.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },
  { id: 'race-15', src: '/images/home/race-15.jpg', category: 'race', orientation: 'landscape', width: 1280, height: 853 },

]

export const HOME_LANDSCAPES = HOME_PHOTOS.filter((p) => p.orientation === 'landscape')
export const HOME_PORTRAITS = HOME_PHOTOS.filter((p) => p.orientation === 'portrait')
