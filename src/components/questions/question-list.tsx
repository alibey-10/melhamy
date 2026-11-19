import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { content } from '@/content'
import { fill } from '@/lib/format'
import { AXES, axisAnchor, axisOf } from '@/lib/question-axes'
import { QUESTIONS, type QuestionSummary } from '@/lib/podcast-questions'

const t = content.questions

/** The written-up questions, one section per axis, each linking to its own page. */
export function QuestionList() {
  return (
    <div className="flex flex-col gap-14">
      {AXES.map((axis) => {
        const questions = QUESTIONS.filter((q) => axisOf(q.number) === axis.number)
        if (!questions.length) return null
        const id = axisAnchor(axis.number)
        return (
          <section
            key={axis.number}
            id={id}
            data-axis={axis.number}
            aria-labelledby={`${id}-title`}
            className="scroll-mt-32 lg:scroll-mt-24"
          >
            <h2 id={`${id}-title`} className="mb-2 flex flex-col gap-1">
              <span className="text-sm font-semibold text-copper">
                {fill(t.axisLabel, { number: axis.number })}
              </span>
              <span className="text-2xl font-semibold text-primary sm:text-3xl">{axis.name}</span>
            </h2>
            <ol className="divide-y divide-border border-y border-border">
              {questions.map((q) => (
                <QuestionItem key={q.number} q={q} />
              ))}
            </ol>
          </section>
        )
      })}
    </div>
  )
}

function QuestionItem({ q }: { q: QuestionSummary }) {
  return (
    <li>
      <Link
        to="/questions/$number"
        params={{ number: String(q.number) }}
        className="group flex gap-4 py-6 sm:gap-6"
      >
        <span
          aria-hidden
          className="w-10 shrink-0 font-heading text-3xl leading-none font-semibold text-copper tabular-nums sm:w-14 sm:text-4xl"
        >
          {q.number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-xl leading-snug font-semibold group-hover:text-primary sm:text-2xl sm:leading-snug">
            <span className="sr-only">{fill(t.questionLabel, { number: q.number })}: </span>
            {q.question}
          </span>
          <span className="line-clamp-2 text-lg leading-relaxed text-muted-foreground">
            {q.summary}
          </span>
          <span className="mt-1 inline-flex items-center gap-1 font-medium text-primary">
            {t.readAnswer}
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4 transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
          </span>
        </span>
      </Link>
    </li>
  )
}
