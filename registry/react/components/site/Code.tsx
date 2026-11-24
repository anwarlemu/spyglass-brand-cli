import { codeRuns } from '@/lib/code'
import { cn } from '@/react/lib/cn'

// The site's code (sections/Connect Code): mono 14/20 in White, as wide as its longest line, with comments,
// punctuation and string quotes in the muted gray. Put it in something that scrolls across.
export interface CodeProps {
  source: string
  /** shell, ts, python or json (json keeps `#` as text). */
  language?: string
  className?: string
}

export function Code({ source, language = 'shell', className }: CodeProps) {
  return (
    <pre data-ds="code" className={cn('m-0 w-max type-code text-fg [tab-size:2]', className)}>
      <code>{codeRuns(source, language).map((r, i) => (r.dim ? <span key={i} className="text-fg-muted">{r.text}</span> : r.text))}</code>
    </pre>
  )
}

export default Code
