/**
 * Rebuilds `src/content/questions/index.json` from the question files next to it
 * (`001.json`, `002.json`, …): each question's number, episode, video, start time,
 * axis, question and short answer, in order.
 *
 *   vp run questions-index
 */
import { readFile, readdir, writeFile } from 'node:fs/promises'

const DIR = new URL('../src/content/questions/', import.meta.url)
const FIELDS = ['number', 'episode', 'videoId', 'start', 'axis', 'question', 'summary'] as const

const names = (await readdir(DIR)).filter((n) => /^\d{3}\.json$/.test(n)).sort()
const questions = await Promise.all(
  names.map(async (name) => {
    const q = JSON.parse(await readFile(new URL(name, DIR), 'utf8'))
    if (`${String(q.number).padStart(3, '0')}.json` !== name) {
      throw new Error(`${name} holds question ${q.number}; rename the file to match`)
    }
    for (const f of FIELDS) if (q[f] === undefined) throw new Error(`${name} is missing "${f}"`)
    return Object.fromEntries(FIELDS.map((f) => [f, q[f]]))
  }),
)

await writeFile(new URL('index.json', DIR), `${JSON.stringify(questions, null, 2)}\n`)
console.log(`Indexed ${questions.length} questions`)
