export type ParsedDogName = {
  primary: string
  secondary: string | null
}

/** Русская и латинская части: из «RU / EN» в name_lat или из name_lat + name_ru. */
export function parseDogName(
  nameLat?: string | null,
  nameRu?: string | null,
): ParsedDogName {
  const name = nameLat || nameRu || ''
  if (!name) return { primary: '', secondary: null }

  const slashParts = name.split('/')
  if (slashParts.length > 1) {
    return {
      primary: slashParts[0].trim(),
      secondary: slashParts.slice(1).join('/').trim() || null,
    }
  }

  if (nameRu && nameRu !== nameLat) {
    return { primary: nameLat || name, secondary: nameRu }
  }

  return { primary: name, secondary: null }
}

export function dogNameSearchText(
  nameLat?: string | null,
  nameRu?: string | null,
): string {
  const { primary, secondary } = parseDogName(nameLat, nameRu)
  return secondary ? `${primary} ${secondary}` : primary
}
