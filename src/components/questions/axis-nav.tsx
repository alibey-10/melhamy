import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@ui-sdk/react/drawer'

import { content } from '@/content'
import { fill } from '@/lib/format'
import { AXES, axisAnchor, axisOf } from '@/lib/question-axes'
import { QUESTIONS } from '@/lib/podcast-questions'

const t = content.questions

const writtenAxes = new Set(QUESTIONS.map((q) => axisOf(q.number)))

/**
 * The ten axes: a sticky sidebar on wide screens, a bottom sheet opened from a bar under
 * the header on narrow ones. `current` is the axis to highlight; with `spy`, it follows
 * the axis section being read on the `/questions` page instead.
 */
export function AxisNav({ current, spy = false }: { current?: number; spy?: boolean }) {
  const spied = useVisibleAxis(spy)
  const active = spy ? spied : current
  const [open, setOpen] = React.useState(false)
  const activeAxis = AXES.find((a) => a.number === active)

  return (
    <>
      <aside className="hidden lg:block">
        <nav
          aria-label={t.axesTitle}
          className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-4"
        >
          <h2 className="mb-3 font-heading text-lg font-semibold text-primary">{t.axesTitle}</h2>
          <AxisList active={active} onListPage={spy} />
        </nav>
      </aside>

      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-border bg-background/90 px-4 py-2 backdrop-blur lg:hidden">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className="shrink-0 text-sm font-semibold text-copper">{t.axesOpen}</span>
            {activeAxis ? (
              <>
                <span aria-hidden className="text-muted-foreground">
                  ·
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{activeAxis.name}</span>
              </>
            ) : (
              <span className="flex-1" />
            )}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </DrawerTrigger>
          <DrawerBackdrop className="bg-black/40" />
          <DrawerContent className="flex max-h-[85dvh] w-full flex-col rounded-t-2xl border-t border-border bg-card text-card-foreground shadow-lg outline-none after:absolute after:inset-x-0 after:top-full after:h-screen after:bg-card">
            <div aria-hidden className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border" />
            <DrawerTitle className="px-5 pt-4 pb-2 font-heading text-lg font-semibold text-primary">
              {t.axesTitle}
            </DrawerTitle>
            <nav
              aria-label={t.axesTitle}
              className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <AxisList active={active} onListPage={spy} onNavigate={() => setOpen(false)} />
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

function AxisList({
  active,
  onListPage,
  onNavigate,
}: {
  active?: number
  onListPage: boolean
  onNavigate?: () => void
}) {
  return (
    <ol className="flex flex-col gap-0.5">
      {AXES.map((axis) => {
        const isActive = axis.number === active
        const body = (
          <>
            <span
              aria-hidden
              className={cn(
                'w-6 shrink-0 font-heading text-lg leading-snug font-semibold tabular-nums',
                writtenAxes.has(axis.number) ? 'text-copper' : 'text-muted-foreground',
              )}
            >
              {axis.number}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="sr-only">{fill(t.axisLabel, { number: axis.number })}: </span>
              <span className="leading-snug">{axis.name}</span>
              <span className="text-sm text-muted-foreground">
                {writtenAxes.has(axis.number)
                  ? fill(t.axisRange, { first: axis.first, last: axis.last })
                  : t.axisComingSoon}
              </span>
            </span>
          </>
        )

        if (!writtenAxes.has(axis.number)) {
          return (
            <li
              key={axis.number}
              className="flex gap-2 rounded-lg border-s-2 border-transparent px-3 py-2 text-muted-foreground"
            >
              {body}
            </li>
          )
        }

        const props = {
          'aria-current': isActive ? ('location' as const) : undefined,
          onClick: onNavigate,
          className: cn(
            'flex gap-2 rounded-lg border-s-2 px-3 py-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
            isActive
              ? 'border-primary bg-primary/8 font-semibold text-primary'
              : 'border-transparent',
          ),
          children: body,
        }

        // On the list page a router Link would mark the axis in the URL's hash
        // `aria-current="page"`, overriding the axis being read; a plain anchor doesn't.
        return (
          <li key={axis.number}>
            {onListPage ? (
              <a href={`#${axisAnchor(axis.number)}`} {...props} />
            ) : (
              <Link
                to="/questions"
                hash={axisAnchor(axis.number)}
                activeOptions={{ exact: true }}
                {...props}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** The axis whose section is nearest the top of the screen on the `/questions` page. */
function useVisibleAxis(enabled: boolean) {
  const [axis, setAxis] = React.useState<number | undefined>(enabled ? 1 : undefined)

  React.useEffect(() => {
    if (!enabled) return
    const sections = AXES.map((a) => document.getElementById(axisAnchor(a.number))).filter(
      (el): el is HTMLElement => el !== null,
    )
    // Past the header and sticky bar, a section counts as current once its top crosses
    // the upper third of the screen.
    const update = () => {
      const line = window.innerHeight / 3
      let found = sections[0]
      for (const el of sections) if (el.getBoundingClientRect().top <= line) found = el
      if (found) setAxis(Number(found.dataset.axis))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled])

  return axis
}
