import { Link, createFileRoute } from '@tanstack/react-router'
import { HugeiconsIcon } from '@hugeicons/react'
import { YoutubeIcon } from '@hugeicons/core-free-icons'

import { AxisNav } from '@/components/questions/axis-nav'
import { QuestionList } from '@/components/questions/question-list'
import { NAV_URLS, QUESTIONS_LIST_URL } from '@/constants/urls'
import { content } from '@/content'
import { fill } from '@/lib/format'
import { QUESTIONS } from '@/lib/podcast-questions'
import { breadcrumbLd, seo } from '@/lib/seo'

const t = content.questions

export const Route = createFileRoute('/questions/list')({
  head: () =>
    seo({
      title: `${t.listTitle} · ${t.title}`,
      description: t.description,
      path: QUESTIONS_LIST_URL,
      jsonLd: [
        breadcrumbLd([
          [content.breadcrumb.home, '/'],
          [t.title, NAV_URLS.questions],
          [t.listTitle, QUESTIONS_LIST_URL],
        ]),
      ],
    }),
  component: QuestionListPage,
})

function QuestionListPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12">
      <AxisNav spy />
      <div className="max-w-4xl min-w-0">
        <header className="mb-10">
          <p className="font-heading font-semibold text-copper">{t.title}</p>
          <h1 className="mt-1 text-3xl font-semibold text-primary sm:text-4xl">{t.listTitle}</h1>
          <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t.intro}
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              to="/questions"
              className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <HugeiconsIcon icon={YoutubeIcon} className="size-5" aria-hidden />
              {t.watchSeries}
            </Link>
            <span className="text-sm text-muted-foreground">
              {fill(t.questionsCount, { count: QUESTIONS.length })}
            </span>
          </p>
        </header>

        <QuestionList />
      </div>
    </div>
  )
}
