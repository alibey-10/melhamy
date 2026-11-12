import { createFileRoute } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

// The Studio is browser-only and large. Guarding on `import.meta.env.SSR` keeps
// it out of the Worker bundle entirely; the browser loads it as its own chunk.
const SanityStudio = import.meta.env.SSR ? () => null : lazy(() => import('@/sanity/studio'))

export const Route = createFileRoute('/studio/$')({
  ssr: false,
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex' },
      { name: 'referrer', content: 'same-origin' },
    ],
  }),
  component: StudioPage,
})

function StudioPage() {
  return (
    <div dir="ltr" className="h-svh">
      <Suspense>
        <SanityStudio />
      </Suspense>
    </div>
  )
}
