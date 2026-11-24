import type { ReactNode } from 'react'
import { FaqAccordion, type FaqAccordionItem } from '@/react/components/blocks/FaqAccordion'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// The site's FAQ (v3/V3Faq): from 1024 the head on the left (4 of 11 columns, 64px apart, held 32px under the header
// while the questions scroll by) and the questions on the right; one column below, the head centered on phones. The
// head is the section head, a lead in the soft gray 24px under it and a quiet button 32px further. `layout="stack"` is
// the earlier site's (v2/V2Faq): the head centered over a narrow list with its hairline at the foot. The rows are
// FaqAccordion. Place it in a page section; it brings no padding of its own. Answer only with what the product states.
export type FaqItem = FaqAccordionItem

export interface FaqBlockProps {
  items: FaqItem[]
  title?: ReactNode
  /** A line under the title. */
  body?: ReactNode
  /** A quiet button under the title: { label: 'Read the docs', href }. */
  action?: { label: string; href?: string }
  /** Names the heading (`<id>-heading`). */
  id?: string
  /** split (head left, questions right) or stack (head over a narrow list). */
  layout?: 'split' | 'stack'
  /** The question open at first; -1 for none. */
  defaultOpen?: number
  className?: string
}

export function FaqBlock({ items, title = 'Questions.', body, action, id = 'faq', layout = 'split', defaultOpen = 0, className }: FaqBlockProps) {
  const stack = layout === 'stack'
  return (
    <section data-ds="faq-block" aria-labelledby={`${id}-heading`} className={cn('grid grid-cols-[minmax(0,1fr)] text-fg', stack ? 'gap-y-16 lg:gap-y-20' : 'gap-y-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-start lg:gap-x-16', className)}>
      <header className={cn('flex flex-col', stack ? 'items-center text-center' : 'items-start max-md:items-center max-md:text-center lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]')}>
        <h2 id={`${id}-heading`} className="type-section max-lg:[text-box:trim-start_cap_alphabetic]">{title}</h2>
        {body ? <p className="mt-6 max-w-measure type-body-lg text-pretty text-fg-soft">{body}</p> : null}
        {action ? <Button href={action.href} variant="secondary" className="mt-8">{action.label}</Button> : null}
      </header>
      <div className="min-w-0">
        <FaqAccordion items={items} defaultOpen={defaultOpen} edge={stack ? 'bottom' : 'top'} narrow={stack} />
      </div>
    </section>
  )
}

export default FaqBlock
