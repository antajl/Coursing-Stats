/** Official RKF exhibition results page (lc.rkfshow.ru). */
export function rkfExhibitionResultsUrl(
  exhibitionId: number | string | null | undefined,
): string | null {
  if (exhibitionId == null || exhibitionId === '') return null
  const id = Number(exhibitionId)
  if (!Number.isFinite(id) || id <= 0) return null
  return `https://lc.rkfshow.ru/RKF/ExhibitionResults/ExhibitionResultListView?exhibitionId=${id}`
}
