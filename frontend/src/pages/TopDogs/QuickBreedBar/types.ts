import type { DogsIndexEntry } from '../../../lib/competingBreeds'

export interface QuickBreedItem {
  key: string
  label: string
  fullName: string
  estWidth: number
}

export interface QuickBreedBarProps {
  selectedBreed: string
  onSelectBreed: (breed: string) => void
  breedValues?: string[]
  dogIndex?: DogsIndexEntry[]
  candidateBreeds?: QuickBreedItem[]
  className?: string
  strictFilterByBreedValues?: boolean
  showHubLink?: boolean
}
