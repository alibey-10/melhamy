import { useEffect, useRef } from 'react'
import { animate, useInView, useReducedMotion } from 'motion/react'

/**
 * A number that counts up from zero the first time it scrolls into view.
 *
 * The server renders the final value, so it's there without JS; with JS, a rule in
 * `styles.css` hides it until it starts counting. Screen readers get the final value only.
 * `format` should be a stable function (module level), since it re-runs on every frame.
 */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduceMotion) {
      el.textContent = format(value)
      el.dataset.ready = ''
      return
    }
    if (!inView) return
    el.textContent = format(0)
    el.dataset.ready = ''
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => {
        el.textContent = format(n)
      },
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value, format])

  return (
    <>
      <span className="sr-only">{format(value)}</span>
      <span ref={ref} aria-hidden data-count-up className="tabular-nums">
        {format(value)}
      </span>
    </>
  )
}
