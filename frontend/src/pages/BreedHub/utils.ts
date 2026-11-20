export function formatSeasonsCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} сезонов`
  if (mod10 === 1) return `${count} сезон`
  if (mod10 >= 2 && mod10 <= 4) return `${count} сезона`
  return `${count} сезонов`
}
