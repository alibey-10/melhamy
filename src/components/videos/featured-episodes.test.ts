import { describe, expect, test } from 'vite-plus/test'

import { pickFeaturedEpisodes } from '@/components/videos/featured-episodes'
import podcast from '@/content/podcast.json'

describe('pickFeaturedEpisodes', () => {
  test('picks 10 unique episodes spanning the podcast starting with episode 1', () => {
    const picked = pickFeaturedEpisodes(podcast.episodes)
    expect(picked).toHaveLength(10)
    expect(picked[0]).toBe(podcast.episodes[0])

    const ids = new Set(picked.map((e) => e.id))
    expect(ids.size).toBe(10)

    const numbers = picked.map((e) => e.number)
    for (let i = 1; i < numbers.length; i++) {
      expect(numbers[i]).toBeGreaterThan(numbers[i - 1])
    }
    expect(numbers.at(-1)).toBeGreaterThan(55)
  })

  test('handles empty, small, and single-count lists', () => {
    expect(pickFeaturedEpisodes([])).toEqual([])
    expect(pickFeaturedEpisodes(podcast.episodes, 0)).toEqual([])
    expect(pickFeaturedEpisodes(podcast.episodes, -2)).toEqual([])
    expect(pickFeaturedEpisodes(podcast.episodes, 1)).toEqual([podcast.episodes[0]])

    const three = podcast.episodes.slice(0, 3)
    expect(pickFeaturedEpisodes(three, 10)).toEqual(three)
  })

  test('picks the highest-viewed episode in each slice after the first', () => {
    const synthetic = [
      { id: 'e1', views: 10 },
      { id: 'e2', views: 50 },
      { id: 'e3', views: 200 },
      { id: 'e4', views: 30 },
      { id: 'e5', views: 400 },
    ]
    expect(pickFeaturedEpisodes(synthetic, 3).map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
  })
})
