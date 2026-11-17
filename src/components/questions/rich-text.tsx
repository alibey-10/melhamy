/** Text with `**bold**` spans, as written in `src/content/podcast-questions.json`. */
export function RichText({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}
