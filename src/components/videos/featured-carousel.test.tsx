import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vite-plus/test'

import { FeaturedCarousel } from '@/components/videos/featured-carousel'
import { pickFeaturedEpisodes } from '@/components/videos/featured-episodes'
import { youtubeThumbnailUrl } from '@/components/youtube-thumbnail'
import { content } from '@/content'
import podcast from '@/content/podcast.json'

describe('FeaturedCarousel', () => {
  test('renders 10 slides, navigation controls, indicators, play toggle, and episode count badge', () => {
    const episodes = pickFeaturedEpisodes(podcast.episodes)
    const html = renderToStaticMarkup(<FeaturedCarousel episodes={episodes} badgeText="70 حلقة" />)

    for (const episode of episodes) {
      expect(html).toContain(youtubeThumbnailUrl(episode.id))
    }

    expect(html).toContain(content.questions.title)
    expect(html).toContain(`aria-label="${content.videos.previousSlide}"`)
    expect(html).toContain(`aria-label="${content.videos.nextSlide}"`)
    expect(html).toContain(`aria-label="${content.videos.carouselSlides}"`)
    expect(html).toContain(content.videos.pauseCarousel)
    expect(html).toContain('70 حلقة')

    const indicatorMatches = html.match(/data-slot="carousel-indicator"/g) ?? []
    expect(indicatorMatches).toHaveLength(10)
  })
})
