import { Link } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { content } from '@/content'
import { fill, formatDuration } from '@/lib/format'
import { QUESTIONS } from '@/lib/podcast-questions'

const t = content.questions

/** The written-up questions, each linking to its own page. */
export function QuestionList() {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {QUESTIONS.map((q) => (
        <li key={q.number}>
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
              <span className="text-sm text-muted-foreground">
                <span className="sr-only">{fill(t.questionLabel, { number: q.number })} · </span>
                {fill(t.questionMeta, { episode: q.episode, time: formatDuration(q.start) })}
              </span>
              <span className="text-xl leading-snug font-semibold group-hover:text-primary sm:text-2xl sm:leading-snug">
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
      ))}
    </ol>
  )
}
