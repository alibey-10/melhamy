import { createPointerKind } from '@ui-sdk/core'
import { usePreference } from '@ui-sdk/react/preferences'
import { Toggle } from '@ui-sdk/react/toggle'
import type { CSSProperties, PointerEvent, ReactNode } from 'react'

import { content } from '@/content'
import { fill } from '@/lib/format'

export const BOOK_3D_TONES = [
  'marble',
  'rose',
  'ochre',
  'sandstone',
  'verdigris',
  'turquoise',
  'lapis',
  'basalt',
] as const

export type Book3DTone = (typeof BOOK_3D_TONES)[number]

const pointerKind = createPointerKind()

const TILT_X = 12
const TILT_Y = 18

/**
 * A hardcover book drawn in CSS 3D, with a light that follows the pointer across
 * its cover. The spine sits on the right in right-to-left pages, as Arabic books
 * are bound, and on the left otherwise. Pass `inside` to make it a toggle that
 * swings the cover open on its hinge.
 */
export function Book3D({
  title,
  subtitle,
  author,
  image,
  tone = 'marble',
  width = 180,
  depth = 28,
  ratio = 4 / 3,
  angle = 28,
  tilt = true,
  binding,
  inside,
  open,
  defaultOpen,
  onOpenChange,
  className,
  style,
}: {
  title: string
  /** Printed under the title on a typeset cover. */
  subtitle?: string
  author?: string
  /** A cover image. Without one, the cover is typeset from `title` and `author`. */
  image?: { src: string; alt?: string }
  tone?: Book3DTone
  /** Cover width in CSS pixels. */
  width?: number
  /** Spine thickness in CSS pixels. */
  depth?: number
  /** Height divided by width. */
  ratio?: number
  /** Resting turn toward the spine, in degrees. */
  angle?: number
  /** Tilt toward the pointer and move the light with it. Mouse and pen only. */
  tilt?: boolean
  /** Which edge the spine is on. Defaults to the page's direction. */
  binding?: 'left' | 'right'
  /** The first page, shown when the cover opens. Makes the book a toggle. */
  inside?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  style?: CSSProperties
}) {
  const { hover } = usePreference(pointerKind)
  const tilting = tilt && hover === 'hover'

  const root = {
    'data-book-3d': '',
    'data-tone': tone,
    'data-binding': binding,
    className,
    style: {
      '--book-w': `${width}px`,
      '--book-d': `${depth}px`,
      '--book-ratio': ratio,
      '--book-angle': `${angle}deg`,
      ...style,
    } as CSSProperties,
    onPointerMove: tilting ? lean : undefined,
    onPointerLeave: tilting ? settle : undefined,
  }

  const book = (
    <>
      <span data-slot="book-3d-shadow" aria-hidden />
      <span data-slot="book-3d-object">
        <span data-slot="book-3d-back" aria-hidden />
        <span data-slot="book-3d-spine" aria-hidden>
          <span data-slot="book-3d-spine-title">{title}</span>
        </span>
        <span data-slot="book-3d-edge" aria-hidden />
        <span data-slot="book-3d-top" aria-hidden />
        {inside != null && <span data-slot="book-3d-page">{inside}</span>}
        <span data-slot="book-3d-cover">
          <span data-slot="book-3d-front">
            {image ? (
              <img
                data-slot="book-3d-image"
                src={image.src}
                alt={image.alt ?? title}
                draggable={false}
              />
            ) : (
              <CoverArt title={title} subtitle={subtitle} author={author} />
            )}
            <span data-slot="book-3d-hinge" aria-hidden />
            <span data-slot="book-3d-glare" aria-hidden />
          </span>
          {inside != null && <span data-slot="book-3d-lining" aria-hidden />}
        </span>
      </span>
    </>
  )

  if (inside == null) {
    return <span {...root}>{book}</span>
  }

  return (
    <Toggle
      {...root}
      aria-label={fill(content.book3d.open, { title })}
      pressed={open}
      defaultPressed={defaultOpen}
      onPressedChange={onOpenChange && ((pressed) => onOpenChange(pressed))}
    >
      {book}
    </Toggle>
  )
}

function CoverArt({
  title,
  subtitle,
  author,
}: {
  title: string
  subtitle?: string
  author?: string
}) {
  return (
    <span data-slot="book-3d-art">
      <Khatam />
      <span data-slot="book-3d-title">{title}</span>
      {subtitle && <span data-slot="book-3d-subtitle">{subtitle}</span>}
      {author && <span data-slot="book-3d-author">{author}</span>}
    </span>
  )
}

/** The eight-pointed star of two squares, a common motif on Arabic bindings. */
function Khatam() {
  return (
    <svg data-slot="book-3d-ornament" viewBox="0 0 24 24" aria-hidden>
      <rect x="5" y="5" width="14" height="14" />
      <rect x="5" y="5" width="14" height="14" transform="rotate(45 12 12)" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  )
}

function lean(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return
  const el = event.currentTarget
  const box = el.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width))
  const y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height))
  el.style.setProperty('--tilt-x', `${(0.5 - y) * TILT_X}deg`)
  el.style.setProperty('--tilt-y', `${(x - 0.5) * TILT_Y}deg`)
  el.style.setProperty('--light-x', `${x * 100}%`)
  el.style.setProperty('--light-y', `${y * 100}%`)
  el.dataset.tilting = ''
}

function settle(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget
  for (const name of ['--tilt-x', '--tilt-y', '--light-x', '--light-y']) {
    el.style.removeProperty(name)
  }
  delete el.dataset.tilting
}
