import { describe, expect, test } from 'vite-plus/test'

import { QUESTIONS } from '@/lib/podcast-questions'
import { AXES, axisOf } from '@/lib/question-axes'

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
})
