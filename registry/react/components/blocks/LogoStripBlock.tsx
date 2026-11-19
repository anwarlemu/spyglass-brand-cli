import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A row of customer names under a label in capitals: each name set as a wordmark in Funnel Display, in the muted
// gray, so no third-party logo is ever drawn. Pass your customers' names (placeholders say Acme); with permission to
// show real marks, put their SVGs in `children` instead, in White. The row wraps on phones. Nothing moves on hover.
export interface LogoStripBlockProps {
  /** The names, each set as a wordmark. */
  names?: string[]
  /** A line in capitals above the row. */
  label?: ReactNode
  /** Instead of the names: the marks themselves. */
  children?: ReactNode
  className?: string
}

export function LogoStripBlock({ names = [], label, children, className }: LogoStripBlockProps) {
  return (
    <section data-ds="logo-strip-block" className={cn('grid gap-8 text-fg max-sm:gap-6', className)}>
      {label && <p className="type-label text-fg-muted">{label}</p>}
      {children ? (
        <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6">{children}</div>
      ) : (
        <ul className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6">
          {names.map((n) => <li key={n} className="type-heading-3 text-fg-muted">{n}</li>)}
        </ul>
      )}
    </section>
  )
}

export default LogoStripBlock
