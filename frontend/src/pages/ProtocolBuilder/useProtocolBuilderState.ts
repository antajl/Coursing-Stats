import { useEffect, useMemo, useRef, useState } from 'react'
import type { CompetitionHeader, CompetitionKind } from './types'
import { findDuplicateDogNames } from './types'
import {
  DEFAULT_HEADER,
  SAMPLE_HEADER,
  createDefaultCategories,
  createSampleCategories,
} from './constants'
import { exportToPDF, printProtocol } from './protocolPdfExport'
import {
  clearProtocolDraft,
  loadProtocolDraft,
  parseImportedProtocolJson,
  saveProtocolDraft,
} from './protocolDraftStorage'
import { useProtocolDogSearch } from './hooks/useProtocolDogSearch'
import { useProtocolMenus } from './hooks/useProtocolMenus'
import { useProtocolCategories } from './hooks/useProtocolCategories'

export function useProtocolBuilderState() {
  const [kind, setKind] = useState<CompetitionKind>('coursing')
  const [header, setHeader] = useState<CompetitionHeader>(DEFAULT_HEADER)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [customBreedCatIds, setCustomBreedCatIds] = useState<Record<string, boolean>>({})
  const [customClassCatIds, setCustomClassCatIds] = useState<Record<string, boolean>>({})
  const printableRef = useRef<HTMLDivElement>(null)

  const menus = useProtocolMenus()
  const { filteredExistingDogs } = useProtocolDogSearch(menus.searchQuery)
  const categoryActions = useProtocolCategories(() => {
    menus.setActiveSearchDog(null)
    menus.setSearchQuery('')
  })

  useEffect(() => {
    const draft = loadProtocolDraft()
    if (!draft) return
    if (draft.header) setHeader(draft.header)
    if (draft.kind) setKind(draft.kind)
    if (draft.categories) categoryActions.setCategories(draft.categories)
  }, [])

  useEffect(() => {
    saveProtocolDraft({ header, kind, categories: categoryActions.categories })
  }, [header, kind, categoryActions.categories])

  const duplicateNames = useMemo(
    () => findDuplicateDogNames(categoryActions.categories),
    [categoryActions.categories]
  )

  const handlePrint = () => printProtocol(header.title)

  const handleDownloadPDF = async () => {
    if (!printableRef.current || isExportingPDF) return
    menus.setIsDownloadOpen(false)
    setIsExportingPDF(true)
    try {
      await exportToPDF(printableRef.current, header, handlePrint)
    } finally {
      setIsExportingPDF(false)
    }
  }

  const loadSampleProtocol = () => {
    setImportError(null)
    setKind('coursing')
    setHeader(SAMPLE_HEADER)
    categoryActions.setCategories(createSampleCategories())
    menus.resetAllMenus()
  }

  const importFromJsonText = (jsonText: string): boolean => {
    const parsed = parseImportedProtocolJson(jsonText)
    if (!parsed) {
      setImportError('Не удалось прочитать файл протокола. Проверьте формат JSON.')
      return false
    }
    setImportError(null)
    if (parsed.header) setHeader(parsed.header)
    if (parsed.kind) setKind(parsed.kind)
    if (parsed.categories) categoryActions.setCategories(parsed.categories)
    menus.resetAllMenus()
    return true
  }

  const resetProtocol = () => {
    clearProtocolDraft()
    setImportError(null)
    setHeader({ ...DEFAULT_HEADER, date: new Date().toISOString().substring(0, 10) })
    setKind('coursing')
    categoryActions.setCategories(createDefaultCategories())
    menus.resetAllMenus()
  }

  return {
    kind,
    setKind,
    header,
    setHeader,
    duplicateNames,
    filteredExistingDogs,
    isExportingPDF,
    importError,
    setImportError,
    customBreedCatIds,
    setCustomBreedCatIds,
    customClassCatIds,
    setCustomClassCatIds,
    printableRef,
    ...menus,
    ...categoryActions,
    handlePrint,
    handleDownloadPDF,
    loadSampleProtocol,
    importFromJsonText,
    resetProtocol,
  }
}
