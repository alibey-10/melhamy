import { createFileRoute } from '@tanstack/react-router'

import { content } from '@/content'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-lg text-muted-foreground">{content.home.placeholder}</p>
    </div>
  )
}
