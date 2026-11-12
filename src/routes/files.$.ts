import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'

/**
 * Streams files (the book PDFs) from the `BOOKS` R2 bucket.
 * `/files/books/sabil-al-rashad/ar-2.pdf` reads the object `books/sabil-al-rashad/ar-2.pdf`.
 *
 * Content-Type and Content-Disposition (with the original Arabic filename) are
 * stored on each object at upload time and passed through here. Range requests
 * are supported so browsers can open large PDFs without downloading all of them.
 */
async function serve(request: Request, key: string, withBody: boolean): Promise<Response> {
  if (!key.startsWith('books/') || key.includes('..')) {
    return new Response('Not found', { status: 404 })
  }

  const object = withBody
    ? await env.BOOKS.get(key, { range: request.headers, onlyIf: request.headers })
    : await env.BOOKS.head(key)
  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Accept-Ranges', 'bytes')
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/pdf')
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'public, max-age=86400')

  // `onlyIf` matched a conditional header (If-None-Match etc.): no body was returned.
  if (!('body' in object)) {
    return new Response(null, { status: withBody ? 304 : 200, headers })
  }

  const range = object.range as { offset?: number; length?: number; suffix?: number } | undefined
  if (range && request.headers.has('Range')) {
    const offset = range.suffix !== undefined ? object.size - range.suffix : (range.offset ?? 0)
    const length = range.suffix ?? range.length ?? object.size - offset
    headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`)
    headers.set('Content-Length', String(length))
    return new Response(object.body as BodyInit, { status: 206, headers })
  }

  headers.set('Content-Length', String(object.size))
  return new Response(object.body as BodyInit, { headers })
}

export const Route = createFileRoute('/files/$')({
  server: {
    handlers: {
      GET: ({ request, params }) => serve(request, params._splat ?? '', true),
      HEAD: ({ request, params }) => serve(request, params._splat ?? '', false),
    },
  },
})
