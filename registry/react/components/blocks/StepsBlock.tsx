import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// How it works in steps, as the site's "Set up in under a minute": each step under a #363636 hairline, its number as
// a label in capitals, a Funnel Display 24/28 title and a #D4D4D4 line; side by side from 768 (up to four), stacked on
// phones. Nothing moves.
export interface Step {
  title: string
  body?: string
}

export interface StepsBlockProps {
  steps: Step[]
  title?: ReactNode
  body?: ReactNode
  className?: string
}

export function StepsBlock({ steps, title, body, className }: StepsBlockProps) {
  return (
    <section data-ds="steps-block" className={cn('grid gap-10 text-fg', className)}>
      {(title || body) && (
        <div className="grid max-w-3xl gap-6">
          {title && <h2 className="type-section">{title}</h2>}
          {body && <p className="max-w-measure type-body-lg text-fg-soft">{body}</p>}
        </div>
      )}
      <ol className="m-0 grid list-none grid-cols-1 gap-8 p-0 md:auto-cols-fr md:grid-flow-col md:gap-6">
        {steps.map((s, n) => (
          <li key={s.title} className="grid content-start gap-3 border-t border-edge pt-6">
            <span className="type-label text-fg-muted">{String(n + 1).padStart(2, '0')}</span>
            <h3 className="type-heading-3">{s.title}</h3>
            {s.body && <p className="type-body text-fg-soft">{s.body}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default StepsBlock
