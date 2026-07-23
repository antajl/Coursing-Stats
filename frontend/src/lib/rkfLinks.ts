/** Official RKF exhibition results page (lc.rkfshow.ru). */
export function rkfExhibitionResultsUrl(
  exhibitionId: number | string | null | undefined,
): string | null {
  if (exhibitionId == null || exhibitionId === '') return null
  const id = Number(exhibitionId)
  if (!Number.isFinite(id) || id <= 0) return null
  return `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${id}`
}

/**
 * Public exhibition page on rkf.online catalog SPA.
 * Route is plural `/exhibitions/:id` (singular `/exhibition/:id` 404s client-side).
 */
export function rkfOnlineExhibitionUrl(
  exhibitionId: number | string | null | undefined,
): string | null {
  if (exhibitionId == null || exhibitionId === '') return null
  const id = Number(exhibitionId)
  if (!Number.isFinite(id) || id <= 0) return null
  return `https://rkf.online/exhibitions/${id}`
}

/** Use stored catalog url if present; rewrite mistaken singular path; else build from id. */
export function resolveRkfOnlineExhibitionUrl(
  url: string | null | undefined,
  exhibitionId: number | string | null | undefined,
): string | null {
  const trimmed = url?.trim()
  if (trimmed) {
    return trimmed.replace(
      /^(https?:\/\/rkf\.online)\/exhibition\//i,
      '$1/exhibitions/',
    )
  }
  return rkfOnlineExhibitionUrl(exhibitionId)
}
