import { PortableText, type PortableTextComponents } from '@portabletext/react'

import { content } from '@/content'
import { urlFor } from '@/sanity/image'
import type { BodyImage, BodyVideo, Post, TextBlock } from '@/sanity/posts'

/** The video ID from a YouTube URL, or `null`. */
function youtubeId(url: string) {
  return /(?:youtu\.be\/|[?&]v=|\/embed\/|\/v\/)([\w-]{11})/.exec(url)?.[1] ?? null
}

/** «[3]» → 3, for footnote references marked `sup` in the article text. */
function footnoteNumber(text: string) {
  const match = /^\s*\[(\d+)\]\s*$/.exec(text)
  return match ? Number(match[1]) : null
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: BodyImage }) => (
      <figure className="my-2">
        <img
          src={urlFor(value).width(1536).fit('max').url()}
          alt={value.alt ?? ''}
          loading="lazy"
          className="mx-auto max-h-[80vh] w-auto max-w-full rounded-xl border border-border"
        />
      </figure>
    ),
    youtube: ({ value }: { value: BodyVideo }) => {
      const id = youtubeId(value.url)
      if (!id) return null
      return (
        <div className="my-2 aspect-video overflow-hidden rounded-xl border border-border bg-muted">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={content.blog.video}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="size-full"
          />
        </div>
      )
    },
  },
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2 className="mt-12 text-2xl font-bold">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-10 text-xl font-bold">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-s-4 border-border ps-4 text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc ps-6 marker:text-muted-foreground">{children}</ul>
    ),
    number: ({ children }) => <ol className="list-decimal ps-6">{children}</ol>,
  },
  listItem: ({ children }) => <li className="mt-3 ps-1 first:mt-0">{children}</li>,
  marks: {
    sup: ({ children, text }) => {
      const n = footnoteNumber(text)
      if (n === null) return <sup>{children}</sup>
      return (
        <sup id={`fnref-${n}`} className="scroll-mt-24">
          <a
            href={`#fn-${n}`}
            className="px-0.5 font-semibold text-primary no-underline hover:underline"
          >
            {n}
          </a>
        </sup>
      )
    },
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href
      // Links to other articles on this site open in the same tab.
      const external = !href?.startsWith('/')
      return (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className="underline underline-offset-4 hover:text-muted-foreground"
        >
          {children}
        </a>
      )
    },
  },
}

/** An article's text, set for long-form Arabic reading. */
export function PostBody({ value }: { value: Post['body'] }) {
  return (
    <div className="flex flex-col gap-6 text-lg leading-loose text-pretty sm:text-xl sm:leading-loose">
      <PortableText value={value} components={components} />
    </div>
  )
}

/** The article's footnotes, numbered in order, each linking back to its reference. */
export function PostFootnotes({ value }: { value: TextBlock[] }) {
  return (
    <section aria-labelledby="footnotes-title" className="mt-16 border-t border-border pt-8">
      <h2 id="footnotes-title" className="text-lg font-bold">
        {content.blog.footnotesTitle}
      </h2>
      <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
        {value.map((note, i) => (
          <li key={note._key} id={`fn-${i + 1}`} className="flex scroll-mt-24 gap-2">
            <a
              href={`#fnref-${i + 1}`}
              aria-label={content.blog.backToReference}
              className="shrink-0 font-semibold text-primary tabular-nums hover:underline"
            >
              {i + 1}.
            </a>
            <div dir="auto" className="min-w-0 break-words">
              <PortableText value={note} components={components} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
