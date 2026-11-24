import type { ReactNode } from 'react'
import { Accordion } from '@/react/components/ui/Accordion'
import { AccordionItem } from '@/react/components/ui/AccordionItem'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// The site's FAQ (v3 V3Faq): two columns from 1024. On the left the section head (Funnel Display at 450, the site's
// .t-head), a #D4D4D4 lead and a quiet button ("Contact us"); on the right the questions as accordion rows under
// #363636 hairlines, the question in DM Sans 16/24 that turns White when open, the answer in #D4D4D4 no wider than
// 640px. One column on smaller screens. Answer only with what the product states.
export interface FaqItem {
  q: string
  a: string
}

export interface FaqBlockProps {
  items: FaqItem[]
  title?: ReactNode
  /** A line under the title. */
  body?: ReactNode
  /** A quiet button under the title: { label: 'Contact us', href }. */
  action?: { label: string; href?: string }
  className?: string
}

export function FaqBlock({ items, title = 'Questions.', body, action, className }: FaqBlockProps) {
  return (
    <section data-ds="faq-block" className={cn('grid gap-12 text-fg lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16', className)}>
      <div className="flex flex-col items-start">
        <h2 className="type-section">{title}</h2>
        {body && <p className="mt-6 max-w-measure type-body-lg text-fg-soft">{body}</p>}
        {action && <Button href={action.href} variant="secondary" className="mt-8">{action.label}</Button>}
      </div>
      <div className="min-w-0 border-t border-edge">
        <Accordion>
          {items.map((i, n) => <AccordionItem key={i.q} value={`q${n + 1}`} title={i.q}>{i.a}</AccordionItem>)}
        </Accordion>
      </div>
    </section>
  )
}

export default FaqBlock
