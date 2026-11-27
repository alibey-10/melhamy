export const FEATURED_SLIDE_COUNT = 10
export const AUTOPLAY_INTERVAL_MS = 2500

export function pickFeaturedEpisodes<T extends { views: number }>(
  episodes: readonly T[],
  count = FEATURED_SLIDE_COUNT,
): T[] {
  if (count <= 0 || episodes.length === 0) return []
  if (episodes.length <= count) return [...episodes]
  if (count === 1) return [episodes[0]]

  const rest = episodes.slice(1)
  const slices = count - 1
  const picked: T[] = [episodes[0]]

  for (let i = 0; i < slices; i++) {
    const start = Math.floor((i * rest.length) / slices)
    const end = Math.floor(((i + 1) * rest.length) / slices)
    let best = rest[start]
    for (let j = start + 1; j < end; j++) {
      if (rest[j].views > best.views) best = rest[j]
    }
    picked.push(best)
  }

  return picked
}
