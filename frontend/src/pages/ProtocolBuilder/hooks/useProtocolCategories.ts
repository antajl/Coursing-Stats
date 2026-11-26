import { useState } from 'react'
import type { CategoryGroup, CoursingScores, DogParticipant, RunStatus } from '../types'
import { createNewCategory, createNewParticipant, createRunData } from '../types'
import { createDefaultCategories, type ExistingDog } from '../constants'

const BLANKET_CYCLE: Array<'red' | 'white' | 'blue'> = ['red', 'white', 'blue']

export function useProtocolCategories(
  onDogSelectedResetMenus: () => void
) {
  const [categories, setCategories] = useState<CategoryGroup[]>(createDefaultCategories)

  const addCategory = () => {
    const totalDogs = categories.reduce((acc, c) => acc + c.dogs.length, 0)
    const lastCat = categories[categories.length - 1]
    const nextBreed = lastCat ? lastCat.breed : 'Уиппет'
    const nextClass = lastCat ? lastCat.className : 'Стандартный'
    const nextSex = lastCat ? (lastCat.sex === 'male' ? 'female' : 'male') : 'male'
    const nextRuns = lastCat ? lastCat.runsCount : 2
    setCategories((prev) => [
      ...prev,
      createNewCategory(nextBreed, nextClass, nextSex, 1, totalDogs + 1, nextRuns),
    ])
  }

  const removeCategory = (categoryId: string) => {
    if (categories.length <= 1) return
    setCategories((prev) => prev.filter((c) => c.id !== categoryId))
  }

  const updateCategoryMeta = (categoryId: string, updates: Partial<CategoryGroup>) => {
    setCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updates } : c)))
  }

  const setCategoryRunsCount = (categoryId: string, count: 1 | 2 | 3) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        const updatedDogs = cat.dogs.map((dog) => {
          const currentRuns = [...dog.runs]
          while (currentRuns.length < count) {
            currentRuns.push(createRunData('1', BLANKET_CYCLE[currentRuns.length % 3]))
          }
          return { ...dog, runs: currentRuns }
        })
        return { ...cat, runsCount: count, dogs: updatedDogs }
      })
    )
  }

  const addDogToCategory = (categoryId: string) => {
    const totalDogs = categories.reduce((acc, c) => acc + c.dogs.length, 0)
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, dogs: [...cat.dogs, createNewParticipant(totalDogs + 1, cat.runsCount)] }
          : cat
      )
    )
  }

  const removeDogFromCategory = (categoryId: string, dogId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId || cat.dogs.length <= 1) return cat
        return { ...cat, dogs: cat.dogs.filter((d) => d.id !== dogId) }
      })
    )
  }

  const updateDog = (categoryId: string, dogId: string, updates: Partial<DogParticipant>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, dogs: cat.dogs.map((d) => (d.id === dogId ? { ...d, ...updates } : d)) }
          : cat
      )
    )
  }

  const updateRunField = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    field: 'heat' | 'blanket',
    value: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              dogs: cat.dogs.map((d) => {
                if (d.id !== dogId) return d
                const runs = [...d.runs]
                const sanitized =
                  field === 'heat' ? String(value || '').replace(/\D/g, '').slice(0, 3) : value
                runs[runIndex] = { ...runs[runIndex], [field]: sanitized }
                return { ...d, runs }
              }),
            }
          : cat
      )
    )
  }

  const cycleBlanket = (categoryId: string, dogId: string, runIndex: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              dogs: cat.dogs.map((d) => {
                if (d.id !== dogId) return d
                const runs = [...d.runs]
                if (!runs[runIndex]) runs[runIndex] = createRunData()
                const current = (runs[runIndex].blanket || 'red') as 'red' | 'white' | 'blue'
                const nextIdx = (BLANKET_CYCLE.indexOf(current) + 1) % BLANKET_CYCLE.length
                runs[runIndex] = { ...runs[runIndex], blanket: BLANKET_CYCLE[nextIdx] }
                return { ...d, runs }
              }),
            }
          : cat
      )
    )
  }

  const updateRunScore = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    criterion: keyof CoursingScores,
    value: string
  ) => {
    const num = value === '' ? '' : Math.min(20, Math.max(0, Number(value)))
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              dogs: cat.dogs.map((d) => {
                if (d.id !== dogId) return d
                const runs = [...d.runs]
                if (!runs[runIndex]) runs[runIndex] = createRunData()
                runs[runIndex] = {
                  ...runs[runIndex],
                  scores: { ...runs[runIndex].scores, [criterion]: num },
                }
                return { ...d, runs }
              }),
            }
          : cat
      )
    )
  }

  const setRunStatus = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    status: RunStatus,
    reason?: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        let targetDog: DogParticipant | null = null
        const updatedDogs = cat.dogs.map((d) => {
          if (d.id !== dogId) return d
          const runs = [...d.runs]
          if (!runs[runIndex]) runs[runIndex] = createRunData()
          runs[runIndex] = {
            ...runs[runIndex],
            status,
            reason: reason !== undefined ? reason : runs[runIndex].reason || '',
          }
          if (status !== 'normal') {
            for (let next = runIndex + 1; next < runs.length; next++) {
              runs[next] = createRunData(
                runs[next]?.heat || '1',
                runs[next]?.blanket || 'white',
                'normal',
                ''
              )
            }
          }
          targetDog = { ...d, runs }
          return targetDog
        })
        if (status === 'absent' && targetDog) {
          return { ...cat, dogs: [...updatedDogs.filter((d) => d.id !== dogId), targetDog] }
        }
        return { ...cat, dogs: updatedDogs }
      })
    )
  }

  const updateRunReason = (
    categoryId: string,
    dogId: string,
    runIndex: number,
    reason: string
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              dogs: cat.dogs.map((d) => {
                if (d.id !== dogId) return d
                const runs = [...d.runs]
                if (!runs[runIndex]) runs[runIndex] = createRunData()
                runs[runIndex] = { ...runs[runIndex], reason }
                return { ...d, runs }
              }),
            }
          : cat
      )
    )
  }

  const toggleAward = (categoryId: string, dogId: string, award: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              dogs: cat.dogs.map((d) => {
                if (d.id !== dogId) return d
                const currentAwards = d.awards || []
                const exists = currentAwards.includes(award)
                return {
                  ...d,
                  awards: exists
                    ? currentAwards.filter((a) => a !== award)
                    : [...currentAwards, award],
                }
              }),
            }
          : cat
      )
    )
  }

  const selectExistingDog = (categoryId: string, dogId: string, dog: ExistingDog) => {
    const updates: Partial<DogParticipant> = { dogName: dog.name }
    if (dog.sex) updates.sex = dog.sex
    updateDog(categoryId, dogId, updates)
    if (dog.breed) {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat && (cat.dogs.length <= 1 || cat.dogs.every((d) => d.id === dogId || !d.dogName))) {
        updateCategoryMeta(categoryId, { breed: dog.breed })
      }
    }
    onDogSelectedResetMenus()
  }

  return {
    categories,
    setCategories,
    addCategory,
    removeCategory,
    updateCategoryMeta,
    setCategoryRunsCount,
    addDogToCategory,
    removeDogFromCategory,
    updateDog,
    updateRunField,
    cycleBlanket,
    updateRunScore,
    setRunStatus,
    updateRunReason,
    toggleAward,
    selectExistingDog,
  }
}
