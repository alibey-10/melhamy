/**
 * Full-screen book reader built on react-pdf (Mozilla PDF.js). It only runs in
 * the browser: load it with `React.lazy` inside `<ClientOnly>`, never on the server.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Download01Icon,
  Loading03Icon,
  MinusSignIcon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'
import { Document, Page, pdfjs } from 'react-pdf'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

import { Button, buttonVariants } from '@/components/ui/button'
import { content } from '@/content'
import { fill } from '@/lib/format'

// Must be set in the same module that renders <Document> (see the react-pdf README).
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc

/** Copied from `pdfjs-dist` to /pdfjs/ by vite-plugin-static-copy (see vite.config.ts). */
const PDF_OPTIONS = {
  cMapUrl: '/pdfjs/cmaps/',
  standardFontDataUrl: '/pdfjs/standard_fonts/',
  wasmUrl: '/pdfjs/wasm/',
  iccUrl: '/pdfjs/iccs/',
}

const ZOOM_STEPS = [1, 1.25, 1.5, 2, 2.5, 3]
const PAGE_GUTTER = 16
const t = content.reader

export type PdfReaderProps = {
  /** URL of the PDF. The server must support range requests for fast first paint. */
  file: string
  title: string
  /** Turn pages leftwards (Arabic, Urdu…). */
  rtl: boolean
  /** Remembers the reader's last page per file in this browser. */
  storageKey: string
  onClose: () => void
}

export default function PdfReader({ file, title, rtl, storageKey, onClose }: PdfReaderProps) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(() => readLastPage(storageKey))
  const [zoom, setZoom] = useState(0)
  const [aspect, setAspect] = useState<number>()
  const [failed, setFailed] = useState(false)
  const area = useRef<HTMLDivElement>(null)
  const [areaEl, setAreaEl] = useState<HTMLDivElement | null>(null)
  const size = useElementSize(areaEl)
  const touchX = useRef<number>(null)

  const goTo = (n: number) => {
    if (!numPages) return
    const next = Math.min(Math.max(1, n), numPages)
    if (next === page) return
    setPage(next)
    area.current?.scrollTo({ top: 0 })
    try {
      localStorage.setItem(storageKey, String(next))
    } catch {}
  }

  // Zoom 1 fits the whole page in view; higher steps scroll.
  const availWidth = Math.max(0, size.width - PAGE_GUTTER * 2)
  const availHeight = Math.max(0, size.height - PAGE_GUTTER * 2)
  const fitWidth = aspect ? Math.min(availWidth, availHeight * aspect) : availWidth
  const pageWidth = Math.floor(fitWidth * ZOOM_STEPS[zoom])

  function onKeyDown(e: KeyboardEvent) {
    if (e.target instanceof HTMLInputElement) return
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight'
    const back = rtl ? 'ArrowRight' : 'ArrowLeft'
    const actions: Record<string, () => void> = {
      [forward]: () => goTo(page + 1),
      [back]: () => goTo(page - 1),
      PageDown: () => goTo(page + 1),
      PageUp: () => goTo(page - 1),
      Home: () => goTo(1),
      End: () => goTo(numPages),
      '+': () => setZoom((z) => Math.min(z + 1, ZOOM_STEPS.length - 1)),
      '=': () => setZoom((z) => Math.min(z + 1, ZOOM_STEPS.length - 1)),
      '-': () => setZoom((z) => Math.max(z - 1, 0)),
    }
    const action = actions[e.key]
    if (action) {
      e.preventDefault()
      action()
    }
  }

  // Swipe to turn pages, only when the page fits (otherwise swiping pans).
  function onTouchStart(e: TouchEvent) {
    touchX.current = zoom === 0 && e.touches.length === 1 ? e.touches[0].clientX : null
  }
  function onTouchEnd(e: TouchEvent) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (Math.abs(dx) < 50) return
    // In a right-to-left book, swiping right reveals the next page.
    goTo(page + (dx > 0 === rtl ? 1 : -1))
  }

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Popup
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-background outline-none"
        >
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-2 sm:px-4">
            <Dialog.Close
              render={
                <Button variant="ghost" size="icon-lg" aria-label={t.close} title={t.close} />
              }
            >
              <HugeiconsIcon icon={Cancel01Icon} />
            </Dialog.Close>
            <Dialog.Title className="min-w-0 flex-1 truncate font-semibold">{title}</Dialog.Title>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label={t.zoomOut}
                title={t.zoomOut}
                disabled={zoom === 0}
                onClick={() => setZoom((z) => Math.max(z - 1, 0))}
              >
                <HugeiconsIcon icon={MinusSignIcon} />
              </Button>
              <span className="w-12 text-center text-sm text-muted-foreground tabular-nums">
                {Math.round(ZOOM_STEPS[zoom] * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label={t.zoomIn}
                title={t.zoomIn}
                disabled={zoom === ZOOM_STEPS.length - 1}
                onClick={() => setZoom((z) => Math.min(z + 1, ZOOM_STEPS.length - 1))}
              >
                <HugeiconsIcon icon={PlusSignIcon} />
              </Button>
              <a
                href={file}
                download
                aria-label={t.download}
                title={t.download}
                className={buttonVariants({ variant: 'ghost', size: 'icon-lg' })}
              >
                <HugeiconsIcon icon={Download01Icon} />
              </a>
            </div>
          </header>

          <div
            ref={(el) => {
              area.current = el
              setAreaEl(el)
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="flex min-h-0 flex-1 overflow-auto bg-muted"
          >
            {failed ? (
              <Centered>
                <p>{t.error}</p>
                <a href={file} download className={buttonVariants({ size: 'lg' })}>
                  <HugeiconsIcon icon={Download01Icon} data-icon="inline-start" />
                  {content.books.download}
                </a>
              </Centered>
            ) : (
              <Document
                file={file}
                options={PDF_OPTIONS}
                suspense={false}
                onLoadSuccess={(pdf) => {
                  setNumPages(pdf.numPages)
                  setPage((p) => Math.min(p, pdf.numPages))
                }}
                onLoadError={() => setFailed(true)}
                loading={<Loading />}
                error={null}
                className="flex min-h-full w-fit min-w-full p-4"
              >
                {pageWidth > 0 ? (
                  <Page
                    pageNumber={page}
                    width={pageWidth}
                    suspense={false}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={(p) => setAspect(p.originalWidth / p.originalHeight)}
                    loading={
                      <div
                        className="bg-card"
                        style={{
                          width: pageWidth,
                          height: aspect ? pageWidth / aspect : availHeight,
                        }}
                      />
                    }
                    className="m-auto bg-card shadow-lg"
                  />
                ) : null}
              </Document>
            )}
          </div>

          <footer
            dir={rtl ? 'rtl' : 'ltr'}
            className="flex h-16 shrink-0 items-center justify-center gap-3 border-t border-border px-4"
          >
            <Button
              variant="outline"
              size="icon-lg"
              aria-label={t.previous}
              title={t.previous}
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
            >
              <HugeiconsIcon icon={rtl ? ArrowRight01Icon : ArrowLeft01Icon} />
            </Button>
            <PageInput page={page} numPages={numPages} onSubmit={goTo} />
            <Button
              variant="outline"
              size="icon-lg"
              aria-label={t.next}
              title={t.next}
              disabled={!numPages || page >= numPages}
              onClick={() => goTo(page + 1)}
            >
              <HugeiconsIcon icon={rtl ? ArrowLeft01Icon : ArrowRight01Icon} />
            </Button>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** "[ 12 ] من 156": type a page number and press Enter to jump to it. */
function PageInput({
  page,
  numPages,
  onSubmit,
}: {
  page: number
  numPages: number
  onSubmit: (page: number) => void
}) {
  const [draft, setDraft] = useState<string>()
  const commit = () => {
    const n = Number(draft)
    if (draft && Number.isInteger(n)) onSubmit(n)
    setDraft(undefined)
  }
  return (
    <form
      dir="rtl"
      className="flex items-center gap-2 text-sm tabular-nums"
      onSubmit={(e) => {
        e.preventDefault()
        commit()
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        aria-label={t.pageInput}
        value={draft ?? String(page)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        disabled={!numPages}
        className="h-9 w-14 rounded-lg border border-input bg-background text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <span className="text-muted-foreground">
        {numPages ? fill(t.pageOf, { count: numPages }) : null}
      </span>
    </form>
  )
}

function Loading() {
  return (
    <Centered>
      <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      <p>{t.loading}</p>
    </Centered>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-auto flex flex-col items-center gap-4 p-6 text-center text-muted-foreground">
      {children}
    </div>
  )
}

function readLastPage(key: string) {
  try {
    const n = Number(localStorage.getItem(key))
    return Number.isInteger(n) && n > 0 ? n : 1
  } catch {
    return 1
  }
}

/** Tracks an element's content size. Takes the element (from a callback ref), not a ref
 * object, because the dialog portal mounts it after this component's first effects run. */
function useElementSize(el: HTMLElement | null) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.floor(width), height: Math.floor(height) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [el])
  return size
}
