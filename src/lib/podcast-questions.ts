import questions from '@/content/podcast-questions.json'

/**
 * The series' questions, written up from the episode transcripts. Each one answers a
 * single question asked on the podcast. `start` is where its answer begins in the video,
 * in seconds. Text may mark **bold** spans (see `RichText`).
 */
export type Question = (typeof questions)[number]

export const QUESTIONS: readonly Question[] = [...questions].sort((a, b) => a.number - b.number)

export function questionPath(number: number) {
  return `/questions/${number}`
}

/** The question with this number, plus its neighbours for the previous/next links. */
export function findQuestion(number: number) {
  const i = QUESTIONS.findIndex((q) => q.number === number)
  if (i === -1) return null
  return { question: QUESTIONS[i], prev: QUESTIONS[i - 1], next: QUESTIONS[i + 1] }
}
