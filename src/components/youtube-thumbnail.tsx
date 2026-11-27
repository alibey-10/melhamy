'use client'

import { useEffect, useRef, useState, type SyntheticEvent } from 'react'

const YOUTUBE_THUMBNAIL_TIERS = [
  {
    url: (id: string) => `https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`,
    width: 1280,
    height: 720,
  },
  {
    url: (id: string) => `https://i.ytimg.com/vi_webp/${id}/sddefault.webp`,
    width: 640,
    height: 480,
  },
  {
    url: (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    width: 480,
    height: 360,
  },
] as const

export type YouTubeThumbnailQuality = 'max' | 'sd'

export function youtubeThumbnailUrl(
  videoId: string,
  quality: YouTubeThumbnailQuality = 'max',
): string {
  const tier = quality === 'sd' ? 1 : 0
  return YOUTUBE_THUMBNAIL_TIERS[tier].url(videoId)
}

export function YouTubeThumbnail({
  videoId,
  alt,
  quality = 'max',
  loading,
  decoding,
  draggable,
  className,
}: {
  videoId: string
  alt: string
  quality?: YouTubeThumbnailQuality
  loading?: 'eager' | 'lazy'
  decoding?: 'async' | 'sync' | 'auto'
  draggable?: boolean
  className?: string
}) {
  const startTier = quality === 'sd' ? 1 : 0
  const [fallback, setFallback] = useState({ videoId, tier: startTier })
  const tier = fallback.videoId === videoId ? Math.max(fallback.tier, startTier) : startTier
  const imgRef = useRef<HTMLImageElement>(null)

  const advance = () => {
    setFallback((prev) => {
      const current = prev.videoId === videoId ? Math.max(prev.tier, startTier) : startTier
      return current < YOUTUBE_THUMBNAIL_TIERS.length - 1 ? { videoId, tier: current + 1 } : prev
    })
  }

  // Catch SSR images that 404 or return YouTube's 120px placeholder before React hydrates.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth <= 120) {
      advance()
    }
  }, [videoId, startTier, tier])

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    if (event.currentTarget.naturalWidth <= 120) advance()
  }

  const spec = YOUTUBE_THUMBNAIL_TIERS[tier]

  return (
    <img
      ref={imgRef}
      src={spec.url(videoId)}
      alt={alt}
      width={spec.width}
      height={spec.height}
      loading={loading}
      decoding={decoding}
      draggable={draggable}
      onError={advance}
      onLoad={handleLoad}
      className={className}
    />
  )
}
