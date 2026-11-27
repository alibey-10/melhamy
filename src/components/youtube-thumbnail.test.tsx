import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vite-plus/test'

import { YouTubeThumbnail, youtubeThumbnailUrl } from '@/components/youtube-thumbnail'

describe('YouTubeThumbnail', () => {
  test('builds maxres and sd WebP thumbnail URLs', () => {
    expect(youtubeThumbnailUrl('abc12345678')).toBe(
      'https://i.ytimg.com/vi_webp/abc12345678/maxresdefault.webp',
    )
    expect(youtubeThumbnailUrl('abc12345678', 'sd')).toBe(
      'https://i.ytimg.com/vi_webp/abc12345678/sddefault.webp',
    )
  })

  test('renders maxres dimensions by default and sd dimensions when requested', () => {
    const maxHtml = renderToStaticMarkup(<YouTubeThumbnail videoId="LZtxtXkS9Mw" alt="test" />)
    expect(maxHtml).toContain('https://i.ytimg.com/vi_webp/LZtxtXkS9Mw/maxresdefault.webp')
    expect(maxHtml).toContain('width="1280"')
    expect(maxHtml).toContain('height="720"')

    const sdHtml = renderToStaticMarkup(
      <YouTubeThumbnail videoId="LZtxtXkS9Mw" alt="test" quality="sd" />,
    )
    expect(sdHtml).toContain('https://i.ytimg.com/vi_webp/LZtxtXkS9Mw/sddefault.webp')
    expect(sdHtml).toContain('width="640"')
    expect(sdHtml).toContain('height="480"')
  })
})
