import { describe, expect, test } from 'vite-plus/test'

import { QUESTIONS } from '@/lib/podcast-questions'
import { AXES, axisOf, firstQuestionByAxis } from '@/lib/question-axes'

describe('question axes', () => {
  test('there are ten axes of ten questions covering 1–100', () => {
    expect(AXES).toHaveLength(10)
    expect(AXES[0]).toMatchObject({ first: 1, last: 10 })
    expect(AXES[9]).toMatchObject({ first: 91, last: 100 })
    expect(axisOf(10)).toBe(1)
    expect(axisOf(11)).toBe(2)
  })

  test("every question's axis name matches its axis in the list", () => {
    for (const q of QUESTIONS)
      expect([q.number, q.axis]).toEqual([q.number, AXES[axisOf(q.number) - 1]?.name])
  })

  test('firstQuestionByAxis finds the lowest-numbered written question per axis', () => {
    const sparse = firstQuestionByAxis([{ number: 25 }, { number: 21 }, { number: 3 }])
    expect(sparse.get(1)).toBe(3)
    expect(sparse.get(2)).toBeUndefined()
    expect(sparse.get(3)).toBe(21)

    const written = firstQuestionByAxis(QUESTIONS)
    expect(written.get(1)).toBe(1)
    expect(written.get(2)).toBe(11)
    expect(written.get(9)).toBe(81)
  })
})
