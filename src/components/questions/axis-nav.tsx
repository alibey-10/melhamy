import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
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
import { AXES, axisAnchor, axisOf, firstQuestionByAxis } from '@/lib/question-axes'
import { QUESTIONS } from '@/lib/podcast-questions'

const t = content.questions

const firstQuestions = firstQuestionByAxis(QUESTIONS)
const AXIS_EASE = [0.16, 1, 0.3, 1] as const

/**
 * The ten axes: a sticky sidebar on wide screens, a bottom sheet opened from a bar under
 * the header on narrow ones. On a question page, pass `question`: its axis is highlighted
 * and lists its questions, and clicking an axis opens its first question. With `spy`, the
 * highlight follows the axis section being read on the `/questions/list` page instead.
 */
export function AxisNav({ question, spy = false }: { question?: number; spy?: boolean }) {
  const spied = useVisibleAxis(spy)
  const active = spy ? spied : question && axisOf(question)
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
          <AxisList active={active} showQuestions={!spy} onListPage={spy} />
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
          <DrawerContent
            initialFocus="content"
            className="flex max-h-[85dvh] w-full flex-col rounded-t-2xl border-t border-border bg-card text-card-foreground shadow-lg outline-none after:absolute after:inset-x-0 after:top-full after:h-screen after:bg-card"
          >
            <div aria-hidden className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border" />
            <DrawerTitle className="px-5 pt-4 pb-2 font-heading text-lg font-semibold text-primary">
              {t.axesTitle}
            </DrawerTitle>
            <nav
              aria-label={t.axesTitle}
              className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <AxisList
                active={active}
                showQuestions={!spy}
                onListPage={spy}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

function AxisList({
  active,
  showQuestions,
  onListPage,
  onNavigate,
}: {
  active?: number
  showQuestions: boolean
  onListPage: boolean
  onNavigate?: () => void
}) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <ol className="flex flex-col gap-0.5">
      {AXES.map((axis) => {
        const isActive = axis.number === active
        const firstQuestion = firstQuestions.get(axis.number)
        const body = (
          <span className="flex min-w-0 flex-col">
            <span className="sr-only">{fill(t.axisLabel, { number: axis.number })}: </span>
            <span className="leading-snug">{axis.name}</span>
            <span className="text-sm text-muted-foreground">
              {firstQuestion !== undefined
                ? fill(t.axisRange, { first: axis.first, last: axis.last })
                : t.axisComingSoon}
            </span>
          </span>
        )

        if (firstQuestion === undefined) {
          return (
            <li key={axis.number} className="flex gap-2 rounded-lg px-3 py-2 text-muted-foreground">
              {body}
            </li>
          )
        }

        const props = {
          'aria-current': isActive ? ('location' as const) : undefined,
          onClick: onNavigate,
          className: cn(
            'flex gap-2 rounded-lg px-3 py-2 transition-colors duration-200 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
            isActive && 'bg-primary/8 font-semibold text-primary',
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
              <Link to="/questions/$number" params={{ number: String(firstQuestion) }} {...props} />
            )}
            {showQuestions ? (
              <AnimatePresence initial={false}>
                {isActive ? (
                  <motion.div
                    key="questions"
                    initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : {
                            height: { duration: 0.26, ease: AXIS_EASE },
                            opacity: { duration: 0.2, ease: 'easeOut' },
                          }
                    }
                    className="overflow-hidden"
                  >
                    <AxisQuestions
                      axis={axis.number}
                      onNavigate={onNavigate}
                      reduceMotion={reduceMotion}
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

function AxisQuestions({
  axis,
  onNavigate,
  reduceMotion,
}: {
  axis: number
  onNavigate?: () => void
  reduceMotion: boolean
}) {
  return (
    <ol className="flex flex-col gap-0.5 pt-1 pe-1 pb-2 ps-3">
      {QUESTIONS.filter((q) => axisOf(q.number) === axis).map((q, index) => (
        <motion.li
          key={q.number}
          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.2, delay: index * 0.018, ease: AXIS_EASE }
          }
        >
          <Link
            to="/questions/$number"
            params={{ number: String(q.number) }}
            onClick={onNavigate}
            className="flex gap-2 rounded-lg px-2 py-1.5 text-sm leading-snug text-muted-foreground transition-colors duration-150 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[status=active]:bg-muted data-[status=active]:font-semibold data-[status=active]:text-foreground"
          >
            <span aria-hidden className="w-5 shrink-0 text-copper tabular-nums">
              {q.number}
            </span>
            <span className="line-clamp-1 min-w-0">
              <span className="sr-only">{fill(t.questionLabel, { number: q.number })}: </span>
              {q.question}
            </span>
          </Link>
        </motion.li>
      ))}
    </ol>
  )
}

/** The axis whose section is nearest the top of the screen on the `/questions/list` page. */
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
