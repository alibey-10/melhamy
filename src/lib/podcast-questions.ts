import index from '@/content/questions/index.json'

/**
 * The series' questions, written up from the episode transcripts. Each question lives in
 * its own file, `src/content/questions/NNN.json`, and `index.json` lists every question
 * with only its short answer, for the list page and the sitemap. After adding or editing
 * a question file, run `vp run questions-index` to rebuild the index.
 */

/** A question as listed in `index.json`. `start` is where its answer begins in the video, in seconds. */
export type QuestionSummary = {
  number: number
  episode: number
  videoId: string
  start: number
  axis: string
  question: string
  /** The short answer, one paragraph. */
  summary: string
}

/** A question's full write-up. Text in `sections` may mark **bold** spans (see `RichText`). */
export type Question = QuestionSummary & {
  sections: { heading: string; points: string[] }[]
  takeaways: string[]
  books: { title: string; author: string; note?: string }[]
  citations: { text: string; source: string }[]
}

export const QUESTIONS: readonly QuestionSummary[] = [...index].sort((a, b) => a.number - b.number)

/** Each question file, loaded on demand so a question page only ships its own answer. */
const files = import.meta.glob<Question>('/src/content/questions/[0-9][0-9][0-9].json', {
  import: 'default',
})

export function questionPath(number: number) {
  return `/questions/${number}`
}

export function questionFile(number: number) {
  return `/src/content/questions/${String(number).padStart(3, '0')}.json`
}

/** The question with this number, plus its neighbours for the previous/next links. */
export async function findQuestion(number: number) {
  const i = QUESTIONS.findIndex((q) => q.number === number)
  const load = files[questionFile(number)]
  if (i === -1 || !load) return null
  return { question: await load(), prev: QUESTIONS[i - 1], next: QUESTIONS[i + 1] }
}
