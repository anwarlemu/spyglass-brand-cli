'use client'
import { useId, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAccordion } from '@/react/hooks/useAccordion'

// One row of an Accordion: the question as a full-width button (DM Sans 16px, soft White that turns full White under
// the pointer and while open) over a neutral hairline, and the answer under it in muted DM Sans 14px. The chevron turns
// half a circle as the row opens (250ms, ease-in-out); it never moves on hover. The closed answer is inert, so its
// links leave the tab order. `title` names the row; children are the answer.
export interface AccordionItemProps {
  /** The value the accordion opens it by. */
  value: string
  /** The question. */
  title?: ReactNode
  disabled?: boolean
  children?: ReactNode
}

export function AccordionItem({ value, title, disabled, children }: AccordionItemProps) {
  const ctx = useAccordion()
  const open = ctx?.isOpen(value) ?? false
  const id = useId()
  return (
    <>
      <style href="ds-accordion-item" precedence="ds">{css}</style>
      <div data-ds="accordion-item" className="border-b border-edge" data-open={open}>
        <h3>
          <button
            id={`${id}-head`}
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-body`}
            disabled={disabled}
            className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left type-body text-fg-soft transition-[color] duration-150 ease-standard hover:text-fg aria-expanded:text-fg disabled:cursor-not-allowed disabled:text-fg-faint"
            onClick={() => ctx?.toggle(value)}
          >
            {title}
            <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" className="ds-accordion-chev shrink-0 text-fg-muted" />
          </button>
        </h3>
        <div id={`${id}-body`} role="region" aria-labelledby={`${id}-head`} inert={!open} className="ds-collapse" data-open={open}>
          <div><div className="ds-collapse-body pb-4 type-ui text-fg-muted">{children}</div></div>
        </div>
      </div>
    </>
  )
}

export default AccordionItem

const css = `
/* The row opens to its content's height (0fr to 1fr) over 250ms and closes in 150ms, on the strong ease-out; the words
   fade and settle 4px down, so they never pop. Reduced motion: no height or move, opacity only. */
.ds-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-exit) var(--ds-easing-out); }
.ds-collapse[data-open="true"] { grid-template-rows: 1fr; transition-duration: var(--ds-duration-glide); }
.ds-collapse > div { min-height: 0; overflow: hidden; }
.ds-collapse-body { opacity: 0; transform: translateY(-4px); transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-out); }
.ds-collapse[data-open="true"] .ds-collapse-body { opacity: 1; transform: none; transition-duration: var(--ds-duration-glide); }
.ds-accordion-chev { transition: rotate var(--ds-duration-glide) var(--ds-easing-in-out); }
[aria-expanded="true"] > .ds-accordion-chev { rotate: 180deg; }
@media (prefers-reduced-motion: reduce) {
  .ds-collapse, .ds-collapse[data-open="true"], .ds-accordion-chev { transition: none; }
  .ds-collapse-body, .ds-collapse[data-open="true"] .ds-collapse-body { transform: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); }
}
`
