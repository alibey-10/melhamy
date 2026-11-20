/**
 * The series' ten axes, ten questions each, in order. Axis `n` holds questions
 * `(n - 1) * 10 + 1` to `n * 10`. Each name must match the `axis` field of that axis's
 * question files. Axis 10's name is the one the host gives when closing axis 9 (episode 59);
 * confirm it again once its episodes are written up.
 */
export const AXIS_NAMES = [
  'مدخل إلى علم التاريخ',
  'مدخل إلى علم الحضارة',
  'السيرة النبوية',
  'الخلافة',
  'الدولة الأموية',
  'الدولة العباسية',
  'الدول المستقلة',
  'الدولة العثمانية',
  'الاستعمار الأجنبي',
  'التاريخ المعاصر',
] as const

export const QUESTIONS_PER_AXIS = 10

export type Axis = { number: number; name: string; first: number; last: number }

export const AXES: readonly Axis[] = AXIS_NAMES.map((name, i) => ({
  number: i + 1,
  name,
  first: i * QUESTIONS_PER_AXIS + 1,
  last: (i + 1) * QUESTIONS_PER_AXIS,
}))

/** The number of the axis a question belongs to. */
export function axisOf(questionNumber: number) {
  return Math.ceil(questionNumber / QUESTIONS_PER_AXIS)
}

/** The id of an axis's section on the `/questions` page. */
export function axisAnchor(axisNumber: number) {
  return `axis-${axisNumber}`
}
